import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calculator,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Fuel,
  Users,
  Wrench,
  Package,
  Calendar as CalendarIcon,
  Download,
  Filter,
  Plus,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/services/api';
import { CostEntry, Project, Material } from '@/types/database';

interface CostAnalyzerProps {
  projectId?: string;
  className?: string;
}

interface CostMetrics {
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  budgetUtilization: number;
  projectedOverrun: number;
  costPerSquareFoot: number;
  actualVsBudget: number;
  efficiency: number;
}

interface CostBreakdown {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  percentage: number;
  status: 'under' | 'on_target' | 'over';
}

interface CostTrend {
  date: string;
  daily_cost: number;
  cumulative_cost: number;
  budget_line: number;
  variance: number;
}

interface BudgetAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: string;
  message: string;
  amount: number;
  threshold: number;
  timestamp: string;
}

const CostAnalyzer: React.FC<CostAnalyzerProps> = ({ 
  projectId,
  className = '' 
}) => {
  const [costMetrics, setCostMetrics] = useState<CostMetrics>({
    totalBudget: 0,
    spentAmount: 0,
    remainingBudget: 0,
    budgetUtilization: 0,
    projectedOverrun: 0,
    costPerSquareFoot: 0,
    actualVsBudget: 0,
    efficiency: 0
  });

  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [costTrends, setCostTrends] = useState<CostTrend[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [dateRange, setDateRange] = useState<{start: Date | undefined, end: Date | undefined}>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [viewPeriod, setViewPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  const loadCostData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Load projects
      const projectsResponse = await api.projects.getAll();
      if (projectsResponse.success) {
        setProjects(projectsResponse.data);
        if (!selectedProject && projectsResponse.data.length > 0) {
          setSelectedProject(projectsResponse.data[0].id);
        }
      }

      // Load materials
      const materialsResponse = await api.materials.getAll();
      if (materialsResponse.success) {
        setMaterials(materialsResponse.data);
      }

      // Load cost entries
      if (selectedProject) {
        const costResponse = await api.cost.getProjectCosts(selectedProject);
        if (costResponse.success) {
          setCostEntries(costResponse.data);
        }
      }

      // Generate mock data
      generateCostMetrics();
      generateCostBreakdown();
      generateCostTrends();
      generateBudgetAlerts();

    } catch (error) {
      console.error('Failed to load cost data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, dateRange]);

  useEffect(() => {
    loadCostData();
  }, [loadCostData]);

  const generateCostMetrics = () => {
    const totalBudget = 250000 + Math.random() * 500000;
    const spentAmount = totalBudget * (0.3 + Math.random() * 0.5);
    const remainingBudget = totalBudget - spentAmount;
    const budgetUtilization = (spentAmount / totalBudget) * 100;
    
    const metrics: CostMetrics = {
      totalBudget,
      spentAmount,
      remainingBudget,
      budgetUtilization,
      projectedOverrun: Math.random() > 0.7 ? totalBudget * 0.1 : 0,
      costPerSquareFoot: 12.50 + Math.random() * 5,
      actualVsBudget: -5 + Math.random() * 15,
      efficiency: 85 + Math.random() * 15
    };

    setCostMetrics(metrics);
  };

  const generateCostBreakdown = () => {
    const categories = [
      'Materials',
      'Labor',
      'Equipment',
      'Transportation',
      'Overhead',
      'Permits & Fees'
    ];

    const breakdown: CostBreakdown[] = categories.map(category => {
      const budgeted = 20000 + Math.random() * 80000;
      const actual = budgeted * (0.8 + Math.random() * 0.4);
      const variance = actual - budgeted;
      const percentage = (actual / budgeted) * 100;
      
      let status: 'under' | 'on_target' | 'over' = 'on_target';
      if (variance < -budgeted * 0.05) status = 'under';
      else if (variance > budgeted * 0.05) status = 'over';

      return {
        category,
        budgeted,
        actual,
        variance,
        percentage,
        status
      };
    });

    setCostBreakdown(breakdown);
  };

  const generateCostTrends = () => {
    const trends: CostTrend[] = [];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let cumulativeCost = 0;
    const totalBudget = costMetrics.totalBudget || 500000;
    const dailyBudget = totalBudget / 60; // 60-day project

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dailyCost = dailyBudget * (0.7 + Math.random() * 0.6);
      cumulativeCost += dailyCost;
      const budgetLine = dailyBudget * (i + 1);
      const variance = cumulativeCost - budgetLine;

      trends.push({
        date: date.toISOString(),
        daily_cost: dailyCost,
        cumulative_cost: cumulativeCost,
        budget_line: budgetLine,
        variance
      });
    }

    setCostTrends(trends);
  };

  const generateBudgetAlerts = () => {
    const alerts: BudgetAlert[] = [];

    if (Math.random() > 0.6) {
      alerts.push({
        id: '1',
        type: 'warning',
        category: 'Materials',
        message: 'Asphalt costs exceeding budget by 12%',
        amount: 15600,
        threshold: 14000,
        timestamp: new Date().toISOString()
      });
    }

    if (Math.random() > 0.7) {
      alerts.push({
        id: '2',
        type: 'critical',
        category: 'Labor',
        message: 'Overtime costs approaching 85% of allocated budget',
        amount: 42500,
        threshold: 50000,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: '3',
        type: 'info',
        category: 'Equipment',
        message: 'Equipment rental under budget - opportunity for savings',
        amount: 8200,
        threshold: 12000,
        timestamp: new Date(Date.now() - 7200000).toISOString()
      });
    }

    setBudgetAlerts(alerts);
  };

  const getVarianceColor = (variance: number) => {
    if (variance < 0) return 'text-success';
    if (variance > 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance < 0) return <TrendingDown className="w-4 h-4 text-success" />;
    if (variance > 0) return <TrendingUp className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under': return 'text-success';
      case 'on_target': return 'text-primary';
      case 'over': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under': return 'default';
      case 'on_target': return 'secondary';
      case 'over': return 'destructive';
      default: return 'outline';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-destructive bg-destructive/10';
      case 'warning': return 'border-warning bg-warning/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-muted bg-muted/10';
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

  const exportCostReport = () => {
    const reportData = {
      project: selectedProject,
      metrics: costMetrics,
      breakdown: costBreakdown,
      trends: costTrends.slice(-7), // Last 7 days
      alerts: budgetAlerts,
      generated: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cost Overview Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow-primary">Cost Analysis</h2>
            <Badge variant="outline" className="glass-card text-accent">
              <Calculator className="w-3 h-3 mr-1" />
              Real-Time Tracking
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-64 glass-card">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="glass-card" onClick={exportCostReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Budget</span>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(costMetrics.totalBudget)}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {costMetrics.budgetUtilization.toFixed(1)}% Used
              </Badge>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Spent</span>
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{formatCurrency(costMetrics.spentAmount)}</p>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={costMetrics.budgetUtilization} className="flex-1 h-2" />
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Remaining</span>
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(costMetrics.remainingBudget)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {((costMetrics.remainingBudget / costMetrics.totalBudget) * 100).toFixed(1)}% available
              </span>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Variance</span>
              {getVarianceIcon(costMetrics.actualVsBudget)}
            </div>
            <p className={`text-2xl font-bold ${getVarianceColor(costMetrics.actualVsBudget)}`}>
              {costMetrics.actualVsBudget >= 0 ? '+' : ''}{costMetrics.actualVsBudget.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                vs. budget baseline
              </span>
            </div>
          </Card>
        </div>
      </Card>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-3">
          {budgetAlerts.map((alert) => (
            <Card key={alert.id} className={`p-4 ${getAlertColor(alert.type)} border-l-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">{alert.category} Budget Alert</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Current: {formatCurrency(alert.amount)}</span>
                      <span>Threshold: {formatCurrency(alert.threshold)}</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={alert.type === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                  {alert.type}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Cost Breakdown
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Trends & Analysis
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Cost Entries
          </TabsTrigger>
          <TabsTrigger value="forecasting" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Budget Forecasting
          </TabsTrigger>
        </TabsList>

        {/* Cost Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown by Category */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Budget vs Actual by Category</h3>
              <div className="space-y-4">
                {costBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(item.status) as "default" | "destructive" | "outline" | "secondary"} className="text-xs">
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <span className={`text-sm font-bold ${getVarianceColor(item.variance)}`}>
                          {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Budgeted:</span>
                        <span className="ml-2 font-medium">{formatCurrency(item.budgeted)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="ml-2 font-medium">{formatCurrency(item.actual)}</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Progress value={Math.min(item.percentage, 100)} className="h-3" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cost Efficiency Metrics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Efficiency Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cost per Square Foot</span>
                    <span className="text-lg font-bold">${costMetrics.costPerSquareFoot.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Industry avg: $14.75/sq ft
                  </div>
                </div>
                
                <div className="p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Efficiency</span>
                    <span className="text-lg font-bold text-success">{costMetrics.efficiency.toFixed(1)}%</span>
                  </div>
                  <Progress value={costMetrics.efficiency} className="h-2 mt-2" />
                </div>
                
                <div className="p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Projected Completion Cost</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(costMetrics.totalBudget + costMetrics.projectedOverrun)}
                    </span>
                  </div>
                  {costMetrics.projectedOverrun > 0 && (
                    <div className="text-xs text-destructive">
                      Overrun: {formatCurrency(costMetrics.projectedOverrun)}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted/10 rounded-lg text-center">
                    <div className="text-lg font-bold text-primary">32</div>
                    <div className="text-muted-foreground">Days Remaining</div>
                  </div>
                  <div className="p-3 bg-muted/10 rounded-lg text-center">
                    <div className="text-lg font-bold text-accent">$8,750</div>
                    <div className="text-muted-foreground">Daily Avg Cost</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Trends & Analysis Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trend Chart */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">30-Day Cost Trend</h3>
              <div className="h-64 bg-muted/10 rounded-lg relative border border-glass-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="cost-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#cost-grid)" />
                    </svg>
                  </div>
                </div>
                
                {/* Simulated trend lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {/* Budget line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    points="20,200 100,180 180,160 260,140 340,120"
                  />
                  {/* Actual cost line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points="20,200 100,185 180,170 260,150 340,135"
                  />
                </svg>
                
                <div className="absolute inset-0 flex items-center justify-center bg-background/10">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-foreground font-medium">Cost Trend Analysis</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tracking vs. budget baseline
                    </p>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-background/90 p-2 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-0.5 bg-primary"></div>
                    <span>Actual Cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-success border-dashed border-t"></div>
                    <span>Budget Line</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Daily Cost Analysis */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Cost Analysis</h3>
              <div className="space-y-3">
                {costTrends.slice(-7).map((trend, index) => (
                  <div key={index} className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {new Date(trend.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        {getVarianceIcon(trend.variance)}
                        <span className={`text-sm font-bold ${getVarianceColor(trend.variance)}`}>
                          {formatCurrency(trend.daily_cost)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>Cumulative: {formatCurrency(trend.cumulative_cost)}</div>
                      <div>Variance: {formatCurrency(trend.variance)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Cost Entries Tab */}
        <TabsContent value="entries" className="space-y-6">
          <Card className="glass-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Cost Entry Management</h3>
              <Button className="glow-primary" onClick={() => console.log('Add Cost Entry clicked - TODO: Implement cost entry creation modal')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Cost Entry
              </Button>
            </div>

            <div className="space-y-4">
              {/* Recent cost entries */}
              <div className="p-4 border border-glass-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Asphalt Materials - Grade A</h4>
                      <p className="text-sm text-muted-foreground">150 tons @ $85/ton</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(12750)}</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Category: Materials</span>
                  <span>Vendor: ABC Suppliers</span>
                  <span>Approved by: J. Smith</span>
                </div>
              </div>
              
              <div className="p-4 border border-glass-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Crew Labor - Highway Team</h4>
                      <p className="text-sm text-muted-foreground">8 workers × 8 hours × $32/hr</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(2048)}</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Category: Labor</span>
                  <span>Shift: Day</span>
                  <span>Project: Highway Resurfacing</span>
                </div>
              </div>
              
              <div className="p-4 border border-glass-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Equipment Rental - Paver</h4>
                      <p className="text-sm text-muted-foreground">CAT AP1055F × 1 day</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(1200)}</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Category: Equipment</span>
                  <span>Rental Co: Heavy Equipment LLC</span>
                  <span>Duration: 8 hours</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Budget Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Forecast */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Project Completion Forecast</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Projected Final Cost</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(costMetrics.totalBudget + costMetrics.projectedOverrun)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on current spending patterns
                  </div>
                </div>
                
                <div className="p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Estimated Completion</span>
                    <span className="text-lg font-bold text-primary">32 days</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    At current work pace
                  </div>
                </div>
                
                <div className="p-4 bg-muted/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Daily Budget Remaining</span>
                    <span className="text-lg font-bold text-accent">
                      {formatCurrency(costMetrics.remainingBudget / 32)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Average available per day
                  </div>
                </div>
              </div>
            </Card>

            {/* Risk Assessment */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Budget Risk Assessment</h3>
              <div className="space-y-4">
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-destructive">High Risk</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Material costs trending 15% above budget. Weather delays may increase labor costs.
                  </p>
                </div>
                
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="font-medium text-warning">Medium Risk</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Equipment rental extending beyond planned duration due to site conditions.
                  </p>
                </div>
                
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="font-medium text-success">Low Risk</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Labor costs tracking below budget. Good weather forecast for next 2 weeks.
                  </p>
                </div>
                
                <div className="pt-3 border-t border-glass-border">
                  <h4 className="font-medium mb-2">Mitigation Strategies</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Negotiate bulk material pricing for remaining quantities</li>
                    <li>• Schedule weather-dependent work during optimal windows</li>
                    <li>• Consider equipment purchase vs. rental for extended use</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading cost analysis data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostAnalyzer;