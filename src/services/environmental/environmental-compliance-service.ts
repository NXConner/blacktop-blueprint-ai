import { supabase } from '@/integrations/supabase/client';

// Environmental compliance types
export interface EnvironmentalCompliance {
  id: string;
  project_id: string;
  compliance_type: ComplianceType;
  regulation: RegulationInfo;
  status: ComplianceStatus;
  permits: EnvironmentalPermit[];
  monitoring: EnvironmentalMonitoring[];
  reporting: ComplianceReporting[];
  violations: Violation[];
  mitigation_measures: MitigationMeasure[];
  created_at: string;
  updated_at: string;
}

export enum ComplianceType {
  AIR_QUALITY = 'air_quality',
  WATER_QUALITY = 'water_quality',
  SOIL_CONTAMINATION = 'soil_contamination',
  HAZARDOUS_MATERIALS = 'hazardous_materials',
  WASTE_MANAGEMENT = 'waste_management',
  NOISE_CONTROL = 'noise_control',
  STORMWATER = 'stormwater',
  WETLANDS = 'wetlands',
  ENDANGERED_SPECIES = 'endangered_species'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING_REVIEW = 'pending_review',
  CONDITIONAL = 'conditional',
  EXPIRED = 'expired'
}

export interface RegulationInfo {
  regulation_name: string;
  agency: string;
  cfr_section?: string;
  state_regulation?: string;
  local_ordinance?: string;
  effective_date: string;
  requirements: string[];
}

export interface EnvironmentalPermit {
  id: string;
  permit_type: string;
  permit_number: string;
  issuing_agency: string;
  issue_date: string;
  expiry_date: string;
  conditions: string[];
  monitoring_requirements: string[];
  reporting_requirements: string[];
  fees: number;
  status: 'active' | 'expired' | 'pending' | 'denied';
}

export interface EnvironmentalMonitoring {
  id: string;
  monitoring_type: MonitoringType;
  parameters: MonitoringParameter[];
  frequency: MonitoringFrequency;
  sampling_locations: SamplingLocation[];
  results: MonitoringResult[];
  equipment: MonitoringEquipment[];
}

export enum MonitoringType {
  AIR_EMISSIONS = 'air_emissions',
  WATER_DISCHARGE = 'water_discharge',
  GROUNDWATER = 'groundwater',
  SOIL_QUALITY = 'soil_quality',
  NOISE_LEVELS = 'noise_levels',
  DUST_PARTICLES = 'dust_particles',
  VIBRATION = 'vibration'
}

export enum MonitoringFrequency {
  CONTINUOUS = 'continuous',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  AS_REQUIRED = 'as_required'
}

export interface MonitoringParameter {
  parameter: string;
  unit: string;
  limit_value: number;
  action_level: number;
  measurement_method: string;
}

export interface SamplingLocation {
  location_id: string;
  description: string;
  coordinates: { latitude: number; longitude: number };
  sampling_method: string;
  access_requirements: string[];
}

export interface MonitoringResult {
  id: string;
  sample_date: string;
  location_id: string;
  parameter: string;
  value: number;
  unit: string;
  detection_limit: number;
  exceedance: boolean;
  lab_analysis?: LabAnalysis;
}

export interface LabAnalysis {
  lab_name: string;
  analyst: string;
  analysis_date: string;
  method: string;
  qc_data: QualityControlData;
  certification: string;
}

export interface QualityControlData {
  blank_results: number[];
  duplicate_results: number[];
  spike_recovery: number;
  calibration_check: boolean;
}

export interface MonitoringEquipment {
  equipment_type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  calibration_date: string;
  next_calibration: string;
  accuracy: string;
  maintenance_schedule: string;
}

export interface ComplianceReporting {
  id: string;
  report_type: string;
  reporting_period: string;
  due_date: string;
  submission_date?: string;
  recipient_agency: string;
  report_data: any;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface Violation {
  id: string;
  violation_type: string;
  description: string;
  identified_date: string;
  severity: 'minor' | 'major' | 'critical';
  regulatory_citation: string;
  corrective_actions: CorrectiveAction[];
  penalty?: Penalty;
  resolution_date?: string;
}

export interface CorrectiveAction {
  action: string;
  responsible_party: string;
  due_date: string;
  completion_date?: string;
  cost: number;
  verification_method: string;
}

export interface Penalty {
  penalty_type: 'fine' | 'stop_work' | 'permit_suspension';
  amount?: number;
  description: string;
  appeal_deadline?: string;
  appeal_status?: string;
}

export interface MitigationMeasure {
  measure_type: string;
  description: string;
  implementation_date: string;
  effectiveness: number;
  monitoring_plan: string;
  cost: number;
}

// Green Building Certification
export interface GreenBuildingProject {
  id: string;
  project_id: string;
  certification_program: CertificationProgram;
  target_level: string;
  current_status: CertificationStatus;
  credits: GreenCredit[];
  documentation: CertificationDocument[];
  energy_modeling: EnergyModel;
  sustainability_metrics: SustainabilityMetrics;
  commissioning: GreenCommissioning;
  created_at: string;
  updated_at: string;
}

export enum CertificationProgram {
  LEED = 'leed',
  BREEAM = 'breeam',
  GREEN_GLOBES = 'green_globes',
  ENERGY_STAR = 'energy_star',
  LIVING_BUILDING = 'living_building',
  WELL = 'well',
  FITWEL = 'fitwel'
}

export enum CertificationStatus {
  PLANNING = 'planning',
  REGISTERED = 'registered',
  DESIGN_REVIEW = 'design_review',
  CONSTRUCTION_REVIEW = 'construction_review',
  FINAL_REVIEW = 'final_review',
  CERTIFIED = 'certified',
  DENIED = 'denied'
}

export interface GreenCredit {
  category: string;
  credit_name: string;
  points_available: number;
  points_attempted: number;
  points_achieved: number;
  compliance_path: string;
  documentation_requirements: string[];
  status: 'not_attempted' | 'in_progress' | 'submitted' | 'achieved' | 'denied';
}

export interface CertificationDocument {
  id: string;
  document_type: string;
  title: string;
  file_url: string;
  upload_date: string;
  reviewer?: string;
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  comments?: string;
}

export interface EnergyModel {
  modeling_software: string;
  baseline_consumption: number;
  proposed_consumption: number;
  energy_savings: number;
  cost_savings: number;
  carbon_reduction: number;
  model_inputs: ModelInput[];
  results: EnergyModelResult[];
}

export interface ModelInput {
  parameter: string;
  value: string;
  source: string;
  assumptions: string;
}

export interface EnergyModelResult {
  metric: string;
  baseline_value: number;
  proposed_value: number;
  improvement: number;
  unit: string;
}

export interface SustainabilityMetrics {
  water_efficiency: WaterMetrics;
  material_efficiency: MaterialMetrics;
  indoor_air_quality: IAQMetrics;
  waste_management: WasteMetrics;
  transportation: TransportationMetrics;
}

export interface WaterMetrics {
  baseline_consumption: number;
  design_consumption: number;
  reduction_percentage: number;
  rainwater_harvesting: boolean;
  greywater_reuse: boolean;
  efficient_fixtures: boolean;
}

export interface MaterialMetrics {
  recycled_content: number;
  regional_materials: number;
  rapidly_renewable: number;
  certified_wood: number;
  low_emitting_materials: number;
}

export interface IAQMetrics {
  ventilation_effectiveness: number;
  pollutant_source_control: boolean;
  air_filtration_merv: number;
  co2_monitoring: boolean;
  natural_ventilation: boolean;
}

export interface WasteMetrics {
  construction_waste_diverted: number;
  ongoing_waste_programs: string[];
  composting: boolean;
  recycling_rate: number;
}

export interface TransportationMetrics {
  public_transit_access: boolean;
  bicycle_facilities: boolean;
  electric_vehicle_charging: number;
  car_sharing: boolean;
  reduced_parking: boolean;
}

export interface GreenCommissioning {
  commissioning_authority: string;
  scope: string[];
  opr_document: string; // Owner's Project Requirements
  basis_of_design: string;
  commissioning_plan: string;
  verification_activities: CommissioningActivity[];
  functional_testing: FunctionalTest[];
  training_provided: boolean;
  operations_manual: boolean;
}

export interface CommissioningActivity {
  system: string;
  activity: string;
  completion_date: string;
  results: string;
  issues_identified: string[];
  resolution: string;
}

export interface FunctionalTest {
  system: string;
  test_description: string;
  acceptance_criteria: string;
  results: 'pass' | 'fail' | 'conditional';
  deficiencies: string[];
  retesting_required: boolean;
}

class EnvironmentalComplianceService {
  // Compliance Management
  async createCompliance(compliance: Omit<EnvironmentalCompliance, 'id' | 'created_at' | 'updated_at'>): Promise<EnvironmentalCompliance> {
    const { data, error } = await supabase
      .from('environmental_compliance')
      .insert(compliance)
      .select()
      .single();

    if (error) throw new Error(`Failed to create compliance record: ${error.message}`);
    return data;
  }

