// Core database types for Blacktop Blackout system
export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  company_id: string;
  vehicle_number: string;
  vehicle_type: 'truck' | 'roller' | 'paver' | 'support';
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  vin?: string;
  fuel_capacity?: number;
  current_fuel_level: number;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  gps_device_id?: string;
  last_maintenance_date?: string;
  next_maintenance_due?: string;
  odometer_reading: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: 'operator' | 'supervisor' | 'driver' | 'laborer';
  certification_level?: 'junior' | 'senior' | 'master' | 'supervisor';
  hire_date?: string;
  hourly_rate?: number;
  status: 'active' | 'inactive' | 'on_leave';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Crew {
  id: string;
  company_id: string;
  crew_name: string;
  supervisor_id?: string;
  status: 'available' | 'deployed' | 'off_duty';
  specialization?: 'resurfacing' | 'patching' | 'sealcoating' | 'marking';
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  employee_id: string;
  role?: 'supervisor' | 'operator' | 'laborer';
  assigned_date: string;
}

export interface Project {
  id: string;
  company_id: string;
  project_number: string;
  project_name: string;
  client_name?: string;
  client_contact?: string;
  location_address?: string;
  location_coordinates?: GeoCoordinate;
  project_type?: 'resurfacing' | 'new_construction' | 'maintenance' | 'patching';
  estimated_cost?: number;
  actual_cost?: number;
  start_date?: string;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  weather_dependent: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  material_type: 'asphalt' | 'aggregate' | 'cement' | 'sealant';
  material_grade?: string;
  supplier?: string;
  unit_cost?: number;
  unit_of_measure?: 'ton' | 'yard' | 'gallon' | 'bag';
  created_at: string;
  updated_at: string;
}

export interface MaterialUsage {
  id: string;
  project_id: string;
  material_id: string;
  quantity_used: number;
  cost_per_unit?: number;
  total_cost?: number;
  usage_date: string;
  notes?: string;
}

