import { supabase } from '@/integrations/supabase/client';

// HVAC System types
export interface HVACSystem {
  id: string;
  project_id: string;
  system_name: string;
  system_type: HVACSystemType;
  manufacturer: string;
  model: string;
  serial_number?: string;
  installation_date: string;
  warranty_expiry?: string;
  capacity: HVACCapacity;
  efficiency_rating: EfficiencyRating;
  zones: HVACZone[];
  components: HVACComponent[];
  maintenance_schedule: MaintenanceSchedule;
  installation_details: InstallationDetails;
  compliance_info: ComplianceInfo;
  energy_data: EnergyData;
  status: SystemStatus;
  created_at: string;
  updated_at: string;
}

export enum HVACSystemType {
  SPLIT_SYSTEM = 'split_system',
  PACKAGED_UNIT = 'packaged_unit',
  HEAT_PUMP = 'heat_pump',
  GEOTHERMAL = 'geothermal',
  CHILLER = 'chiller',
  BOILER = 'boiler',
  VRF_VRV = 'vrf_vrv',
  MINI_SPLIT = 'mini_split',
  WINDOW_UNIT = 'window_unit',
  EVAPORATIVE_COOLER = 'evaporative_cooler'
}

export enum SystemStatus {
  PLANNING = 'planning',
  DESIGN = 'design',
  INSTALLATION = 'installation',
  COMMISSIONED = 'commissioned',
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  REPAIR_NEEDED = 'repair_needed',
  DECOMMISSIONED = 'decommissioned'
}

export interface HVACCapacity {
  cooling_btu: number;
  heating_btu: number;
  airflow_cfm: number;
  tonnage: number;
  coverage_sqft: number;
}

export interface EfficiencyRating {
  seer: number; // Seasonal Energy Efficiency Ratio
  eer: number; // Energy Efficiency Ratio
  hspf: number; // Heating Seasonal Performance Factor
  afue: number; // Annual Fuel Utilization Efficiency
  cop: number; // Coefficient of Performance
  energy_star_certified: boolean;
}

export interface HVACZone {
  id: string;
  zone_name: string;
  area_sqft: number;
  room_count: number;
  design_temperature: TemperatureRange;
  damper_type: DamperType;
  thermostat_info: ThermostatInfo;
  load_calculation: LoadCalculation;
}

export interface TemperatureRange {
  cooling_setpoint: number;
  heating_setpoint: number;
  humidity_setpoint?: number;
}

export enum DamperType {
  MANUAL = 'manual',
  MOTORIZED = 'motorized',
  VAV = 'vav',
  CAV = 'cav'
}

export interface ThermostatInfo {
  thermostat_type: 'manual' | 'programmable' | 'smart' | 'wifi';
  manufacturer: string;
  model: string;
  installation_location: string;
  programming_schedule?: ProgrammingSchedule[];
}

export interface ProgrammingSchedule {
  day_of_week: string;
  time_periods: TimePeriod[];
}

export interface TimePeriod {
  start_time: string;
  end_time: string;
  temperature: number;
  mode: 'heat' | 'cool' | 'auto' | 'off';
}

export interface LoadCalculation {
  cooling_load_btu: number;
  heating_load_btu: number;
  internal_heat_gain: number;
  solar_heat_gain: number;
  infiltration_load: number;
  ventilation_load: number;
  calculation_method: 'manual_j' | 'manual_d' | 'manual_s' | 'other';
  calculation_date: string;
  calculated_by: string;
}

export interface HVACComponent {
  id: string;
  component_type: ComponentType;
  component_name: string;
  manufacturer: string;
  model: string;
  part_number?: string;
  specifications: ComponentSpec[];
  location: string;
  installation_date: string;
  warranty_info: WarrantyInfo;
  maintenance_requirements: MaintenanceRequirement[];
  status: ComponentStatus;
}

export enum ComponentType {
  CONDENSER = 'condenser',
  EVAPORATOR = 'evaporator',
  COMPRESSOR = 'compressor',
  FURNACE = 'furnace',
  HEAT_EXCHANGER = 'heat_exchanger',
  BLOWER = 'blower',
  DUCTWORK = 'ductwork',
  FILTER = 'filter',
  THERMOSTAT = 'thermostat',
  DAMPER = 'damper',
  HUMIDIFIER = 'humidifier',
  DEHUMIDIFIER = 'dehumidifier',
  VENTILATION_FAN = 'ventilation_fan',
  ECONOMIZER = 'economizer'
}

export enum ComponentStatus {
  NEW = 'new',
  OPERATIONAL = 'operational',
  NEEDS_MAINTENANCE = 'needs_maintenance',
  REPAIR_REQUIRED = 'repair_required',
  REPLACED = 'replaced',
  END_OF_LIFE = 'end_of_life'
}

export interface ComponentSpec {
  name: string;
  value: string;
  unit?: string;
  category: 'performance' | 'electrical' | 'mechanical' | 'dimensional';
}

export interface WarrantyInfo {
  warranty_type: 'manufacturer' | 'extended' | 'labor';
  warranty_period_years: number;
  warranty_start: string;
  warranty_end: string;
  coverage_details: string;
  warranty_provider: string;
}

export interface MaintenanceRequirement {
  task: string;
  frequency: MaintenanceFrequency;
  estimated_duration_hours: number;
  required_skills: string[];
  required_tools: string[];
  safety_requirements: string[];
}

export enum MaintenanceFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  AS_NEEDED = 'as_needed'
}

export interface MaintenanceSchedule {
  schedule_id: string;
  system_id: string;
  scheduled_tasks: ScheduledTask[];
  preventive_maintenance: PreventiveMaintenance[];
  inspection_schedule: InspectionSchedule[];
  filter_replacement_schedule: FilterReplacementSchedule;
}

export interface ScheduledTask {
  id: string;
  task_name: string;
  description: string;
  frequency: MaintenanceFrequency;
  next_due_date: string;
  last_completed: string;
  assigned_technician?: string;
  estimated_cost: number;
  priority: TaskPriority;
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface PreventiveMaintenance {
  pm_type: PMType;
  checklist: MaintenanceChecklist[];
  frequency: MaintenanceFrequency;
  seasonal_requirements: string[];
}

export enum PMType {
  BASIC_INSPECTION = 'basic_inspection',
  COMPREHENSIVE_SERVICE = 'comprehensive_service',
  SEASONAL_PREP = 'seasonal_prep',
  SYSTEM_STARTUP = 'system_startup',
  SYSTEM_SHUTDOWN = 'system_shutdown'
}

export interface MaintenanceChecklist {
  item: string;
  category: ChecklistCategory;
  required: boolean;
  acceptance_criteria: string;
}

export enum ChecklistCategory {
  SAFETY = 'safety',
  ELECTRICAL = 'electrical',
  MECHANICAL = 'mechanical',
  REFRIGERANT = 'refrigerant',
  CONTROLS = 'controls',
  DUCTWORK = 'ductwork',
  PERFORMANCE = 'performance'
}

export interface InspectionSchedule {
  inspection_type: InspectionType;
  frequency: MaintenanceFrequency;
  inspector_requirements: string[];
  documentation_required: string[];
}

export enum InspectionType {
  SAFETY_INSPECTION = 'safety_inspection',
  PERFORMANCE_TEST = 'performance_test',
  EFFICIENCY_AUDIT = 'efficiency_audit',
  COMPLIANCE_CHECK = 'compliance_check',
  WARRANTY_INSPECTION = 'warranty_inspection'
}

export interface FilterReplacementSchedule {
  filter_type: string;
  filter_size: string;
  replacement_frequency: MaintenanceFrequency;
  filter_rating: string; // MERV rating
  cost_per_filter: number;
  supplier_info: SupplierInfo;
}

export interface SupplierInfo {
  supplier_name: string;
  contact_info: string;
  part_number: string;
  lead_time_days: number;
}

export interface InstallationDetails {
  installation_method: InstallationMethod;
  contractor_info: ContractorInfo;
  permits_required: PermitInfo[];
  installation_standards: string[];
  commissioning_info: CommissioningInfo;
  startup_procedures: StartupProcedure[];
}

export enum InstallationMethod {
  NEW_INSTALLATION = 'new_installation',
  REPLACEMENT = 'replacement',
  RETROFIT = 'retrofit',
  UPGRADE = 'upgrade'
}

export interface ContractorInfo {
  company_name: string;
  license_number: string;
  certifications: string[];
  contact_info: string;
  insurance_info: string;
  nate_certified: boolean;
  epa_certified: boolean;
}

export interface PermitInfo {
  permit_type: string;
  permit_number?: string;
  issuing_authority: string;
  application_date?: string;
  approval_date?: string;
  inspection_required: boolean;
  fees: number;
}

export interface CommissioningInfo {
  commissioning_agent: string;
  commissioning_date: string;
  test_results: TestResult[];
  performance_verification: PerformanceVerification;
  documentation_provided: string[];
}

export interface TestResult {
  test_name: string;
  expected_value: number;
  actual_value: number;
  unit: string;
  pass_fail: 'pass' | 'fail';
  notes?: string;
}

export interface PerformanceVerification {
  cooling_capacity_verified: boolean;
  heating_capacity_verified: boolean;
  airflow_verified: boolean;
  efficiency_verified: boolean;
  controls_verified: boolean;
  safety_systems_verified: boolean;
}

export interface StartupProcedure {
  step_number: number;
  procedure: string;
  safety_notes: string[];
  completion_criteria: string;
  completed: boolean;
  completed_by?: string;
  completion_date?: string;
}

export interface ComplianceInfo {
  energy_codes: EnergyCodeCompliance[];
  refrigerant_regulations: RefrigerantCompliance;
  safety_standards: SafetyStandard[];
  local_requirements: LocalRequirement[];
}

export interface EnergyCodeCompliance {
  code_name: string;
  code_version: string;
  compliance_status: 'compliant' | 'non_compliant' | 'pending';
  requirements_met: string[];
  documentation: string[];
}

export interface RefrigerantCompliance {
  refrigerant_type: string;
  epa_section_608_compliance: boolean;
  refrigerant_management_plan: boolean;
  leak_detection_system: boolean;
  recovery_equipment_required: boolean;
  technician_certification_required: boolean;
}

export interface SafetyStandard {
  standard_name: string;
  applicable_sections: string[];
  compliance_status: 'compliant' | 'non_compliant' | 'pending';
  inspection_required: boolean;
}

export interface LocalRequirement {
  requirement_type: string;
  description: string;
  compliance_deadline?: string;
  responsible_party: string;
}

export interface EnergyData {
  energy_consumption: EnergyConsumption;
  efficiency_metrics: EfficiencyMetrics;
  cost_analysis: CostAnalysis;
  environmental_impact: EnvironmentalImpact;
}

export interface EnergyConsumption {
  electricity_kwh: number;
  natural_gas_therms: number;
  propane_gallons?: number;
  oil_gallons?: number;
  measurement_period: string;
  baseline_comparison: number;
}

export interface EfficiencyMetrics {
  current_seer: number;
  current_eer: number;
  current_hspf: number;
  runtime_hours: number;
  cycling_frequency: number;
  load_factor: number;
}

export interface CostAnalysis {
  operating_cost_monthly: number;
  maintenance_cost_annual: number;
  repair_cost_ytd: number;
  energy_cost_breakdown: EnergyCostBreakdown;
  cost_per_sqft: number;
  cost_per_ton: number;
}

export interface EnergyCostBreakdown {
  electricity_cost: number;
  gas_cost: number;
  demand_charges: number;
  other_charges: number;
}

export interface EnvironmentalImpact {
  carbon_footprint_lbs: number;
  refrigerant_gwp: number; // Global Warming Potential
  ozone_depletion_potential: number;
  energy_star_score?: number;
}

// HVAC Design and Engineering
export interface HVACDesign {
  id: string;
  project_id: string;
  design_phase: DesignPhase;
  design_criteria: DesignCriteria;
  load_calculations: ProjectLoadCalculation;
  equipment_selection: EquipmentSelection[];
  ductwork_design: DuctworkDesign;
  controls_design: ControlsDesign;
  energy_modeling: EnergyModeling;
  drawings: DesignDrawing[];
  specifications: DesignSpecification[];
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export enum DesignPhase {
  SCHEMATIC = 'schematic',
  DESIGN_DEVELOPMENT = 'design_development',
  CONSTRUCTION_DOCUMENTS = 'construction_documents',
  BIDDING = 'bidding',
  CONSTRUCTION_ADMINISTRATION = 'construction_administration'
}

export interface DesignCriteria {
  outdoor_design_conditions: DesignConditions;
  indoor_design_conditions: DesignConditions;
  building_envelope: BuildingEnvelope;
  occupancy_requirements: OccupancyRequirements;
  ventilation_requirements: VentilationRequirements;
  energy_efficiency_targets: EfficiencyTargets;
}

export interface DesignConditions {
  dry_bulb_temperature: number;
  wet_bulb_temperature: number;
  relative_humidity: number;
  wind_speed: number;
  solar_conditions: string;
}

export interface BuildingEnvelope {
  wall_r_value: number;
  roof_r_value: number;
  window_u_value: number;
  window_shgc: number; // Solar Heat Gain Coefficient
  infiltration_rate: number;
  thermal_mass: string;
}

export interface OccupancyRequirements {
  occupant_density: number; // people per sq ft
  hours_of_operation: OperatingHours[];
  internal_heat_gains: InternalHeatGains;
  special_requirements: string[];
}

export interface OperatingHours {
  day_type: 'weekday' | 'weekend' | 'holiday';
  start_time: string;
  end_time: string;
  occupancy_percentage: number;
}

export interface InternalHeatGains {
  lighting_watts_per_sqft: number;
  equipment_watts_per_sqft: number;
  people_sensible_btu_per_person: number;
  people_latent_btu_per_person: number;
}

export interface VentilationRequirements {
  outdoor_air_cfm_per_person: number;
  outdoor_air_cfm_per_sqft: number;
  exhaust_air_requirements: ExhaustRequirement[];
  air_quality_requirements: string[];
}

export interface ExhaustRequirement {
  space_type: string;
  exhaust_rate_cfm: number;
  exhaust_method: string;
}

export interface EfficiencyTargets {
  target_seer: number;
  target_eer: number;
  target_hspf: number;
  energy_star_required: boolean;
  leed_points_target?: number;
}

export interface ProjectLoadCalculation {
  calculation_method: 'manual_j' | 'manual_d' | 'ashrae' | 'software';
  software_used?: string;
  total_cooling_load: number;
  total_heating_load: number;
  zone_loads: ZoneLoad[];
  peak_load_conditions: PeakLoadConditions;
}

export interface ZoneLoad {
  zone_id: string;
  cooling_load: number;
  heating_load: number;
  airflow_requirement: number;
  load_breakdown: LoadBreakdown;
}

export interface LoadBreakdown {
  envelope_load: number;
  internal_load: number;
  ventilation_load: number;
  infiltration_load: number;
  solar_load: number;
}

export interface PeakLoadConditions {
  cooling_peak_time: string;
  heating_peak_time: string;
  coincidence_factor: number;
  diversity_factor: number;
}

export interface EquipmentSelection {
  equipment_type: ComponentType;
  manufacturer: string;
  model: string;
  capacity: number;
  efficiency_rating: EfficiencyRating;
  selection_criteria: SelectionCriteria;
  cost_estimate: number;
  lead_time_weeks: number;
}

export interface SelectionCriteria {
  load_matching: number; // percentage
  efficiency_priority: number; // 1-10 scale
  cost_priority: number; // 1-10 scale
  reliability_priority: number; // 1-10 scale
  maintenance_priority: number; // 1-10 scale
}

export interface DuctworkDesign {
  design_method: 'equal_friction' | 'static_regain' | 'velocity_reduction';
  supply_ductwork: DuctSection[];
  return_ductwork: DuctSection[];
  duct_materials: DuctMaterial[];
  insulation_requirements: InsulationRequirement[];
  sealing_requirements: string[];
}

export interface DuctSection {
  section_id: string;
  duct_size: string;
  length_feet: number;
  airflow_cfm: number;
  velocity_fpm: number;
  pressure_drop_iwc: number; // inches water column
  duct_type: DuctType;
}

export enum DuctType {
  SUPPLY = 'supply',
  RETURN = 'return',
  EXHAUST = 'exhaust',
  OUTSIDE_AIR = 'outside_air'
}

export interface DuctMaterial {
  material_type: 'sheet_metal' | 'flexible' | 'fiberglass' | 'pvc';
  gauge_thickness: string;
  shape: 'round' | 'rectangular' | 'oval';
  coating?: string;
}

export interface InsulationRequirement {
  location: string;
  r_value: number;
  vapor_barrier_required: boolean;
  facing_type?: string;
}

export interface ControlsDesign {
  control_type: ControlType;
  control_strategy: ControlStrategy;
  sensors: ControlSensor[];
  actuators: ControlActuator[];
  control_sequences: ControlSequence[];
  user_interfaces: UserInterface[];
}

export enum ControlType {
  PNEUMATIC = 'pneumatic',
  ELECTRIC = 'electric',
  ELECTRONIC = 'electronic',
  DDC = 'ddc', // Direct Digital Control
  BAS = 'bas', // Building Automation System
  SMART_THERMOSTAT = 'smart_thermostat'
}

export interface ControlStrategy {
  heating_strategy: string;
  cooling_strategy: string;
  ventilation_strategy: string;
  economizer_strategy?: string;
  demand_control_ventilation: boolean;
  occupancy_based_control: boolean;
}

export interface ControlSensor {
  sensor_type: SensorType;
  location: string;
  measurement_range: string;
  accuracy: string;
  calibration_frequency: MaintenanceFrequency;
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  AIRFLOW = 'airflow',
  CO2 = 'co2',
  OCCUPANCY = 'occupancy',
  LIGHT = 'light'
}

export interface ControlActuator {
  actuator_type: ActuatorType;
  controlled_device: string;
  control_signal: string;
  response_time: string;
}

export enum ActuatorType {
  DAMPER_ACTUATOR = 'damper_actuator',
  VALVE_ACTUATOR = 'valve_actuator',
  VFD = 'vfd', // Variable Frequency Drive
  RELAY = 'relay',
  CONTACTOR = 'contactor'
}

export interface ControlSequence {
  sequence_name: string;
  description: string;
  trigger_conditions: string[];
  control_actions: string[];
  safety_overrides: string[];
}

export interface UserInterface {
  interface_type: 'thermostat' | 'touch_panel' | 'web_interface' | 'mobile_app';
  capabilities: string[];
  user_access_levels: string[];
}

export interface EnergyModeling {
  modeling_software: string;
  building_model: BuildingModel;
  hvac_model: HVACModel;
  simulation_results: SimulationResults;
  energy_savings_analysis: EnergySavingsAnalysis;
}

export interface BuildingModel {
  building_geometry: string;
  thermal_zones: number;
  envelope_properties: BuildingEnvelope;
  internal_loads: InternalHeatGains;
  schedules: OperatingHours[];
}

export interface HVACModel {
  system_type: HVACSystemType;
  equipment_efficiency: EfficiencyRating;
  control_strategies: ControlStrategy;
  sizing_factors: SizingFactors;
}

export interface SizingFactors {
  cooling_safety_factor: number;
  heating_safety_factor: number;
  ventilation_factor: number;
}

export interface SimulationResults {
  annual_energy_consumption: EnergyConsumption;
  peak_demand: PeakDemand;
  monthly_breakdown: MonthlyEnergyData[];
  comfort_analysis: ComfortAnalysis;
}

export interface PeakDemand {
  cooling_peak_kw: number;
  heating_peak_kw: number;
  total_peak_kw: number;
  peak_demand_time: string;
}

export interface MonthlyEnergyData {
  month: string;
  cooling_energy: number;
  heating_energy: number;
  fan_energy: number;
  total_energy: number;
  energy_cost: number;
}

export interface ComfortAnalysis {
  hours_outside_comfort_zone: number;
  temperature_excursions: TemperatureExcursion[];
  humidity_control_effectiveness: number;
}

export interface TemperatureExcursion {
  zone_id: string;
  excursion_hours: number;
  max_deviation: number;
  typical_cause: string;
}

export interface EnergySavingsAnalysis {
  baseline_consumption: number;
  proposed_consumption: number;
  annual_savings_kwh: number;
  annual_cost_savings: number;
  simple_payback_years: number;
  lifecycle_savings: number;
}

export interface DesignDrawing {
  id: string;
  drawing_type: DrawingType;
  drawing_number: string;
  title: string;
  scale: string;
  file_url: string;
  revision: string;
  revision_date: string;
}

export enum DrawingType {
  FLOOR_PLAN = 'floor_plan',
  EQUIPMENT_SCHEDULE = 'equipment_schedule',
  DUCTWORK_LAYOUT = 'ductwork_layout',
  CONTROLS_DIAGRAM = 'controls_diagram',
  DETAILS = 'details',
  SECTIONS = 'sections',
  SCHEDULES = 'schedules'
}

export interface DesignSpecification {
  id: string;
  specification_section: string;
  title: string;
  content: string;
  referenced_standards: string[];
  performance_criteria: PerformanceCriteria[];
}

export interface PerformanceCriteria {
  parameter: string;
  requirement: string;
  test_method: string;
  acceptance_criteria: string;
}

class HVACManagementService {
  // System Management
  async createHVACSystem(system: Omit<HVACSystem, 'id' | 'created_at' | 'updated_at'>): Promise<HVACSystem> {
    const { data, error } = await supabase
      .from('hvac_systems')
      .insert(system)
      .select()
      .single();

    if (error) throw new Error(`Failed to create HVAC system: ${error.message}`);
    return data;
  }

