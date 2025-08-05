import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target,
  Activity,
  AlertTriangle,
  Clock,
  Settings,
  Shield,
  Calendar,
  BarChart3,
  UserCheck,
  Phone
} from 'lucide-react';
import CrewDeployment from '@/components/crew/CrewDeployment';
import { api } from '@/services/api';

const CrewManagement: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    crews_active: 0,
    workers_deployed: 0,
    emergency_alerts: 0,
    system_health: 'optimal'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Simulate system status data
      setSystemStatus({
        crews_active: Math.floor(Math.random() * 8) + 3,
        workers_deployed: Math.floor(Math.random() * 30) + 15,
        emergency_alerts: Math.floor(Math.random() * 3),
        system_health: Math.random() > 0.1 ? 'optimal' : 'warning'
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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              CREW DEPLOYMENT
            </h1>
            <p className="text-muted-foreground text-lg">
              Workforce Management & Real-Time Deployment // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-success">
              <UserCheck className="w-4 h-4 mr-2" />
              {systemStatus.workers_deployed} Deployed
            </Badge>
            <Badge 
              variant={getHealthBadge(systemStatus.system_health) as any}
              className={`glass-card ${getHealthColor(systemStatus.system_health)}`}
            >
              <Activity className="w-4 h-4 mr-2" />
              System {systemStatus.system_health}
            </Badge>
            {systemStatus.emergency_alerts > 0 && (
              <Badge variant="destructive" className="glass-card animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {systemStatus.emergency_alerts} Alerts
              </Badge>
            )}
            <Button
              variant="outline"
              className="glass-card"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Crews</p>
                <p className="text-xl font-bold">{systemStatus.crews_active}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Workers</p>
                <p className="text-xl font-bold">{systemStatus.workers_deployed}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-xl font-bold">99.8%</p>
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
                <p className="text-xl font-bold">94%</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      {!isLoading && (
        <Tabs defaultValue="deployment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deployment" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Deployment Center
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Workforce Analytics
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Emergency Response
            </TabsTrigger>
          </TabsList>

          {/* Deployment Center Tab */}
          <TabsContent value="deployment">
            <CrewDeployment className="w-full" />
          </TabsContent>

          {/* Workforce Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Daily Productivity</span>
                    <span className="text-lg font-bold text-success">127%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Task Completion Rate</span>
                    <span className="text-lg font-bold text-primary">89%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Safety Incidents</span>
                    <span className="text-lg font-bold text-success">0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Average Response Time</span>
                    <span className="text-lg font-bold text-accent">4.2min</span>
                  </div>
                </div>
              </Card>

              {/* Resource Utilization */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Crew Utilization</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Equipment Usage</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Material Efficiency</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Highway Crew deployed to Route 95</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                    <Badge variant="default" className="text-xs">Deployed</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Parking Lot Team completed Phase 1</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Equipment maintenance scheduled</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Scheduled</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Emergency Response Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emergency Protocols */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-destructive" />
                  Emergency Protocols
                </h3>
                <div className="space-y-4">
                  <Button className="w-full justify-start bg-destructive hover:bg-destructive/90">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Stop All Operations
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Emergency Services
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Recall All Crews
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Activate Backup Systems
                  </Button>
                </div>
              </Card>

              {/* Response Teams */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Emergency Response Teams</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Alpha Response Team</span>
                      <Badge variant="default" className="text-xs">Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Emergency repair specialists • 4 members</p>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Bravo Safety Team</span>
                      <Badge variant="default" className="text-xs">Standby</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Safety and evacuation • 3 members</p>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Charlie Medical Team</span>
                      <Badge variant="outline" className="text-xs">On Call</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">First aid and medical response • 2 members</p>
                  </div>
                </div>
              </Card>

              {/* System Status */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">System Status Monitor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="font-medium text-success">Communication Systems</span>
                    </div>
                    <p className="text-sm text-muted-foreground">All radio channels operational</p>
                  </div>
                  
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="font-medium text-success">GPS Tracking</span>
                    </div>
                    <p className="text-sm text-muted-foreground">All units reporting location</p>
                  </div>
                  
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="font-medium text-success">Alert System</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Emergency alerts functional</p>
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
            <p className="text-muted-foreground">Loading crew management system...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewManagement;