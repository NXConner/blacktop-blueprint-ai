import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse, PaginatedResponse } from '@/types/database';

// Analytics API for dashboard and reporting
export const analyticsApi = {
  // Get dashboard statistics
  async getDashboardStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<ApiResponse<any>> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Get various statistics in parallel
      const [
        { data: activeProjects },
        { data: fleetVehicles },
        { data: employees },
        { data: totalCosts },
        { data: recentAlerts }
      ] = await Promise.all([
        supabase.from('projects').select('id').eq('status', 'active'),
        supabase.from('fleet_vehicles').select('id, status'),
        supabase.from('employees').select('id').eq('status', 'active'),
        supabase.from('employee_costs').select('amount').gte('created_at', startDate.toISOString()),
        supabase.from('notifications').select('id, type, created_at').gte('created_at', startDate.toISOString()).order('created_at', { ascending: false }).limit(10)
      ]);

      const stats = {
        activeProjects: activeProjects?.length || 0,
        totalVehicles: fleetVehicles?.length || 0,
        activeVehicles: fleetVehicles?.filter(v => v.status === 'active').length || 0,
        activeEmployees: employees?.length || 0,
        totalCosts: totalCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0,
        recentAlerts: recentAlerts || [],
        timeframe,
        lastUpdated: new Date().toISOString()
      };

      return { data: stats, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  },

  // Get project performance metrics
  async getProjectMetrics(projectId: string): Promise<ApiResponse<any>> {
    try {
      const [
        { data: project },
        { data: tasks },
        { data: costs },
        { data: sessions }
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('project_tasks').select('*').eq('project_id', projectId),
        supabase.from('employee_costs').select('*').eq('project_id', projectId),
        supabase.from('routes').select('*').eq('status', 'completed') // Using routes as proxy for work sessions
      ]);

      const totalCosts = costs?.reduce((sum, cost) => sum + cost.amount, 0) || 0;
      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;
      const totalTasks = tasks?.length || 0;
      const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const metrics = {
        project,
        progressPercentage: Math.round(progressPercentage),
        totalCosts,
        budgetVariance: project ? totalCosts - (project.estimated_cost || 0) : 0,
        completedTasks,
        totalTasks,
        totalSessions: sessions?.length || 0,
        lastUpdated: new Date().toISOString()
      };

      return { data: metrics, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  },

  // Get fleet performance analytics
  async getFleetAnalytics(timeframe: string = 'week'): Promise<ApiResponse<any>> {
    try {
      const { data: vehicles, error } = await supabase
        .from('fleet_vehicles')
        .select('id, name, status, fuel_level, odometer, created_at');

      if (error) throw error;

      const analytics = {
        totalVehicles: vehicles?.length || 0,
        activeVehicles: vehicles?.filter(v => v.status === 'active').length || 0,
        averageFuelLevel: vehicles?.reduce((sum, v) => sum + (v.fuel_level || 0), 0) / (vehicles?.length || 1),
        totalOdometer: vehicles?.reduce((sum, v) => sum + (v.odometer || 0), 0) || 0,
        statusBreakdown: vehicles?.reduce((acc, v) => {
          acc[v.status || 'unknown'] = (acc[v.status || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };

      return { data: analytics, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Reporting API for generating reports
export const reportingApi = {
  // Generate project report
  async generateProjectReport(projectId: string, options: {
    includeFinancials?: boolean;
    includeTasks?: boolean;
    includeTimeline?: boolean;
  } = {}): Promise<ApiResponse<any>> {
    try {
      const baseQuery = supabase.from('projects').select('*').eq('id', projectId).single();
      const { data: project, error: projectError } = await baseQuery;

      if (projectError) throw projectError;

      const reportData: any = { project };

      if (options.includeFinancials) {
        const { data: costs } = await supabase
          .from('employee_costs')
          .select('*')
          .eq('project_id', projectId);
        
        reportData.financials = {
          costs: costs || [],
          totalCost: costs?.reduce((sum, cost) => sum + cost.amount, 0) || 0,
          budgetVariance: (costs?.reduce((sum, cost) => sum + cost.amount, 0) || 0) - (project.estimated_cost || 0)
        };
      }

      if (options.includeTasks) {
        const { data: tasks } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('project_id', projectId);
        
        reportData.tasks = tasks || [];
      }

      if (options.includeTimeline) {
        const { data: milestones } = await supabase
          .from('project_milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('target_date', { ascending: true });
        
        reportData.timeline = milestones || [];
      }

      reportData.generatedAt = new Date().toISOString();
      return { data: reportData, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  },

  // Generate fleet report
  async generateFleetReport(): Promise<ApiResponse<any>> {
    try {
      const [
        { data: vehicles },
        { data: maintenanceRecords },
        { data: routes }
      ] = await Promise.all([
        supabase.from('fleet_vehicles').select('*'),
        supabase.from('maintenance_records').select('*'),
        supabase.from('routes').select('*').eq('status', 'completed')
      ]);

      const reportData = {
        vehicles: vehicles || [],
        maintenanceRecords: maintenanceRecords || [],
        routes: routes || [],
        summary: {
          totalVehicles: vehicles?.length || 0,
          totalRoutes: routes?.length || 0,
          totalMaintenanceRecords: maintenanceRecords?.length || 0,
          totalDistance: routes?.reduce((sum, route) => sum + (route.estimated_distance || 0), 0) || 0
        },
        generatedAt: new Date().toISOString()
      };

      return { data: reportData, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Mobile API for mobile app specific endpoints
export const mobileApi = {
  // Register mobile device
  async registerDevice(deviceData: {
    device_id: string;
    device_type: string;
    device_token?: string;
    user_id?: string;
    app_version?: string;
    os_version?: string;
    model?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('mobile_devices')
        .upsert({
          ...deviceData,
          status: 'active',
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  },

  // Log mobile session
  async logSession(sessionData: {
    device_id: string;
    user_id?: string;
    session_token: string;
    start_time: string;
    ip_address?: string;
    location?: any;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('mobile_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  },

  // End mobile session
  async endSession(sessionId: string): Promise<ApiResponse<any>> {
    try {
      const endTime = new Date().toISOString();
      
      // Get session start time to calculate duration
      const { data: session } = await supabase
        .from('mobile_sessions')
        .select('start_time')
        .eq('id', sessionId)
        .single();

      const duration = session ? 
        (new Date(endTime).getTime() - new Date(session.start_time).getTime()) / 1000 : 0;

      const { data, error } = await supabase
        .from('mobile_sessions')
        .update({
          end_time: endTime,
          duration: Math.round(duration)
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  },

  // Log app usage metrics
  async logUsageMetrics(metricsData: {
    user_id?: string;
    device_id?: string;
    session_id?: string;
    feature_name: string;
    action_type?: string;
    duration?: number;
    metadata?: any;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('app_usage_metrics')
        .insert(metricsData)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  },

  // Get mobile notifications for user
  async getNotifications(userId: string, limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('mobile_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error: any) {
      return { data: [], success: false, message: error.message };
    }
  },

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('mobile_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Search API for advanced search functionality
export const searchApi = {
  // Global search across multiple tables
  async globalSearch(query: string, options: {
    tables?: string[];
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    try {
      const { tables = ['projects', 'employees', 'fleet_vehicles'], limit = 10 } = options;
      const results: any = {};

      // Search projects
      if (tables.includes('projects')) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, description, status')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit);
        results.projects = projects || [];
      }

      // Search employees
      if (tables.includes('employees')) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, first_name, last_name, email, role')
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(limit);
        results.employees = employees || [];
      }

      // Search vehicles
      if (tables.includes('fleet_vehicles')) {
        const { data: vehicles } = await supabase
          .from('fleet_vehicles')
          .select('id, name, license_plate, type')
          .or(`name.ilike.%${query}%,license_plate.ilike.%${query}%`)
          .limit(limit);
        results.vehicles = vehicles || [];
      }

      return { data: results, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Geolocation API for location-based features
export const geolocationApi = {
  // Find nearby projects
  async findNearbyProjects(latitude: number, longitude: number, radiusKm: number = 10): Promise<ApiResponse<any[]>> {
    try {
      // In a real implementation, you would use PostGIS for spatial queries
      // For now, we'll use a simplified approach
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .not('site_address', 'is', null);

      if (error) throw error;

      // Simple distance calculation (in a real app, use PostGIS ST_DWithin)
      const nearbyProjects = projects?.filter(project => {
        // This is a simplified check - in reality you'd geocode addresses
        // and use proper geographic distance calculation
        return true; // For demo purposes
      }) || [];

      return { data: nearbyProjects, success: true };
    } catch (error: any) {
      return { data: [], success: false, message: error.message };
    }
  },

  // Record GPS location
  async recordLocation(locationData: {
    device_id: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    battery_level?: number;
    signal_strength?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('gps_locations')
        .insert({
          ...locationData,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error: any) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Export extended API collection
export const extendedApi = {
  analytics: analyticsApi,
  reporting: reportingApi,
  mobile: mobileApi,
  search: searchApi,
  geolocation: geolocationApi
};