  async updateHVACSystem(id: string, updates: Partial<HVACSystem>): Promise<HVACSystem> {
    const { data, error } = await supabase
      .from('hvac_systems')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update HVAC system: ${error.message}`);
    return data;
  }

  async getHVACSystem(id: string): Promise<HVACSystem | null> {
    const { data, error } = await supabase
      .from('hvac_systems')
      .select(`
        *,
        hvac_zones (*),
        hvac_components (*),
        maintenance_schedules (*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch HVAC system: ${error.message}`);
    }
    return data;
  }

  async getProjectHVACSystems(projectId: string): Promise<HVACSystem[]> {
    const { data, error } = await supabase
      .from('hvac_systems')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch HVAC systems: ${error.message}`);
    return data || [];
  }

  // Load Calculations
  async performLoadCalculation(
    projectId: string,
    designCriteria: DesignCriteria,
    zones: HVACZone[]
  ): Promise<ProjectLoadCalculation> {
    // This would integrate with Manual J or similar load calculation software
    // For now, we'll simulate the calculation
    
    let totalCoolingLoad = 0;
    let totalHeatingLoad = 0;
    const zoneLoads: ZoneLoad[] = [];

    for (const zone of zones) {
      const coolingLoad = this.calculateZoneCoolingLoad(zone, designCriteria);
      const heatingLoad = this.calculateZoneHeatingLoad(zone, designCriteria);
      
      totalCoolingLoad += coolingLoad;
      totalHeatingLoad += heatingLoad;

      zoneLoads.push({
        zone_id: zone.id,
        cooling_load: coolingLoad,
        heating_load: heatingLoad,
        airflow_requirement: this.calculateAirflowRequirement(coolingLoad),
        load_breakdown: {
          envelope_load: coolingLoad * 0.4,
          internal_load: coolingLoad * 0.3,
          ventilation_load: coolingLoad * 0.15,
          infiltration_load: coolingLoad * 0.1,
          solar_load: coolingLoad * 0.05
        }
      });
    }

    const loadCalculation: ProjectLoadCalculation = {
      calculation_method: 'manual_j',
      software_used: 'HVAC Load Calculator Pro',
      total_cooling_load: totalCoolingLoad,
      total_heating_load: totalHeatingLoad,
      zone_loads: zoneLoads,
      peak_load_conditions: {
        cooling_peak_time: '3:00 PM',
        heating_peak_time: '7:00 AM',
        coincidence_factor: 0.85,
        diversity_factor: 0.9
      }
    };

    // Store calculation results
    const { data, error } = await supabase
      .from('load_calculations')
      .insert({
        project_id: projectId,
        calculation_data: loadCalculation,
        calculated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to store load calculation: ${error.message}`);
    
    return loadCalculation;
  }

  // Equipment Selection
  async selectEquipment(
    loadCalculation: ProjectLoadCalculation,
    designCriteria: DesignCriteria
  ): Promise<EquipmentSelection[]> {
    // This would integrate with manufacturer databases and selection software
    const selections: EquipmentSelection[] = [];

    // Select main cooling equipment
    const coolingEquipment = await this.selectCoolingEquipment(
      loadCalculation.total_cooling_load,
      designCriteria.energy_efficiency_targets
    );
    selections.push(coolingEquipment);

    // Select heating equipment if needed
    if (loadCalculation.total_heating_load > 0) {
      const heatingEquipment = await this.selectHeatingEquipment(
        loadCalculation.total_heating_load,
        designCriteria.energy_efficiency_targets
      );
      selections.push(heatingEquipment);
    }

    // Select air handling equipment
    const airHandler = await this.selectAirHandler(
      loadCalculation.zone_loads.reduce((total, zone) => total + zone.airflow_requirement, 0)
    );
    selections.push(airHandler);

    return selections;
  }

  // Energy Analysis
  async performEnergyAnalysis(systemId: string, period: 'month' | 'year' = 'year'): Promise<{
    energy_consumption: EnergyConsumption;
    efficiency_metrics: EfficiencyMetrics;
    cost_analysis: CostAnalysis;
    recommendations: string[];
  }> {
    const system = await this.getHVACSystem(systemId);
    if (!system) throw new Error('HVAC system not found');

    // Get energy data (would integrate with utility meters, BAS, etc.)
    const energyData = await this.getEnergyData(systemId, period);
    const costData = await this.calculateEnergyCosts(energyData);
    const efficiencyMetrics = await this.calculateEfficiencyMetrics(system, energyData);
    const recommendations = await this.generateEnergyRecommendations(system, efficiencyMetrics);

    return {
      energy_consumption: energyData,
      efficiency_metrics: efficiencyMetrics,
      cost_analysis: costData,
      recommendations
    };
  }

  // Maintenance Management
  async scheduleMaintenanceTask(task: Omit<ScheduledTask, 'id'>): Promise<ScheduledTask> {
    const { data, error } = await supabase
      .from('scheduled_maintenance_tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw new Error(`Failed to schedule maintenance task: ${error.message}`);
    return data;
  }

  async getMaintenanceTasks(systemId: string, filters?: {
    status?: 'due' | 'overdue' | 'completed';
    priority?: TaskPriority[];
    date_range?: { start: string; end: string };
  }): Promise<ScheduledTask[]> {
    let query = supabase
      .from('scheduled_maintenance_tasks')
      .select('*')
      .eq('system_id', systemId);

    if (filters?.status === 'due') {
      const today = new Date().toISOString().split('T')[0];
      query = query.lte('next_due_date', today);
    } else if (filters?.status === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      query = query.lt('next_due_date', today);
    }

    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority);
    }

    const { data, error } = await query.order('next_due_date');
    if (error) throw new Error(`Failed to fetch maintenance tasks: ${error.message}`);
    
    return data || [];
  }

  async completeMaintenanceTask(taskId: string, completion: {
    completed_by: string;
    completion_notes: string;
    next_due_date: string;
    actual_cost?: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('scheduled_maintenance_tasks')
      .update({
        last_completed: new Date().toISOString(),
        next_due_date: completion.next_due_date,
        completed_by: completion.completed_by,
        completion_notes: completion.completion_notes,
        actual_cost: completion.actual_cost
      })
      .eq('id', taskId);

    if (error) throw new Error(`Failed to complete maintenance task: ${error.message}`);
  }

  // Design Management
  async createHVACDesign(design: Omit<HVACDesign, 'id' | 'created_at' | 'updated_at'>): Promise<HVACDesign> {
    const { data, error } = await supabase
      .from('hvac_designs')
      .insert(design)
      .select()
      .single();

    if (error) throw new Error(`Failed to create HVAC design: ${error.message}`);
    return data;
  }

  async updateHVACDesign(id: string, updates: Partial<HVACDesign>): Promise<HVACDesign> {
    const { data, error } = await supabase
      .from('hvac_designs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update HVAC design: ${error.message}`);
    return data;
  }

  async getHVACDesign(id: string): Promise<HVACDesign | null> {
    const { data, error } = await supabase
      .from('hvac_designs')
      .select(`
        *,
        design_drawings (*),
        design_specifications (*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch HVAC design: ${error.message}`);
    }
    return data;
  }

