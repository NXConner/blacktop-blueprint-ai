import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  FileText,
  TrendingUp,
  Target,
  Activity,
  Settings,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Zap,
  RefreshCw,
  Database,
  PieChart,
  LineChart,
  Calendar,
  Share
} from 'lucide-react';
import ReportingEngine from '@/components/reporting/ReportingEngine';

const ReportingAnalytics: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    data_processing_rate: 0,
    report_generation_speed: 0,
    dashboard_refreshes: 0,
    storage_efficiency: 0,
    user_engagement: 0,
    system_health: 0
  });

  const [kpiSummary, setKpiSummary] = useState({
    total_data_points: 0,
    active_dashboards: 0,
    scheduled_reports: 0,
    user_interactions: 0,
    export_requests: 0,
    system_uptime: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);

      // Simulate loading system metrics
      setSystemMetrics({
        data_processing_rate: 15.2 + Math.random() * 5,
        report_generation_speed: 2.8 + Math.random() * 1.5,
        dashboard_refreshes: 450 + Math.random() * 100,
        storage_efficiency: 87.3 + Math.random() * 8,
        user_engagement: 92.1 + Math.random() * 6,
        system_health: 98.7 + Math.random() * 1.2
      });

      // Simulate KPI summary
      setKpiSummary({
        total_data_points: 2847592 + Math.floor(Math.random() * 100000),
        active_dashboards: 23 + Math.floor(Math.random() * 10),
        scheduled_reports: 47 + Math.floor(Math.random() * 15),
        user_interactions: 8734 + Math.floor(Math.random() * 1000),
        export_requests: 156 + Math.floor(Math.random() * 50),
        system_uptime: 99.8 + Math.random() * 0.2
      });

    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const insights = [
    {
      icon: <TrendingUp className="w-5 h-5 text-success" />,
      title: 'Performance Trending Up',
      description: 'System performance improved by 15% this month with faster report generation',
      impact: 'high',
      action: 'Continue optimization efforts'
    },
    {
      icon: <Users className="w-5 h-5 text-primary" />,
      title: 'Increased User Engagement',
      description: 'Dashboard usage increased 28% with new interactive analytics features',
      impact: 'medium',
      action: 'Expand interactive capabilities'
    },
    {
      icon: <Database className="w-5 h-5 text-accent" />,
      title: 'Data Quality Excellence',
      description: 'Data accuracy maintained at 99.2% across all integrated systems',
      impact: 'high',
      action: 'Maintain current protocols'
    },
    {
      icon: <Zap className="w-5 h-5 text-warning" />,
      title: 'Automation Efficiency',
      description: 'Automated reporting reduced manual effort by 67% this quarter',
      impact: 'high',
      action: 'Identify additional automation opportunities'
    }
  ];

  const capabilities = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Real-Time Analytics',
      description: 'Live data processing with instant dashboard updates',
      metrics: { processed: '2.8M', latency: '< 100ms' }
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Automated Reporting',
      description: 'Scheduled report generation with custom templates',
      metrics: { templates: '47', automation: '85%' }
    },
    {
      icon: <PieChart className="w-5 h-5" />,
      title: 'Interactive Visualizations',
      description: 'Dynamic charts and graphs with drill-down capabilities',
      metrics: { charts: '156', interactions: '8.7K' }
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'KPI Monitoring',
      description: 'Key performance indicators with threshold alerts',
      metrics: { kpis: '89', alerts: '12' }
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'Multi-Format Export',
      description: 'Export reports in PDF, Excel, CSV, and dashboard formats',
      metrics: { formats: '4+', exports: '156' }
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: 'Performance Monitoring',
      description: 'System health tracking with predictive maintenance',
      metrics: { uptime: '99.8%', health: '98.7%' }
    }
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              REPORTING & ANALYTICS CENTER
            </h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive Data Intelligence & Business Analytics // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-success">
              <Database className="w-4 h-4 mr-2" />
              {formatLargeNumber(kpiSummary.total_data_points)} Data Points
            </Badge>
            <Badge variant="outline" className="glass-card text-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              {kpiSummary.active_dashboards} Active Dashboards
            </Badge>
            <Badge variant="outline" className="glass-card text-accent">
              <FileText className="w-4 h-4 mr-2" />
              {kpiSummary.scheduled_reports} Reports
            </Badge>
            <Button variant="outline" className="glass-card">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* System Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Processing Rate</span>
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{formatNumber(systemMetrics.data_processing_rate)}M/s</p>
            <span className="text-xs text-muted-foreground">Records per second</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Report Speed</span>
              <Clock className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{formatNumber(systemMetrics.report_generation_speed, 2)}s</p>
            <span className="text-xs text-muted-foreground">Average generation</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Dashboard Hits</span>
              <Eye className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{systemMetrics.dashboard_refreshes.toFixed(0)}</p>
            <span className="text-xs text-muted-foreground">This hour</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Storage Efficiency</span>
              <Database className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{formatNumber(systemMetrics.storage_efficiency)}%</p>
            <span className="text-xs text-muted-foreground">Optimization</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">User Engagement</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{formatNumber(systemMetrics.user_engagement)}%</p>
            <span className="text-xs text-muted-foreground">Active users</span>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">System Health</span>
              <Activity className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{formatNumber(systemMetrics.system_health)}%</p>
            <span className="text-xs text-muted-foreground">Overall status</span>
          </Card>
        </div>

        {/* System Status */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analytics System Status</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last update: {new Date().toLocaleTimeString()}
              </span>
              <Button size="sm" variant="outline" className="glass-card">
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium mb-3">Data Pipeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Data Ingestion: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>ETL Processes: Running</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Data Validation: Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span>Real-time Processing: Active</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Reporting Services</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Report Engine: Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Template System: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Export Services: Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span>Automated Jobs: Running</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Analytics Engine</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Calculation Engine: Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Visualization API: Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span>Dashboard Service: Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span>KPI Monitoring: Active</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">System Resources</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span>54%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '54%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Capabilities Overview */}
      <Card className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          Analytics Capabilities Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
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
                {Object.entries(capability.metrics).map(([key, value], i) => (
                  <div key={i} className="text-center">
                    <div className="font-medium text-primary">{value}</div>
                    <div className="text-xs text-muted-foreground capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Main Reporting Engine */}
      <ReportingEngine />

      {/* Insights & Recommendations */}
      <Card className="glass-card p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Analytics Insights & Recommendations</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              System Performance Insights
            </h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    insight.impact === 'high' ? 'bg-success/10 border-success/20' :
                    insight.impact === 'medium' ? 'bg-primary/10 border-primary/20' :
                    'bg-accent/10 border-accent/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {insight.icon}
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <p className="text-xs font-medium">{insight.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-warning" />
              Optimization Opportunities
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3 h-3 text-warning" />
                  <span className="font-medium text-warning">Storage Optimization</span>
                </div>
                <p className="text-sm">Archive older reports to improve system performance and reduce storage costs</p>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="font-medium text-primary">Report Scheduling</span>
                </div>
                <p className="text-sm">Optimize report generation times to reduce peak hour system load</p>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-accent" />
                  <span className="font-medium text-accent">User Training</span>
                </div>
                <p className="text-sm">Provide advanced analytics training to increase dashboard utilization</p>
              </div>
              
              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-success" />
                  <span className="font-medium text-success">Automation Expansion</span>
                </div>
                <p className="text-sm">Identify additional processes for automated report generation</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing reporting and analytics systems...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingAnalytics;