import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings,
  Shield,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  PieChart
} from 'lucide-react';
import CostAnalyzer from '@/components/cost/CostAnalyzer';

const CostControl: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    projects_tracked: 0,
    total_budget: 0,
    total_spent: 0,
    budget_alerts: 0,
    system_health: 'optimal'
  });
  const [financialMetrics, setFinancialMetrics] = useState({
    profit_margin: 0,
    cost_efficiency: 0,
    roi: 0,
    cash_flow: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Simulate system status data
      setSystemStatus({
        projects_tracked: Math.floor(Math.random() * 8) + 12,
        total_budget: 2500000 + Math.random() * 2000000,
        total_spent: 1200000 + Math.random() * 800000,
        budget_alerts: Math.floor(Math.random() * 6),
        system_health: Math.random() > 0.1 ? 'optimal' : 'warning'
      });

      setFinancialMetrics({
        profit_margin: 15 + Math.random() * 10,
        cost_efficiency: 85 + Math.random() * 12,
        roi: 12 + Math.random() * 8,
        cash_flow: Math.random() > 0.5 ? 1 : -1
      });
    } catch (error) {
      console.error('Failed to load system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'optimal': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'optimal': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
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

  const budgetUtilization = (systemStatus.total_spent / systemStatus.total_budget) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              COST CONTROL CENTER
            </h1>
            <p className="text-muted-foreground text-lg">
              Financial Management & Budget Analysis // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-success">
              <Calculator className="w-4 h-4 mr-2" />
              {systemStatus.projects_tracked} Projects Tracked
            </Badge>
            <Badge 
              variant={getHealthBadge(systemStatus.system_health) as any}
              className={`glass-card ${getHealthColor(systemStatus.system_health)}`}
            >
              <Shield className="w-4 h-4 mr-2" />
              System {systemStatus.system_health}
            </Badge>
            {systemStatus.budget_alerts > 0 && (
              <Badge variant="destructive" className="glass-card animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {systemStatus.budget_alerts} Budget Alerts
              </Badge>
            )}
            <Button
              variant="outline"
              className="glass-card"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-xl font-bold">{formatCurrency(systemStatus.total_budget)}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">{formatCurrency(systemStatus.total_spent)}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-xl font-bold text-success">{financialMetrics.profit_margin.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-xl font-bold">{financialMetrics.cost_efficiency.toFixed(0)}%</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                financialMetrics.cash_flow > 0 ? 'bg-success/20' : 'bg-destructive/20'
              }`}>
                {financialMetrics.cash_flow > 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cash Flow</p>
                <p className={`text-xl font-bold ${
                  financialMetrics.cash_flow > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {financialMetrics.cash_flow > 0 ? 'Positive' : 'Negative'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Budget Utilization Overview */}
        <Card className="glass-card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Overall Budget Utilization</h3>
            <Badge variant="outline" className="glass-card">
              {budgetUtilization.toFixed(1)}% Utilized
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-4 mb-2">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Spent: {formatCurrency(systemStatus.total_spent)}</span>
            <span>Remaining: {formatCurrency(systemStatus.total_budget - systemStatus.total_spent)}</span>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {!isLoading && (
        <Tabs defaultValue="analyzer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Cost Analyzer
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Financial Reports
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Budget Planning
            </TabsTrigger>
          </TabsList>

          {/* Cost Analyzer Tab */}
          <TabsContent value="analyzer">
            <CostAnalyzer className="w-full" />
          </TabsContent>

          {/* Financial Reports Tab */}
          <TabsContent value="reporting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Summary */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Performance Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Return on Investment (ROI)</span>
                    <span className="text-lg font-bold text-success">{financialMetrics.roi.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Cost Performance Index</span>
                    <span className="text-lg font-bold text-primary">1.15</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Schedule Performance Index</span>
                    <span className="text-lg font-bold text-accent">0.95</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Budget Variance</span>
                    <span className="text-lg font-bold text-warning">-3.2%</span>
                  </div>
                </div>
              </Card>

              {/* Monthly Trends */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Financial Trends</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Current Month</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm font-bold text-success">+12.5%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>Revenue: {formatCurrency(485000)}</div>
                      <div>Costs: {formatCurrency(425000)}</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Previous Month</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-primary">+8.2%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>Revenue: {formatCurrency(432000)}</div>
                      <div>Costs: {formatCurrency(395000)}</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quarter Average</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold text-accent">+9.8%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>Revenue: {formatCurrency(445000)}</div>
                      <div>Costs: {formatCurrency(398000)}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Cost Distribution */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Cost Distribution Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <PieChart className="w-4 h-4 text-primary" />
                      <span className="font-medium">Materials</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">{formatCurrency(180000)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="font-medium">{formatCurrency(195000)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Variance:</span>
                        <span className="font-medium text-destructive">+8.3%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-success" />
                      <span className="font-medium">Labor</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">{formatCurrency(120000)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="font-medium">{formatCurrency(115000)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Variance:</span>
                        <span className="font-medium text-success">-4.2%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-warning" />
                      <span className="font-medium">Equipment</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-medium">{formatCurrency(95000)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="font-medium">{formatCurrency(98000)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Variance:</span>
                        <span className="font-medium text-warning">+3.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Budget Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Templates */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Budget Templates
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Highway Resurfacing</span>
                      <Badge variant="default" className="text-xs">Standard</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Materials: 45% • Labor: 30% • Equipment: 20% • Other: 5%</div>
                      <div>Typical range: $12-18 per sq ft</div>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2">
                      Apply Template
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Parking Lot Construction</span>
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Materials: 50% • Labor: 25% • Equipment: 20% • Other: 5%</div>
                      <div>Typical range: $8-14 per sq ft</div>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2">
                      Apply Template
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Crack Sealing Project</span>
                      <Badge variant="secondary" className="text-xs">Maintenance</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Materials: 40% • Labor: 35% • Equipment: 20% • Other: 5%</div>
                      <div>Typical range: $2-4 per linear ft</div>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2">
                      Apply Template
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Budget Goals */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Budget Goals & Targets</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="font-medium text-success">Cost Efficiency Target</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Maintain 90%+ efficiency across all projects
                    </div>
                    <div className="text-xs text-success mt-1">
                      Current: {financialMetrics.cost_efficiency.toFixed(1)}% ✓
                    </div>
                  </div>
                  
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="font-medium text-warning">Profit Margin Goal</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Achieve 20% profit margin on all contracts
                    </div>
                    <div className="text-xs text-warning mt-1">
                      Current: {financialMetrics.profit_margin.toFixed(1)}% (Target: 20%)
                    </div>
                  </div>
                  
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-medium text-primary">ROI Objective</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Maintain minimum 15% return on investment
                    </div>
                    <div className="text-xs text-primary mt-1">
                      Current: {financialMetrics.roi.toFixed(1)}% ✓
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-glass-border">
                    <h4 className="font-medium mb-2">Action Items</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Increase profit margins on future bids</li>
                      <li>• Optimize material procurement strategies</li>
                      <li>• Improve equipment utilization rates</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Upcoming Budget Reviews */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Upcoming Budget Reviews</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">Q1 Budget Review - Highway Project</div>
                        <div className="text-sm text-muted-foreground">
                          Quarterly financial assessment and variance analysis
                        </div>
                      </div>
                      <Badge variant="default" className="text-xs">Due March 31</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="ml-1 font-medium">{formatCurrency(450000)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spent:</span>
                        <span className="ml-1 font-medium">{formatCurrency(380000)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="ml-1 font-medium text-success">On Track</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">Mid-Project Cost Assessment</div>
                        <div className="text-sm text-muted-foreground">
                          Comprehensive cost analysis for Parking Lot A renovation
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">Due April 15</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="ml-1 font-medium">{formatCurrency(125000)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spent:</span>
                        <span className="ml-1 font-medium">{formatCurrency(65000)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="ml-1 font-medium text-primary">In Progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cost control system...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostControl;