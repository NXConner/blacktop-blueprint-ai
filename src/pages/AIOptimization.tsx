import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain,
  Zap,
  TrendingUp,
  Target,
  Cpu,
  Activity,
  BarChart3,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Route,
  Users,
  Truck
} from 'lucide-react';
import OptimizationEngine from '@/components/ai/OptimizationEngine';

const AIOptimization: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    ai_engine_status: 'active',
    neural_networks: 3,
    active_optimizations: 0,
    model_version: '2.1.0',
    last_update: new Date().toISOString(),
    compute_utilization: 0,
    memory_usage: 0
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    total_optimizations: 0,
    success_rate: 0,
    average_improvement: 0,
    total_savings: 0,
    processing_speed: 0,
    uptime_percentage: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);

      // Simulate loading AI system status
      setSystemStatus({
        ai_engine_status: 'active',
        neural_networks: 3,
        active_optimizations: Math.floor(Math.random() * 5) + 1,
        model_version: '2.1.0',
        last_update: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        compute_utilization: 65 + Math.random() * 25,
        memory_usage: 45 + Math.random() * 30
      });

      // Simulate performance metrics
      setPerformanceMetrics({
        total_optimizations: 1247 + Math.floor(Math.random() * 200),
        success_rate: 91.5 + Math.random() * 6,
        average_improvement: 24.3 + Math.random() * 8,
        total_savings: 187500 + Math.random() * 50000,
        processing_speed: 0.85 + Math.random() * 0.3,
        uptime_percentage: 99.2 + Math.random() * 0.7
      });

    } catch (error) {
      console.error('Failed to load AI system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      case 'maintenance': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'maintenance': return 'outline';
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

  const aiCapabilities = [
    {
      icon: <Route className="w-5 h-5" />,
      title: 'Route Optimization',
      description: 'AI-powered route planning with real-time traffic and weather integration',
      accuracy: '94.2%',
      improvement: '+18.5%'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Resource Allocation',
      description: 'Intelligent crew and equipment assignment based on skills and availability',
      accuracy: '91.7%',
      improvement: '+22.1%'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Schedule Optimization',
      description: 'Dynamic scheduling with dependency analysis and constraint optimization',
      accuracy: '89.3%',
      improvement: '+15.8%'
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: 'Cost Prediction',
      description: 'Machine learning-based cost forecasting and budget optimization',
      accuracy: '93.8%',
      improvement: '+19.7%'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              AI OPTIMIZATION CENTER
            </h1>
            <p className="text-muted-foreground text-lg">
              Neural Network-Powered Operational Intelligence // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={getStatusBadge(systemStatus.ai_engine_status) as "default" | "destructive" | "outline" | "secondary"} className={`glass-card ${getStatusColor(systemStatus.ai_engine_status)}`}>
              <Brain className="w-4 h-4 mr-2" />
              AI Engine {systemStatus.ai_engine_status.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="glass-card text-accent">
              <Cpu className="w-4 h-4 mr-2" />
              {systemStatus.neural_networks} Neural Networks
            </Badge>
            <Badge variant="outline" className="glass-card text-primary">
              <Activity className="w-4 h-4 mr-2" />
              {systemStatus.active_optimizations} Active
            </Badge>
            <Button variant="outline" className="glass-card">
              <Settings className="w-4 h-4 mr-2" />
              AI Settings
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
              <Target className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{performanceMetrics.success_rate.toFixed(1)}%</p>
            <span className="text-xs text-muted-foreground">Optimization accuracy</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Avg Improvement</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">+{performanceMetrics.average_improvement.toFixed(1)}%</p>
            <span className="text-xs text-muted-foreground">Efficiency gains</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Savings</span>
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{formatCurrency(performanceMetrics.total_savings)}</p>
            <span className="text-xs text-muted-foreground">Cost reductions</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Processing Speed</span>
              <Zap className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{performanceMetrics.processing_speed.toFixed(2)}s</p>
            <span className="text-xs text-muted-foreground">Avg optimization time</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Optimizations</span>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{performanceMetrics.total_optimizations.toLocaleString()}</p>
            <span className="text-xs text-muted-foreground">Completed tasks</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Uptime</span>
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{performanceMetrics.uptime_percentage.toFixed(1)}%</p>
            <span className="text-xs text-muted-foreground">System availability</span>
          </Card>
        </div>

        {/* System Health */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Neural Network Health</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(systemStatus.last_update).toLocaleTimeString()}
              </span>
              <Badge variant="outline" className="text-xs">
                v{systemStatus.model_version}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">System Resources</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Compute Utilization</span>
                    <span>{systemStatus.compute_utilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemStatus.compute_utilization}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>{systemStatus.memory_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemStatus.memory_usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Model Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Route Planning Model: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Resource Optimization: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Cost Prediction: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span>Learning Engine: Training</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Route optimization completed for Project Alpha</div>
                <div>• Resource allocation updated for Crew Beta</div>
                <div>• Cost prediction model retrained</div>
                <div>• Schedule optimization queued for Highway 101</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Capabilities Overview */}
      <Card className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          AI Capabilities Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiCapabilities.map((capability, index) => (
            <Card key={index} className="glass-elevated p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  {capability.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{capability.title}</h3>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{capability.description}</p>
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="ml-1 font-medium text-success">{capability.accuracy}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Improvement:</span>
                  <span className="ml-1 font-medium text-primary">{capability.improvement}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Main AI Optimization Engine */}
      <OptimizationEngine />

      {/* Additional AI Insights */}
      <Card className="glass-card p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">AI-Powered Insights & Recommendations</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Optimization Opportunities
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="font-medium text-success">High Impact</span>
                </div>
                <p className="text-sm">Route consolidation could reduce fuel costs by 15% for Highway 101 project</p>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium text-primary">Medium Impact</span>
                </div>
                <p className="text-sm">Crew reallocation in Zone B could improve utilization by 12%</p>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="font-medium text-accent">Scheduling</span>
                </div>
                <p className="text-sm">Weather forecast suggests moving Tuesday operations to Wednesday</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Predictive Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3 h-3 text-warning" />
                  <span className="font-medium text-warning">Equipment Maintenance</span>
                </div>
                <p className="text-sm">Paver CAT-01 predicted to need maintenance in 3 days based on usage patterns</p>
              </div>
              
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                  <span className="font-medium text-destructive">Budget Risk</span>
                </div>
                <p className="text-sm">Project Delta trending 8% over budget - cost optimization recommended</p>
              </div>
              
              <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="font-medium">Schedule Conflict</span>
                </div>
                <p className="text-sm">Resource overlap detected between Project Alpha and Project Gamma next week</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing AI optimization systems...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIOptimization;