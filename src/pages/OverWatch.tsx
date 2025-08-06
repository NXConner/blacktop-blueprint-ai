import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Monitor, 
  MapPin, 
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import OverWatchMap from '@/components/overwatch/OverWatchMap';
import OverWatchControlPanel from '@/components/overwatch/OverWatchControlPanel';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

const OverWatch: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-safe">
      <ResponsiveContainer className="py-6">
        {/* Header */}
        <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              OVERWATCH SYSTEM
            </h1>
            <p className="text-muted-foreground text-lg">
              Real-Time Operations Command Center // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-accent">
              <Eye className="w-4 h-4 mr-2" />
              Active Monitoring
            </Badge>
            <Badge variant="outline" className="glass-card text-success">
              <Monitor className="w-4 h-4 mr-2" />
              All Systems Online
            </Badge>
            <Button
              variant="outline"
              className="glass-card"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Control Center
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alert Management
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Map + Summary */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Main Map */}
              <div className="lg:col-span-2">
                <OverWatchMap 
                  height={isFullscreen ? "calc(100vh - 200px)" : "600px"}
                  className="w-full"
                />
              </div>

              {/* Live Status Panel */}
              <div className="space-y-4">
                {/* System Status Summary */}
                <div className="glass-elevated p-6">
                  <h3 className="text-lg font-semibold mb-4 text-glow-accent">System Status</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">OverWatch Hub</span>
                      <Badge variant="default" className="text-xs">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GPS Tracking</span>
                      <Badge variant="default" className="text-xs">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weather Monitor</span>
                      <Badge variant="default" className="text-xs">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">PavementScan Pro</span>
                      <Badge variant="secondary" className="text-xs">Standby</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Atlas Hub</span>
                      <Badge variant="default" className="text-xs">Online</Badge>
                    </div>
                  </div>
                </div>

                {/* Active Operations */}
                <div className="glass-elevated p-6">
                  <h3 className="text-lg font-semibold mb-4 text-glow-accent">Active Operations</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/20 rounded-lg border border-glass-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Site Alpha-7</span>
                        <Badge variant="default" className="text-xs">Active</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Resurfacing - 78% Complete</p>
                      <p className="text-xs text-muted-foreground">Crew: Alpha Team (5 members)</p>
                    </div>
                    
                    <div className="p-3 bg-muted/20 rounded-lg border border-glass-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Site Beta-3</span>
                        <Badge variant="secondary" className="text-xs">Prep</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Patching - Starting Soon</p>
                      <p className="text-xs text-muted-foreground">Crew: Beta Team (4 members)</p>
                    </div>
                    
                    <div className="p-3 bg-muted/20 rounded-lg border border-glass-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Site Gamma-2</span>
                        <Badge variant="outline" className="text-xs">Paused</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Weather Hold</p>
                      <p className="text-xs text-muted-foreground">Next Check: 14:30</p>
                    </div>
                  </div>
                </div>

                {/* Weather Conditions */}
                <div className="glass-elevated p-6">
                  <h3 className="text-lg font-semibold mb-4 text-glow-accent">Weather Conditions</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Temperature</span>
                      <span className="text-sm font-medium">72°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Humidity</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Wind Speed</span>
                      <span className="text-sm font-medium">8 mph</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Precipitation</span>
                      <span className="text-sm font-medium text-success">0%</span>
                    </div>
                    
                    <div className="mt-3 p-2 bg-success/10 border border-success/30 rounded text-xs text-success">
                      ✓ Optimal conditions for asphalt operations
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-elevated p-6">
                  <h3 className="text-lg font-semibold mb-4 text-glow-accent">Quick Actions</h3>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start glass-card">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh All Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start glass-card">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start glass-card">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      View All Alerts
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Control Center Tab */}
          <TabsContent value="control" className="space-y-6">
            <OverWatchControlPanel />
          </TabsContent>

          {/* Alert Management Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Alerts */}
              <div className="glass-elevated p-6">
                <h3 className="text-lg font-semibold mb-4 text-glow-accent">Active Alerts</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="destructive" className="mb-2">Critical</Badge>
                        <h4 className="font-semibold">Vehicle T-07 Fuel Low</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">2 min ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Fuel level at 8%. Return to depot immediately.</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="destructive">Acknowledge</Button>
                      <Button size="sm" variant="outline">Dispatch Fuel</Button>
                    </div>
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="secondary" className="mb-2">Warning</Badge>
                        <h4 className="font-semibold">Weather Change Incoming</h4>
                      </div>
                      <span className="text-xs text-muted-foreground">15 min ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Precipitation probability rising to 40% in next 2 hours.</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">View Radar</Button>
                      <Button size="sm" variant="outline">Notify Crews</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert History */}
              <div className="glass-elevated p-6">
                <h3 className="text-lg font-semibold mb-4 text-glow-accent">Recent Activity</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Alpha Team completed Section A-7</p>
                      <p className="text-xs text-muted-foreground">45 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Vehicle P-12 maintenance scheduled</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">New project Site Delta-5 created</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">Weather alert resolved</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isFullscreen && (
          <div className="fixed top-6 right-6 z-60">
            <Button
              variant="outline"
              className="glass-card"
              onClick={toggleFullscreen}
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default OverWatch;