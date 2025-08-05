import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { 
  BarChart3,
  FileText,
  Download,
  Share,
  Calendar as CalendarIcon,
  Filter,
  Settings,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Truck,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  PieChart,
  LineChart,
  MapPin,
  Zap,
  Brain,
  Shield,
  Camera,
  Cloud,
  Gauge,
  RefreshCw,
  Upload,
  Mail,
  Printer,
  ExternalLink
} from 'lucide-react';
import { api } from '@/services/api';
import { Project, Vehicle, Crew, Employee } from '@/types/database';

interface ReportingEngineProps {
  className?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  category: 'operational' | 'financial' | 'compliance' | 'performance' | 'executive';
  description: string;
  data_sources: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on-demand';
  format: 'pdf' | 'excel' | 'dashboard' | 'email';
  recipients: string[];
  last_generated: string;
  is_automated: boolean;
  status: 'active' | 'scheduled' | 'generating' | 'completed' | 'failed';
}

interface ReportMetrics {
  total_reports: number;
  reports_this_month: number;
  automation_rate: number;
  data_sources_connected: number;
  avg_generation_time: number;
  storage_used: number;
}

interface AnalyticsData {
  projects: {
    total: number;
    active: number;
    completed: number;
    completion_rate: number;
    avg_duration: number;
    budget_variance: number;
  };
  fleet: {
    total_vehicles: number;
    utilization_rate: number;
    maintenance_cost: number;
    fuel_efficiency: number;
    downtime_hours: number;
  };
  workforce: {
    total_employees: number;
    active_crews: number;
    productivity_score: number;
    safety_incidents: number;
    overtime_hours: number;
  };
  financial: {
    total_revenue: number;
    total_costs: number;
    profit_margin: number;
    budget_utilization: number;
    cost_per_mile: number;
  };
  ai_optimization: {
    optimizations_run: number;
    avg_efficiency_gain: number;
    cost_savings: number;
    success_rate: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

const ReportingEngine: React.FC<ReportingEngineProps> = ({ 
  className = '' 
}) => {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reportMetrics, setReportMetrics] = useState<ReportMetrics>({
    total_reports: 0,
    reports_this_month: 0,
    automation_rate: 0,
    data_sources_connected: 0,
    avg_generation_time: 0,
    storage_used: 0
  });
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    projects: {
      total: 0,
      active: 0,
      completed: 0,
      completion_rate: 0,
      avg_duration: 0,
      budget_variance: 0
    },
    fleet: {
      total_vehicles: 0,
      utilization_rate: 0,
      maintenance_cost: 0,
      fuel_efficiency: 0,
      downtime_hours: 0
    },
    workforce: {
      total_employees: 0,
      active_crews: 0,
      productivity_score: 0,
      safety_incidents: 0,
      overtime_hours: 0
    },
    financial: {
      total_revenue: 0,
      total_costs: 0,
      profit_margin: 0,
      budget_utilization: 0,
      cost_per_mile: 0
    },
    ai_optimization: {
      optimizations_run: 0,
      avg_efficiency_gain: 0,
      cost_savings: 0,
      success_rate: 0
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportingData();
  }, []);

  const loadReportingData = async () => {
    try {
      setIsLoading(true);

      // Load report metrics
      setReportMetrics({
        total_reports: 347 + Math.floor(Math.random() * 50),
        reports_this_month: 28 + Math.floor(Math.random() * 10),
        automation_rate: 85.2 + Math.random() * 10,
        data_sources_connected: 12,
        avg_generation_time: 2.3 + Math.random() * 1.5,
        storage_used: 4.7 + Math.random() * 2
      });

      // Load analytics data
      setAnalyticsData({
        projects: {
          total: 15 + Math.floor(Math.random() * 10),
          active: 8 + Math.floor(Math.random() * 5),
          completed: 7 + Math.floor(Math.random() * 5),
          completion_rate: 92.5 + Math.random() * 5,
          avg_duration: 45 + Math.random() * 20,
          budget_variance: -2.1 + Math.random() * 8
        },
        fleet: {
          total_vehicles: 23 + Math.floor(Math.random() * 10),
          utilization_rate: 78.3 + Math.random() * 15,
          maintenance_cost: 45000 + Math.random() * 20000,
          fuel_efficiency: 6.8 + Math.random() * 2,
          downtime_hours: 120 + Math.random() * 80
        },
        workforce: {
          total_employees: 156 + Math.floor(Math.random() * 50),
          active_crews: 12 + Math.floor(Math.random() * 5),
          productivity_score: 87.2 + Math.random() * 8,
          safety_incidents: Math.floor(Math.random() * 3),
          overtime_hours: 240 + Math.random() * 120
        },
        financial: {
          total_revenue: 2400000 + Math.random() * 600000,
          total_costs: 1950000 + Math.random() * 400000,
          profit_margin: 18.7 + Math.random() * 6,
          budget_utilization: 87.5 + Math.random() * 10,
          cost_per_mile: 12500 + Math.random() * 3000
        },
        ai_optimization: {
          optimizations_run: 147 + Math.floor(Math.random() * 30),
          avg_efficiency_gain: 23.8 + Math.random() * 8,
          cost_savings: 187500 + Math.random() * 50000,
          success_rate: 91.3 + Math.random() * 6
        }
      });

      // Load report templates
      await loadReportTemplates();

    } catch (error) {
      console.error('Failed to load reporting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportTemplates = async () => {
    const templates: ReportTemplate[] = [
      {
        id: '1',
        name: 'Executive Dashboard',
        category: 'executive',
        description: 'High-level overview of all operations, KPIs, and financial metrics',
        data_sources: ['Projects', 'Fleet', 'Financial', 'AI Optimization'],
        frequency: 'weekly',
        format: 'dashboard',
        recipients: ['CEO', 'COO', 'CFO'],
        last_generated: new Date(Date.now() - 86400000).toISOString(),
        is_automated: true,
        status: 'active'
      },
      {
        id: '2',
        name: 'Project Performance Report',
        category: 'operational',
        description: 'Detailed analysis of project progress, timelines, and resource utilization',
        data_sources: ['Projects', 'Crews', 'Costs', 'Weather'],
        frequency: 'daily',
        format: 'pdf',
        recipients: ['Project Managers', 'Operations Team'],
        last_generated: new Date(Date.now() - 3600000).toISOString(),
        is_automated: true,
        status: 'completed'
      },
      {
        id: '3',
        name: 'Fleet Utilization Analysis',
        category: 'operational',
        description: 'Vehicle performance, maintenance costs, and optimization recommendations',
        data_sources: ['Fleet', 'GPS Tracking', 'Maintenance', 'Fuel'],
        frequency: 'weekly',
        format: 'excel',
        recipients: ['Fleet Manager', 'Maintenance Team'],
        last_generated: new Date(Date.now() - 259200000).toISOString(),
        is_automated: true,
        status: 'active'
      },
      {
        id: '4',
        name: 'Financial Summary',
        category: 'financial',
        description: 'Budget analysis, cost breakdowns, and financial forecasting',
        data_sources: ['Costs', 'Budget', 'Materials', 'Labor'],
        frequency: 'monthly',
        format: 'pdf',
        recipients: ['CFO', 'Accounting Team', 'Project Managers'],
        last_generated: new Date(Date.now() - 604800000).toISOString(),
        is_automated: true,
        status: 'scheduled'
      },
      {
        id: '5',
        name: 'Safety & Compliance Report',
        category: 'compliance',
        description: 'Safety incidents, compliance status, and regulatory requirements',
        data_sources: ['Safety', 'Training', 'Incidents', 'Inspections'],
        frequency: 'monthly',
        format: 'pdf',
        recipients: ['Safety Officer', 'HR', 'Legal'],
        last_generated: new Date(Date.now() - 1209600000).toISOString(),
        is_automated: true,
        status: 'active'
      },
      {
        id: '6',
        name: 'AI Optimization Impact',
        category: 'performance',
        description: 'AI-driven improvements, efficiency gains, and cost savings analysis',
        data_sources: ['AI Optimization', 'Route Planning', 'Resource Allocation'],
        frequency: 'weekly',
        format: 'dashboard',
        recipients: ['CTO', 'Operations Team', 'Data Scientists'],
        last_generated: new Date(Date.now() - 172800000).toISOString(),
        is_automated: true,
        status: 'generating'
      }
    ];

    setReportTemplates(templates);
  };

  const generateReport = async (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) return;

    setIsGenerating(true);
    
    // Update template status
    setReportTemplates(prev =>
      prev.map(t =>
        t.id === templateId
          ? { ...t, status: 'generating' }
          : t
      )
    );

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update template with completion
    setReportTemplates(prev =>
      prev.map(t =>
        t.id === templateId
          ? { 
              ...t, 
              status: 'completed',
              last_generated: new Date().toISOString()
            }
          : t
      )
    );

    setIsGenerating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'generating': return 'text-primary';
      case 'scheduled': return 'text-accent';
      case 'failed': return 'text-destructive';
      case 'active': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'generating': return 'secondary';
      case 'scheduled': return 'outline';
      case 'failed': return 'destructive';
      case 'active': return 'default';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <Target className="w-4 h-4" />;
      case 'operational': return <Activity className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'compliance': return <Shield className="w-4 h-4" />;
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  const mockChartData = {
    projectProgress: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Completed Projects',
          data: [2, 3, 4, 2, 5, 3],
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 1)'
        },
        {
          label: 'Active Projects', 
          data: [5, 4, 6, 8, 7, 8],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)'
        }
      ]
    },
    fleetUtilization: {
      labels: ['Trucks', 'Pavers', 'Rollers', 'Support'],
      datasets: [
        {
          label: 'Utilization %',
          data: [85, 92, 78, 65],
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)',
            'rgba(34, 197, 94, 0.6)', 
            'rgba(251, 191, 36, 0.6)',
            'rgba(239, 68, 68, 0.6)'
          ]
        }
      ]
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reporting Engine Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow-primary">Reporting & Analytics Engine</h2>
            <Badge variant="outline" className="glass-card text-accent">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass-card">
              <Settings className="w-4 h-4 mr-2" />
              Configure Reports
            </Button>
            <Button className="glow-primary">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Reporting Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Reports</span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{reportMetrics.total_reports}</p>
            <span className="text-xs text-muted-foreground">All time</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">This Month</span>
              <CalendarIcon className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{reportMetrics.reports_this_month}</p>
            <span className="text-xs text-muted-foreground">Reports generated</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Automation</span>
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{formatNumber(reportMetrics.automation_rate)}%</p>
            <span className="text-xs text-muted-foreground">Automated reports</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Data Sources</span>
              <Eye className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{reportMetrics.data_sources_connected}</p>
            <span className="text-xs text-muted-foreground">Connected</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg Gen Time</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(reportMetrics.avg_generation_time, 2)}s</p>
            <span className="text-xs text-muted-foreground">Per report</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Storage</span>
              <Upload className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{formatNumber(reportMetrics.storage_used)}GB</p>
            <span className="text-xs text-muted-foreground">Used</span>
          </Card>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Report Templates
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Report Generator
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Data Visualization
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Center
          </TabsTrigger>
        </TabsList>

        {/* Analytics Dashboard Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Project Analytics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Project Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-lg font-bold text-primary">{analyticsData.projects.total}</div>
                    <div className="text-xs text-muted-foreground">Total Projects</div>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">{analyticsData.projects.active}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium text-success">{formatNumber(analyticsData.projects.completion_rate)}%</span>
                  </div>
                  <Progress value={analyticsData.projects.completion_rate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Duration</span>
                    <span className="font-medium">{formatNumber(analyticsData.projects.avg_duration, 0)} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Variance</span>
                    <span className={`font-medium ${analyticsData.projects.budget_variance < 0 ? 'text-success' : 'text-warning'}`}>
                      {analyticsData.projects.budget_variance > 0 ? '+' : ''}{formatNumber(analyticsData.projects.budget_variance)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Fleet Analytics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                Fleet Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <div className="text-lg font-bold text-accent">{analyticsData.fleet.total_vehicles}</div>
                    <div className="text-xs text-muted-foreground">Total Vehicles</div>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <div className="text-lg font-bold text-warning">{formatNumber(analyticsData.fleet.utilization_rate)}%</div>
                    <div className="text-xs text-muted-foreground">Utilization</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maintenance Cost</span>
                    <span className="font-medium">{formatCurrency(analyticsData.fleet.maintenance_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuel Efficiency</span>
                    <span className="font-medium">{formatNumber(analyticsData.fleet.fuel_efficiency)} mpg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downtime</span>
                    <span className="font-medium">{formatNumber(analyticsData.fleet.downtime_hours, 0)} hrs</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Workforce Analytics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-success" />
                Workforce Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">{analyticsData.workforce.total_employees}</div>
                    <div className="text-xs text-muted-foreground">Total Employees</div>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-lg font-bold text-primary">{analyticsData.workforce.active_crews}</div>
                    <div className="text-xs text-muted-foreground">Active Crews</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Productivity Score</span>
                    <span className="font-medium text-success">{formatNumber(analyticsData.workforce.productivity_score)}%</span>
                  </div>
                  <Progress value={analyticsData.workforce.productivity_score} className="h-2" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Safety Incidents</span>
                    <span className="font-medium">{analyticsData.workforce.safety_incidents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime Hours</span>
                    <span className="font-medium">{formatNumber(analyticsData.workforce.overtime_hours, 0)} hrs</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Financial Analytics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-warning" />
                Financial Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">{formatCurrency(analyticsData.financial.total_revenue)}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <div className="text-lg font-bold text-warning">{formatNumber(analyticsData.financial.profit_margin)}%</div>
                    <div className="text-xs text-muted-foreground">Profit Margin</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Costs</span>
                    <span className="font-medium">{formatCurrency(analyticsData.financial.total_costs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget Utilization</span>
                    <span className="font-medium">{formatNumber(analyticsData.financial.budget_utilization)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost per Mile</span>
                    <span className="font-medium">{formatCurrency(analyticsData.financial.cost_per_mile)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Optimization Analytics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Optimization Analytics
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-lg font-bold text-primary">{analyticsData.ai_optimization.optimizations_run}</div>
                    <div className="text-xs text-muted-foreground">Optimizations</div>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">{formatNumber(analyticsData.ai_optimization.success_rate)}%</div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Efficiency Gain</span>
                    <span className="font-medium text-success">+{formatNumber(analyticsData.ai_optimization.avg_efficiency_gain)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost Savings</span>
                    <span className="font-medium text-primary">{formatCurrency(analyticsData.ai_optimization.cost_savings)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Health */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                System Health
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>OverWatch System: Online</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>AI Optimization: Active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>Mobile App: Synced</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-3 h-3 text-primary animate-pulse" />
                    <span>Data Processing: Running</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-glass-border">
                  <div className="text-center p-3 bg-muted/10 rounded-lg">
                    <div className="text-lg font-bold text-success">99.7%</div>
                    <div className="text-xs text-muted-foreground">System Uptime</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Report Templates Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Report Templates</h3>
              <Button className="glow-primary">
                <FileText className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="space-y-4">
              {reportTemplates.map((template) => (
                <Card key={template.id} className="glass-card p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        {getCategoryIcon(template.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {template.category} • {template.frequency} • {template.format}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadge(template.status) as "default" | "destructive" | "outline" | "secondary"} className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                      {template.is_automated && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Data Sources</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.data_sources.map((source, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Recipients</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.recipients.slice(0, 2).map((recipient, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {recipient}
                          </Badge>
                        ))}
                        {template.recipients.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.recipients.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Last Generated</span>
                      <p className="text-sm mt-1">
                        {new Date(template.last_generated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <RefreshCw className="w-3 h-3" />
                      <span>Next: {template.frequency === 'daily' ? 'Tomorrow' : 'Next week'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="glass-card"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className={`${template.status === 'generating' ? 'opacity-50' : 'glow-primary'}`}
                        onClick={() => generateReport(template.id)}
                        disabled={template.status === 'generating' || isGenerating}
                      >
                        {template.status === 'generating' ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Generate
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Report Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">Custom Report Generator</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Name</label>
                  <Input 
                    placeholder="Enter report name..."
                    className="glass-card"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Data Sources</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Projects', 'Fleet', 'Crews', 'Costs', 'Weather', 'AI Optimization', 'Materials', 'Safety'].map((source) => (
                      <label key={source} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea 
                    placeholder="Describe what this report will cover..."
                    className="glass-card"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Frequency</label>
                  <Select>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="on-demand">On Demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Format</label>
                  <Select>
                    <SelectTrigger className="glass-card">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="dashboard">Live Dashboard</SelectItem>
                      <SelectItem value="email">Email Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Recipients</label>
                  <Input 
                    placeholder="Enter email addresses..."
                    className="glass-card"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Enable automated generation</span>
                </div>

                <Button className="w-full glow-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Report Template
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Data Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Project Progress Trends</h3>
              <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Line Chart: Project completion over time</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Fleet Utilization Distribution</h3>
              <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Pie Chart: Vehicle type utilization</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
              <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Bar Chart: Cost breakdown by category</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">AI Optimization Impact</h3>
              <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Area Chart: Efficiency gains over time</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Export Center Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-6">Export Center</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Quick Exports</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start glass-card">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Analytics (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start glass-card">
                    <Download className="w-4 h-4 mr-2" />
                    Export Financial Summary (Excel)
                  </Button>
                  <Button variant="outline" className="w-full justify-start glass-card">
                    <Download className="w-4 h-4 mr-2" />
                    Export Project Reports (ZIP)
                  </Button>
                  <Button variant="outline" className="w-full justify-start glass-card">
                    <Download className="w-4 h-4 mr-2" />
                    Export Raw Data (CSV)
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Scheduled Exports</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Weekly Executive Summary</span>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Monthly Financial Report</span>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">1st of each month at 10:00 AM</p>
                  </div>
                  
                  <Button variant="outline" className="w-full glass-card">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule New Export
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading reporting engine...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingEngine;