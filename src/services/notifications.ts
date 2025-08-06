import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  time: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Notification service singleton
class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  constructor() {
    // Initialize with some sample notifications
    this.notifications = [
      {
        id: '1',
        title: 'System Alert',
        message: 'Crew deployment has been completed successfully',
        type: 'success',
        time: '2 mins ago',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        title: 'Equipment Warning',
        message: 'Vehicle maintenance required for unit V-101',
        type: 'warning',
        time: '15 mins ago',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        title: 'New Message',
        message: 'Update received from field operations',
        type: 'info',
        time: '1 hour ago',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false
      }
    ];
  }

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    return newNotification;
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Remove notification
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get all notifications
  getNotifications() {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Subscribe to notifications
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Update notification time formatting
  updateTimeLabels() {
    this.notifications.forEach(notification => {
      const timeDiff = Date.now() - notification.timestamp.getTime();
      const minutes = Math.floor(timeDiff / (1000 * 60));
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      if (minutes < 1) {
        notification.time = 'Just now';
      } else if (minutes < 60) {
        notification.time = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
      } else if (hours < 24) {
        notification.time = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        notification.time = `${days} day${days > 1 ? 's' : ''} ago`;
      }
    });
    this.notifyListeners();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// React hook for using notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(
    notificationService.getNotifications()
  );

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(setNotifications);

    // Update time labels every minute
    const timeUpdateInterval = setInterval(() => {
      notificationService.updateTimeLabels();
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(timeUpdateInterval);
    };
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    return notificationService.addNotification(notification);
  };

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const removeNotification = (id: string) => {
    notificationService.removeNotification(id);
  };

  const clearAll = () => {
    notificationService.clearAll();
  };

  const unreadCount = notificationService.getUnreadCount();

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

// Export service for direct use
export { notificationService };

// Helper functions for common notification types
export const showSuccessNotification = (title: string, message: string) => {
  return notificationService.addNotification({
    title,
    message,
    type: 'success',
    time: 'Just now',
    read: false,
  });
};

export const showWarningNotification = (title: string, message: string) => {
  return notificationService.addNotification({
    title,
    message,
    type: 'warning',
    time: 'Just now',
    read: false,
  });
};

export const showErrorNotification = (title: string, message: string) => {
  return notificationService.addNotification({
    title,
    message,
    type: 'error',
    time: 'Just now',
    read: false,
  });
};

export const showInfoNotification = (title: string, message: string) => {
  return notificationService.addNotification({
    title,
    message,
    type: 'info',
    time: 'Just now',
    read: false,
  });
};

// System notification handlers (for existing system integrations)
export const handleSystemNotification = (type: 'crew' | 'equipment' | 'weather' | 'security', data: any) => {
  switch (type) {
    case 'crew':
      if (data.event === 'deployment_complete') {
        showSuccessNotification(
          'Crew Deployment Complete',
          `Crew ${data.crewId} has been successfully deployed to ${data.location}`
        );
      } else if (data.event === 'emergency') {
        showErrorNotification(
          'Emergency Alert',
          `Emergency reported by crew ${data.crewId} at ${data.location}`
        );
      }
      break;
      
    case 'equipment':
      if (data.event === 'maintenance_required') {
        showWarningNotification(
          'Maintenance Required',
          `Vehicle ${data.vehicleId} requires immediate maintenance`
        );
      } else if (data.event === 'breakdown') {
        showErrorNotification(
          'Equipment Breakdown',
          `Critical failure detected in ${data.equipmentType} ${data.equipmentId}`
        );
      }
      break;
      
    case 'weather':
      if (data.event === 'severe_weather') {
        showWarningNotification(
          'Severe Weather Alert',
          `${data.weatherType} warning issued for operational areas`
        );
      }
      break;
      
    case 'security':
      if (data.event === 'access_violation') {
        showErrorNotification(
          'Security Alert',
          `Unauthorized access attempt detected at ${data.location}`
        );
      }
      break;
      
    default:
      showInfoNotification('System Update', data.message || 'System notification received');
  }
};