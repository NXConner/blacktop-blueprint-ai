import { supabase } from '@/integrations/supabase/client';
import { realtimeService } from './realtime';
import type { Alert } from '@/types/database';

// Notification types
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'weather' | 'fleet' | 'security' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  expires_at?: string;
  user_id?: string;
}

interface NotificationAction {
  id: string;
  label: string;
  action: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  weather_alerts: boolean;
  fleet_alerts: boolean;
  security_alerts: boolean;
  maintenance_alerts: boolean;
  cost_alerts: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationData['type'];
  title_template: string;
  message_template: string;
  severity: NotificationData['severity'];
  auto_dismiss?: boolean;
  dismiss_after?: number; // seconds
}

// Notification system class
class NotificationSystem {
  private notifications: Map<string, NotificationData> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private callbacks: Set<(notification: NotificationData) => void> = new Set();

  constructor() {
    this.initializeTemplates();
    this.subscribeToAlerts();
    this.loadUserPreferences();
  }

  // Initialize notification templates
  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'weather_warning',
        name: 'Weather Warning',
        type: 'weather',
        title_template: 'Weather Alert - {{weather_type}}',
        message_template: 'Weather conditions may affect operations: {{details}}',
        severity: 'high',
        auto_dismiss: false,
      },
      {
        id: 'vehicle_speed_alert',
        name: 'Vehicle Speed Alert',
        type: 'fleet',
        title_template: 'Speed Alert - {{vehicle_name}}',
        message_template: 'Vehicle {{vehicle_name}} is exceeding speed limit: {{speed}} km/h',
        severity: 'high',
        auto_dismiss: true,
        dismiss_after: 300, // 5 minutes
      },
      {
        id: 'vehicle_offline',
        name: 'Vehicle Offline',
        type: 'fleet',
        title_template: 'Vehicle Offline - {{vehicle_name}}',
        message_template: 'Vehicle {{vehicle_name}} has gone offline. Last location: {{location}}',
        severity: 'medium',
        auto_dismiss: false,
      },
      {
        id: 'maintenance_due',
        name: 'Maintenance Due',
        type: 'maintenance',
        title_template: 'Maintenance Due - {{vehicle_name}}',
        message_template: 'Vehicle {{vehicle_name}} is due for maintenance. Odometer: {{odometer}} km',
        severity: 'medium',
        auto_dismiss: false,
      },
      {
        id: 'security_alert',
        name: 'Security Alert',
        type: 'security',
        title_template: 'Security Alert - {{alert_type}}',
        message_template: 'Security event detected: {{details}}',
        severity: 'critical',
        auto_dismiss: false,
      },
      {
        id: 'cost_overrun',
        name: 'Cost Overrun',
        type: 'warning',
        title_template: 'Budget Alert - {{project_name}}',
        message_template: 'Project {{project_name}} is over budget by {{amount}}',
        severity: 'high',
        auto_dismiss: false,
      },
      {
        id: 'project_milestone',
        name: 'Project Milestone',
        type: 'success',
        title_template: 'Milestone Completed - {{project_name}}',
        message_template: 'Project {{project_name}} has completed milestone: {{milestone}}',
        severity: 'low',
        auto_dismiss: true,
        dismiss_after: 60,
      },
      {
        id: 'employee_violation',
        name: 'Employee Violation',
        type: 'warning',
        title_template: 'Compliance Violation - {{employee_name}}',
        message_template: 'Employee {{employee_name}} has committed a violation: {{violation_type}}',
        severity: 'high',
        auto_dismiss: false,
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Subscribe to real-time alerts
  private subscribeToAlerts(): void {
    realtimeService.subscribeToAlerts((alert: Alert) => {
      this.handleIncomingAlert(alert);
    });
  }

  // Handle incoming real-time alerts
  private async handleIncomingAlert(alert: Alert): Promise<void> {
    const notification = this.convertAlertToNotification(alert);
    await this.addNotification(notification);
  }

  // Convert alert to notification format
  private convertAlertToNotification(alert: Alert): NotificationData {
    return {
      id: alert.id,
      title: alert.title,
      message: alert.message,
      type: this.mapAlertTypeToNotificationType(alert.alert_type),
      severity: alert.severity,
      timestamp: alert.created_at,
      read: alert.acknowledged,
      data: {
        related_entity_type: alert.related_entity_type,
        related_entity_id: alert.related_entity_id,
        expires_at: alert.expires_at,
      },
      actions: this.generateActionsForAlert(alert),
    };
  }

  // Map alert types to notification types
  private mapAlertTypeToNotificationType(alertType: string): NotificationData['type'] {
    const mapping: Record<string, NotificationData['type']> = {
      weather: 'weather',
      maintenance: 'maintenance',
      cost_overrun: 'warning',
      safety: 'error',
      equipment: 'maintenance',
      fleet: 'fleet',
      security: 'security',
    };

    return mapping[alertType] || 'info';
  }

  // Generate actions for alerts
  private generateActionsForAlert(alert: Alert): NotificationAction[] {
    const actions: NotificationAction[] = [
      {
        id: 'acknowledge',
        label: 'Acknowledge',
        action: 'acknowledge_alert',
      },
    ];

    // Add specific actions based on alert type
    switch (alert.alert_type) {
      case 'maintenance':
        actions.push({
          id: 'schedule_maintenance',
          label: 'Schedule Maintenance',
          action: 'schedule_maintenance',
          variant: 'default',
        });
        break;
      case 'weather':
        actions.push({
          id: 'view_forecast',
          label: 'View Forecast',
          action: 'view_weather_forecast',
          variant: 'outline',
        });
        break;
      case 'fleet':
        actions.push({
          id: 'view_vehicle',
          label: 'View Vehicle',
          action: 'view_vehicle_details',
          variant: 'outline',
        });
        break;
      case 'security':
        actions.push({
          id: 'investigate',
          label: 'Investigate',
          action: 'investigate_security_event',
          variant: 'destructive',
        });
        break;
    }

    return actions;
  }

  // Create notification from template
  async createFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    userId?: string
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const notification: NotificationData = {
      id: crypto.randomUUID(),
      title: this.interpolateTemplate(template.title_template, variables),
      message: this.interpolateTemplate(template.message_template, variables),
      type: template.type,
      severity: template.severity,
      timestamp: new Date().toISOString(),
      read: false,
      data: variables,
      user_id: userId,
    };

    if (template.auto_dismiss && template.dismiss_after) {
      notification.expires_at = new Date(
        Date.now() + template.dismiss_after * 1000
      ).toISOString();
    }

    await this.addNotification(notification);
    return notification.id;
  }

  // Interpolate template variables
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // Add notification
  async addNotification(notification: NotificationData): Promise<void> {
    // Check user preferences
    if (notification.user_id) {
      const preferences = this.preferences.get(notification.user_id);
      if (preferences && !this.shouldSendNotification(notification, preferences)) {
        return;
      }
    }

    // Store in memory
    this.notifications.set(notification.id, notification);

    // Store in database
    await this.storeNotification(notification);

    // Notify listeners
    this.callbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });

    // Send push notification if enabled
    if (notification.user_id) {
      await this.sendPushNotification(notification);
    }

    // Auto-dismiss if configured
    if (notification.expires_at) {
      const expiresIn = new Date(notification.expires_at).getTime() - Date.now();
      if (expiresIn > 0) {
        setTimeout(() => {
          this.dismissNotification(notification.id);
        }, expiresIn);
      }
    }
  }

  // Check if notification should be sent based on preferences
  private shouldSendNotification(
    notification: NotificationData,
    preferences: NotificationPreferences
  ): boolean {
    // Check quiet hours
    if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = this.parseTime(preferences.quiet_hours_start);
      const endTime = this.parseTime(preferences.quiet_hours_end);

      if (this.isInQuietHours(currentTime, startTime, endTime)) {
        // Only send critical notifications during quiet hours
        return notification.severity === 'critical';
      }
    }

    // Check type-specific preferences
    switch (notification.type) {
      case 'weather':
        return preferences.weather_alerts;
      case 'fleet':
        return preferences.fleet_alerts;
      case 'security':
        return preferences.security_alerts;
      case 'maintenance':
        return preferences.maintenance_alerts;
      default:
        return true;
    }
  }

  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isInQuietHours(current: number, start: number, end: number): boolean {
    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Quiet hours cross midnight
      return current >= start || current <= end;
    }
  }

  // Store notification in database
  private async storeNotification(notification: NotificationData): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        data: notification.data,
        user_id: notification.user_id,
        created_at: notification.timestamp,
      });
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  // Send push notification
  private async sendPushNotification(notification: NotificationData): Promise<void> {
    if (!notification.user_id) return;

    try {
      // Get user's devices
      const { data: devices, error } = await supabase
        .from('mobile_devices')
        .select('device_token')
        .eq('user_id', notification.user_id)
        .eq('status', 'active');

      if (error || !devices.length) return;

      // Send to each device (in a real implementation, you'd use a push notification service)
      const pushPromises = devices.map(device => 
        this.sendToDevice(device.device_token, notification)
      );

      await Promise.allSettled(pushPromises);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Send to specific device (mock implementation)
  private async sendToDevice(deviceToken: string, notification: NotificationData): Promise<void> {
    // In a real implementation, you would use a service like Firebase Cloud Messaging
    console.log(`Sending push notification to device ${deviceToken}:`, {
      title: notification.title,
      body: notification.message,
    });

    // Store the push notification attempt
    await supabase.from('mobile_notifications').insert({
      device_id: deviceToken,
      title: notification.title,
      body: notification.message,
      type: notification.type,
      data: notification.data,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);

      // Update in database
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    }
  }

  // Dismiss notification
  async dismissNotification(notificationId: string): Promise<void> {
    this.notifications.delete(notificationId);

    // Remove from database (or mark as dismissed)
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
  }

  // Handle notification action
  async handleAction(notificationId: string, actionId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) return;

    switch (action.action) {
      case 'acknowledge_alert':
        await this.acknowledgeAlert(notification);
        break;
      case 'schedule_maintenance':
        await this.scheduleMaintenanceFromNotification(notification);
        break;
      case 'view_weather_forecast':
        // This would typically trigger navigation in the UI
        console.log('Viewing weather forecast');
        break;
      case 'view_vehicle_details':
        console.log('Viewing vehicle details:', notification.data);
        break;
      case 'investigate_security_event':
        await this.investigateSecurityEvent(notification);
        break;
    }

    // Mark as read after action
    await this.markAsRead(notificationId);
  }

  // Acknowledge alert
  private async acknowledgeAlert(notification: NotificationData): Promise<void> {
    if (notification.data?.related_entity_type === 'alert') {
      await supabase
        .from('security_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', notification.data.related_entity_id);
    }
  }

  // Schedule maintenance from notification
  private async scheduleMaintenanceFromNotification(notification: NotificationData): Promise<void> {
    // This would integrate with a maintenance scheduling system
    console.log('Scheduling maintenance for:', notification.data);
  }

  // Investigate security event
  private async investigateSecurityEvent(notification: NotificationData): Promise<void> {
    // This would create an investigation record or workflow
    console.log('Starting security investigation for:', notification.data);
  }

  // Get all notifications for user
  getNotifications(userId?: string): NotificationData[] {
    const allNotifications = Array.from(this.notifications.values());
    
    if (userId) {
      return allNotifications.filter(n => n.user_id === userId || !n.user_id);
    }
    
    return allNotifications;
  }

  // Get unread count
  getUnreadCount(userId?: string): number {
    return this.getNotifications(userId).filter(n => !n.read).length;
  }

  // Subscribe to notifications
  subscribe(callback: (notification: NotificationData) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Load user preferences
  private async loadUserPreferences(): Promise<void> {
    try {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*');

      if (error) throw error;

      preferences?.forEach(pref => {
        this.preferences.set(pref.user_id, pref as NotificationPreferences);
      });
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  // Update user preferences
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = this.preferences.get(userId) || {
      user_id: userId,
      email_notifications: true,
      push_notifications: true,
      weather_alerts: true,
      fleet_alerts: true,
      security_alerts: true,
      maintenance_alerts: true,
      cost_alerts: true,
    };

    const updated = { ...current, ...preferences };
    this.preferences.set(userId, updated);

    // Update in database
    await supabase
      .from('user_preferences')
      .upsert(updated)
      .eq('user_id', userId);
  }

  // Clean up expired notifications
  async cleanupExpired(): Promise<void> {
    const now = new Date();
    const expired: string[] = [];

    for (const [id, notification] of this.notifications) {
      if (notification.expires_at && new Date(notification.expires_at) <= now) {
        expired.push(id);
      }
    }

    // Remove expired notifications
    for (const id of expired) {
      await this.dismissNotification(id);
    }

    console.log(`Cleaned up ${expired.length} expired notifications`);
  }
}

// Export singleton instance
export const notificationSystem = new NotificationSystem();

// React hook for notifications
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = React.useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const updateNotifications = () => {
      setNotifications(notificationSystem.getNotifications(userId));
      setUnreadCount(notificationSystem.getUnreadCount(userId));
    };

    // Initial load
    updateNotifications();

    // Subscribe to new notifications
    const unsubscribe = notificationSystem.subscribe(() => {
      updateNotifications();
    });

    return unsubscribe;
  }, [userId]);

  return {
    notifications,
    unreadCount,
    markAsRead: notificationSystem.markAsRead.bind(notificationSystem),
    dismiss: notificationSystem.dismissNotification.bind(notificationSystem),
    handleAction: notificationSystem.handleAction.bind(notificationSystem),
    createFromTemplate: notificationSystem.createFromTemplate.bind(notificationSystem),
  };
}

// Utility functions for common notification scenarios
export const NotificationUtils = {
  // Weather notifications
  async createWeatherAlert(severity: 'low' | 'medium' | 'high', weatherType: string, details: string) {
    return notificationSystem.createFromTemplate('weather_warning', {
      weather_type: weatherType,
      details,
    });
  },

  // Fleet notifications
  async createVehicleSpeedAlert(vehicleName: string, speed: number) {
    return notificationSystem.createFromTemplate('vehicle_speed_alert', {
      vehicle_name: vehicleName,
      speed,
    });
  },

  async createVehicleOfflineAlert(vehicleName: string, location: string) {
    return notificationSystem.createFromTemplate('vehicle_offline', {
      vehicle_name: vehicleName,
      location,
    });
  },

  // Maintenance notifications
  async createMaintenanceAlert(vehicleName: string, odometer: number) {
    return notificationSystem.createFromTemplate('maintenance_due', {
      vehicle_name: vehicleName,
      odometer,
    });
  },

  // Project notifications
  async createMilestoneNotification(projectName: string, milestone: string) {
    return notificationSystem.createFromTemplate('project_milestone', {
      project_name: projectName,
      milestone,
    });
  },

  async createCostOverrunAlert(projectName: string, amount: string) {
    return notificationSystem.createFromTemplate('cost_overrun', {
      project_name: projectName,
      amount,
    });
  },
};

import React from 'react';