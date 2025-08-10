import { supabase } from '@/integrations/supabase/client';

// Offline storage types
interface OfflineAction {
  id: string;
  type: string;
  table: string;
  data: unknown;
  timestamp: string;
  synced: boolean;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingActions: number;
  syncInProgress: boolean;
}

class OfflineService {
  private dbName = 'BlackTopOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private syncCallbacks: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.initDB();
    this.setupOnlineListeners();
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline actions (CRUD operations to sync later)
        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp');
          actionsStore.createIndex('synced', 'synced');
        }

        // Cache for data (read operations)
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry');
        }

        // Store for user preferences
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }

        // Store for form drafts
        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' });
          draftsStore.createIndex('formType', 'formType');
          draftsStore.createIndex('lastModified', 'lastModified');
        }
      };
    });
  }

  // Setup online/offline listeners
  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.sync();
    });

    // Periodic sync when online
    setInterval(() => {
      if (navigator.onLine) {
        this.sync();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Queue action for later sync
  async queueAction(type: string, table: string, data: unknown): Promise<string> {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
      retryCount: 0,
    };

    await this.storeAction(action);

    // Try immediate sync if online
    if (navigator.onLine) {
      this.sync();
    }

    return action.id;
  }

  // Store action in IndexedDB
  private async storeAction(action: OfflineAction): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.add(action);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending actions
  private async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync pending actions with server
  async sync(): Promise<void> {
    if (!navigator.onLine) return;

    const pendingActions = await this.getPendingActions();
    if (pendingActions.length === 0) return;

    this.notifyCallbacks({
      isOnline: true,
      lastSync: null,
      pendingActions: pendingActions.length,
      syncInProgress: true,
    });

    for (const action of pendingActions) {
      try {
        await this.syncAction(action);
        await this.markActionSynced(action.id);
      } catch (error) {
        console.error('Failed to sync action:', error);
        await this.incrementRetryCount(action.id);
      }
    }

    this.notifyCallbacks({
      isOnline: true,
      lastSync: new Date().toISOString(),
      pendingActions: 0,
      syncInProgress: false,
    });
  }

  // Sync individual action
  private async syncAction(action: OfflineAction): Promise<void> {
    const { type, table, data } = action;

    switch (type) {
      case 'INSERT':
        await supabase.from(table).insert(data);
        break;
      case 'UPDATE':
        await supabase.from(table).update(data).eq('id', data.id);
        break;
      case 'DELETE':
        await supabase.from(table).delete().eq('id', data.id);
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // Mark action as synced
  private async markActionSynced(actionId: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.get(actionId);

      request.onsuccess = () => {
        const action = request.result;
        if (action) {
          action.synced = true;
          const updateRequest = store.put(action);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Increment retry count
  private async incrementRetryCount(actionId: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.get(actionId);

      request.onsuccess = () => {
        const action = request.result;
        if (action) {
          action.retryCount += 1;
          // Remove actions that have failed too many times
          if (action.retryCount > 5) {
            store.delete(actionId);
          } else {
            store.put(action);
          }
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Cache data for offline access
  async cacheData(key: string, data: unknown, expiryMinutes: number = 60): Promise<void> {
    if (!this.db) await this.initDB();

    const cacheItem = {
      key,
      data,
      expiry: new Date(Date.now() + expiryMinutes * 60 * 1000).getTime(),
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expiry > Date.now()) {
          resolve(result.data);
        } else {
          // Remove expired cache
          if (result) {
            const deleteTransaction = this.db!.transaction(['cache'], 'readwrite');
            const deleteStore = deleteTransaction.objectStore('cache');
            deleteStore.delete(key);
          }
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Preferences API
  async setPreference<T = unknown>(key: string, value: T): Promise<void> {
    if (!this.db) await this.initDB();

    const record = { key, value, updatedAt: new Date().toISOString() };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPreference<T = unknown>(key: string): Promise<T | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? (result.value as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Save form draft
  async saveDraft(formType: string, formData: unknown): Promise<string> {
    if (!this.db) await this.initDB();

    const draft = {
      id: crypto.randomUUID(),
      formType,
      formData,
      lastModified: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.put(draft);

      request.onsuccess = () => resolve(draft.id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get form drafts
  async getDrafts(formType?: string): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readonly');
      const store = transaction.objectStore('drafts');

      if (formType) {
        const index = store.index('formType');
        const request = index.getAll(formType);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } else {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }
    });
  }

  // Delete draft
  async deleteDraft(draftId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['drafts'], 'readwrite');
      const store = transaction.objectStore('drafts');
      const request = store.delete(draftId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clean up expired cache
  async cleanupCache(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync status
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingActions = await this.getPendingActions();
    
    return {
      isOnline: navigator.onLine,
      lastSync: localStorage.getItem('lastSync'),
      pendingActions: pendingActions.length,
      syncInProgress: false,
    };
  }

  // Subscribe to sync status changes
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  // Notify sync status callbacks
  private notifyCallbacks(status: SyncStatus): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });

    if (status.lastSync) {
      localStorage.setItem('lastSync', status.lastSync);
    }
  }

  // Force sync
  async forcSync(): Promise<void> {
    await this.sync();
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['actions', 'cache', 'drafts'], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('actions').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('cache').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore('drafts').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ]);
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

// React hook for offline functionality
export function useOffline() {
  const [status, setStatus] = React.useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingActions: 0,
    syncInProgress: false,
  });

  React.useEffect(() => {
    // Initial status
    offlineService.getSyncStatus().then(setStatus);

    // Subscribe to changes
    const unsubscribe = offlineService.onSyncStatusChange(setStatus);

    return unsubscribe;
  }, []);

  return {
    ...status,
    queueAction: offlineService.queueAction.bind(offlineService),
    sync: offlineService.forcSync.bind(offlineService),
    cacheData: offlineService.cacheData.bind(offlineService),
    getCachedData: offlineService.getCachedData.bind(offlineService),
    setPreference: offlineService.setPreference.bind(offlineService),
    getPreference: offlineService.getPreference.bind(offlineService),
    saveDraft: offlineService.saveDraft.bind(offlineService),
    getDrafts: offlineService.getDrafts.bind(offlineService),
    deleteDraft: offlineService.deleteDraft.bind(offlineService),
    clearOfflineData: offlineService.clearOfflineData.bind(offlineService),
  };
}

import React from 'react';