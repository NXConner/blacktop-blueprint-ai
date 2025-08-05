import { supabase } from '@/integrations/supabase/client';
import { realtimeService } from './realtime';
import type { ApiResponse } from '@/types/database';

// Chart data types
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter' | 'pie';
}

export interface ChartConfig {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'heatmap' | 'gauge';
  series: ChartSeries[];
  xAxis?: {
    title: string;
    type: 'category' | 'datetime' | 'numeric';
    format?: string;
  };
  yAxis?: {
    title: string;
    format?: string;
    min?: number;
    max?: number;
  };
  realtime?: boolean;
  refreshInterval?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  timeRange?: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month';
  };
}

// Dashboard layout types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'map' | 'alert';
  chartConfig?: ChartConfig;
  metricConfig?: {
    value: number;
    label: string;
    trend?: number;
    format?: string;
    color?: string;
  };
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  dataSource: string;
  filters?: Record<string, any>;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'flex';
  refreshInterval?: number;
  isPublic?: boolean;
  tags?: string[];
}

class DataVisualizationService {
  private charts: Map<string, ChartConfig> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private subscriptions: Map<string, () => void> = new Map();
  private updateCallbacks: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.loadSavedDashboards();
  }

  // Create chart configuration
  async createChart(config: Omit<ChartConfig, 'id'>): Promise<string> {
    const chartId = crypto.randomUUID();
    const chartConfig: ChartConfig = {
      ...config,
      id: chartId,
    };

    this.charts.set(chartId, chartConfig);

    // Setup real-time updates if enabled
    if (chartConfig.realtime) {
      this.setupRealtimeChart(chartId);
    }

    return chartId;
  }

  // Setup real-time chart updates
  private setupRealtimeChart(chartId: string): void {
    const config = this.charts.get(chartId);
    if (!config) return;

    // Subscribe based on chart type and data source
    const unsubscribe = realtimeService.subscribeToSystemStatus((update) => {
      this.updateChartData(chartId, update);
    });

    this.subscriptions.set(chartId, unsubscribe);

    // Also setup periodic refresh
    if (config.refreshInterval) {
      const interval = setInterval(() => {
        this.refreshChartData(chartId);
      }, config.refreshInterval);

      const originalUnsub = this.subscriptions.get(chartId);
      this.subscriptions.set(chartId, () => {
        originalUnsub?.();
        clearInterval(interval);
      });
    }
  }

  // Update chart data
  private updateChartData(chartId: string, newData: any): void {
    const callbacks = this.updateCallbacks.get(chartId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newData);
        } catch (error) {
          console.error('Error in chart update callback:', error);
        }
      });
    }
  }

  // Refresh chart data from database
  private async refreshChartData(chartId: string): Promise<void> {
    const config = this.charts.get(chartId);
    if (!config) return;

    try {
      const data = await this.generateChartData(config);
      this.updateChartData(chartId, data);
    } catch (error) {
      console.error('Failed to refresh chart data:', error);
    }
  }

  // Generate chart data based on configuration
  async generateChartData(config: ChartConfig): Promise<ChartSeries[]> {
    const { type, timeRange, aggregation } = config;

    switch (type) {
      case 'line':
      case 'area':
        return this.generateTimeSeriesData(config);
      case 'bar':
        return this.generateBarChartData(config);
      case 'pie':
        return this.generatePieChartData(config);
      case 'gauge':
        return this.generateGaugeData(config);
      case 'heatmap':
        return this.generateHeatmapData(config);
      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }

  // Generate time series data
  private async generateTimeSeriesData(config: ChartConfig): Promise<ChartSeries[]> {
    const { timeRange } = config;
    
    try {
      // Fleet utilization over time
      const { data: fleetData } = await supabase
        .from('fleet_vehicles')
        .select('created_at, status')
        .gte('created_at', timeRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', timeRange?.end || new Date().toISOString())
        .order('created_at');

      // Process data by day
      const dailyStats = this.aggregateByTimeGranularity(
        fleetData || [],
        'created_at',
        timeRange?.granularity || 'day',
        (items) => items.filter(item => item.status === 'active').length
      );

      return [{
        name: 'Active Vehicles',
        data: dailyStats.map(stat => ({
          x: stat.date,
          y: stat.value,
        })),
        color: '#3b82f6',
        type: 'line',
      }];
    } catch (error) {
      console.error('Failed to generate time series data:', error);
      return [];
    }
  }

  // Generate bar chart data
  private async generateBarChartData(config: ChartConfig): Promise<ChartSeries[]> {
    try {
      // Project status distribution
      const { data: projects } = await supabase
        .from('projects')
        .select('status');

      const statusCounts = (projects || []).reduce((acc, project) => {
        acc[project.status || 'unknown'] = (acc[project.status || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return [{
        name: 'Projects by Status',
        data: Object.entries(statusCounts).map(([status, count]) => ({
          x: status,
          y: count,
          label: status,
        })),
        type: 'bar',
      }];
    } catch (error) {
      console.error('Failed to generate bar chart data:', error);
      return [];
    }
  }

  // Generate pie chart data
  private async generatePieChartData(config: ChartConfig): Promise<ChartSeries[]> {
    try {
      // Cost breakdown by category
      const { data: costs } = await supabase
        .from('employee_costs')
        .select('category, amount');

      const categoryTotals = (costs || []).reduce((acc, cost) => {
        acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
        return acc;
      }, {} as Record<string, number>);

      return [{
        name: 'Cost Distribution',
        data: Object.entries(categoryTotals).map(([category, total]) => ({
          x: category,
          y: total,
          label: `${category}: $${total.toLocaleString()}`,
        })),
        type: 'pie',
      }];
    } catch (error) {
      console.error('Failed to generate pie chart data:', error);
      return [];
    }
  }

  // Generate gauge data
  private async generateGaugeData(config: ChartConfig): Promise<ChartSeries[]> {
    try {
      // Fleet utilization percentage
      const { data: vehicles } = await supabase
        .from('fleet_vehicles')
        .select('status');

      const total = vehicles?.length || 0;
      const active = vehicles?.filter(v => v.status === 'active').length || 0;
      const utilization = total > 0 ? (active / total) * 100 : 0;

      return [{
        name: 'Fleet Utilization',
        data: [{
          x: 'Utilization',
          y: Math.round(utilization),
          label: `${Math.round(utilization)}%`,
        }],
        type: 'pie', // Gauge represented as pie for simplicity
      }];
    } catch (error) {
      console.error('Failed to generate gauge data:', error);
      return [];
    }
  }

  // Generate heatmap data
  private async generateHeatmapData(config: ChartConfig): Promise<ChartSeries[]> {
    try {
      // Activity heatmap by hour and day
      const { data: activities } = await supabase
        .from('routes')
        .select('start_time')
        .not('start_time', 'is', null);

      const heatmapData: ChartDataPoint[] = [];
      const hourCounts: Record<string, Record<number, number>> = {};

      activities?.forEach(activity => {
        const date = new Date(activity.start_time);
        const day = date.toLocaleDateString();
        const hour = date.getHours();

        if (!hourCounts[day]) hourCounts[day] = {};
        hourCounts[day][hour] = (hourCounts[day][hour] || 0) + 1;
      });

      // Convert to heatmap format
      Object.entries(hourCounts).forEach(([day, hours]) => {
        Object.entries(hours).forEach(([hour, count]) => {
          heatmapData.push({
            x: day,
            y: count,
            metadata: { hour: parseInt(hour), day },
          });
        });
      });

      return [{
        name: 'Activity Heatmap',
        data: heatmapData,
        type: 'scatter',
      }];
    } catch (error) {
      console.error('Failed to generate heatmap data:', error);
      return [];
    }
  }

  // Aggregate data by time granularity
  private aggregateByTimeGranularity(
    data: any[],
    dateField: string,
    granularity: 'hour' | 'day' | 'week' | 'month',
    aggregator: (items: any[]) => number
  ): Array<{ date: string; value: number }> {
    const groups: Record<string, any[]> = {};

    data.forEach(item => {
      const date = new Date(item[dateField]);
      let key: string;

      switch (granularity) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
          break;
        case 'week':
          const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
          key = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups)
      .map(([date, items]) => ({
        date,
        value: aggregator(items),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Create dashboard
  async createDashboard(dashboard: Omit<Dashboard, 'id'>): Promise<string> {
    const dashboardId = crypto.randomUUID();
    const newDashboard: Dashboard = {
      ...dashboard,
      id: dashboardId,
    };

    this.dashboards.set(dashboardId, newDashboard);
    await this.saveDashboard(newDashboard);

    return dashboardId;
  }

  // Get dashboard
  getDashboard(dashboardId: string): Dashboard | null {
    return this.dashboards.get(dashboardId) || null;
  }

  // Update dashboard
  async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return;

    const updatedDashboard = { ...dashboard, ...updates };
    this.dashboards.set(dashboardId, updatedDashboard);
    await this.saveDashboard(updatedDashboard);
  }

  // Delete dashboard
  async deleteDashboard(dashboardId: string): Promise<void> {
    this.dashboards.delete(dashboardId);
    
    // Also remove from storage
    try {
      await supabase
        .from('app_configs')
        .delete()
        .eq('name', `dashboard_${dashboardId}`);
    } catch (error) {
      console.error('Failed to delete dashboard from storage:', error);
    }
  }

  // Save dashboard to storage
  private async saveDashboard(dashboard: Dashboard): Promise<void> {
    try {
      await supabase
        .from('app_configs')
        .upsert({
          name: `dashboard_${dashboard.id}`,
          value: dashboard,
          description: `Dashboard: ${dashboard.name}`,
          is_active: true,
        });
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  }

  // Load saved dashboards
  private async loadSavedDashboards(): Promise<void> {
    try {
      const { data: configs } = await supabase
        .from('app_configs')
        .select('*')
        .like('name', 'dashboard_%')
        .eq('is_active', true);

      configs?.forEach(config => {
        const dashboard = config.value as Dashboard;
        this.dashboards.set(dashboard.id, dashboard);
      });
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    }
  }

  // Get predefined dashboard templates
  getDashboardTemplates(): Dashboard[] {
    return [
      {
        id: 'template-fleet-overview',
        name: 'Fleet Overview',
        description: 'Comprehensive fleet monitoring dashboard',
        layout: 'grid',
        widgets: [
          {
            id: 'fleet-utilization',
            title: 'Fleet Utilization',
            type: 'chart',
            chartConfig: {
              id: 'fleet-util-chart',
              title: 'Fleet Utilization',
              type: 'gauge',
              series: [],
              realtime: true,
              refreshInterval: 30000,
            },
            position: { x: 0, y: 0, w: 6, h: 4 },
            dataSource: 'fleet_vehicles',
          },
          {
            id: 'vehicle-status',
            title: 'Vehicle Status',
            type: 'chart',
            chartConfig: {
              id: 'vehicle-status-chart',
              title: 'Vehicle Status Distribution',
              type: 'pie',
              series: [],
              realtime: true,
              refreshInterval: 60000,
            },
            position: { x: 6, y: 0, w: 6, h: 4 },
            dataSource: 'fleet_vehicles',
          },
          {
            id: 'daily-routes',
            title: 'Daily Routes',
            type: 'chart',
            chartConfig: {
              id: 'daily-routes-chart',
              title: 'Routes Completed',
              type: 'line',
              series: [],
              timeRange: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString(),
                granularity: 'day',
              },
              realtime: true,
              refreshInterval: 300000,
            },
            position: { x: 0, y: 4, w: 12, h: 6 },
            dataSource: 'routes',
          },
        ],
      },
      {
        id: 'template-project-management',
        name: 'Project Management',
        description: 'Project progress and resource tracking',
        layout: 'grid',
        widgets: [
          {
            id: 'project-status',
            title: 'Project Status',
            type: 'chart',
            chartConfig: {
              id: 'project-status-chart',
              title: 'Projects by Status',
              type: 'bar',
              series: [],
              realtime: true,
              refreshInterval: 120000,
            },
            position: { x: 0, y: 0, w: 6, h: 4 },
            dataSource: 'projects',
          },
          {
            id: 'cost-breakdown',
            title: 'Cost Breakdown',
            type: 'chart',
            chartConfig: {
              id: 'cost-breakdown-chart',
              title: 'Cost by Category',
              type: 'pie',
              series: [],
              realtime: true,
              refreshInterval: 300000,
            },
            position: { x: 6, y: 0, w: 6, h: 4 },
            dataSource: 'employee_costs',
          },
        ],
      },
    ];
  }

  // Subscribe to chart updates
  subscribeToChart(chartId: string, callback: (data: any) => void): () => void {
    if (!this.updateCallbacks.has(chartId)) {
      this.updateCallbacks.set(chartId, new Set());
    }

    const callbacks = this.updateCallbacks.get(chartId)!;
    callbacks.add(callback);

    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.updateCallbacks.delete(chartId);
        // Also unsubscribe from real-time updates
        const unsubscribe = this.subscriptions.get(chartId);
        if (unsubscribe) {
          unsubscribe();
          this.subscriptions.delete(chartId);
        }
      }
    };
  }

  // Get all dashboards
  getAllDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  // Generate analytics report
  async generateAnalyticsReport(timeRange: { start: string; end: string }): Promise<any> {
    try {
      const [projectsData, fleetData, costsData, alertsData] = await Promise.all([
        this.getProjectAnalytics(timeRange),
        this.getFleetAnalytics(timeRange),
        this.getCostAnalytics(timeRange),
        this.getAlertAnalytics(timeRange),
      ]);

      return {
        timeRange,
        generatedAt: new Date().toISOString(),
        projects: projectsData,
        fleet: fleetData,
        costs: costsData,
        alerts: alertsData,
        summary: {
          totalProjects: projectsData.total,
          activeVehicles: fleetData.activeCount,
          totalCosts: costsData.total,
          criticalAlerts: alertsData.critical,
        },
      };
    } catch (error) {
      console.error('Failed to generate analytics report:', error);
      throw error;
    }
  }

  // Get project analytics
  private async getProjectAnalytics(timeRange: { start: string; end: string }): Promise<any> {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end);

    const statusCounts = (projects || []).reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: projects?.length || 0,
      statusBreakdown: statusCounts,
      avgCost: projects?.reduce((sum, p) => sum + (p.estimated_cost || 0), 0) / (projects?.length || 1),
    };
  }

  // Get fleet analytics
  private async getFleetAnalytics(timeRange: { start: string; end: string }): Promise<any> {
    const { data: vehicles } = await supabase
      .from('fleet_vehicles')
      .select('*');

    const { data: routes } = await supabase
      .from('routes')
      .select('*')
      .gte('start_time', timeRange.start)
      .lte('start_time', timeRange.end);

    return {
      totalVehicles: vehicles?.length || 0,
      activeCount: vehicles?.filter(v => v.status === 'active').length || 0,
      totalRoutes: routes?.length || 0,
      totalDistance: routes?.reduce((sum, r) => sum + (r.estimated_distance || 0), 0) || 0,
    };
  }

  // Get cost analytics
  private async getCostAnalytics(timeRange: { start: string; end: string }): Promise<any> {
    const { data: costs } = await supabase
      .from('employee_costs')
      .select('*')
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end);

    const categoryTotals = (costs || []).reduce((acc, cost) => {
      acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: costs?.reduce((sum, c) => sum + c.amount, 0) || 0,
      categoryBreakdown: categoryTotals,
      avgPerEntry: (costs?.reduce((sum, c) => sum + c.amount, 0) || 0) / (costs?.length || 1),
    };
  }

  // Get alert analytics
  private async getAlertAnalytics(timeRange: { start: string; end: string }): Promise<any> {
    const { data: alerts } = await supabase
      .from('notifications')
      .select('*')
      .gte('created_at', timeRange.start)
      .lte('created_at', timeRange.end);

    const typeCounts = (alerts || []).reduce((acc, alert) => {
      acc[alert.type || 'unknown'] = (acc[alert.type || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: alerts?.length || 0,
      critical: alerts?.filter(a => (a.data as any)?.severity === 'critical').length || 0,
      typeBreakdown: typeCounts,
      unread: alerts?.filter(a => !a.read).length || 0,
    };
  }
}

// Export singleton instance
export const dataVisualizationService = new DataVisualizationService();

// React hook for data visualization
export function useDataVisualization() {
  const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDashboards = () => {
      setDashboards(dataVisualizationService.getAllDashboards());
      setLoading(false);
    };

    // Initial load
    setTimeout(loadDashboards, 1000); // Allow time for data to load

    return () => {};
  }, []);

  return {
    dashboards,
    loading,
    createDashboard: dataVisualizationService.createDashboard.bind(dataVisualizationService),
    updateDashboard: dataVisualizationService.updateDashboard.bind(dataVisualizationService),
    deleteDashboard: dataVisualizationService.deleteDashboard.bind(dataVisualizationService),
    generateChartData: dataVisualizationService.generateChartData.bind(dataVisualizationService),
    getDashboardTemplates: dataVisualizationService.getDashboardTemplates.bind(dataVisualizationService),
    generateAnalyticsReport: dataVisualizationService.generateAnalyticsReport.bind(dataVisualizationService),
  };
}

import React from 'react';