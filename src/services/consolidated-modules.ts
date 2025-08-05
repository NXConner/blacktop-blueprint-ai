import { supabase } from '@/integrations/supabase/client';

// ================================
// CYBERSECURITY & SAFETY MANAGEMENT
// ================================
export interface SecurityCompliance {
  id: string;
  project_id: string;
  security_type: SecurityType;
  compliance_frameworks: ComplianceFramework[];
  risk_assessments: SecurityRiskAssessment[];
  vulnerabilities: SecurityVulnerability[];
  incidents: SecurityIncident[];
  training_records: SecurityTraining[];
  audits: SecurityAudit[];
  status: ComplianceStatus;
  created_at: string;
  updated_at: string;
}

export enum SecurityType {
  CYBERSECURITY = 'cybersecurity',
  PHYSICAL_SECURITY = 'physical_security',
  INFORMATION_SECURITY = 'information_security',
  OPERATIONAL_SECURITY = 'operational_security',
  WORKPLACE_SAFETY = 'workplace_safety'
}

export enum ComplianceFramework {
  NIST = 'nist',
  ISO_27001 = 'iso_27001',
  SOC_2 = 'soc_2',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  OSHA = 'osha'
}

export interface SecurityRiskAssessment {
  risk_id: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  risk_score: number;
  mitigation_plan: string;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface SecurityVulnerability {
  vulnerability_id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_systems: string[];
  remediation_plan: string;
  due_date: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface SecurityIncident {
  incident_id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_systems: string[];
  response_actions: string[];
  lessons_learned: string[];
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
}

export interface SecurityTraining {
  employee_id: string;
  training_type: string;
  completion_date: string;
  expiry_date: string;
  score: number;
  certification: string;
}

export interface SecurityAudit {
  audit_id: string;
  audit_type: string;
  auditor: string;
  audit_date: string;
  findings: AuditFinding[];
  recommendations: string[];
  compliance_score: number;
}

export interface AuditFinding {
  finding_id: string;
  category: string;
  severity: string;
  description: string;
  evidence: string[];
  remediation_required: boolean;
}

// ================================
// FIELD SERVICE & IOT INTEGRATION
// ================================
export interface FieldService {
  id: string;
  work_order: WorkOrder;
  technician: FieldTechnician;
  equipment: FieldEquipment[];
  location: ServiceLocation;
  iot_devices: IoTDevice[];
  mobile_data: MobileDataSync;
  performance_metrics: FieldServiceMetrics;
  status: FieldServiceStatus;
}

export enum FieldServiceStatus {
  SCHEDULED = 'scheduled',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface WorkOrder {
  order_id: string;
  type: WorkOrderType;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  description: string;
  scheduled_date: string;
  estimated_duration: number;
  parts_required: PartRequirement[];
  instructions: string[];
  safety_requirements: string[];
}

export enum WorkOrderType {
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  INSTALLATION = 'installation',
  INSPECTION = 'inspection',
  EMERGENCY = 'emergency'
}

export interface FieldTechnician {
  technician_id: string;
  name: string;
  skills: string[];
  certifications: TechnicianCertification[];
  current_location: { latitude: number; longitude: number };
  availability: AvailabilitySchedule[];
  performance_rating: number;
}

export interface TechnicianCertification {
  certification_name: string;
  issue_date: string;
  expiry_date: string;
  issuing_body: string;
  level: string;
}

export interface AvailabilitySchedule {
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'scheduled' | 'unavailable';
}

export interface FieldEquipment {
  equipment_id: string;
  type: string;
  model: string;
  condition: string;
  last_service: string;
  iot_enabled: boolean;
  sensors: IoTSensor[];
}

export interface ServiceLocation {
  site_id: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  access_instructions: string[];
  safety_notes: string[];
  contact_person: string;
}

export interface IoTDevice {
  device_id: string;
  device_type: IoTDeviceType;
  manufacturer: string;
  model: string;
  firmware_version: string;
  connectivity: ConnectivityInfo;
  sensors: IoTSensor[];
  data_streams: DataStream[];
  alerts: IoTAlert[];
  status: DeviceStatus;
}

export enum IoTDeviceType {
  SENSOR = 'sensor',
  CONTROLLER = 'controller',
  GATEWAY = 'gateway',
  ACTUATOR = 'actuator',
  MONITOR = 'monitor'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error'
}

export interface ConnectivityInfo {
  connection_type: 'wifi' | 'cellular' | 'ethernet' | 'lora' | 'zigbee';
  signal_strength: number;
  last_communication: string;
  data_usage: number;
}

export interface IoTSensor {
  sensor_id: string;
  sensor_type: SensorType;
  measurement_unit: string;
  sampling_rate: number;
  accuracy: number;
  calibration_date: string;
  current_value: number;
  thresholds: SensorThreshold[];
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  VIBRATION = 'vibration',
  FLOW = 'flow',
  LEVEL = 'level',
  MOTION = 'motion',
  GPS = 'gps'
}

export interface SensorThreshold {
  threshold_type: 'min' | 'max' | 'target';
  value: number;
  action: 'alert' | 'alarm' | 'shutdown';
}

export interface DataStream {
  stream_id: string;
  data_type: string;
  frequency: number;
  retention_period: number;
  compression: boolean;
  encryption: boolean;
}

export interface IoTAlert {
  alert_id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface MobileDataSync {
  last_sync: string;
  pending_uploads: number;
  sync_status: 'in_sync' | 'pending' | 'error';
  bandwidth_usage: number;
  offline_capacity: number;
}

export interface FieldServiceMetrics {
  response_time: number;
  resolution_time: number;
  first_time_fix_rate: number;
  customer_satisfaction: number;
  parts_availability: number;
  travel_time: number;
}

// ================================
// BUSINESS INTELLIGENCE & AI OPTIMIZATION
// ================================
export interface BusinessIntelligence {
  id: string;
  dashboard_config: DashboardConfig;
  analytics_models: AnalyticsModel[];
  reports: IntelligenceReport[];
  ai_insights: AIInsight[];
  predictive_models: PredictiveModel[];
  optimization_recommendations: OptimizationRecommendation[];
  data_sources: DataSource[];
}

export interface DashboardConfig {
  dashboard_id: string;
  name: string;
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  permissions: string[];
  refresh_interval: number;
}

export interface DashboardWidget {
  widget_id: string;
  type: WidgetType;
  title: string;
  data_source: string;
  configuration: WidgetConfig;
  position: { x: number; y: number; width: number; height: number };
}

export enum WidgetType {
  CHART = 'chart',
  KPI = 'kpi',
  TABLE = 'table',
  MAP = 'map',
  GAUGE = 'gauge',
  TEXT = 'text'
}

export interface WidgetConfig {
  chart_type?: 'line' | 'bar' | 'pie' | 'scatter';
  metrics: string[];
  dimensions: string[];
  filters: FilterConfig[];
  time_range: TimeRangeConfig;
}

export interface FilterConfig {
  field: string;
  operator: string;
  value: any;
}

export interface TimeRangeConfig {
  type: 'relative' | 'absolute';
  value: string;
  start_date?: string;
  end_date?: string;
}

export interface LayoutConfig {
  columns: number;
  rows: number;
  responsive: boolean;
  theme: string;
}

export interface AnalyticsModel {
  model_id: string;
  name: string;
  type: ModelType;
  algorithm: string;
  training_data: string[];
  features: ModelFeature[];
  performance_metrics: ModelPerformance;
  deployment_status: 'training' | 'deployed' | 'retired';
}

export enum ModelType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  FORECASTING = 'forecasting',
  ANOMALY_DETECTION = 'anomaly_detection'
}

export interface ModelFeature {
  feature_name: string;
  importance: number;
  data_type: string;
  transformation: string;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  mse?: number;
  r_squared?: number;
}

export interface IntelligenceReport {
  report_id: string;
  name: string;
  type: ReportType;
  schedule: ReportSchedule;
  recipients: string[];
  content: ReportContent;
  last_generated: string;
}

export enum ReportType {
  OPERATIONAL = 'operational',
  FINANCIAL = 'financial',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance',
  EXECUTIVE = 'executive'
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  timezone: string;
  enabled: boolean;
}

export interface ReportContent {
  sections: ReportSection[];
  format: 'pdf' | 'excel' | 'html';
  template: string;
}

export interface ReportSection {
  section_id: string;
  title: string;
  content_type: 'chart' | 'table' | 'text' | 'kpi';
  data_query: string;
  styling: any;
}

export interface AIInsight {
  insight_id: string;
  type: InsightType;
  confidence: number;
  description: string;
  impact: 'low' | 'medium' | 'high';
  action_items: string[];
  supporting_data: any;
  generated_at: string;
}

export enum InsightType {
  TREND_ANALYSIS = 'trend_analysis',
  ANOMALY_DETECTION = 'anomaly_detection',
  CORRELATION = 'correlation',
  PREDICTION = 'prediction',
  OPTIMIZATION = 'optimization'
}

export interface PredictiveModel {
  model_id: string;
  prediction_type: PredictionType;
  target_variable: string;
  forecast_horizon: number;
  accuracy_metrics: ModelPerformance;
  last_prediction: Prediction;
}

export enum PredictionType {
  DEMAND_FORECAST = 'demand_forecast',
  FAILURE_PREDICTION = 'failure_prediction',
  COST_PROJECTION = 'cost_projection',
  PERFORMANCE_FORECAST = 'performance_forecast'
}

export interface Prediction {
  prediction_id: string;
  predicted_value: number;
  confidence_interval: { lower: number; upper: number };
  prediction_date: string;
  actual_value?: number;
  accuracy?: number;
}

export interface OptimizationRecommendation {
  recommendation_id: string;
  category: string;
  description: string;
  potential_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  timeline: string;
  success_probability: number;
  dependencies: string[];
}

export interface DataSource {
  source_id: string;
  name: string;
  type: DataSourceType;
  connection_info: ConnectionInfo;
  refresh_schedule: RefreshSchedule;
  data_quality_score: number;
  last_updated: string;
}

export enum DataSourceType {
  DATABASE = 'database',
  API = 'api',
  FILE = 'file',
  STREAM = 'stream',
  EXTERNAL_SERVICE = 'external_service'
}

export interface ConnectionInfo {
  endpoint: string;
  authentication: AuthenticationInfo;
  ssl_enabled: boolean;
  timeout: number;
}

export interface AuthenticationInfo {
  type: 'none' | 'basic' | 'oauth' | 'api_key';
  credentials: any;
}

export interface RefreshSchedule {
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
  time?: string;
  enabled: boolean;
}

// ================================
// INSURANCE & RISK MANAGEMENT
// ================================
export interface InsuranceRiskManagement {
  id: string;
  project_id: string;
  insurance_policies: InsurancePolicy[];
  risk_assessments: RiskAssessment[];
  claims: InsuranceClaim[];
  risk_mitigation: RiskMitigation[];
  compliance_tracking: ComplianceTracking[];
  performance_metrics: RiskMetrics;
}

export interface InsurancePolicy {
  policy_id: string;
  policy_type: PolicyType;
  insurer: InsurerInfo;
  coverage_details: CoverageDetails;
  premium_info: PremiumInfo;
  policy_terms: PolicyTerms;
  claims_history: ClaimSummary[];
  status: PolicyStatus;
}

export enum PolicyType {
  GENERAL_LIABILITY = 'general_liability',
  WORKERS_COMPENSATION = 'workers_compensation',
  PROFESSIONAL_LIABILITY = 'professional_liability',
  CYBER_LIABILITY = 'cyber_liability',
  PROPERTY_INSURANCE = 'property_insurance',
  EQUIPMENT_INSURANCE = 'equipment_insurance'
}

export enum PolicyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING_RENEWAL = 'pending_renewal'
}

export interface InsurerInfo {
  company_name: string;
  rating: string;
  contact_info: string;
  claims_phone: string;
  policy_number: string;
}

export interface CoverageDetails {
  coverage_limits: CoverageLimit[];
  deductibles: Deductible[];
  exclusions: string[];
  territory: string;
  covered_operations: string[];
}

export interface CoverageLimit {
  type: string;
  amount: number;
  per_occurrence: boolean;
  aggregate: boolean;
}

export interface Deductible {
  type: string;
  amount: number;
  applies_to: string[];
}

export interface PremiumInfo {
  annual_premium: number;
  payment_schedule: PaymentSchedule;
  discounts_applied: Discount[];
  factors_affecting_premium: PremiumFactor[];
}

export interface PaymentSchedule {
  frequency: 'annual' | 'semi_annual' | 'quarterly' | 'monthly';
  amount: number;
  due_dates: string[];
}

export interface Discount {
  discount_type: string;
  percentage: number;
  description: string;
}

export interface PremiumFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PolicyTerms {
  effective_date: string;
  expiry_date: string;
  renewal_terms: string;
  cancellation_terms: string;
  modification_procedures: string;
}

export interface ClaimSummary {
  claim_number: string;
  incident_date: string;
  claim_amount: number;
  status: ClaimStatus;
  resolution_date?: string;
}

export enum ClaimStatus {
  REPORTED = 'reported',
  UNDER_INVESTIGATION = 'under_investigation',
  APPROVED = 'approved',
  DENIED = 'denied',
  SETTLED = 'settled',
  CLOSED = 'closed'
}

export interface InsuranceClaim {
  claim_id: string;
  policy_id: string;
  incident_details: IncidentDetails;
  claim_amount: number;
  supporting_documents: ClaimDocument[];
  investigation: ClaimInvestigation;
  settlement: ClaimSettlement;
  status: ClaimStatus;
}

export interface IncidentDetails {
  incident_date: string;
  incident_time: string;
  location: string;
  description: string;
  cause: string;
  witnesses: string[];
  police_report?: string;
  photos: string[];
}

export interface ClaimDocument {
  document_type: string;
  document_url: string;
  upload_date: string;
  required: boolean;
  verified: boolean;
}

export interface ClaimInvestigation {
  investigator: string;
  start_date: string;
  findings: string[];
  recommendations: string[];
  liability_assessment: string;
  completion_date?: string;
}

export interface ClaimSettlement {
  settlement_amount: number;
  settlement_date: string;
  payment_method: string;
  conditions: string[];
  release_signed: boolean;
}

export interface RiskMitigation {
  mitigation_id: string;
  risk_category: string;
  mitigation_strategy: string;
  implementation_date: string;
  effectiveness: number;
  cost: number;
  monitoring_plan: string;
}

export interface ComplianceTracking {
  regulation: string;
  compliance_status: 'compliant' | 'non_compliant' | 'pending';
  last_audit_date: string;
  next_audit_due: string;
  findings: string[];
  corrective_actions: string[];
}

export interface RiskMetrics {
  total_exposure: number;
  claims_frequency: number;
  claims_severity: number;
  loss_ratio: number;
  premium_efficiency: number;
  risk_score: number;
}

// ================================
// CONSOLIDATED SERVICE CLASS
// ================================
class ConsolidatedModulesService {
  // Security & Compliance Methods
  async createSecurityCompliance(compliance: Omit<SecurityCompliance, 'id' | 'created_at' | 'updated_at'>): Promise<SecurityCompliance> {
    const { data, error } = await supabase
      .from('security_compliance')
      .insert(compliance)
      .select()
      .single();

    if (error) throw new Error(`Failed to create security compliance: ${error.message}`);
    return data;
  }

  async performSecurityAudit(projectId: string, auditType: string): Promise<SecurityAudit> {
    const findings = await this.generateSecurityFindings(projectId, auditType);
    const audit: Omit<SecurityAudit, 'audit_id'> = {
      audit_type: auditType,
      auditor: 'Security Team',
      audit_date: new Date().toISOString(),
      findings,
      recommendations: this.generateSecurityRecommendations(findings),
      compliance_score: this.calculateComplianceScore(findings)
    };

    const { data, error } = await supabase
      .from('security_audits')
      .insert(audit)
      .select()
      .single();

    if (error) throw new Error(`Failed to record security audit: ${error.message}`);
    return data;
  }

  // Field Service Methods
  async scheduleFieldService(workOrder: WorkOrder, technicianId: string): Promise<FieldService> {
    const technician = await this.getFieldTechnician(technicianId);
    const fieldService: Omit<FieldService, 'id'> = {
      work_order: workOrder,
      technician,
      equipment: [],
      location: await this.getServiceLocation(workOrder.order_id),
      iot_devices: [],
      mobile_data: {
        last_sync: new Date().toISOString(),
        pending_uploads: 0,
        sync_status: 'in_sync',
        bandwidth_usage: 0,
        offline_capacity: 100
      },
      performance_metrics: {
        response_time: 0,
        resolution_time: 0,
        first_time_fix_rate: 0,
        customer_satisfaction: 0,
        parts_availability: 0,
        travel_time: 0
      },
      status: FieldServiceStatus.SCHEDULED
    };

    const { data, error } = await supabase
      .from('field_services')
      .insert(fieldService)
      .select()
      .single();

    if (error) throw new Error(`Failed to schedule field service: ${error.message}`);
    return data;
  }

  async updateIoTDevice(deviceId: string, data: Partial<IoTDevice>): Promise<void> {
    const { error } = await supabase
      .from('iot_devices')
      .update(data)
      .eq('device_id', deviceId);

    if (error) throw new Error(`Failed to update IoT device: ${error.message}`);
  }

  // Business Intelligence Methods
  async createDashboard(config: Omit<DashboardConfig, 'dashboard_id'>): Promise<DashboardConfig> {
    const dashboardId = `dash_${Date.now()}`;
    const dashboard = { ...config, dashboard_id: dashboardId };

    const { data, error } = await supabase
      .from('dashboards')
      .insert(dashboard)
      .select()
      .single();

    if (error) throw new Error(`Failed to create dashboard: ${error.message}`);
    return data;
  }

  async generateAIInsights(dataSourceId: string): Promise<AIInsight[]> {
    // Mock AI insight generation
    const insights: AIInsight[] = [
      {
        insight_id: `insight_${Date.now()}`,
        type: InsightType.TREND_ANALYSIS,
        confidence: 0.85,
        description: 'Equipment maintenance costs are trending upward by 15% over the last quarter',
        impact: 'medium',
        action_items: [
          'Review maintenance schedules',
          'Evaluate equipment replacement options',
          'Negotiate better service contracts'
        ],
        supporting_data: {},
        generated_at: new Date().toISOString()
      }
    ];

    // Store insights
    const { error } = await supabase
      .from('ai_insights')
      .insert(insights);

    if (error) throw new Error(`Failed to store AI insights: ${error.message}`);
    return insights;
  }

  async trainPredictiveModel(modelConfig: Omit<PredictiveModel, 'model_id'>): Promise<PredictiveModel> {
    // Mock model training
    const model: PredictiveModel = {
      ...modelConfig,
      model_id: `model_${Date.now()}`,
      accuracy_metrics: {
        accuracy: 0.87,
        precision: 0.85,
        recall: 0.89,
        f1_score: 0.87
      },
      last_prediction: {
        prediction_id: `pred_${Date.now()}`,
        predicted_value: 1000,
        confidence_interval: { lower: 900, upper: 1100 },
        prediction_date: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('predictive_models')
      .insert(model)
      .select()
      .single();

    if (error) throw new Error(`Failed to create predictive model: ${error.message}`);
    return data;
  }

  // Insurance & Risk Management Methods
  async createInsurancePolicy(policy: Omit<InsurancePolicy, 'policy_id'>): Promise<InsurancePolicy> {
    const policyId = `policy_${Date.now()}`;
    const policyWithId = { ...policy, policy_id: policyId };

    const { data, error } = await supabase
      .from('insurance_policies')
      .insert(policyWithId)
      .select()
      .single();

    if (error) throw new Error(`Failed to create insurance policy: ${error.message}`);
    return data;
  }

  async submitInsuranceClaim(claim: Omit<InsuranceClaim, 'claim_id'>): Promise<InsuranceClaim> {
    const claimId = `claim_${Date.now()}`;
    const claimWithId = { ...claim, claim_id: claimId };

    const { data, error } = await supabase
      .from('insurance_claims')
      .insert(claimWithId)
      .select()
      .single();

    if (error) throw new Error(`Failed to submit insurance claim: ${error.message}`);
    return data;
  }

  async assessProjectRisk(projectId: string): Promise<RiskAssessment[]> {
    // Mock risk assessment
    return [
      {
        risk_id: `risk_${Date.now()}`,
        description: 'Equipment failure risk',
        category: 'operational',
        probability: 0.3,
        impact: 8,
        risk_score: 2.4,
        mitigation_plan: 'Implement preventive maintenance schedule',
        status: 'open'
      }
    ];
  }

  // Private utility methods
  private async generateSecurityFindings(projectId: string, auditType: string): Promise<AuditFinding[]> {
    return [
      {
        finding_id: `finding_${Date.now()}`,
        category: 'access_control',
        severity: 'medium',
        description: 'Weak password policies detected',
        evidence: ['Policy review', 'User account analysis'],
        remediation_required: true
      }
    ];
  }

  private generateSecurityRecommendations(findings: AuditFinding[]): string[] {
    return [
      'Implement multi-factor authentication',
      'Update password policies',
      'Conduct security awareness training',
      'Regular security assessments'
    ];
  }

  private calculateComplianceScore(findings: AuditFinding[]): number {
    const totalFindings = findings.length;
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    
    const baseScore = 100;
    const deductions = (criticalFindings * 20) + (highFindings * 10) + ((totalFindings - criticalFindings - highFindings) * 5);
    
    return Math.max(0, baseScore - deductions);
  }

  private async getFieldTechnician(technicianId: string): Promise<FieldTechnician> {
    // Mock technician data
    return {
      technician_id: technicianId,
      name: 'John Smith',
      skills: ['HVAC', 'Electrical', 'Plumbing'],
      certifications: [
        {
          certification_name: 'EPA 608',
          issue_date: '2022-01-01',
          expiry_date: '2025-01-01',
          issuing_body: 'EPA',
          level: 'Universal'
        }
      ],
      current_location: { latitude: 40.7128, longitude: -74.0060 },
      availability: [],
      performance_rating: 4.5
    };
  }

  private async getServiceLocation(orderId: string): Promise<ServiceLocation> {
    return {
      site_id: `site_${orderId}`,
      address: '123 Main St, Anytown, USA',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      access_instructions: ['Use main entrance', 'Check in at front desk'],
      safety_notes: ['Hard hat required', 'Safety glasses required'],
      contact_person: 'Jane Doe'
    };
  }
}

// Export singleton instance
export const consolidatedModulesService = new ConsolidatedModulesService();

// React hooks for each module
export function useSecurityCompliance() {
  const [compliance, setCompliance] = React.useState<SecurityCompliance[]>([]);
  const [audits, setAudits] = React.useState<SecurityAudit[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const performAudit = async (projectId: string, auditType: string) => {
    try {
      const audit = await consolidatedModulesService.performSecurityAudit(projectId, auditType);
      setAudits(prev => [audit, ...prev]);
      return audit;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to perform security audit');
    }
  };

  return { compliance, audits, isLoading, error, performAudit, service: consolidatedModulesService };
}

export function useFieldService() {
  const [services, setServices] = React.useState<FieldService[]>([]);
  const [iotDevices, setIoTDevices] = React.useState<IoTDevice[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const scheduleService = async (workOrder: WorkOrder, technicianId: string) => {
    try {
      const service = await consolidatedModulesService.scheduleFieldService(workOrder, technicianId);
      setServices(prev => [service, ...prev]);
      return service;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to schedule field service');
    }
  };

  return { services, iotDevices, isLoading, error, scheduleService, service: consolidatedModulesService };
}

export function useBusinessIntelligence() {
  const [dashboards, setDashboards] = React.useState<DashboardConfig[]>([]);
  const [insights, setInsights] = React.useState<AIInsight[]>([]);
  const [models, setModels] = React.useState<PredictiveModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const createDashboard = async (config: Omit<DashboardConfig, 'dashboard_id'>) => {
    try {
      const dashboard = await consolidatedModulesService.createDashboard(config);
      setDashboards(prev => [dashboard, ...prev]);
      return dashboard;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create dashboard');
    }
  };

  const generateInsights = async (dataSourceId: string) => {
    try {
      const newInsights = await consolidatedModulesService.generateAIInsights(dataSourceId);
      setInsights(prev => [...newInsights, ...prev]);
      return newInsights;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate AI insights');
    }
  };

  return { dashboards, insights, models, isLoading, error, createDashboard, generateInsights, service: consolidatedModulesService };
}

export function useInsuranceRisk() {
  const [policies, setPolicies] = React.useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = React.useState<InsuranceClaim[]>([]);
  const [risks, setRisks] = React.useState<RiskAssessment[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const createPolicy = async (policy: Omit<InsurancePolicy, 'policy_id'>) => {
    try {
      const newPolicy = await consolidatedModulesService.createInsurancePolicy(policy);
      setPolicies(prev => [newPolicy, ...prev]);
      return newPolicy;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create insurance policy');
    }
  };

  const submitClaim = async (claim: Omit<InsuranceClaim, 'claim_id'>) => {
    try {
      const newClaim = await consolidatedModulesService.submitInsuranceClaim(claim);
      setClaims(prev => [newClaim, ...prev]);
      return newClaim;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to submit insurance claim');
    }
  };

  return { policies, claims, risks, isLoading, error, createPolicy, submitClaim, service: consolidatedModulesService };
}

import React from 'react';