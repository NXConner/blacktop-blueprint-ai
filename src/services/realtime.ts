import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { 
  LiveVehicleLocation, 
  LiveCrewStatus, 
  Alert, 
  GPSTracking,
  WeatherData,
  SystemStatus
} from '@/types/database';

// Real-time subscription types
type SubscriptionCallback<T> = (payload: T) => void;
type SubscriptionErrorCallback = (error: unknown) => void;

interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

class RealtimeService {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();

  // Vehicle tracking subscriptions
  subscribeToVehicleLocations(
    callback: SubscriptionCallback<GPSTracking>,
    onError?: SubscriptionErrorCallback
  ): () => void {
    const channelName = 'vehicle-locations';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gps_locations'
        },
        (payload) => callback(payload.new as GPSTracking)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gps_locations'
        },
        (payload) => callback(payload.new as GPSTracking)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Vehicle locations subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to vehicle locations'));
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription.unsubscribe;
  }

  // Fleet vehicle status subscriptions
  subscribeToFleetStatus(
    callback: SubscriptionCallback<any>,
    onError?: SubscriptionErrorCallback
  ): () => void {
    const channelName = 'fleet-status';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fleet_vehicles'
        },
        (payload) => callback(payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Fleet status subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to fleet status'));
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription.unsubscribe;
  }

  // Weather data subscriptions
  subscribeToWeatherUpdates(
    callback: SubscriptionCallback<WeatherData>,
    onError?: SubscriptionErrorCallback
  ): () => void {
    const channelName = 'weather-updates';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weather_station_data'
        },
        (payload) => callback(payload.new as WeatherData)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Weather updates subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to weather updates'));
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription.unsubscribe;
  }

  // Alerts and notifications subscriptions
  subscribeToAlerts(
    callback: SubscriptionCallback<Alert>,
    onError?: SubscriptionErrorCallback
  ): () => void {
    const channelName = 'system-alerts';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts'
        },
        (payload) => callback(payload.new as Alert)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => callback(payload.new as Alert)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Alerts subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to alerts'));
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription.unsubscribe;
  }

  // System status monitoring
  subscribeToSystemStatus(
    callback: SubscriptionCallback<SystemStatus>,
    onError?: SubscriptionErrorCallback
  ): () => void {
    const channelName = 'system-status';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices'
        },
        (payload) => callback(payload.new as SystemStatus)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ System status subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to system status'));
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription.unsubscribe;
  }

  // Project updates subscriptions
  subscribeToProjectUpdates(
    projectId: string,
    callback: SubscriptionCallback<any>,
    onError?: SubscriptionErrorCallback
  ): () => void {
    const channelName = `project-${projectId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`
        },
        (payload) => callback(payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => callback(payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Project ${projectId} updates subscription active`);
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error(`Failed to subscribe to project ${projectId} updates`));
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription.unsubscribe;
  }

  // Employee activity tracking
  subscribeToEmployeeActivity(
    callback: SubscriptionCallback<any>,
    onError?: SubscriptionErrorCallback
  ): () => void {
    const channelName = 'employee-activity';
    
    if (this.subscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => callback(payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employee_scores'
        },
        (payload) => callback(payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Employee activity subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to employee activity'));
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription.unsubscribe;
  }

  // Presence tracking for online users
  subscribeToPresence(
    channelName: string,
    userMetadata: Record<string, unknown>,
    onJoin?: (user: unknown) => void,
    onLeave?: (user: unknown) => void
  ): () => void {
    const presenceChannelName = `presence-${channelName}`;
    
    if (this.subscriptions.has(presenceChannelName)) {
      this.unsubscribe(presenceChannelName);
    }

    const channel = supabase
      .channel(presenceChannelName, {
        config: {
          presence: {
            key: userMetadata.user_id,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('Presence sync:', presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        onJoin?.(newPresences[0]);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        onLeave?.(leftPresences[0]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Presence ${channelName} subscription active`);
          await channel.track(userMetadata);
        }
      });

    const subscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(presenceChannelName);
      }
    };

    this.subscriptions.set(presenceChannelName, subscription);
    return subscription.unsubscribe;
  }

  // Utility methods
  unsubscribe(channelName: string): void {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  // Broadcast messaging
  async broadcastMessage(
    channelName: string,
    event: string,
    payload: unknown
  ): Promise<void> {
    const channel = supabase.channel(channelName);
    
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event,
      payload
    });
    
    // Clean up after sending
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 1000);
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Export hooks for React components
export function useRealtimeSubscription<T>(
  subscriptionType: 'vehicles' | 'weather' | 'alerts' | 'fleet' | 'system',
  callback: SubscriptionCallback<T>,
  dependencies: unknown[] = []
): void {
  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    switch (subscriptionType) {
      case 'vehicles':
        unsubscribe = realtimeService.subscribeToVehicleLocations(callback as any);
        break;
      case 'weather':
        unsubscribe = realtimeService.subscribeToWeatherUpdates(callback as any);
        break;
      case 'alerts':
        unsubscribe = realtimeService.subscribeToAlerts(callback as any);
        break;
      case 'fleet':
        unsubscribe = realtimeService.subscribeToFleetStatus(callback as any);
        break;
      case 'system':
        unsubscribe = realtimeService.subscribeToSystemStatus(callback as any);
        break;
    }

    return () => {
      unsubscribe?.();
    };
  }, dependencies);
}

// React import for the hook
import React from 'react';