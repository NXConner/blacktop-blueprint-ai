import { supabase } from '@/integrations/supabase/client';

// Property management types
export interface Property {
  id: string;
  property_type: PropertyType;
  property_name: string;
  description?: string;
  address: PropertyAddress;
  ownership_info: OwnershipInfo;
  financial_info: PropertyFinancials;
  specifications: PropertySpecs;
  units?: PropertyUnit[];
  amenities: string[];
  documents: PropertyDocument[];
  images: PropertyImage[];
  status: PropertyStatus;
  acquired_date?: string;
  market_value: number;
  assessment_value: number;
  created_at: string;
  updated_at: string;
}

export enum PropertyType {
  RESIDENTIAL_SINGLE = 'residential_single',
  RESIDENTIAL_MULTI = 'residential_multi',
  COMMERCIAL_OFFICE = 'commercial_office',
  COMMERCIAL_RETAIL = 'commercial_retail',
  COMMERCIAL_WAREHOUSE = 'commercial_warehouse',
  INDUSTRIAL = 'industrial',
  LAND_DEVELOPMENT = 'land_development',
  AGRICULTURAL = 'agricultural',
  MIXED_USE = 'mixed_use'
}

export enum PropertyStatus {
  OWNED = 'owned',
  LEASED = 'leased',
  FOR_SALE = 'for_sale',
  FOR_LEASE = 'for_lease',
  UNDER_CONTRACT = 'under_contract',
  DEVELOPMENT = 'development',
  VACANT = 'vacant',
  OCCUPIED = 'occupied'
}

export interface PropertyAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  parcel_number?: string;
  legal_description?: string;
}

export interface OwnershipInfo {
  owner_type: 'individual' | 'corporation' | 'partnership' | 'trust' | 'llc';
  owner_name: string;
  ownership_percentage: number;
  acquisition_method: 'purchase' | 'inheritance' | 'gift' | 'development' | 'foreclosure';
  deed_type: string;
  title_company?: string;
  mortgage_info?: MortgageInfo;
}

export interface MortgageInfo {
  lender_name: string;
  loan_amount: number;
  interest_rate: number;
  loan_term_months: number;
  monthly_payment: number;
  remaining_balance: number;
  maturity_date: string;
  loan_type: string;
}

export interface PropertyFinancials {
  purchase_price?: number;
  current_market_value: number;
  assessed_value: number;
  annual_taxes: number;
  insurance_premium: number;
  maintenance_reserve: number;
  gross_rental_income: number;
  operating_expenses: number;
  net_operating_income: number;
  cap_rate: number;
  cash_flow: number;
  expense_breakdown: ExpenseBreakdown;
}

export interface ExpenseBreakdown {
  property_taxes: number;
  insurance: number;
  maintenance: number;
  utilities: number;
  management_fees: number;
  marketing: number;
  professional_services: number;
  other: number;
}

export interface PropertySpecs {
  total_sqft: number;
  lot_size_sqft?: number;
  lot_size_acres?: number;
  year_built: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parking_spaces?: number;
  zoning: string;
  construction_type: string;
  roof_type?: string;
  hvac_type?: string;
  utilities: string[];
  special_features: string[];
}

export interface PropertyUnit {
  id: string;
  property_id: string;
  unit_number: string;
  unit_type: UnitType;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  deposit_amount: number;
  lease_info?: LeaseInfo;
  tenant_info?: TenantInfo;
  unit_status: UnitStatus;
  amenities: string[];
  last_renovated?: string;
}

export enum UnitType {
  STUDIO = 'studio',
  ONE_BEDROOM = 'one_bedroom',
  TWO_BEDROOM = 'two_bedroom',
  THREE_BEDROOM = 'three_bedroom',
  FOUR_PLUS_BEDROOM = 'four_plus_bedroom',
  OFFICE = 'office',
  RETAIL = 'retail',
  WAREHOUSE = 'warehouse',
  STORAGE = 'storage'
}

export enum UnitStatus {
  OCCUPIED = 'occupied',
  VACANT_READY = 'vacant_ready',
  VACANT_MAKE_READY = 'vacant_make_ready',
  MAINTENANCE = 'maintenance',
  RENOVATION = 'renovation',
  NOT_RENTABLE = 'not_rentable'
}

export interface LeaseInfo {
  id: string;
  lease_start: string;
  lease_end: string;
  lease_term_months: number;
  rent_amount: number;
  security_deposit: number;
  pet_deposit?: number;
  lease_type: LeaseType;
  rent_due_date: number; // Day of month
  late_fee_amount: number;
  grace_period_days: number;
  renewal_options: RenewalOption[];
  special_terms: string[];
  signed_date: string;
  lease_document_url?: string;
}

export enum LeaseType {
  FIXED_TERM = 'fixed_term',
  MONTH_TO_MONTH = 'month_to_month',
  COMMERCIAL_TRIPLE_NET = 'commercial_triple_net',
  COMMERCIAL_GROSS = 'commercial_gross',
  COMMERCIAL_MODIFIED_GROSS = 'commercial_modified_gross'
}

export interface RenewalOption {
  term_months: number;
  rent_increase_percentage?: number;
  rent_increase_amount?: number;
  conditions: string[];
}

export interface TenantInfo {
  id: string;
  tenant_type: 'individual' | 'business';
  primary_name: string;
  secondary_name?: string;
  contact_info: ContactInfo;
  emergency_contact: EmergencyContact;
  employment_info?: EmploymentInfo;
  business_info?: BusinessInfo;
  financial_info: TenantFinancials;
  background_check: BackgroundCheck;
  move_in_date: string;
  move_out_date?: string;
  tenant_status: TenantStatus;
}

export enum TenantStatus {
  ACTIVE = 'active',
  FORMER = 'former',
  EVICTION_PROCESS = 'eviction_process',
  NOTICE_GIVEN = 'notice_given',
  HOLD_OVER = 'hold_over'
}

export interface ContactInfo {
  phone_primary: string;
  phone_secondary?: string;
  email: string;
  preferred_contact_method: 'phone' | 'email' | 'text';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmploymentInfo {
  employer_name: string;
  position: string;
  employment_length_months: number;
  monthly_income: number;
  supervisor_name?: string;
  supervisor_phone?: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'self_employed';
}

export interface BusinessInfo {
  business_name: string;
  business_type: string;
  years_in_business: number;
  annual_revenue: number;
  employees_count: number;
  business_license?: string;
  tax_id: string;
}

export interface TenantFinancials {
  monthly_income: number;
  debt_to_income_ratio: number;
  credit_score: number;
  bank_account_verified: boolean;
  references: Reference[];
  payment_history: PaymentRecord[];
}

export interface Reference {
  reference_type: 'previous_landlord' | 'employer' | 'personal' | 'professional';
  name: string;
  company?: string;
  phone: string;
  relationship: string;
  years_known: number;
  notes?: string;
}

export interface BackgroundCheck {
  criminal_check: boolean;
  criminal_results: 'clear' | 'minor' | 'major';
  credit_check: boolean;
  credit_score: number;
  eviction_check: boolean;
  eviction_results: 'none' | 'past_evictions';
  employment_verification: boolean;
  income_verification: boolean;
  reference_check: boolean;
  check_date: string;
  screening_company?: string;
}

export interface PaymentRecord {
  id: string;
  unit_id: string;
  tenant_id: string;
  payment_date: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  late_fee?: number;
  notes?: string;
  status: PaymentStatus;
}

export enum PaymentType {
  RENT = 'rent',
  SECURITY_DEPOSIT = 'security_deposit',
  PET_DEPOSIT = 'pet_deposit',
  LATE_FEE = 'late_fee',
  MAINTENANCE = 'maintenance',
  UTILITIES = 'utilities',
  OTHER = 'other'
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  MONEY_ORDER = 'money_order',
  ONLINE_PORTAL = 'online_portal'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  LATE = 'late',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  unit_id?: string;
  tenant_id?: string;
  request_type: MaintenanceType;
  priority: MaintenancePriority;
  title: string;
  description: string;
  reported_date: string;
  scheduled_date?: string;
  completed_date?: string;
  assigned_to?: string;
  contractor_info?: ContractorInfo;
  estimated_cost: number;
  actual_cost?: number;
  images: string[];
  documents: string[];
  status: MaintenanceStatus;
  tenant_satisfaction?: number;
  notes: string[];
}

export enum MaintenanceType {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HVAC = 'hvac',
  APPLIANCE = 'appliance',
  FLOORING = 'flooring',
  PAINTING = 'painting',
  ROOFING = 'roofing',
  LANDSCAPING = 'landscaping',
  SECURITY = 'security',
  PEST_CONTROL = 'pest_control',
  CLEANING = 'cleaning',
  GENERAL_REPAIR = 'general_repair',
  EMERGENCY = 'emergency'
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

export enum MaintenanceStatus {
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export interface ContractorInfo {
  contractor_id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  license_number?: string;
  insurance_verified: boolean;
  specialty: string[];
  hourly_rate?: number;
  rating: number;
}

export interface PropertyDocument {
  id: string;
  document_type: DocumentType;
  document_name: string;
  file_url: string;
  upload_date: string;
  expiry_date?: string;
  category: DocumentCategory;
  is_active: boolean;
}

export enum DocumentType {
  DEED = 'deed',
  TITLE_INSURANCE = 'title_insurance',
  SURVEY = 'survey',
  PROPERTY_INSURANCE = 'property_insurance',
  TAX_ASSESSMENT = 'tax_assessment',
  LEASE_AGREEMENT = 'lease_agreement',
  TENANT_APPLICATION = 'tenant_application',
  BACKGROUND_CHECK = 'background_check',
  MAINTENANCE_RECORD = 'maintenance_record',
  INSPECTION_REPORT = 'inspection_report',
  PERMIT = 'permit',
  WARRANTY = 'warranty',
  FINANCIAL_STATEMENT = 'financial_statement'
}

export enum DocumentCategory {
  OWNERSHIP = 'ownership',
  FINANCIAL = 'financial',
  TENANT = 'tenant',
  MAINTENANCE = 'maintenance',
  LEGAL = 'legal',
  INSURANCE = 'insurance',
  TAX = 'tax'
}

export interface PropertyImage {
  id: string;
  image_url: string;
  thumbnail_url: string;
  caption?: string;
  category: ImageCategory;
  room_type?: string;
  taken_date: string;
  is_primary: boolean;
}

export enum ImageCategory {
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  UNIT = 'unit',
  AMENITY = 'amenity',
  MAINTENANCE = 'maintenance',
  BEFORE_AFTER = 'before_after'
}

// Land Development types
export interface LandDevelopmentProject {
  id: string;
  project_name: string;
  property_id: string;
  development_type: DevelopmentType;
  project_status: ProjectStatus;
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  permits: DevelopmentPermit[];
  phases: DevelopmentPhase[];
  stakeholders: ProjectStakeholder[];
  environmental_studies: EnvironmentalStudy[];
  utilities: UtilityPlanning[];
  created_at: string;
  updated_at: string;
}

export enum DevelopmentType {
  RESIDENTIAL_SUBDIVISION = 'residential_subdivision',
  COMMERCIAL_COMPLEX = 'commercial_complex',
  MIXED_USE = 'mixed_use',
  INDUSTRIAL_PARK = 'industrial_park',
  MASTER_PLANNED_COMMUNITY = 'master_planned_community',
  REDEVELOPMENT = 'redevelopment'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  PERMITTING = 'permitting',
  PRE_CONSTRUCTION = 'pre_construction',
  CONSTRUCTION = 'construction',
  MARKETING = 'marketing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export interface ProjectTimeline {
  start_date: string;
  projected_completion: string;
  actual_completion?: string;
  milestones: ProjectMilestone[];
  critical_path: string[];
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  planned_date: string;
  actual_date?: string;
  dependencies: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
}

export interface ProjectBudget {
  total_budget: number;
  land_cost: number;
  development_cost: number;
  construction_cost: number;
  marketing_cost: number;
  contingency: number;
  financing_cost: number;
  spent_to_date: number;
  cost_breakdown: CostBreakdown[];
}

export interface CostBreakdown {
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
}

export interface DevelopmentPermit {
  id: string;
  permit_type: PermitType;
  permit_number: string;
  issuing_authority: string;
  application_date: string;
  issued_date?: string;
  expiry_date?: string;
  status: PermitStatus;
  requirements: string[];
  conditions: string[];
  fees: number;
  documents: string[];
}

export enum PermitType {
  ZONING = 'zoning',
  SUBDIVISION = 'subdivision',
  BUILDING = 'building',
  ENVIRONMENTAL = 'environmental',
  UTILITY = 'utility',
  TRAFFIC = 'traffic',
  WETLANDS = 'wetlands',
  ARCHAEOLOGICAL = 'archaeological'
}

export enum PermitStatus {
  NOT_APPLIED = 'not_applied',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  DENIED = 'denied',
  EXPIRED = 'expired',
  RENEWED = 'renewed'
}

export interface DevelopmentPhase {
  id: string;
  phase_number: number;
  phase_name: string;
  description: string;
  start_date: string;
  end_date: string;
  budget_allocation: number;
  lots_count?: number;
  units_count?: number;
  status: PhaseStatus;
  deliverables: string[];
}

export enum PhaseStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

export interface ProjectStakeholder {
  id: string;
  stakeholder_type: StakeholderType;
  name: string;
  company?: string;
  role: string;
  contact_info: ContactInfo;
  responsibilities: string[];
  contract_value?: number;
}

export enum StakeholderType {
  OWNER = 'owner',
  DEVELOPER = 'developer',
  ARCHITECT = 'architect',
  ENGINEER = 'engineer',
  CONTRACTOR = 'contractor',
  CONSULTANT = 'consultant',
  GOVERNMENT = 'government',
  UTILITY_COMPANY = 'utility_company',
  FINANCIAL_INSTITUTION = 'financial_institution'
}

export interface EnvironmentalStudy {
  id: string;
  study_type: EnvironmentalStudyType;
  conducted_by: string;
  study_date: string;
  report_url: string;
  findings: string[];
  recommendations: string[];
  compliance_status: 'compliant' | 'non_compliant' | 'conditional';
  mitigation_measures: string[];
}

export enum EnvironmentalStudyType {
  ENVIRONMENTAL_IMPACT = 'environmental_impact',
  WETLANDS_DELINEATION = 'wetlands_delineation',
  SOIL_ANALYSIS = 'soil_analysis',
  GROUNDWATER_STUDY = 'groundwater_study',
  ARCHAEOLOGICAL = 'archaeological',
  ENDANGERED_SPECIES = 'endangered_species',
  NOISE_STUDY = 'noise_study',
  TRAFFIC_IMPACT = 'traffic_impact'
}

export interface UtilityPlanning {
  utility_type: UtilityType;
  provider: string;
  capacity_required: number;
  connection_cost: number;
  timeline: string;
  status: 'planned' | 'approved' | 'under_construction' | 'completed';
  specifications: string[];
}

export enum UtilityType {
  WATER = 'water',
  SEWER = 'sewer',
  ELECTRIC = 'electric',
  GAS = 'gas',
  TELECOMMUNICATIONS = 'telecommunications',
  CABLE_TV = 'cable_tv',
  INTERNET = 'internet'
}

class PropertyManagementService {
  // Property Management
  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (error) throw new Error(`Failed to create property: ${error.message}`);
    return data;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update property: ${error.message}`);
    return data;
  }

  async getProperty(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_units (*),
        property_documents (*),
        property_images (*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
    return data;
  }

  async getProperties(filters?: {
    property_type?: PropertyType[];
    status?: PropertyStatus[];
    location?: { city?: string; state?: string; zip_code?: string };
    price_range?: { min: number; max: number };
    sqft_range?: { min: number; max: number };
  }): Promise<Property[]> {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.property_type?.length) {
      query = query.in('property_type', filters.property_type);
    }

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.location?.city) {
      query = query.eq('address->city', filters.location.city);
    }

    if (filters?.price_range) {
      if (filters.price_range.min) {
        query = query.gte('market_value', filters.price_range.min);
      }
      if (filters.price_range.max) {
        query = query.lte('market_value', filters.price_range.max);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch properties: ${error.message}`);
    
    return data || [];
  }

  // Unit Management
  async createUnit(unit: Omit<PropertyUnit, 'id'>): Promise<PropertyUnit> {
    const { data, error } = await supabase
      .from('property_units')
      .insert(unit)
      .select()
      .single();

    if (error) throw new Error(`Failed to create unit: ${error.message}`);
    return data;
  }

  async updateUnit(id: string, updates: Partial<PropertyUnit>): Promise<PropertyUnit> {
    const { data, error } = await supabase
      .from('property_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update unit: ${error.message}`);
    return data;
  }

  async getPropertyUnits(propertyId: string): Promise<PropertyUnit[]> {
    const { data, error } = await supabase
      .from('property_units')
      .select(`
        *,
        lease_info (*),
        tenant_info (*)
      `)
      .eq('property_id', propertyId)
      .order('unit_number');

    if (error) throw new Error(`Failed to fetch units: ${error.message}`);
    return data || [];
  }

  // Tenant Management
  async createTenant(tenant: Omit<TenantInfo, 'id'>): Promise<TenantInfo> {
    const { data, error } = await supabase
      .from('tenants')
      .insert(tenant)
      .select()
      .single();

    if (error) throw new Error(`Failed to create tenant: ${error.message}`);
    return data;
  }

  async updateTenant(id: string, updates: Partial<TenantInfo>): Promise<TenantInfo> {
    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update tenant: ${error.message}`);
    return data;
  }

  async getTenant(id: string): Promise<TenantInfo | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch tenant: ${error.message}`);
    }
    return data;
  }

