// Analytics and Dashboard Types
export interface DashboardStats {
  activeProjects: number;
  totalVehicles: number;
  availableVehicles: number;
  totalEmployees: number;
  activeEmployees: number;
  totalCosts: number;
  recentAlerts: number;
  criticalAlerts: number;
  weeklyFuelConsumption: number;
  averageProjectCost: number;
  completedProjectsThisMonth: number;
  maintenanceDue: number;
}

export interface ProjectMetrics {
  id: string;
  name: string;
  status: string;
  completion_percentage: number;
  total_cost: number;
  start_date: string;
  estimated_completion: string;
}

export interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  outOfServiceVehicles: number;
  averageFuelLevel: number;
  totalMileage: number;
  maintenanceCosts: number;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
  pending: number;
}

export interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  visibility: number;
  condition: string;
  alerts: string[];
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  target: number;
  status: 'above' | 'below' | 'on_target';
  trend: 'improving' | 'declining' | 'stable';
}

export interface RealtimeData {
  timestamp: string;
  activeVehicles: number;
  onlineEmployees: number;
  systemLoad: number;
  alertsCount: number;
  networkStatus: 'online' | 'offline' | 'degraded';
}

export interface AdvancedAnalytics {
  efficiency: {
    fuelEfficiency: number;
    laborProductivity: number;
    equipmentUtilization: number;
    costPerMile: number;
  };
  trends: {
    projectCompletionRate: number[];
    monthlyRevenue: number[];
    maintenanceCosts: number[];
    fuelConsumption: number[];
  };
  predictions: {
    nextMaintenanceDue: string;
    estimatedMonthlyBudget: number;
    weatherImpact: number;
    resourceNeeds: string[];
  };
}

export interface CompanyPerformance {
  companyId: string;
  companyName: string;
  projectsCompleted: number;
  totalRevenue: number;
  efficiency: number;
  customerSatisfaction: number;
  safetyScore: number;
}

export interface ProcessedAnalytics {
  dashboardStats: DashboardStats;
  projectMetrics: ProjectMetrics[];
  fleetMetrics: FleetMetrics;
  costBreakdown: CostBreakdown[];
  alertSummary: AlertSummary;
  weatherCondition: WeatherCondition;
  performanceMetrics: PerformanceMetric[];
  realtimeData: RealtimeData;
  advancedAnalytics: AdvancedAnalytics;
  companyPerformance: CompanyPerformance[];
}

export interface SearchFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  categories?: string[];
  companyIds?: string[];
  vehicleTypes?: string[];
  employeeRoles?: string[];
}

export interface AdvancedSearchParams {
  query?: string;
  filters?: SearchFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult<T = unknown> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IntegrationData {
  quickbooks?: Record<string, unknown>;
  gsaAuctions?: Record<string, unknown>;
  weather?: Record<string, unknown>;
  maps?: Record<string, unknown>;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
  processedIds: string[];
}

export interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
  integrations: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
  uptime: number;
}