  // Commissioning and Testing
  async performCommissioning(systemId: string, procedures: StartupProcedure[]): Promise<CommissioningInfo> {
    const testResults: TestResult[] = [];
    
    // Perform system tests
    for (const procedure of procedures) {
      const result = await this.executeCommissioningProcedure(systemId, procedure);
      testResults.push(result);
    }

    const commissioningInfo: CommissioningInfo = {
      commissioning_agent: 'Certified Commissioning Agent',
      commissioning_date: new Date().toISOString(),
      test_results: testResults,
      performance_verification: {
        cooling_capacity_verified: testResults.some(t => t.test_name === 'cooling_capacity' && t.pass_fail === 'pass'),
        heating_capacity_verified: testResults.some(t => t.test_name === 'heating_capacity' && t.pass_fail === 'pass'),
        airflow_verified: testResults.some(t => t.test_name === 'airflow' && t.pass_fail === 'pass'),
        efficiency_verified: testResults.some(t => t.test_name === 'efficiency' && t.pass_fail === 'pass'),
        controls_verified: testResults.some(t => t.test_name === 'controls' && t.pass_fail === 'pass'),
        safety_systems_verified: testResults.some(t => t.test_name === 'safety' && t.pass_fail === 'pass')
      },
      documentation_provided: [
        'Test and Balance Report',
        'Commissioning Report',
        'O&M Manuals',
        'Warranty Documentation'
      ]
    };

    // Store commissioning results
    await supabase
      .from('commissioning_records')
      .insert({
        system_id: systemId,
        commissioning_data: commissioningInfo,
        commissioning_date: new Date().toISOString()
      });

    return commissioningInfo;
  }

