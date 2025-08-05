import { useState } from 'react';
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
    <div className="min-h-screen bg-background p-6">
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
        <div className="flex gap-3">
          <Button variant="default" className="glow-primary">
            Emergency Override
          </Button>
          <Button variant="outline" className="glass-card">
            Deploy Crew
          </Button>
          <Button variant="outline" className="glass-card">
            Weather Radar
          </Button>
          <Button variant="outline" className="glass-card">
            Cost Analysis
          </Button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border border-glass-border">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Interactive Map Loading...</p>
              <p className="text-sm text-muted-foreground mt-1">5 active sites tracked</p>
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