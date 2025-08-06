// Specific types for API Extensions

export interface FleetAnalytics {
  totalVehicles: number;
  activeVehicles: number;
  averageFuelEfficiency: number;
  maintenanceAlerts: number;
  totalMileage: number;
  fuelCosts: number;
  utilizationRate: number;
  breakdown: {
    trucks: number;
    rollers: number;
    pavers: number;
    support: number;
  };
}

export interface SearchParams {
  query?: string;
  entityType?: 'projects' | 'vehicles' | 'employees' | 'materials';
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FleetReportData {
  vehicles: Array<{
    id: string;
    vehicle_number: string;
    type: string;
    status: string;
    fuel_level: number;
    mileage: number;
    last_maintenance: string;
  }>;
  summary: {
    totalVehicles: number;
    activeVehicles: number;
    maintenanceRequired: number;
    averageFuelLevel: number;
  };
  costs: {
    fuel: number;
    maintenance: number;
    total: number;
  };
}

export interface WorkSessionData {
  sessionId: string;
  projectId: string;
  crewId: string;
  startTime: string;
  endTime?: string;
  location: {
    lat: number;
    lng: number;
  };
  activities: string[];
  notes?: string;
}

export interface NotificationData {
  id: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface IntegrationSyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  lastSync: string;
  source: 'quickbooks' | 'gsa' | 'weather' | 'maps';
}

export interface BulkOperationParams {
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  data: Record<string, unknown>[];
  validationRules?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface GeospatialSearchParams {
  center: [number, number];
  radius: number;
  unit?: 'km' | 'miles';
  entityType?: string;
  filters?: Record<string, unknown>;
}

export interface WeatherIntegrationData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  conditions: string;
  alerts: string[];
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    conditions: string;
    precipitation: number;
  }>;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}