  async updateCompliance(id: string, updates: Partial<EnvironmentalCompliance>): Promise<EnvironmentalCompliance> {
    const { data, error } = await supabase
      .from('environmental_compliance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update compliance: ${error.message}`);
    return data;
  }

  async getProjectCompliance(projectId: string): Promise<EnvironmentalCompliance[]> {
    const { data, error } = await supabase
      .from('environmental_compliance')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch compliance records: ${error.message}`);
    return data || [];
  }

  // Monitoring and Reporting
  async recordMonitoringResult(result: Omit<MonitoringResult, 'id'>): Promise<MonitoringResult> {
    const { data, error } = await supabase
      .from('monitoring_results')
      .insert(result)
      .select()
      .single();

    if (error) throw new Error(`Failed to record monitoring result: ${error.message}`);

    // Check for exceedances and create alerts if necessary
    if (result.exceedance) {
      await this.createExceedanceAlert(result);
    }

    return data;
  }

  async generateComplianceReport(
    projectId: string,
    complianceType: ComplianceType,
    period: { start: string; end: string }
  ): Promise<{
    summary: ComplianceSummary;
    monitoring_data: MonitoringResult[];
    violations: Violation[];
    recommendations: string[];
  }> {
    const [compliance, monitoringData, violations] = await Promise.all([
      this.getProjectCompliance(projectId),
      this.getMonitoringData(projectId, complianceType, period),
      this.getViolations(projectId, period)
    ]);

    const summary = this.generateComplianceSummary(compliance, monitoringData, violations);
    const recommendations = this.generateRecommendations(summary, violations);

    return {
      summary,
      monitoring_data: monitoringData,
      violations,
      recommendations
    };
  }

  // Green Building Certification
  async createGreenBuildingProject(project: Omit<GreenBuildingProject, 'id' | 'created_at' | 'updated_at'>): Promise<GreenBuildingProject> {
    const { data, error } = await supabase
      .from('green_building_projects')
      .insert(project)
      .select()
      .single();

    if (error) throw new Error(`Failed to create green building project: ${error.message}`);
    return data;
  }

  async updateCreditStatus(projectId: string, creditName: string, status: string, pointsAchieved: number): Promise<void> {
    const { error } = await supabase
      .from('green_credits')
      .update({
        status,
        points_achieved: pointsAchieved,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('credit_name', creditName);

    if (error) throw new Error(`Failed to update credit status: ${error.message}`);
  }

  async calculateCertificationScore(projectId: string): Promise<{
    total_points: number;
    achieved_points: number;
    certification_level: string;
    progress_percentage: number;
  }> {
    const { data, error } = await supabase
      .from('green_credits')
      .select('points_available, points_achieved')
      .eq('project_id', projectId);

    if (error) throw new Error(`Failed to calculate certification score: ${error.message}`);

    const totalPoints = data?.reduce((sum, credit) => sum + credit.points_available, 0) || 0;
    const achievedPoints = data?.reduce((sum, credit) => sum + credit.points_achieved, 0) || 0;

    // LEED certification levels (example)
    const certificationLevel = this.determineCertificationLevel(achievedPoints);
    const progressPercentage = totalPoints > 0 ? (achievedPoints / totalPoints) * 100 : 0;

    return {
      total_points: totalPoints,
      achieved_points: achievedPoints,
      certification_level: certificationLevel,
      progress_percentage: progressPercentage
    };
  }

  // Carbon Footprint Analysis
  async calculateCarbonFootprint(projectId: string): Promise<{
    total_emissions: number;
    emissions_by_category: EmissionCategory[];
    reduction_opportunities: ReductionOpportunity[];
    offset_recommendations: OffsetRecommendation[];
  }> {
    const projectData = await this.getProjectData(projectId);
    
    const emissionCategories = [
      this.calculateEnergyEmissions(projectData),
      this.calculateTransportationEmissions(projectData),
      this.calculateMaterialEmissions(projectData),
      this.calculateWasteEmissions(projectData)
    ];

    const totalEmissions = emissionCategories.reduce((sum, cat) => sum + cat.emissions, 0);
    const reductionOpportunities = this.identifyReductionOpportunities(emissionCategories);
    const offsetRecommendations = this.generateOffsetRecommendations(totalEmissions);

    return {
      total_emissions: totalEmissions,
      emissions_by_category: emissionCategories,
      reduction_opportunities: reductionOpportunities,
      offset_recommendations: offsetRecommendations
    };
  }

  // Private utility methods
  private async createExceedanceAlert(result: MonitoringResult): Promise<void> {
    await supabase
      .from('environmental_alerts')
      .insert({
        alert_type: 'exceedance',
        parameter: result.parameter,
        location_id: result.location_id,
        value: result.value,
        limit_value: result.value, // This would come from monitoring parameters
        severity: this.determineSeverity(result),
        created_at: new Date().toISOString()
      });
  }

  private async getMonitoringData(
    projectId: string,
    complianceType: ComplianceType,
    period: { start: string; end: string }
  ): Promise<MonitoringResult[]> {
    const { data, error } = await supabase
      .from('monitoring_results')
      .select('*')
      .eq('project_id', projectId)
      .gte('sample_date', period.start)
      .lte('sample_date', period.end)
      .order('sample_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch monitoring data: ${error.message}`);
    return data || [];
  }

