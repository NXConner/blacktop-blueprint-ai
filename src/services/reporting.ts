import { supabase } from '@/integrations/supabase/client';
import { analyticsApi, reportingApi } from './api-extensions';
import type { ApiResponse } from '@/types/database';

// Report types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'excel' | 'csv' | 'json';
  category: 'fleet' | 'project' | 'financial' | 'compliance' | 'custom';
  template: string; // HTML template for PDF or column definitions for Excel
  parameters: ReportParameter[];
  scheduling?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    nextRun?: string;
  };
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{ value: unknown; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ReportGeneration {
  id: string;
  templateId: string;
  parameters: Record<string, unknown>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  outputUrl?: string;
  errorMessage?: string;
  generatedBy: string;
  size?: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filename?: string;
  includeCharts?: boolean;
  includeData?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, unknown>;
  template?: string;
}

class ReportingService {
  private templates: Map<string, ReportTemplate> = new Map();
  private generations: Map<string, ReportGeneration> = new Map();
  private progressCallbacks: Map<string, (progress: number) => void> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  // Initialize default report templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ReportTemplate[] = [
      {
        id: 'fleet-summary',
        name: 'Fleet Summary Report',
        description: 'Comprehensive fleet utilization and performance report',
        type: 'pdf',
        category: 'fleet',
        template: this.getFleetReportTemplate(),
        parameters: [
          {
            name: 'dateRange',
            label: 'Date Range',
            type: 'select',
            required: true,
            defaultValue: 'last_30_days',
            options: [
              { value: 'last_7_days', label: 'Last 7 Days' },
              { value: 'last_30_days', label: 'Last 30 Days' },
              { value: 'last_90_days', label: 'Last 90 Days' },
              { value: 'custom', label: 'Custom Range' },
            ],
          },
          {
            name: 'includeMaintenanceData',
            label: 'Include Maintenance Data',
            type: 'boolean',
            required: false,
            defaultValue: true,
          },
        ],
      },
      {
        id: 'project-financial',
        name: 'Project Financial Report',
        description: 'Detailed financial analysis for projects',
        type: 'excel',
        category: 'financial',
        template: this.getProjectFinancialTemplate(),
        parameters: [
          {
            name: 'projectId',
            label: 'Project',
            type: 'select',
            required: false,
            options: [], // Will be populated dynamically
          },
          {
            name: 'includeProjections',
            label: 'Include Budget Projections',
            type: 'boolean',
            required: false,
            defaultValue: true,
          },
        ],
      },
      {
        id: 'compliance-audit',
        name: 'Compliance Audit Report',
        description: 'Employee compliance and safety metrics',
        type: 'pdf',
        category: 'compliance',
        template: this.getComplianceReportTemplate(),
        parameters: [
          {
            name: 'departmentFilter',
            label: 'Department Filter',
            type: 'multiselect',
            required: false,
            options: [
              { value: 'operations', label: 'Operations' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'administration', label: 'Administration' },
            ],
          },
        ],
      },
      {
        id: 'daily-operations',
        name: 'Daily Operations Summary',
        description: 'Daily summary of fleet, projects, and activities',
        type: 'csv',
        category: 'fleet',
        template: 'daily_operations',
        parameters: [
          {
            name: 'targetDate',
            label: 'Target Date',
            type: 'date',
            required: true,
            defaultValue: new Date().toISOString().split('T')[0],
          },
        ],
        scheduling: {
          enabled: true,
          frequency: 'daily',
          recipients: [],
        },
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // Generate report
  async generateReport(
    templateId: string,
    parameters: Record<string, unknown>,
    userId: string
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const generationId = crypto.randomUUID();
    const generation: ReportGeneration = {
      id: generationId,
      templateId,
      parameters,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      generatedBy: userId,
    };

    this.generations.set(generationId, generation);

    // Start generation process
    this.processReportGeneration(generationId).catch(error => {
      console.error('Report generation failed:', error);
      this.updateGenerationStatus(generationId, 'failed', error.message);
    });

    return generationId;
  }

  // Process report generation
  private async processReportGeneration(generationId: string): Promise<void> {
    const generation = this.generations.get(generationId);
    if (!generation) return;

    const template = this.templates.get(generation.templateId);
    if (!template) return;

    try {
      this.updateGenerationProgress(generationId, 10);
      this.updateGenerationStatus(generationId, 'generating');

      // Collect data based on template and parameters
      const data = await this.collectReportData(template, generation.parameters);
      this.updateGenerationProgress(generationId, 40);

      // Generate report based on format
      let outputUrl: string;
      switch (template.type) {
        case 'pdf':
          outputUrl = await this.generatePDFReport(template, data, generation.parameters);
          break;
        case 'excel':
          outputUrl = await this.generateExcelReport(template, data, generation.parameters);
          break;
        case 'csv':
          outputUrl = await this.generateCSVReport(template, data, generation.parameters);
          break;
        case 'json':
          outputUrl = await this.generateJSONReport(template, data, generation.parameters);
          break;
        default:
          throw new Error(`Unsupported report type: ${template.type}`);
      }

      this.updateGenerationProgress(generationId, 100);
      this.updateGenerationStatus(generationId, 'completed');
      
      // Update generation with output URL
      const updatedGeneration = this.generations.get(generationId);
      if (updatedGeneration) {
        updatedGeneration.outputUrl = outputUrl;
        updatedGeneration.endTime = new Date().toISOString();
        this.generations.set(generationId, updatedGeneration);
      }

    } catch (error) {
      this.updateGenerationStatus(generationId, 'failed', error.message);
    }
  }

  // Collect data for report
  private async collectReportData(
    template: ReportTemplate,
    parameters: Record<string, unknown>
  ): Promise<any> {
    const { category } = template;

    switch (category) {
      case 'fleet':
        return this.collectFleetData(parameters);
      case 'project':
      case 'financial':
        return this.collectProjectData(parameters);
      case 'compliance':
        return this.collectComplianceData(parameters);
      default:
        return this.collectCustomData(template, parameters);
    }
  }

  // Collect fleet data
  private async collectFleetData(parameters: Record<string, unknown>): Promise<any> {
    const dateRange = this.getDateRange(parameters.dateRange);
    
    const [vehicles, routes, maintenance, costs] = await Promise.all([
      supabase.from('fleet_vehicles').select('*'),
      supabase.from('routes').select('*')
        .gte('start_time', dateRange.start)
        .lte('start_time', dateRange.end),
      parameters.includeMaintenanceData 
        ? supabase.from('maintenance_records').select('*')
            .gte('created_at', dateRange.start)
            .lte('created_at', dateRange.end)
        : Promise.resolve({ data: [] }),
      supabase.from('employee_costs').select('*')
        .eq('category', 'fuel')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end),
    ]);

    return {
      vehicles: vehicles.data || [],
      routes: routes.data || [],
      maintenance: maintenance.data || [],
      fuelCosts: costs.data || [],
      summary: {
        totalVehicles: vehicles.data?.length || 0,
        activeVehicles: vehicles.data?.filter(v => v.status === 'active').length || 0,
        totalRoutes: routes.data?.length || 0,
        totalDistance: routes.data?.reduce((sum, r) => sum + (r.estimated_distance || 0), 0) || 0,
        totalFuelCost: costs.data?.reduce((sum, c) => sum + c.amount, 0) || 0,
      },
      dateRange,
      generatedAt: new Date().toISOString(),
    };
  }

  // Collect project data
  private async collectProjectData(parameters: Record<string, unknown>): Promise<any> {
    const projectFilter = parameters.projectId ? { eq: ['id', parameters.projectId] } : {};
    
    const [projects, tasks, costs, milestones] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('project_tasks').select('*'),
      supabase.from('employee_costs').select('*'),
      supabase.from('project_milestones').select('*'),
    ]);

    return {
      projects: projects.data || [],
      tasks: tasks.data || [],
      costs: costs.data || [],
      milestones: milestones.data || [],
      includeProjections: parameters.includeProjections,
      generatedAt: new Date().toISOString(),
    };
  }

  // Collect compliance data
  private async collectComplianceData(parameters: Record<string, unknown>): Promise<any> {
    const [employees, violations, certifications, scores] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('employee_violations').select('*'),
      supabase.from('employee_certifications').select('*'),
      supabase.from('employee_compliance_scores').select('*'),
    ]);

    return {
      employees: employees.data || [],
      violations: violations.data || [],
      certifications: certifications.data || [],
      scores: scores.data || [],
      departmentFilter: parameters.departmentFilter,
      generatedAt: new Date().toISOString(),
    };
  }

  // Collect custom data
  private async collectCustomData(
    template: ReportTemplate,
    parameters: Record<string, unknown>
  ): Promise<any> {
    // This would be implemented based on specific custom requirements
    return {
      template: template.name,
      parameters,
      generatedAt: new Date().toISOString(),
    };
  }

  // Generate PDF report using real PDF generation
  private async generatePDFReport(
    template: ReportTemplate,
    data: unknown,
    parameters: Record<string, unknown>
  ): Promise<string> {
    try {
      // Use Puppeteer for PDF generation
      const htmlContent = this.renderHTMLTemplate(template.template, data);
      
      // Send to PDF generation service
      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: htmlContent,
          options: {
            format: 'A4',
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
            displayHeaderFooter: true,
            headerTemplate: `<div style="font-size: 10px; text-align: center; width: 100%;">${template.name}</div>`,
            footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;"><span class="pageNumber"></span> of <span class="totalPages"></span></div>'
          }
        })
      });

      if (!pdfResponse.ok) {
        throw new Error(`PDF generation failed: ${pdfResponse.statusText}`);
      }

      const pdfBlob = await pdfResponse.blob();
      
      // Upload to cloud storage
      const uploadUrl = await this.uploadToCloudStorage(pdfBlob, `reports/${template.name}_${Date.now()}.pdf`);
      
      return uploadUrl;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  // Generate Excel report using real Excel generation
  private async generateExcelReport(
    template: ReportTemplate,
    data: unknown,
    parameters: Record<string, unknown>
  ): Promise<string> {
    try {
      // Use ExcelJS for real Excel generation
      const excelResponse = await fetch('/api/generate-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: template.name,
          data: data,
          parameters: parameters
        })
      });

      if (!excelResponse.ok) {
        throw new Error(`Excel generation failed: ${excelResponse.statusText}`);
      }

      const excelBlob = await excelResponse.blob();
      
      // Upload to cloud storage
      const uploadUrl = await this.uploadToCloudStorage(excelBlob, `reports/${template.name}_${Date.now()}.xlsx`);
      
      return uploadUrl;
    } catch (error) {
      console.error('Excel generation failed:', error);
      throw new Error('Failed to generate Excel report');
    }
  }

  // Upload files to cloud storage
  private async uploadToCloudStorage(blob: Blob, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('folder', 'reports');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      return uploadData.url;
    } catch (error) {
      console.error('Cloud storage upload failed:', error);
      // Fallback to blob URL for local development
      return URL.createObjectURL(blob);
    }
  }

  // Generate CSV report
  private async generateCSVReport(
    template: ReportTemplate,
    data: unknown,
    parameters: Record<string, unknown>
  ): Promise<string> {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    return url;
  }

  // Generate JSON report
  private async generateJSONReport(
    template: ReportTemplate,
    data: unknown,
    parameters: Record<string, unknown>
  ): Promise<string> {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return url;
  }

  // Convert data to CSV
  private convertToCSV(data: unknown): string {
    if (!data || typeof data !== 'object') return '';

    // Simple CSV conversion for flat data
    const keys = Object.keys(data);
    const csvRows: string[] = [];

    // Add headers
    csvRows.push(keys.join(','));

    // If data has arrays, convert them
    const maxLength = Math.max(
      ...keys.map(key => Array.isArray(data[key]) ? data[key].length : 1)
    );

    for (let i = 0; i < maxLength; i++) {
      const row = keys.map(key => {
        const value = Array.isArray(data[key]) ? data[key][i] : data[key];
        return typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      });
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  // Render HTML template
  private renderHTMLTemplate(template: string, data: unknown): string {
    // Simple template rendering (in production, use a proper template engine)
    let html = template;
    
    // Replace variables in format {{variable}}
    html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });

    return html;
  }

  // Get date range from parameter
  private getDateRange(rangeType: string): { start: string; end: string } {
    const now = new Date();
    const end = now.toISOString();
    let start: string;

    switch (rangeType) {
      case 'last_7_days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_30_days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_90_days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    return { start, end };
  }

  // Update generation status
  private updateGenerationStatus(
    generationId: string,
    status: ReportGeneration['status'],
    errorMessage?: string
  ): void {
    const generation = this.generations.get(generationId);
    if (generation) {
      generation.status = status;
      if (errorMessage) generation.errorMessage = errorMessage;
      this.generations.set(generationId, generation);
    }
  }

  // Update generation progress
  private updateGenerationProgress(generationId: string, progress: number): void {
    const generation = this.generations.get(generationId);
    if (generation) {
      generation.progress = progress;
      this.generations.set(generationId, generation);
      
      // Notify callback if exists
      const callback = this.progressCallbacks.get(generationId);
      if (callback) callback(progress);
    }
  }

  // Get report templates
  getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get template by ID
  getTemplate(templateId: string): ReportTemplate | null {
    return this.templates.get(templateId) || null;
  }

  // Get generation status
  getGeneration(generationId: string): ReportGeneration | null {
    return this.generations.get(generationId) || null;
  }

  // Subscribe to generation progress
  subscribeToProgress(generationId: string, callback: (progress: number) => void): () => void {
    this.progressCallbacks.set(generationId, callback);
    return () => this.progressCallbacks.delete(generationId);
  }

  // Quick export functions for common use cases
  async exportFleetData(options: ExportOptions): Promise<string> {
    const data = await this.collectFleetData({
      dateRange: 'last_30_days',
      includeMaintenanceData: true,
    });

    switch (options.format) {
      case 'csv':
        return this.generateCSVReport({ type: 'csv' } as ReportTemplate, data, {});
      case 'json':
        return this.generateJSONReport({ type: 'json' } as ReportTemplate, data, {});
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  async exportProjectData(projectId: string, options: ExportOptions): Promise<string> {
    const data = await this.collectProjectData({
      projectId,
      includeProjections: true,
    });

    switch (options.format) {
      case 'excel':
        return this.generateExcelReport({ type: 'excel' } as ReportTemplate, data, {});
      case 'csv':
        return this.generateCSVReport({ type: 'csv' } as ReportTemplate, data, {});
      case 'json':
        return this.generateJSONReport({ type: 'json' } as ReportTemplate, data, {});
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Template getters
  private getFleetReportTemplate(): string {
    return `
      <html>
        <head><title>Fleet Summary Report</title></head>
        <body>
          <h1>Fleet Summary Report</h1>
          <p>Generated: {{generatedAt}}</p>
          <h2>Summary</h2>
          <p>Total Vehicles: {{summary.totalVehicles}}</p>
          <p>Active Vehicles: {{summary.activeVehicles}}</p>
          <p>Total Routes: {{summary.totalRoutes}}</p>
          <p>Total Distance: {{summary.totalDistance}} km</p>
          <p>Total Fuel Cost: $\{{summary.totalFuelCost}}</p>
        </body>
      </html>
    `;
  }

  private getProjectFinancialTemplate(): string {
    return 'project_financial_spreadsheet_template';
  }

  private getComplianceReportTemplate(): string {
    return `
      <html>
        <head><title>Compliance Audit Report</title></head>
        <body>
          <h1>Compliance Audit Report</h1>
          <p>Generated: {{generatedAt}}</p>
          <h2>Employee Compliance Overview</h2>
          <!-- Compliance data would be rendered here -->
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const reportingService = new ReportingService();

// React hook for reporting
export function useReporting() {
  const [templates, setTemplates] = React.useState<ReportTemplate[]>([]);
  const [generations, setGenerations] = React.useState<Map<string, ReportGeneration>>(new Map());

  React.useEffect(() => {
    setTemplates(reportingService.getTemplates());
  }, []);

  const generateReport = async (
    templateId: string,
    parameters: Record<string, unknown>,
    userId: string
  ) => {
    const generationId = await reportingService.generateReport(templateId, parameters, userId);
    
    // Subscribe to progress updates
    const unsubscribe = reportingService.subscribeToProgress(generationId, (progress) => {
      const generation = reportingService.getGeneration(generationId);
      if (generation) {
        setGenerations(prev => new Map(prev.set(generationId, generation)));
      }
    });

    // Cleanup subscription after completion
    const checkCompletion = setInterval(() => {
      const generation = reportingService.getGeneration(generationId);
      if (generation && (generation.status === 'completed' || generation.status === 'failed')) {
        unsubscribe();
        clearInterval(checkCompletion);
      }
    }, 1000);

    return generationId;
  };

  return {
    templates,
    generations: Array.from(generations.values()),
    generateReport,
    getGeneration: reportingService.getGeneration.bind(reportingService),
    exportFleetData: reportingService.exportFleetData.bind(reportingService),
    exportProjectData: reportingService.exportProjectData.bind(reportingService),
  };
}

import React from 'react';