  // Private utility methods
  private calculateZoneCoolingLoad(zone: HVACZone, criteria: DesignCriteria): number {
    // Simplified load calculation - in practice would use detailed Manual J calculations
    const baseLoad = zone.area_sqft * 25; // Base 25 BTU/sqft
    const temperatureFactor = (criteria.outdoor_design_conditions.dry_bulb_temperature - 75) / 10;
    const occupancyFactor = zone.room_count * 0.1;
    
    return Math.round(baseLoad * (1 + temperatureFactor + occupancyFactor));
  }

  private calculateZoneHeatingLoad(zone: HVACZone, criteria: DesignCriteria): number {
    // Simplified heating load calculation
    const baseLoad = zone.area_sqft * 20; // Base 20 BTU/sqft
    const temperatureFactor = (70 - criteria.outdoor_design_conditions.dry_bulb_temperature) / 15;
    
    return Math.round(baseLoad * (1 + temperatureFactor));
  }

  private calculateAirflowRequirement(coolingLoad: number): number {
    // Standard airflow calculation: 400 CFM per ton (12,000 BTU)
    return Math.round((coolingLoad / 12000) * 400);
  }

  private async selectCoolingEquipment(load: number, targets: EfficiencyTargets): Promise<EquipmentSelection> {
    // Mock equipment selection - would integrate with manufacturer databases
    return {
      equipment_type: ComponentType.CONDENSER,
      manufacturer: 'Carrier',
      model: 'Performance Series',
      capacity: Math.ceil(load / 12000), // Convert to tons
      efficiency_rating: {
        seer: targets.target_seer,
        eer: targets.target_eer,
        hspf: 0,
        afue: 0,
        cop: 3.2,
        energy_star_certified: targets.energy_star_required
      },
      selection_criteria: {
        load_matching: 95,
        efficiency_priority: 8,
        cost_priority: 6,
        reliability_priority: 9,
        maintenance_priority: 7
      },
      cost_estimate: Math.ceil(load / 12000) * 3500, // $3500 per ton estimate
      lead_time_weeks: 6
    };
  }

  private async selectHeatingEquipment(load: number, targets: EfficiencyTargets): Promise<EquipmentSelection> {
    return {
      equipment_type: ComponentType.FURNACE,
      manufacturer: 'Trane',
      model: 'XC80 Gas Furnace',
      capacity: Math.ceil(load / 1000), // Convert to MBH
      efficiency_rating: {
        seer: 0,
        eer: 0,
        hspf: targets.target_hspf,
        afue: 95,
        cop: 0,
        energy_star_certified: targets.energy_star_required
      },
      selection_criteria: {
        load_matching: 98,
        efficiency_priority: 9,
        cost_priority: 5,
        reliability_priority: 8,
        maintenance_priority: 6
      },
      cost_estimate: Math.ceil(load / 1000) * 150, // $150 per MBH estimate
      lead_time_weeks: 4
    };
  }

  private async selectAirHandler(airflow: number): Promise<EquipmentSelection> {
    return {
      equipment_type: ComponentType.BLOWER,
      manufacturer: 'Daikin',
      model: 'Indoor Air Handler',
      capacity: airflow,
      efficiency_rating: {
        seer: 0,
        eer: 0,
        hspf: 0,
        afue: 0,
        cop: 0,
        energy_star_certified: false
      },
      selection_criteria: {
        load_matching: 100,
        efficiency_priority: 6,
        cost_priority: 7,
        reliability_priority: 8,
        maintenance_priority: 7
      },
      cost_estimate: airflow * 2.5, // $2.50 per CFM estimate
      lead_time_weeks: 3
    };
  }