  // Lease Management
  async createLease(lease: Omit<LeaseInfo, 'id'>): Promise<LeaseInfo> {
    const { data, error } = await supabase
      .from('leases')
      .insert(lease)
      .select()
      .single();

    if (error) throw new Error(`Failed to create lease: ${error.message}`);
    
    // Update unit status to occupied
    await supabase
      .from('property_units')
      .update({ unit_status: UnitStatus.OCCUPIED })
      .eq('id', lease.unit_id);

    return data;
  }

  async getLeasesByProperty(propertyId: string): Promise<LeaseInfo[]> {
    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        property_units!inner (
          property_id,
          unit_number
        ),
        tenants (*)
      `)
      .eq('property_units.property_id', propertyId)
      .order('lease_start', { ascending: false });

    if (error) throw new Error(`Failed to fetch leases: ${error.message}`);
    return data || [];
  }

  async getExpiringLeases(days: number = 30): Promise<LeaseInfo[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('leases')
      .select(`
        *,
        property_units (
          unit_number,
          properties (property_name)
        ),
        tenants (primary_name, contact_info)
      `)
      .lte('lease_end', futureDate.toISOString())
      .gte('lease_end', new Date().toISOString())
      .order('lease_end');

    if (error) throw new Error(`Failed to fetch expiring leases: ${error.message}`);
    return data || [];
  }

  // Payment Management
  async recordPayment(payment: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> {
    const { data, error } = await supabase
      .from('payment_records')
      .insert(payment)
      .select()
      .single();

    if (error) throw new Error(`Failed to record payment: ${error.message}`);
    return data;
  }

  async getPaymentHistory(unitId: string, startDate?: string, endDate?: string): Promise<PaymentRecord[]> {
    let query = supabase
      .from('payment_records')
      .select('*')
      .eq('unit_id', unitId)
      .order('payment_date', { ascending: false });

    if (startDate) {
      query = query.gte('payment_date', startDate);
    }
    if (endDate) {
      query = query.lte('payment_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch payment history: ${error.message}`);
    
    return data || [];
  }

  async getOverduePayments(): Promise<PaymentRecord[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('payment_records')
      .select(`
        *,
        property_units (
          unit_number,
          properties (property_name)
        ),
        tenants (primary_name, contact_info)
      `)
      .lt('due_date', today)
      .neq('status', PaymentStatus.PAID)
      .order('due_date');

    if (error) throw new Error(`Failed to fetch overdue payments: ${error.message}`);
    return data || [];
  }

  // Maintenance Management
  async createMaintenanceRequest(request: Omit<MaintenanceRequest, 'id'>): Promise<MaintenanceRequest> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw new Error(`Failed to create maintenance request: ${error.message}`);
    return data;
  }

  async updateMaintenanceRequest(id: string, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update maintenance request: ${error.message}`);
    return data;
  }

  async getMaintenanceRequests(filters?: {
    property_id?: string;
    status?: MaintenanceStatus[];
    priority?: MaintenancePriority[];
    type?: MaintenanceType[];
  }): Promise<MaintenanceRequest[]> {
    let query = supabase
      .from('maintenance_requests')
      .select(`
        *,
        properties (property_name),
        property_units (unit_number),
        tenants (primary_name)
      `)
      .order('reported_date', { ascending: false });

    if (filters?.property_id) {
      query = query.eq('property_id', filters.property_id);
    }

    if (filters?.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters?.priority?.length) {
      query = query.in('priority', filters.priority);
    }

    if (filters?.type?.length) {
      query = query.in('request_type', filters.type);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch maintenance requests: ${error.message}`);
    
    return data || [];
  }

  // Land Development Management
  async createDevelopmentProject(project: Omit<LandDevelopmentProject, 'id' | 'created_at' | 'updated_at'>): Promise<LandDevelopmentProject> {
    const { data, error } = await supabase
      .from('land_development_projects')
      .insert(project)
      .select()
      .single();

    if (error) throw new Error(`Failed to create development project: ${error.message}`);
    return data;
  }

  async updateDevelopmentProject(id: string, updates: Partial<LandDevelopmentProject>): Promise<LandDevelopmentProject> {
    const { data, error } = await supabase
      .from('land_development_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update development project: ${error.message}`);
    return data;
  }

  async getDevelopmentProject(id: string): Promise<LandDevelopmentProject | null> {
    const { data, error } = await supabase
      .from('land_development_projects')
      .select(`
        *,
        properties (*),
        development_permits (*),
        development_phases (*)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch development project: ${error.message}`);
    }
    return data;
  }

  async getDevelopmentProjects(): Promise<LandDevelopmentProject[]> {
    const { data, error } = await supabase
      .from('land_development_projects')
      .select(`
        *,
        properties (property_name, address)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch development projects: ${error.message}`);
    return data || [];
  }

  // Permit Management
  async createPermit(permit: Omit<DevelopmentPermit, 'id'>): Promise<DevelopmentPermit> {
    const { data, error } = await supabase
      .from('development_permits')
      .insert(permit)
      .select()
      .single();

    if (error) throw new Error(`Failed to create permit: ${error.message}`);
    return data;
  }

  async updatePermit(id: string, updates: Partial<DevelopmentPermit>): Promise<DevelopmentPermit> {
    const { data, error } = await supabase
      .from('development_permits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update permit: ${error.message}`);
    return data;
  }

  async getProjectPermits(projectId: string): Promise<DevelopmentPermit[]> {
    const { data, error } = await supabase
      .from('development_permits')
      .select('*')
      .eq('project_id', projectId)
      .order('application_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch permits: ${error.message}`);
    return data || [];
  }

  // Financial Analysis
  async calculatePropertyROI(propertyId: string): Promise<{
    gross_yield: number;
    net_yield: number;
    cap_rate: number;
    cash_on_cash_return: number;
    total_return: number;
    monthly_cash_flow: number;
    annual_appreciation: number;
  }> {
    const property = await this.getProperty(propertyId);
    if (!property) throw new Error('Property not found');

    const financials = property.financial_info;
    const purchasePrice = financials.purchase_price || financials.current_market_value;

    const grossYield = (financials.gross_rental_income / purchasePrice) * 100;
    const netYield = (financials.net_operating_income / purchasePrice) * 100;
    const capRate = financials.cap_rate;
    const monthlyCashFlow = financials.cash_flow / 12;

    // Calculate cash-on-cash return (assuming 20% down payment)
    const downPayment = purchasePrice * 0.2;
    const cashOnCashReturn = (financials.cash_flow / downPayment) * 100;

    // Calculate appreciation (mock - would use historical data)
    const annualAppreciation = 3.5; // Mock 3.5% annual appreciation

    const totalReturn = netYield + annualAppreciation;

    return {
      gross_yield: Math.round(grossYield * 100) / 100,
      net_yield: Math.round(netYield * 100) / 100,
      cap_rate: Math.round(capRate * 100) / 100,
      cash_on_cash_return: Math.round(cashOnCashReturn * 100) / 100,
      total_return: Math.round(totalReturn * 100) / 100,
      monthly_cash_flow: Math.round(monthlyCashFlow),
      annual_appreciation: annualAppreciation
    };
  }

  async generateFinancialReport(propertyId: string, year: number): Promise<{
    income_statement: PropertyIncomeStatement;
    cash_flow_statement: PropertyCashFlow;
    performance_metrics: PropertyMetrics;
  }> {
    // Generate comprehensive financial reports
    const property = await this.getProperty(propertyId);
    if (!property) throw new Error('Property not found');

    const incomeStatement = await this.generateIncomeStatement(propertyId, year);
    const cashFlowStatement = await this.generateCashFlowStatement(propertyId, year);
    const performanceMetrics = await this.calculatePerformanceMetrics(propertyId, year);

    return {
      income_statement: incomeStatement,
      cash_flow_statement: cashFlowStatement,
      performance_metrics: performanceMetrics
    };
  }

  // Utility methods
  private async generateIncomeStatement(propertyId: string, year: number): Promise<PropertyIncomeStatement> {
    // Mock income statement generation
    return {
      year,
      gross_rental_income: 120000,
      vacancy_loss: 6000,
      effective_gross_income: 114000,
      operating_expenses: {
        property_taxes: 8000,
        insurance: 3000,
        maintenance: 5000,
        management: 5700,
        utilities: 2400,
        other: 1900
      },
      total_operating_expenses: 26000,
      net_operating_income: 88000,
      debt_service: 60000,
      cash_flow: 28000
    };
  }

  private async generateCashFlowStatement(propertyId: string, year: number): Promise<PropertyCashFlow> {
    return {
      year,
      operating_cash_flow: 88000,
      capital_expenditures: -15000,
      financing_cash_flow: -60000,
      net_cash_flow: 13000,
      beginning_cash: 25000,
      ending_cash: 38000
    };
  }

  private async calculatePerformanceMetrics(propertyId: string, year: number): Promise<PropertyMetrics> {
    const roi = await this.calculatePropertyROI(propertyId);
    
    return {
      occupancy_rate: 95,
      rent_growth_rate: 3.2,
      expense_ratio: 22.8,
      debt_service_coverage: 1.47,
      cap_rate: roi.cap_rate,
      cash_on_cash_return: roi.cash_on_cash_return,
      total_return: roi.total_return
    };
  }
}

// Supporting interfaces
interface PropertyIncomeStatement {
  year: number;
  gross_rental_income: number;
  vacancy_loss: number;
  effective_gross_income: number;
  operating_expenses: {
    property_taxes: number;
    insurance: number;
    maintenance: number;
    management: number;
    utilities: number;
    other: number;
  };
  total_operating_expenses: number;
  net_operating_income: number;
  debt_service: number;
  cash_flow: number;
}

interface PropertyCashFlow {
  year: number;
  operating_cash_flow: number;
  capital_expenditures: number;
  financing_cash_flow: number;
  net_cash_flow: number;
  beginning_cash: number;
  ending_cash: number;
}

interface PropertyMetrics {
  occupancy_rate: number;
  rent_growth_rate: number;
  expense_ratio: number;
  debt_service_coverage: number;
  cap_rate: number;
  cash_on_cash_return: number;
  total_return: number;
}

// Export singleton instance
export const propertyManagementService = new PropertyManagementService();

// React hook
export function usePropertyManagement() {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [developmentProjects, setDevelopmentProjects] = React.useState<LandDevelopmentProject[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = React.useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadProperties = async (filters?: unknown) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await propertyManagementService.getProperties(filters);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const createProperty = async (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProperty = await propertyManagementService.createProperty(property);
      setProperties(prev => [newProperty, ...prev]);
      return newProperty;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create property');
    }
  };

  const loadDevelopmentProjects = async () => {
    setIsLoading(true);
    try {
      const data = await propertyManagementService.getDevelopmentProjects();
      setDevelopmentProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load development projects');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMaintenanceRequests = async (filters?: unknown) => {
    setIsLoading(true);
    try {
      const data = await propertyManagementService.getMaintenanceRequests(filters);
      setMaintenanceRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance requests');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateROI = async (propertyId: string) => {
    try {
      return await propertyManagementService.calculatePropertyROI(propertyId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to calculate ROI');
    }
  };

  return {
    properties,
    developmentProjects,
    maintenanceRequests,
    isLoading,
    error,
    loadProperties,
    createProperty,
    loadDevelopmentProjects,
    loadMaintenanceRequests,
    calculateROI,
    service: propertyManagementService
  };
}

import React from 'react';