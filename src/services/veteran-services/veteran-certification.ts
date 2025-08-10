import { supabase } from '@/integrations/supabase/client';

// Veteran certification types
export interface VeteranCertification {
  id: string;
  business_id: string;
  certification_type: VeteranCertificationType;
  certification_number: string;
  issued_date: string;
  expiry_date: string;
  issuing_authority: string;
  status: CertificationStatus;
  documents: CertificationDocument[];
  owner_veteran_info: VeteranInfo;
  business_info: VeteranBusinessInfo;
  created_at: string;
  updated_at: string;
}

export enum VeteranCertificationType {
  VOSB = 'vosb', // Veteran-Owned Small Business
  SDVOSB = 'sdvosb', // Service-Disabled Veteran-Owned Small Business
  DVBE = 'dvbe', // Disabled Veteran Business Enterprise
  HUBZONE = 'hubzone', // Historically Underutilized Business Zone
  SBA_8A = 'sba_8a', // SBA 8(a) Business Development
  WOSB = 'wosb', // Woman-Owned Small Business
  EDWOSB = 'edwosb' // Economically Disadvantaged Woman-Owned Small Business
}

export enum CertificationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  UNDER_REVIEW = 'under_review'
}

export interface VeteranInfo {
  veteran_id: string;
  first_name: string;
  last_name: string;
  military_branch: MilitaryBranch;
  service_start_date: string;
  service_end_date: string;
  discharge_type: DischargeType;
  disability_rating?: number;
  va_file_number?: string;
  dd214_verified: boolean;
  security_clearance?: SecurityClearance;
}

export enum MilitaryBranch {
  ARMY = 'army',
  NAVY = 'navy',
  AIR_FORCE = 'air_force',
  MARINES = 'marines',
  COAST_GUARD = 'coast_guard',
  SPACE_FORCE = 'space_force',
  NATIONAL_GUARD = 'national_guard',
  RESERVES = 'reserves'
}

export enum DischargeType {
  HONORABLE = 'honorable',
  GENERAL = 'general',
  OTHER_THAN_HONORABLE = 'other_than_honorable',
  BAD_CONDUCT = 'bad_conduct',
  DISHONORABLE = 'dishonorable',
  MEDICAL = 'medical'
}

export enum SecurityClearance {
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
  TOP_SECRET = 'top_secret',
  SCI = 'sci', // Sensitive Compartmented Information
  SAP = 'sap', // Special Access Program
  Q_CLEARANCE = 'q_clearance' // DOE Q Clearance
}