  private async getViolations(projectId: string, period: { start: string; end: string }): Promise<Violation[]> {
    const { data, error } = await supabase
      .from('environmental_violations')
      .select('*')
      .eq('project_id', projectId)
      .gte('identified_date', period.start)
      .lte('identified_date', period.end)
      .order('identified_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch violations: ${error.message}`);
    return data || [];
  }

  private generateComplianceSummary(
    compliance: EnvironmentalCompliance[],
    monitoringData: MonitoringResult[],
    violations: Violation[]
  ): ComplianceSummary {
    const exceedances = monitoringData.filter(result => result.exceedance);
    const openViolations = violations.filter(v => !v.resolution_date);

    return {
      total_compliance_items: compliance.length,
      compliant_items: compliance.filter(c => c.status === ComplianceStatus.COMPLIANT).length,
      monitoring_points: monitoringData.length,
      exceedances: exceedances.length,
      violations: violations.length,
      open_violations: openViolations.length,
      compliance_rate: compliance.length > 0 ? 
        (compliance.filter(c => c.status === ComplianceStatus.COMPLIANT).length / compliance.length) * 100 : 0
    };
  }

  private generateRecommendations(summary: ComplianceSummary, violations: Violation[]): string[] {
    const recommendations: string[] = [];

    if (summary.compliance_rate < 90) {
      recommendations.push('Implement additional compliance monitoring and training programs');
    }

    if (summary.exceedances > 0) {
      recommendations.push('Review and enhance monitoring procedures to prevent future exceedances');
    }

    if (summary.open_violations > 0) {
      recommendations.push('Prioritize resolution of open violations to avoid penalties');
    }

    if (violations.some(v => v.severity === 'critical')) {
      recommendations.push('Immediate action required for critical violations - consider engaging environmental consultant');
    }

    recommendations.push('Schedule regular environmental audits to maintain compliance');
    recommendations.push('Update environmental management plans based on recent findings');

    return recommendations;
  }

  private determineCertificationLevel(points: number): string {
    if (points >= 80) return 'Platinum';
    if (points >= 60) return 'Gold';
    if (points >= 50) return 'Silver';
    if (points >= 40) return 'Certified';
    return 'Not Certified';
  }

  private determineSeverity(result: MonitoringResult): 'low' | 'medium' | 'high' {
    // This would be based on specific regulatory thresholds
    return result.exceedance ? 'high' : 'low';
  }

  private async getProjectData(projectId: string): Promise<any> {
    // Mock project data - would fetch from various sources
    return {
      energy_consumption: 50000, // kWh
      fuel_consumption: 2000, // gallons
      material_usage: 1000, // tons
      waste_generated: 100, // tons
      transportation_miles: 10000
    };
  }

  private calculateEnergyEmissions(projectData: any): EmissionCategory {
    const emissionFactor = 0.5; // kg CO2/kWh
    return {
      category: 'Energy',
      emissions: projectData.energy_consumption * emissionFactor,
      unit: 'kg CO2e',
      percentage: 0 // Would be calculated after all categories
    };
  }

  private calculateTransportationEmissions(projectData: any): EmissionCategory {
    const emissionFactor = 0.2; // kg CO2/mile
    return {
      category: 'Transportation',
      emissions: projectData.transportation_miles * emissionFactor,
      unit: 'kg CO2e',
      percentage: 0
    };
  }

  private calculateMaterialEmissions(projectData: any): EmissionCategory {
    const emissionFactor = 500; // kg CO2/ton
    return {
      category: 'Materials',
      emissions: projectData.material_usage * emissionFactor,
      unit: 'kg CO2e',
      percentage: 0
    };
  }

  private calculateWasteEmissions(projectData: any): EmissionCategory {
    const emissionFactor = 100; // kg CO2/ton
    return {
      category: 'Waste',
      emissions: projectData.waste_generated * emissionFactor,
      unit: 'kg CO2e',
      percentage: 0
    };
  }

  private identifyReductionOpportunities(categories: EmissionCategory[]): ReductionOpportunity[] {
    return [
      {
        opportunity: 'Switch to renewable energy sources',
        potential_reduction: categories.find(c => c.category === 'Energy')?.emissions * 0.8 || 0,
        cost_estimate: 50000,
        payback_period: 5,
        implementation_effort: 'High'
      },
      {
        opportunity: 'Implement waste reduction and recycling program',
        potential_reduction: categories.find(c => c.category === 'Waste')?.emissions * 0.5 || 0,
        cost_estimate: 10000,
        payback_period: 2,
        implementation_effort: 'Medium'
      }
    ];
  }

  private generateOffsetRecommendations(totalEmissions: number): OffsetRecommendation[] {
    return [
      {
        offset_type: 'Reforestation',
        offset_amount: totalEmissions,
        cost_per_ton: 15,
        total_cost: totalEmissions * 15,
        verification_standard: 'VCS',
        location: 'Regional'
      },
      {
        offset_type: 'Renewable Energy Certificates',
        offset_amount: totalEmissions * 0.6,
        cost_per_ton: 25,
        total_cost: totalEmissions * 0.6 * 25,
        verification_standard: 'Green-e',
        location: 'National'
      }
    ];
  }
}

// Supporting interfaces
interface ComplianceSummary {
  total_compliance_items: number;
  compliant_items: number;
  monitoring_points: number;
  exceedances: number;
  violations: number;
  open_violations: number;
  compliance_rate: number;
}

interface EmissionCategory {
  category: string;
  emissions: number;
  unit: string;
  percentage: number;
}

interface ReductionOpportunity {
  opportunity: string;
  potential_reduction: number;
  cost_estimate: number;
  payback_period: number;
  implementation_effort: string;
}

interface OffsetRecommendation {
  offset_type: string;
  offset_amount: number;
  cost_per_ton: number;
  total_cost: number;
  verification_standard: string;
  location: string;
}

// Export singleton instance
export const environmentalComplianceService = new EnvironmentalComplianceService();

// React hook
export function useEnvironmentalCompliance() {
  const [compliance, setCompliance] = React.useState<EnvironmentalCompliance[]>([]);
  const [greenProjects, setGreenProjects] = React.useState<GreenBuildingProject[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadCompliance = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await environmentalComplianceService.getProjectCompliance(projectId);
      setCompliance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
    } finally {
      setIsLoading(false);
    }
  };

  const createCompliance = async (compliance: Omit<EnvironmentalCompliance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCompliance = await environmentalComplianceService.createCompliance(compliance);
      setCompliance(prev => [newCompliance, ...prev]);
      return newCompliance;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create compliance record');
    }
  };

  const generateReport = async (projectId: string, complianceType: ComplianceType, period: { start: string; end: string }) => {
    try {
      return await environmentalComplianceService.generateComplianceReport(projectId, complianceType, period);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate compliance report');
    }
  };

  const calculateCarbonFootprint = async (projectId: string) => {
    try {
      return await environmentalComplianceService.calculateCarbonFootprint(projectId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to calculate carbon footprint');
    }
  };

  return {
    compliance,
    greenProjects,
    isLoading,
    error,
    loadCompliance,
    createCompliance,
    generateReport,
    calculateCarbonFootprint,
    service: environmentalComplianceService
  };
}

import React from 'react';