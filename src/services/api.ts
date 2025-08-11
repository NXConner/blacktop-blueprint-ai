import { supabase } from '@/integrations/supabase/client';
import type { 
  Company, Vehicle, Employee, Crew, Project, Material, WorkSession,
  GPSTracking, WeatherData, PavementScan, AtlasPointCloud, CostEntry,
  MaintenanceRecord, Alert, SystemStatus, UserActivity,
  CreateProjectForm, CreateVehicleForm, CreateEmployeeForm,
  ApiResponse, PaginatedResponse, GeoCoordinate
} from '@/types/database';

// Companies API
export const companiesApi = {
  async getAll(): Promise<ApiResponse<Company[]>> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async getById(id: string): Promise<ApiResponse<Company | null>> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async create(company: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert(company)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async update(id: string, updates: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Vehicles API
export const vehiclesApi = {
  async getAll(companyId?: string): Promise<ApiResponse<Vehicle[]>> {
    try {
      let query = supabase.from('vehicles').select('*');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('vehicle_number');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async getFleetStatus(companyId?: string): Promise<ApiResponse<Vehicle[]>> {
    try {
      let query = supabase.from('fleet_status').select('*');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('vehicle_number');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async create(vehicle: CreateVehicleForm & { company_id: string }): Promise<ApiResponse<Vehicle>> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicle)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async updateFuelLevel(vehicleId: string, fuelLevel: number): Promise<ApiResponse<Vehicle>> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ current_fuel_level: fuelLevel })
        .eq('id', vehicleId)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async updateStatus(vehicleId: string, status: string): Promise<ApiResponse<Vehicle>> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', vehicleId)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Employees API
export const employeesApi = {
  async getAll(companyId?: string): Promise<ApiResponse<Employee[]>> {
    try {
      let query = supabase.from('employees').select('*');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('last_name');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async create(employee: CreateEmployeeForm & { company_id: string }): Promise<ApiResponse<Employee>> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Crews API
export const crewsApi = {
  async getAll(companyId?: string): Promise<ApiResponse<Crew[]>> {
    try {
      let query = supabase.from('crew_availability').select('*');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('crew_name');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async create(crew: Partial<Crew>): Promise<ApiResponse<Crew>> {
    try {
      const { data, error } = await supabase
        .from('crews')
        .insert(crew)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async updateStatus(crewId: string, status: string): Promise<ApiResponse<Crew>> {
    try {
      const { data, error } = await supabase
        .from('crews')
        .update({ status })
        .eq('id', crewId)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Projects API
export const projectsApi = {
  async getAll(companyId?: string): Promise<ApiResponse<Project[]>> {
    try {
      let query = supabase.from('projects').select('*');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async getActive(companyId?: string): Promise<ApiResponse<Project[]>> {
    try {
      let query = supabase.from('active_projects').select('*');
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async create(project: CreateProjectForm & { company_id: string }): Promise<ApiResponse<Project>> {
    try {
      const projectNumber = `PROJ-${Date.now().toString().slice(-6)}`;
      const projectData = {
        ...project,
        project_number: projectNumber
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async updateStatus(projectId: string, status: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// GPS Tracking API
export const gpsApi = {
  async saveLocation(tracking: Omit<GPSTracking, 'id'>): Promise<ApiResponse<GPSTracking>> {
    try {
      const { data, error } = await supabase
        .from('gps_tracking')
        .insert(tracking)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async getVehicleHistory(vehicleId: string, hours = 24): Promise<ApiResponse<GPSTracking[]>> {
    try {
      const { data, error } = await supabase
        .from('gps_tracking')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async getCurrentLocations(): Promise<ApiResponse<GPSTracking[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_latest_vehicle_locations');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  }
};

// Weather API
export const weatherApi = {
  async getCurrent(coordinates: GeoCoordinate): Promise<ApiResponse<WeatherData[]>> {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .select('*')
        .gte('forecast_timestamp', new Date().toISOString())
        .order('forecast_timestamp')
        .limit(48);

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async saveWeatherData(weather: Omit<WeatherData, 'id'>): Promise<ApiResponse<WeatherData>> {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .insert(weather)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// PavementScan Pro API
export const pavementScanApi = {
  async saveScan(scan: Omit<PavementScan, 'id'>): Promise<ApiResponse<PavementScan>> {
    try {
      const { data, error } = await supabase
        .from('pavement_scans')
        .insert(scan)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async getProjectScans(projectId: string): Promise<ApiResponse<PavementScan[]>> {
    try {
      const { data, error } = await supabase
        .from('pavement_scans')
        .select('*')
        .eq('project_id', projectId)
        .order('scan_timestamp', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  }
};

// Atlas Hub API
export const atlasApi = {
  async savePointCloud(pointCloud: Omit<AtlasPointCloud, 'id'>): Promise<ApiResponse<AtlasPointCloud>> {
    try {
      const { data, error } = await supabase
        .from('atlas_point_clouds')
        .insert(pointCloud)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async getProjectPointClouds(projectId: string): Promise<ApiResponse<AtlasPointCloud[]>> {
    try {
      const { data, error } = await supabase
        .from('atlas_point_clouds')
        .select('*')
        .eq('project_id', projectId)
        .order('capture_timestamp', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async updateProcessingStatus(id: string, status: string): Promise<ApiResponse<AtlasPointCloud>> {
    try {
      const { data, error } = await supabase
        .from('atlas_point_clouds')
        .update({ processing_status: status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Cost Tracking API
export const costApi = {
  async addEntry(entry: Omit<CostEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<CostEntry>> {
    try {
      const { data, error } = await supabase
        .from('cost_entries')
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async getProjectCosts(projectId: string): Promise<ApiResponse<CostEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('cost_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async getCostSummary(projectId: string): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const { data, error } = await supabase
        .rpc('get_project_cost_summary', { project_id: projectId });

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Maintenance API
export const maintenanceApi = {
  async addRecord(record: Omit<MaintenanceRecord, 'id' | 'created_at'>): Promise<ApiResponse<MaintenanceRecord>> {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message };
    }
  },

  async getVehicleHistory(vehicleId: string): Promise<ApiResponse<MaintenanceRecord[]>> {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('performed_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message };
    }
  }
};

// Vehicle Inspections API
export const inspectionsApi = {
  async create(inspection: {
    vehicle_id: string;
    inspector_name?: string;
    checklist: Record<string, unknown>;
    notes?: string;
    attachment_urls?: string[];
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('vehicle_inspections')
        .insert({ ...inspection })
        .select()
        .single();
      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message };
    }
  },
  async list(vehicleId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('inspection_date', { ascending: false });
      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message };
    }
  }
};

// Vehicle Documents API
export const vehicleDocumentsApi = {
  async uploadFile(file: File, pathPrefix = 'vehicle-documents'): Promise<ApiResponse<string>> {
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('public-files')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('public-files')
        .getPublicUrl(fileName);
      return { data: publicUrl, success: true };
    } catch (error) {
      return { data: '', success: false, message: (error as Error).message };
    }
  },
  async addRecord(doc: {
    vehicle_id: string;
    document_type: string;
    document_name: string;
    file_url: string;
    notes?: string;
    uploaded_by?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .insert(doc)
        .select()
        .single();
      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message };
    }
  },
  async list(vehicleId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message };
    }
  }
};

// Alerts API
export const alertsApi = {
  async getActive(): Promise<ApiResponse<Alert[]>> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('acknowledged', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async create(alert: Omit<Alert, 'id' | 'created_at' | 'acknowledged' | 'acknowledged_by' | 'acknowledged_at'>): Promise<ApiResponse<Alert>> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert(alert)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async acknowledge(alertId: string, userId: string): Promise<ApiResponse<Alert>> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({
          acknowledged: true,
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// System Status API
export const systemApi = {
  async getStatus(): Promise<ApiResponse<SystemStatus[]>> {
    try {
      const { data, error } = await supabase
        .from('system_status')
        .select('*')
        .order('component');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async updateHeartbeat(component: string, status: string, metrics?: Record<string, unknown>): Promise<ApiResponse<SystemStatus>> {
    try {
      const { data, error } = await supabase
        .from('system_status')
        .upsert({
          component,
          status,
          last_heartbeat: new Date().toISOString(),
          performance_metrics: metrics,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Materials API
export const materialsApi = {
  async getAll(): Promise<ApiResponse<Material[]>> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('material_type');

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  },

  async create(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Material>> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert(material)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Work Sessions API
export const workSessionsApi = {
  async create(session: Omit<WorkSession, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<WorkSession>> {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  },

  async getProjectSessions(projectId: string): Promise<ApiResponse<WorkSession[]>> {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      return { data: [], success: false, message: error.message };
    }
  }
};

// User Activity API
export const userActivityApi = {
  async log(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<ApiResponse<UserActivity>> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      return { data: null, success: false, message: error.message };
    }
  }
};

// Export all APIs as a single object for easier importing
export const api = {
  companies: companiesApi,
  vehicles: vehiclesApi,
  employees: employeesApi,
  crews: crewsApi,
  projects: projectsApi,
  gps: gpsApi,
  weather: weatherApi,
  pavementScan: pavementScanApi,
  atlas: atlasApi,
  cost: costApi,
  maintenance: maintenanceApi,
  alerts: alertsApi,
  system: systemApi,
  materials: materialsApi,
  workSessions: workSessionsApi,
  userActivity: userActivityApi,
  inspections: inspectionsApi,
  vehicleDocuments: vehicleDocumentsApi,
};