export interface VeteranBusinessInfo {
  business_name: string;
  duns_number: string;
  cage_code?: string;
  naics_codes: string[];
  annual_revenue: number;
  employee_count: number;
  veteran_ownership_percentage: number;
  veteran_control_percentage: number;
  primary_contact: ContactInfo;
  business_address: AddressInfo;
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface AddressInfo {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface CertificationDocument {
  id: string;
  document_type: DocumentType;
  document_name: string;
  file_url: string;
  upload_date: string;
  verified: boolean;
  verified_by?: string;
  verified_date?: string;
}

export enum DocumentType {
  DD214 = 'dd214',
  VA_DISABILITY_LETTER = 'va_disability_letter',
  BUSINESS_LICENSE = 'business_license',
  FINANCIAL_STATEMENTS = 'financial_statements',
  TAX_RETURNS = 'tax_returns',
  ARTICLES_OF_INCORPORATION = 'articles_of_incorporation',
  OPERATING_AGREEMENT = 'operating_agreement',
  OWNERSHIP_DOCUMENTATION = 'ownership_documentation',
  NAICS_DOCUMENTATION = 'naics_documentation'
}

export interface ContractOpportunity {
  id: string;
  solicitation_number: string;
  title: string;
  description: string;
  agency: string;
  office: string;
  naics_code: string;
  set_aside_type: SetAsideType[];
  estimated_value: number;
  posting_date: string;
  response_deadline: string;
  place_of_performance: string;
  contract_type: ContractType;
  requirements: string;
  status: OpportunityStatus;
  matched_certifications: VeteranCertificationType[];
  interest_expressed: boolean;
  application_submitted: boolean;
}

export enum SetAsideType {
  SMALL_BUSINESS = 'small_business',
  VETERAN_OWNED = 'veteran_owned',
  SERVICE_DISABLED_VETERAN = 'service_disabled_veteran',
  WOMAN_OWNED = 'woman_owned',
  HUBZONE = 'hubzone',
  SBA_8A = 'sba_8a',
  UNRESTRICTED = 'unrestricted'
}

export enum ContractType {
  FIXED_PRICE = 'fixed_price',
  COST_REIMBURSEMENT = 'cost_reimbursement',
  TIME_AND_MATERIALS = 'time_and_materials',
  LABOR_HOUR = 'labor_hour',
  INDEFINITE_DELIVERY = 'indefinite_delivery'
}

export enum OpportunityStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

class VeteranCertificationService {
  // Certification Management
  async createCertification(certification: Omit<VeteranCertification, 'id' | 'created_at' | 'updated_at'>): Promise<VeteranCertification> {
    // Validate certification data
    await this.validateCertificationData(certification);

    const { data, error } = await supabase
      .from('veteran_certifications')
      .insert(certification)
      .select()
      .single();

    if (error) throw new Error(`Failed to create certification: ${error.message}`);
    return data;
  }

  async updateCertification(id: string, updates: Partial<VeteranCertification>): Promise<VeteranCertification> {
    const { data, error } = await supabase
      .from('veteran_certifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update certification: ${error.message}`);
    return data;
  }

  async getCertification(id: string): Promise<VeteranCertification | null> {
    const { data, error } = await supabase
      .from('veteran_certifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to fetch certification: ${error.message}`);
    return data;
  }

  async getCertificationsByBusiness(businessId: string): Promise<VeteranCertification[]> {
    const { data, error } = await supabase
      .from('veteran_certifications')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch certifications: ${error.message}`);
    return data || [];
  }

  async getActiveCertifications(businessId: string): Promise<VeteranCertification[]> {
    const { data, error } = await supabase
      .from('veteran_certifications')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', CertificationStatus.ACTIVE)
      .gt('expiry_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch active certifications: ${error.message}`);
    return data || [];
  }

  // Contract Opportunity Management
  async getContractOpportunities(filters?: {
    setAsideTypes?: SetAsideType[];
    naicsCodes?: string[];
    minValue?: number;
    maxValue?: number;
    states?: string[];
    keywords?: string;
  }): Promise<ContractOpportunity[]> {
    let query = supabase
      .from('contract_opportunities')
      .select('*')
      .eq('status', OpportunityStatus.ACTIVE)
      .gt('response_deadline', new Date().toISOString())
      .order('posting_date', { ascending: false });

    if (filters?.setAsideTypes?.length) {
      query = query.overlaps('set_aside_type', filters.setAsideTypes);
    }

    if (filters?.naicsCodes?.length) {
      query = query.in('naics_code', filters.naicsCodes);
    }

    if (filters?.minValue) {
      query = query.gte('estimated_value', filters.minValue);
    }

    if (filters?.maxValue) {
      query = query.lte('estimated_value', filters.maxValue);
    }

    if (filters?.keywords) {
      query = query.or(`title.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch contract opportunities: ${error.message}`);
    
    return data || [];
  }

  async getMatchedOpportunities(businessId: string): Promise<ContractOpportunity[]> {
    // Get business certifications
    const certifications = await this.getActiveCertifications(businessId);
    const certificationTypes = certifications.map(c => c.certification_type);

    // Get business NAICS codes
    const businessInfo = certifications[0]?.business_info;
    const naicsCodes = businessInfo?.naics_codes || [];

    // Map certifications to set-aside types
    const setAsideTypes: SetAsideType[] = [];
    if (certificationTypes.includes(VeteranCertificationType.VOSB)) {
      setAsideTypes.push(SetAsideType.VETERAN_OWNED);
    }
    if (certificationTypes.includes(VeteranCertificationType.SDVOSB)) {
      setAsideTypes.push(SetAsideType.SERVICE_DISABLED_VETERAN);
    }
    if (certificationTypes.includes(VeteranCertificationType.HUBZONE)) {
      setAsideTypes.push(SetAsideType.HUBZONE);
    }
    if (certificationTypes.includes(VeteranCertificationType.SBA_8A)) {
      setAsideTypes.push(SetAsideType.SBA_8A);
    }

    return this.getContractOpportunities({
      setAsideTypes,
      naicsCodes
    });
  }

  async expressInterest(opportunityId: string, businessId: string): Promise<void> {
    const { error } = await supabase
      .from('contract_interests')
      .upsert({
        opportunity_id: opportunityId,
        business_id: businessId,
        expressed_at: new Date().toISOString()
      });

    if (error) throw new Error(`Failed to express interest: ${error.message}`);

    // Update opportunity record
    await supabase
      .from('contract_opportunities')
      .update({ interest_expressed: true })
      .eq('id', opportunityId);
  }

  async submitApplication(opportunityId: string, businessId: string, applicationData: {
    proposal_document_url: string;
    technical_approach: string;
    past_performance: string;
    pricing: number;
    delivery_schedule: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('contract_applications')
      .insert({
        opportunity_id: opportunityId,
        business_id: businessId,
        submitted_at: new Date().toISOString(),
        ...applicationData
      });

    if (error) throw new Error(`Failed to submit application: ${error.message}`);

    // Update opportunity record
    await supabase
      .from('contract_opportunities')
      .update({ application_submitted: true })
      .eq('id', opportunityId);
  }

  // Compliance Tracking
  async checkComplianceStatus(businessId: string): Promise<{
    overall_status: 'compliant' | 'non_compliant' | 'warning';
    certifications: {
      certification_type: VeteranCertificationType;
      status: CertificationStatus;
      expires_in_days: number;
      issues: string[];
    }[];
    action_items: string[];
  }> {
    const certifications = await this.getCertificationsByBusiness(businessId);
    const today = new Date();

    let overallStatus: 'compliant' | 'non_compliant' | 'warning' = 'compliant';
    const actionItems: string[] = [];
    
    const certificationStatuses = certifications.map(cert => {
      const expiryDate = new Date(cert.expiry_date);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const issues: string[] = [];

      // Check expiry
      if (daysToExpiry < 0) {
        issues.push('Certification has expired');
        overallStatus = 'non_compliant';
      } else if (daysToExpiry < 30) {
        issues.push('Certification expires within 30 days');
        if (overallStatus === 'compliant') overallStatus = 'warning';
      }

      // Check document verification
      const unverifiedDocs = cert.documents.filter(doc => !doc.verified);
      if (unverifiedDocs.length > 0) {
        issues.push(`${unverifiedDocs.length} documents pending verification`);
        if (overallStatus === 'compliant') overallStatus = 'warning';
      }

      // Check certification status
      if (cert.status !== CertificationStatus.ACTIVE) {
        issues.push(`Certification status is ${cert.status}`);
        if (cert.status === CertificationStatus.EXPIRED || cert.status === CertificationStatus.REVOKED) {
          overallStatus = 'non_compliant';
        } else if (overallStatus === 'compliant') {
          overallStatus = 'warning';
        }
      }

      return {
        certification_type: cert.certification_type,
        status: cert.status,
        expires_in_days: daysToExpiry,
        issues
      };
    });

    // Generate action items
    certificationStatuses.forEach(certStatus => {
      if (certStatus.expires_in_days < 60 && certStatus.expires_in_days > 0) {
        actionItems.push(`Renew ${certStatus.certification_type} certification (expires in ${certStatus.expires_in_days} days)`);
      }
      if (certStatus.expires_in_days < 0) {
        actionItems.push(`Urgent: Renew expired ${certStatus.certification_type} certification`);
      }
      if (certStatus.issues.some(issue => issue.includes('pending verification'))) {
        actionItems.push(`Submit verification documents for ${certStatus.certification_type}`);
      }
    });

    return {
      overall_status: overallStatus,
      certifications: certificationStatuses,
      action_items: actionItems
    };
  }

  // Document Management
  async uploadDocument(certificationId: string, document: {
    document_type: DocumentType;
    document_name: string;
    file: File;
  }): Promise<CertificationDocument> {
    // Upload file to storage
    const fileExt = document.file.name.split('.').pop();
    const fileName = `${certificationId}/${document.document_type}_${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certification-documents')
      .upload(fileName, document.file);

    if (uploadError) throw new Error(`Failed to upload document: ${uploadError.message}`);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certification-documents')
      .getPublicUrl(fileName);

    // Create document record
    const documentRecord: Omit<CertificationDocument, 'id'> = {
      document_type: document.document_type,
      document_name: document.document_name,
      file_url: publicUrl,
      upload_date: new Date().toISOString(),
      verified: false
    };

    const { data, error } = await supabase
      .from('certification_documents')
      .insert({
        certification_id: certificationId,
        ...documentRecord
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create document record: ${error.message}`);
    return data;
  }

  async verifyDocument(documentId: string, verifiedBy: string): Promise<void> {
    const { error } = await supabase
      .from('certification_documents')
      .update({
        verified: true,
        verified_by: verifiedBy,
        verified_date: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) throw new Error(`Failed to verify document: ${error.message}`);
  }

  // Reporting and Analytics
  async generateComplianceReport(businessId: string): Promise<{
    business_info: VeteranBusinessInfo;
    certifications: VeteranCertification[];
    compliance_status: unknown;
    contract_activity: {
      opportunities_viewed: number;
      applications_submitted: number;
      contracts_awarded: number;
      total_contract_value: number;
    };
    recommendations: string[];
  }> {
    const certifications = await this.getCertificationsByBusiness(businessId);
    const complianceStatus = await this.checkComplianceStatus(businessId);

    // Get contract activity
    const { data: contractActivity } = await supabase
      .from('contract_applications')
      .select(`
        *,
        contract_opportunities (
          estimated_value,
          status
        )
      `)
      .eq('business_id', businessId);

    const applicationsSubmitted = contractActivity?.length || 0;
    const contractsAwarded = contractActivity?.filter(app => 
      app.contract_opportunities?.status === OpportunityStatus.AWARDED
    ).length || 0;
    const totalContractValue = contractActivity?.reduce((sum, app) => 
      sum + (app.contract_opportunities?.estimated_value || 0), 0
    ) || 0;

    // Generate recommendations
    const recommendations: string[] = [];
    if (certifications.length === 0) {
      recommendations.push('Consider obtaining veteran business certifications to access set-aside contracts');
    }
    if (applicationsSubmitted < 5) {
      recommendations.push('Increase contract application activity to improve award chances');
    }
    if (complianceStatus.overall_status !== 'compliant') {
      recommendations.push('Address compliance issues to maintain certification eligibility');
    }

    return {
      business_info: certifications[0]?.business_info || {} as VeteranBusinessInfo,
      certifications,
      compliance_status: complianceStatus,
      contract_activity: {
        opportunities_viewed: 0, // Would track from user activity
        applications_submitted: applicationsSubmitted,
        contracts_awarded: contractsAwarded,
        total_contract_value: totalContractValue
      },
      recommendations
    };
  }

  // Utility methods
  private async validateCertificationData(certification: unknown): Promise<void> {
    // Validate veteran info
    if (!certification.owner_veteran_info?.dd214_verified) {
      throw new Error('DD-214 verification is required for veteran certification');
    }

    // Validate business ownership percentages
    const veteranOwnership = certification.business_info?.veteran_ownership_percentage || 0;
    const veteranControl = certification.business_info?.veteran_control_percentage || 0;

    if (certification.certification_type === VeteranCertificationType.VOSB && veteranOwnership < 51) {
      throw new Error('VOSB certification requires at least 51% veteran ownership');
    }

    if (certification.certification_type === VeteranCertificationType.SDVOSB) {
      if (veteranOwnership < 51) {
        throw new Error('SDVOSB certification requires at least 51% service-disabled veteran ownership');
      }
      if (!certification.owner_veteran_info?.disability_rating || certification.owner_veteran_info.disability_rating < 10) {
        throw new Error('SDVOSB certification requires documented service-connected disability');
      }
    }

    // Validate required documents
    const requiredDocs = this.getRequiredDocuments(certification.certification_type);
    const providedDocTypes = certification.documents?.map((doc: unknown) => doc.document_type) || [];
    
    for (const requiredDoc of requiredDocs) {
      if (!providedDocTypes.includes(requiredDoc)) {
        throw new Error(`Required document missing: ${requiredDoc}`);
      }
    }
  }

  private getRequiredDocuments(certificationType: VeteranCertificationType): DocumentType[] {
    const baseRequirements = [
      DocumentType.DD214,
      DocumentType.BUSINESS_LICENSE,
      DocumentType.ARTICLES_OF_INCORPORATION,
      DocumentType.OWNERSHIP_DOCUMENTATION
    ];

    switch (certificationType) {
      case VeteranCertificationType.SDVOSB:
        return [...baseRequirements, DocumentType.VA_DISABILITY_LETTER];
      case VeteranCertificationType.SBA_8A:
        return [...baseRequirements, DocumentType.FINANCIAL_STATEMENTS, DocumentType.TAX_RETURNS];
      default:
        return baseRequirements;
    }
  }

  // Fetch contract opportunities from SAM.gov API
  private async fetchFromSAMAPI(): Promise<any[]> {
    try {
      const { getEnv } = await import("@/lib/env");
      const apiKey = getEnv("VITE_SAM_GOV_API_KEY");
      if (!apiKey) {
        console.warn('SAM.gov API key not configured, falling back to database data');
        return [];
      }

      // SAM.gov Contract Opportunities API endpoint
      const baseUrl = 'https://api.sam.gov/opportunities/v2/search';
      const params = new URLSearchParams({
        api_key: apiKey,
        limit: '100',
        ptype: 'o', // Opportunities
        naics: '237310,238110,238190', // Construction NAICS codes
        setaside: 'SDVOSBC,SBC', // Set-aside types for veterans
        status: 'active,forecast'
      });

      const response = await fetch(`${baseUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`SAM.gov API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform SAM.gov data to our format
      return data.opportunitiesData?.map((opp: any) => ({
        solicitation_number: opp.solicitationNumber,
        title: opp.title,
        description: opp.description,
        agency: opp.organizationHierarchy?.agencyName,
        office: opp.organizationHierarchy?.officeName,
        naics_code: opp.naicsCode?.[0]?.naicsCode,
        set_aside_type: this.mapSAMSetAsideTypes(opp.typeOfSetAside),
        estimated_value: opp.award?.dollarAmount || opp.baseAndAllOptionsValue,
        posting_date: opp.postedDate,
        response_deadline: opp.responseDeadLine,
        place_of_performance: opp.placeOfPerformance?.streetAddress,
        contract_type: this.mapSAMContractType(opp.typeOfContract),
        requirements: opp.description,
        status: opp.active ? OpportunityStatus.ACTIVE : OpportunityStatus.CLOSED
      })) || [];
    } catch (error) {
      console.error('Failed to fetch from SAM.gov API:', error);
      return [];
    }
  }

  private mapSAMSetAsideTypes(setAsideCode: string): SetAsideType[] {
    const types: SetAsideType[] = [];
    
    if (setAsideCode?.includes('SDVOSBC')) {
      types.push(SetAsideType.SERVICE_DISABLED_VETERAN);
    }
    if (setAsideCode?.includes('SBC') || setAsideCode?.includes('SB')) {
      types.push(SetAsideType.SMALL_BUSINESS);
    }
    if (setAsideCode?.includes('8A')) {
      types.push(SetAsideType.EIGHT_A);
    }
    if (setAsideCode?.includes('HUBZ')) {
      types.push(SetAsideType.HUBZONE);
    }
    if (setAsideCode?.includes('WOSB')) {
      types.push(SetAsideType.WOMEN_OWNED);
    }
    
    return types.length > 0 ? types : [SetAsideType.UNRESTRICTED];
  }

  private mapSAMContractType(contractType: string): ContractType {
    switch (contractType?.toUpperCase()) {
      case 'FIRM_FIXED_PRICE':
      case 'FFP':
        return ContractType.FIXED_PRICE;
      case 'COST_PLUS_FIXED_FEE':
      case 'CPFF':
        return ContractType.COST_PLUS;
      case 'TIME_AND_MATERIALS':
      case 'T&M':
        return ContractType.TIME_AND_MATERIALS;
      case 'INDEFINITE_DELIVERY':
      case 'IDIQ':
        return ContractType.INDEFINITE_DELIVERY;
      default:
        return ContractType.FIXED_PRICE;
    }
  }

  // Government API Integration (SAM.gov)
  async syncContractOpportunities(): Promise<{ 
    success: boolean; 
    processed: number; 
    errors: string[] 
  }> {
    try {
      // Fetch real contract opportunities from SAM.gov API
      const opportunities = await this.fetchFromSAMAPI();
      
      let processed = 0;
      const errors: string[] = [];

      for (const opportunity of opportunities) {
        try {
          const { error } = await supabase
            .from('contract_opportunities')
            .upsert(opportunity);

          if (error) {
            errors.push(`Failed to sync opportunity ${opportunity.solicitation_number}: ${error.message}`);
          } else {
            processed++;
          }
        } catch (err) {
          errors.push(`Error processing opportunity ${opportunity.solicitation_number}: ${err}`);
        }
      }

      return {
        success: errors.length === 0,
        processed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        processed: 0,
        errors: [error.message]
      };
    }
  }
}

// Export singleton instance
export const veteranCertificationService = new VeteranCertificationService();

// React hook for veteran services
export function useVeteranServices() {
  const [certifications, setCertifications] = React.useState<VeteranCertification[]>([]);
  const [opportunities, setOpportunities] = React.useState<ContractOpportunity[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadCertifications = async (businessId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await veteranCertificationService.getCertificationsByBusiness(businessId);
      setCertifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certifications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOpportunities = async (businessId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = businessId 
        ? await veteranCertificationService.getMatchedOpportunities(businessId)
        : await veteranCertificationService.getContractOpportunities();
      setOpportunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  const createCertification = async (certification: Omit<VeteranCertification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCert = await veteranCertificationService.createCertification(certification);
      setCertifications(prev => [newCert, ...prev]);
      return newCert;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create certification');
    }
  };

  const checkCompliance = async (businessId: string) => {
    try {
      return await veteranCertificationService.checkComplianceStatus(businessId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to check compliance');
    }
  };

  const expressInterest = async (opportunityId: string, businessId: string) => {
    try {
      await veteranCertificationService.expressInterest(opportunityId, businessId);
      // Update local state
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunityId 
            ? { ...opp, interest_expressed: true }
            : opp
        )
      );
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to express interest');
    }
  };

  return {
    certifications,
    opportunities,
    isLoading,
    error,
    loadCertifications,
    loadOpportunities,
    createCertification,
    checkCompliance,
    expressInterest,
    service: veteranCertificationService
  };
}

import React from 'react';