export interface WorkSession {
  id: string;
  project_id: string;
  crew_id?: string;
  session_date: string;
  start_time?: string;
  end_time?: string;
  work_area_coordinates?: GeoPolygon;
  work_type?: 'preparation' | 'laying' | 'compaction' | 'finishing';
  temperature_start?: number;
  temperature_end?: number;
  weather_conditions?: string;
  productivity_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GPSTracking {
  id: string;
  vehicle_id: string;
  location_coordinates: GeoCoordinate;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp: string;
  accuracy?: number;
}

export interface WeatherData {
  id: string;
  location_coordinates: GeoCoordinate;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  wind_direction?: number;
  precipitation?: number;
  precipitation_probability?: number;
  weather_condition?: 'clear' | 'cloudy' | 'rain' | 'snow';
  forecast_timestamp: string;
  data_source?: 'weather_api' | 'local_sensor';
  created_at: string;
}

export interface PavementScan {
  id: string;
  project_id: string;
  scan_location: GeoCoordinate;
  scan_area?: GeoPolygon;
  scan_timestamp: string;
  scan_type: 'pre_work' | 'progress' | 'post_work' | 'maintenance';
  surface_condition_score?: number;
  crack_density?: number;
  pothole_count: number;
  roughness_index?: number;
  rutting_depth?: number;
  image_urls?: string[];
  analysis_data?: Record<string, unknown>;
  ai_confidence_score?: number;
  created_at: string;
}

export interface AtlasPointCloud {
  id: string;
  project_id: string;
  scan_location: GeoCoordinate;
  point_cloud_file_url: string;
  mesh_file_url?: string;
  elevation_data?: Record<string, unknown>;
  terrain_analysis?: Record<string, unknown>;
  capture_timestamp: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface CostEntry {
  id: string;
  project_id: string;
  category: 'labor' | 'materials' | 'equipment' | 'fuel' | 'overhead';
  subcategory?: string;
  description?: string;
  amount: number;
  entry_date: string;
  invoice_number?: string;
  vendor?: string;
  approved_by?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  maintenance_type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost?: number;
  performed_by?: string;
  performed_date: string;
  next_service_due?: string;
  parts_replaced?: string[];
  notes?: string;
  created_at: string;
}

export interface VehicleInspection {
  id: string;
  vehicle_id: string;
  inspection_date: string;
  inspector_name?: string;
  checklist: Record<string, boolean | string | number>;
  notes?: string;
  attachment_urls?: string[];
  created_at: string;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: 'manual' | 'repair_guide' | 'parts_list' | 'receipt' | 'other';
  document_name: string;
  file_url: string;
  uploaded_by?: string;
  uploaded_at: string;
  notes?: string;
}

export interface Alert {
  id: string;
  alert_type: 'weather' | 'maintenance' | 'cost_overrun' | 'safety' | 'equipment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  related_entity_type?: 'project' | 'vehicle' | 'crew' | 'weather';
  related_entity_id?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface SystemStatus {
  id: string;
  component: 'overwatch' | 'pavement_scan' | 'atlas_hub' | 'weather';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  last_heartbeat: string;
  error_message?: string;
  performance_metrics?: Record<string, unknown>;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Utility types
export interface GeoCoordinate {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // Array of linear rings
}

// View types for common queries
export interface ActiveProject extends Project {
  company_name: string;
  total_spent: number;
}

export interface FleetStatus extends Vehicle {
  company_name: string;
  maintenance_status: 'overdue' | 'due_soon' | 'current';
}

export interface CrewAvailability extends Crew {
  company_name: string;
  crew_size: number;
}

// Dashboard widget data structures
export interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  status: 'active' | 'warning' | 'critical' | 'success';
  icon: React.ReactNode;
  description?: string;
}

// Real-time data interfaces
export interface LiveVehicleLocation {
  vehicle_id: string;
  vehicle_number: string;
  location: GeoCoordinate;
  speed: number;
  heading: number;
  timestamp: string;
  status: string;
}

export interface LiveCrewStatus {
  crew_id: string;
  crew_name: string;
  status: string;
  current_project?: string;
  location?: GeoCoordinate;
  members_count: number;
}

// Analytics and reporting types
export interface ProductivityMetrics {
  crew_id: string;
  project_id: string;
  date: string;
  hours_worked: number;
  area_completed: number;
  materials_used: number;
  efficiency_score: number;
}

export interface CostAnalysis {
  project_id: string;
  total_budget: number;
  spent_to_date: number;
  projected_cost: number;
  variance: number;
  cost_breakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

// Weather forecast types
export interface WeatherForecast {
  location: GeoCoordinate;
  forecasts: WeatherData[];
  alerts: WeatherAlert[];
}

export interface WeatherAlert {
  id: string;
  type: 'precipitation' | 'temperature' | 'wind' | 'severe';
  severity: 'watch' | 'warning' | 'advisory';
  message: string;
  start_time: string;
  end_time: string;
  affected_area: GeoPolygon;
}

// AI/ML types for optimization
export interface RouteOptimization {
  crew_id: string;
  optimal_route: GeoCoordinate[];
  estimated_time: number;
  fuel_efficiency: number;
  priority_stops: string[];
}

export interface ResourceAllocation {
  project_id: string;
  recommended_crew_size: number;
  recommended_equipment: string[];
  estimated_duration: number;
  confidence_score: number;
}

// Form input types
export interface CreateProjectForm {
  project_name: string;
  client_name: string;
  location_address: string;
  project_type: string;
  estimated_cost: number;
  start_date: string;
  estimated_completion_date: string;
  priority: string;
  weather_dependent: boolean;
  notes?: string;
}

export interface CreateVehicleForm {
  vehicle_number: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  fuel_capacity: number;
}

export interface CreateEmployeeForm {
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  certification_level: string;
  hourly_rate: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}