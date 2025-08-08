import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Truck, 
  MapPin, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  status: 'active' | 'warning' | 'critical' | 'success';
  icon: React.ReactNode;
  description?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [widgets] = useState<DashboardWidget[]>([
    {
      id: 'employees',
      title: 'Active Crews',
      value: '8',
      change: '+2',
      status: 'active',
      icon: <Users className="w-6 h-6" />,
      description: '6 on-site, 2 standby'
    },
    {
      id: 'vehicles',
      title: 'Fleet Status',
      value: '12/15',
      status: 'success',
      icon: <Truck className="w-6 h-6" />,
      description: '3 in maintenance'
    },
    {
      id: 'jobs',
      title: 'Active Jobs',
      value: '5',
      change: '+1',
      status: 'active',
      icon: <MapPin className="w-6 h-6" />,
      description: '2 completing today'
    },
    {
      id: 'cost-center',
      title: 'Real-Time Costs',
      value: '$12,847',
      change: '+$1,240',
      status: 'warning',
      icon: <DollarSign className="w-6 h-6" />,
      description: 'Updated 3 min ago'
    },
    {
      id: 'weather',
      title: 'Weather Alert',
      value: 'Rain Incoming',
      status: 'critical',
      icon: <AlertTriangle className="w-6 h-6" />,
      description: '15 miles NE, 2.5 hrs'
    },
    {
      id: 'productivity',
      title: 'Productivity',
      value: '94%',
      change: '+8%',
      status: 'success',
      icon: <Activity className="w-6 h-6" />,
      description: 'Above target'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success/20 text-success border-success/30';
      case 'warning': return 'bg-warning/20 text-warning border-warning/30';
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  const getChangeColor = (change?: string) => {
    if (!change) return '';
    return change.startsWith('+') ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              BLACKTOP BLACKOUT
            </h1>
            <p className="text-muted-foreground text-lg">
              Command Center // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-accent">
              <Zap className="w-4 h-4 mr-2" />
              ISAC OS v2.1
            </Badge>
            <Badge variant="outline" className="glass-card text-success">
              <Clock className="w-4 h-4 mr-2" />
              {new Date().toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Badge>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="default" className="glow-primary">
            Emergency Override
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/overwatch')}>
            OverWatch Center
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/pavement-scan')}>
            PavementScan Pro
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/atlas-hub')}>
            Atlas Hub
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/crew-management')}>
            Deploy Crew
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/weather-station')}>
            Weather Station
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/cost-control')}>
            Cost Analysis
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/mobile-app')}>
            Mobile App
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/ai-optimization')}>
            AI Optimization
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/reporting-analytics')}>
            Reports & Analytics
          </Button>
          <Button variant="outline" className="glass-card" onClick={() => navigate('/security-compliance')}>
            Security & Compliance
          </Button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {widgets.map((widget) => (
          <Card key={widget.id} className="glass-card p-6 hover:glass-elevated transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${getStatusColor(widget.status)}`}>
                {widget.icon}
              </div>
              {widget.change && (
                <Badge variant="outline" className={`${getChangeColor(widget.change)} border-current`}>
                  {widget.change}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {widget.title}
              </h3>
              <p className="text-3xl font-bold text-foreground">
                {widget.value}
              </p>
              {widget.description && (
                <p className="text-sm text-muted-foreground">
                  {widget.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* OverWatch Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-glow-accent">OverWatch Map</h3>
            <Badge variant="outline" className="glass-card text-accent">
              Real-time
            </Badge>
          </div>
          <div className="h-64 bg-muted/20 rounded-lg relative border border-glass-border overflow-hidden cursor-pointer"
               onClick={() => navigate('/overwatch')}>
            {/* Simulated Map Preview */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid-small" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-small)" />
                </svg>
              </div>
            </div>
            
            {/* Vehicle Markers */}
            <div className="absolute top-8 left-12 w-3 h-3 bg-success rounded-full animate-pulse"></div>
            <div className="absolute top-16 right-16 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <div className="absolute bottom-16 left-20 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            <div className="absolute bottom-12 right-12 w-3 h-3 bg-warning rounded-full animate-pulse"></div>
            
            {/* Center Info */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/10">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-foreground font-medium">Real-Time Tracking Active</p>
                <p className="text-sm text-muted-foreground mt-1">5 vehicles • 3 crews • 2 alerts</p>
                <p className="text-xs text-accent mt-2">Click to open OverWatch</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-glow-accent">Live Feed</h3>
            <Badge variant="outline" className="glass-card text-success">
              Connected
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-muted/20 rounded-lg border border-glass-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Crew Alpha - Site 7</span>
                <span className="text-xs text-accent">14:32</span>
              </div>
              <p className="text-sm text-muted-foreground">Base coat application completed. Temp: 165°F</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg border border-glass-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Fleet Mgmt</span>
                <span className="text-xs text-warning">14:28</span>
              </div>
              <p className="text-sm text-muted-foreground">Truck T-07 fuel level: 15%. Return to depot?</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg border border-glass-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Weather System</span>
                <span className="text-xs text-destructive">14:25</span>
              </div>
              <p className="text-sm text-muted-foreground">Precipitation alert: 2.5 hrs NE direction</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;