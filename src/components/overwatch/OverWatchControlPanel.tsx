import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Zap, 
  Radio,
  Settings,
  Power,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';
import { api } from '@/services/api';
import { SystemStatus, Alert } from '@/types/database';

interface ControlPanelProps {
  className?: string;
}

interface SystemMetrics {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  activeConnections: number;
  dataProcessingRate: number;
}

interface EmergencyControl {
  id: string;
  name: string;
  description: string;
  type: 'stop_all' | 'emergency_alert' | 'evacuation' | 'lockdown';
  enabled: boolean;
  requiresConfirmation: boolean;
}

const OverWatchControlPanel: React.FC<ControlPanelProps> = ({ className = '' }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    uptime: '72h 15m',
    cpuUsage: 24,
    memoryUsage: 68,
    networkLatency: 12,
    activeConnections: 156,
    dataProcessingRate: 2847
  });
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [emergencyControls] = useState<EmergencyControl[]>([
    {
      id: 'stop_all',
      name: 'Emergency Stop',
      description: 'Stop all active operations immediately',
      type: 'stop_all',
      enabled: true,
      requiresConfirmation: true
    },
    {
      id: 'emergency_alert',
      name: 'Emergency Broadcast',
      description: 'Send emergency alert to all crews',
      type: 'emergency_alert',
      enabled: true,
      requiresConfirmation: true
    },
    {
      id: 'evacuation',
      name: 'Site Evacuation',
      description: 'Initiate evacuation protocol',
      type: 'evacuation',
      enabled: true,
      requiresConfirmation: true
    },
    {
      id: 'lockdown',
      name: 'System Lockdown',
      description: 'Lock down all systems and vehicles',
      type: 'lockdown',
      enabled: true,
      requiresConfirmation: true
    }
  ]);

  const [operationalControls, setOperationalControls] = useState({
    autoDispatch: true,
    weatherMonitoring: true,
    costTracking: true,
    realTimeUpdates: true,
    maintenanceAlerts: true
  });

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      const [statusResponse, alertsResponse] = await Promise.all([
        api.system.getStatus(),
        api.alerts.getActive()
      ]);

      if (statusResponse.success) {
        setSystemStatus(statusResponse.data);
      }

      if (alertsResponse.success) {
        setActiveAlerts(alertsResponse.data);
      }

      // Simulate metrics updates
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(15, Math.min(85, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(45, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(5, Math.min(50, prev.networkLatency + (Math.random() - 0.5) * 5)),
        activeConnections: Math.max(100, Math.min(300, prev.activeConnections + Math.floor((Math.random() - 0.5) * 20))),
        dataProcessingRate: Math.max(2000, Math.min(5000, prev.dataProcessingRate + Math.floor((Math.random() - 0.5) * 200)))
      }));
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'offline': return 'text-destructive';
      case 'degraded': return 'text-warning';
      case 'maintenance': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      case 'degraded': return 'secondary';
      case 'maintenance': return 'outline';
      default: return 'outline';
    }
  };

  const handleEmergencyAction = async (control: EmergencyControl) => {
    if (control.requiresConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to execute ${control.name}?\n\n${control.description}\n\nThis action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      // Create emergency alert
      await api.alerts.create({
        alert_type: 'safety',
        severity: 'critical',
        title: `Emergency Action: ${control.name}`,
        message: `Emergency control ${control.name} was activated: ${control.description}`,
        related_entity_type: 'system'
      });

      // Log the emergency action
      await api.userActivity.log({
        user_id: 'system', // In production, use actual user ID
        action: `emergency_${control.type}`,
        entity_type: 'system',
        details: { control: control.name, description: control.description }
      });

      console.log(`Emergency action executed: ${control.name}`);
    } catch (error) {
      console.error('Failed to execute emergency action:', error);
    }
  };

  const handleSystemControl = async (component: string, action: 'start' | 'stop' | 'restart') => {
    try {
      let newStatus = 'online';
      if (action === 'stop') newStatus = 'offline';
      if (action === 'restart') newStatus = 'maintenance';

      await api.system.updateHeartbeat(component, newStatus);
      
      // If restarting, set back to online after a delay
      if (action === 'restart') {
        setTimeout(async () => {
          await api.system.updateHeartbeat(component, 'online');
          fetchSystemData();
        }, 3000);
      }

      fetchSystemData();
    } catch (error) {
      console.error(`Failed to ${action} ${component}:`, error);
    }
  };

  const toggleOperationalControl = (control: keyof typeof operationalControls) => {
    setOperationalControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-destructive';
    if (value >= thresholds.warning) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Status Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow-primary">OverWatch Control Center</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={() => setIsLocked(!isLocked)}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={fetchSystemData}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {systemStatus.filter(s => s.status === 'online').length}
            </div>
            <div className="text-sm text-muted-foreground">Systems Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              {systemStatus.filter(s => s.status === 'degraded').length}
            </div>
            <div className="text-sm text-muted-foreground">Degraded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">
              {activeAlerts.filter(a => a.severity === 'critical').length}
            </div>
            <div className="text-sm text-muted-foreground">Critical Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {systemMetrics.uptime}
            </div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Controls</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* System Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">System Components</h3>
            <div className="space-y-3">
              {systemStatus.map((status) => (
                <div key={status.component} className="flex items-center justify-between p-3 border border-glass-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className={`w-5 h-5 ${getStatusColor(status.status)}`} />
                    <div>
                      <div className="font-medium capitalize">{status.component.replace('_', ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        Last heartbeat: {new Date(status.last_heartbeat).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(status.status)}>
                      {status.status}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSystemControl(status.component, 'start')}
                        disabled={isLocked}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSystemControl(status.component, 'stop')}
                        disabled={isLocked}
                      >
                        <PauseCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSystemControl(status.component, 'restart')}
                        disabled={isLocked}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Emergency Controls Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card className="glass-card p-6 border-destructive">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Emergency Controls</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyControls.map((control) => (
                <div key={control.id} className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{control.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{control.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleEmergencyAction(control)}
                    disabled={!control.enabled || isLocked}
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Execute {control.name}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Operational Controls</h3>
            
            <div className="space-y-4">
              {Object.entries(operationalControls).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border border-glass-border rounded-lg">
                  <div>
                    <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-sm text-muted-foreground">
                      {key === 'autoDispatch' && 'Automatically dispatch crews based on priority'}
                      {key === 'weatherMonitoring' && 'Monitor weather conditions for safety alerts'}
                      {key === 'costTracking' && 'Real-time cost tracking and budget monitoring'}
                      {key === 'realTimeUpdates' && 'Live updates from field operations'}
                      {key === 'maintenanceAlerts' && 'Automatic maintenance scheduling alerts'}
                    </div>
                  </div>
                  
                  <Button
                    variant={value ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleOperationalControl(key as keyof typeof operationalControls)}
                    disabled={isLocked}
                  >
                    <Power className="w-4 h-4 mr-2" />
                    {value ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">System Performance</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className={`text-sm font-bold ${getMetricColor(systemMetrics.cpuUsage, { warning: 70, critical: 85 })}`}>
                      {systemMetrics.cpuUsage}%
                    </span>
                  </div>
                  <Progress value={systemMetrics.cpuUsage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className={`text-sm font-bold ${getMetricColor(systemMetrics.memoryUsage, { warning: 80, critical: 90 })}`}>
                      {systemMetrics.memoryUsage}%
                    </span>
                  </div>
                  <Progress value={systemMetrics.memoryUsage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Network Latency</span>
                    <span className={`text-sm font-bold ${getMetricColor(systemMetrics.networkLatency, { warning: 30, critical: 50 })}`}>
                      {systemMetrics.networkLatency}ms
                    </span>
                  </div>
                  <Progress value={(systemMetrics.networkLatency / 100) * 100} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Network Activity</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Connections</span>
                  <span className="text-lg font-bold text-primary">{systemMetrics.activeConnections}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Data Processing Rate</span>
                  <span className="text-lg font-bold text-accent">{systemMetrics.dataProcessingRate}/sec</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Uptime</span>
                  <span className="text-lg font-bold text-success">{systemMetrics.uptime}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OverWatchControlPanel;