  private async getEnergyData(systemId: string, period: string): Promise<EnergyConsumption> {
    // Mock energy data - would integrate with utility meters or BAS
    return {
      electricity_kwh: 15000,
      natural_gas_therms: 800,
      measurement_period: period,
      baseline_comparison: 5 // 5% above baseline
    };
  }

  private async calculateEnergyCosts(energyData: EnergyConsumption): Promise<CostAnalysis> {
    const electricityRate = 0.12; // $0.12 per kWh
    const gasRate = 1.15; // $1.15 per therm
    
    const electricityCost = energyData.electricity_kwh * electricityRate;
    const gasCost = energyData.natural_gas_therms * gasRate;
    
    return {
      operating_cost_monthly: (electricityCost + gasCost) / 12,
      maintenance_cost_annual: 2500,
      repair_cost_ytd: 850,
      energy_cost_breakdown: {
        electricity_cost: electricityCost,
        gas_cost: gasCost,
        demand_charges: electricityCost * 0.2,
        other_charges: 150
      },
      cost_per_sqft: (electricityCost + gasCost) / 5000, // Assuming 5000 sqft
      cost_per_ton: (electricityCost + gasCost) / 10 // Assuming 10 ton system
    };
  }

  private async calculateEfficiencyMetrics(system: HVACSystem, energyData: EnergyConsumption): Promise<EfficiencyMetrics> {
    return {
      current_seer: system.efficiency_rating.seer * 0.95, // Assume 5% degradation
      current_eer: system.efficiency_rating.eer * 0.95,
      current_hspf: system.efficiency_rating.hspf * 0.95,
      runtime_hours: 2400, // Hours per year
      cycling_frequency: 4.5, // Cycles per hour
      load_factor: 0.65 // 65% average load
    };
  }

  private async generateEnergyRecommendations(system: HVACSystem, metrics: EfficiencyMetrics): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (metrics.current_seer < system.efficiency_rating.seer * 0.9) {
      recommendations.push('Schedule comprehensive maintenance to restore efficiency');
    }
    
    if (metrics.cycling_frequency > 6) {
      recommendations.push('System may be oversized - consider load analysis');
    }
    
    if (metrics.load_factor < 0.5) {
      recommendations.push('Consider variable capacity equipment for better part-load efficiency');
    }
    
    recommendations.push('Implement programmable setback schedules to reduce energy consumption');
    recommendations.push('Seal ductwork to improve system efficiency');
    
    return recommendations;
  }

  private async executeCommissioningProcedure(systemId: string, procedure: StartupProcedure): Promise<TestResult> {
    // Mock commissioning test execution
    const testResults: Record<string, TestResult> = {
      'cooling_capacity': {
        test_name: 'cooling_capacity',
        expected_value: 36000,
        actual_value: 35800,
        unit: 'BTU/hr',
        pass_fail: 'pass',
        notes: 'Within 5% tolerance'
      },
      'heating_capacity': {
        test_name: 'heating_capacity',
        expected_value: 80000,
        actual_value: 81200,
        unit: 'BTU/hr',
        pass_fail: 'pass'
      },
      'airflow': {
        test_name: 'airflow',
        expected_value: 1200,
        actual_value: 1180,
        unit: 'CFM',
        pass_fail: 'pass'
      }
    };

    // Return a test result based on the procedure step
    const testName = procedure.procedure.toLowerCase().includes('cooling') ? 'cooling_capacity' :
                     procedure.procedure.toLowerCase().includes('heating') ? 'heating_capacity' : 'airflow';
    
    return testResults[testName] || testResults['airflow'];
  }
}

// Export singleton instance
export const hvacManagementService = new HVACManagementService();

// React hook
export function useHVACManagement() {
  const [systems, setSystems] = React.useState<HVACSystem[]>([]);
  const [designs, setDesigns] = React.useState<HVACDesign[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = React.useState<ScheduledTask[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadSystems = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hvacManagementService.getProjectHVACSystems(projectId);
      setSystems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load HVAC systems');
    } finally {
      setIsLoading(false);
    }
  };

  const createSystem = async (system: Omit<HVACSystem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSystem = await hvacManagementService.createHVACSystem(system);
      setSystems(prev => [newSystem, ...prev]);
      return newSystem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create HVAC system');
    }
  };

  const performLoadCalculation = async (
    projectId: string,
    designCriteria: DesignCriteria,
    zones: HVACZone[]
  ) => {
    try {
      return await hvacManagementService.performLoadCalculation(projectId, designCriteria, zones);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to perform load calculation');
    }
  };

  const scheduleMaintenanceTask = async (task: Omit<ScheduledTask, 'id'>) => {
    try {
      const newTask = await hvacManagementService.scheduleMaintenanceTask(task);
      setMaintenanceTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to schedule maintenance task');
    }
  };

  const performEnergyAnalysis = async (systemId: string, period: 'month' | 'year' = 'year') => {
    try {
      return await hvacManagementService.performEnergyAnalysis(systemId, period);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to perform energy analysis');
    }
  };

  return {
    systems,
    designs,
    maintenanceTasks,
    isLoading,
    error,
    loadSystems,
    createSystem,
    performLoadCalculation,
    scheduleMaintenanceTask,
    performEnergyAnalysis,
    service: hvacManagementService
  };
}

import React from 'react';