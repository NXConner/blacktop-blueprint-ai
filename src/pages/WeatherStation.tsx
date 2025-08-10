import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Settings,
  Activity,
  Calendar,
  Zap,
  MapPin,
  Shield,
  Eye,
  TrendingUp
} from 'lucide-react';
import WeatherMonitor from '@/components/weather/WeatherMonitor';
import RadarMap from '@/components/map/RadarMap';

const WeatherStation: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    stations_online: 0,
    weather_alerts: 0,
    forecast_accuracy: 0,
    system_health: 'optimal'
  });
  const [environmentalConditions, setEnvironmentalConditions] = useState({
    air_quality: 'good',
    uv_index: 0,
    atmospheric_pressure: 0,
    dew_point: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      // Simulate system status data
      setSystemStatus({
        stations_online: Math.floor(Math.random() * 3) + 8,
        weather_alerts: Math.floor(Math.random() * 5),
        forecast_accuracy: 85 + Math.random() * 10,
        system_health: Math.random() > 0.1 ? 'optimal' : 'warning'
      });

      setEnvironmentalConditions({
        air_quality: Math.random() > 0.3 ? 'good' : 'moderate',
        uv_index: Math.floor(Math.random() * 10) + 1,
        atmospheric_pressure: 29.8 + Math.random() * 0.6,
        dew_point: 45 + Math.random() * 20
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

  const getAirQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-success';
      case 'moderate': return 'text-warning';
      case 'unhealthy': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getUVIndexColor = (index: number) => {
    if (index <= 2) return 'text-success';
    if (index <= 5) return 'text-warning';
    if (index <= 7) return 'text-orange-500';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              WEATHER STATION
            </h1>
            <p className="text-muted-foreground text-lg">
              Environmental Monitoring & Operational Planning // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-success">
              <Activity className="w-4 h-4 mr-2" />
              {systemStatus.stations_online} Stations Online
            </Badge>
            <Badge 
              variant={getHealthBadge(systemStatus.system_health) as "default" | "destructive" | "outline" | "secondary"}
              className={`glass-card ${getHealthColor(systemStatus.system_health)}`}
            >
              <Shield className="w-4 h-4 mr-2" />
              System {systemStatus.system_health}
            </Badge>
            {systemStatus.weather_alerts > 0 && (
              <Badge variant="destructive" className="glass-card animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {systemStatus.weather_alerts} Active Alerts
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

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Cloud className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stations</p>
                <p className="text-xl font-bold">{systemStatus.stations_online}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-xl font-bold">{systemStatus.forecast_accuracy.toFixed(0)}%</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                environmentalConditions.air_quality === 'good' ? 'bg-success/20' : 'bg-warning/20'
              }`}>
                <Wind className={`w-4 h-4 ${getAirQualityColor(environmentalConditions.air_quality)}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Air Quality</p>
                <p className={`text-xl font-bold capitalize ${getAirQualityColor(environmentalConditions.air_quality)}`}>
                  {environmentalConditions.air_quality}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                <Eye className={`w-4 h-4 ${getUVIndexColor(environmentalConditions.uv_index)}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">UV Index</p>
                <p className={`text-xl font-bold ${getUVIndexColor(environmentalConditions.uv_index)}`}>
                  {environmentalConditions.uv_index}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                <Thermometer className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pressure</p>
                <p className="text-xl font-bold">{environmentalConditions.atmospheric_pressure.toFixed(1)}"</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      {!isLoading && (
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Weather Monitor
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Environmental Analysis
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alert Management
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Radar & Map
            </TabsTrigger>
          </TabsList>

          {/* Weather Monitor Tab */}
          <TabsContent value="monitor">
            <WeatherMonitor className="w-full" />
          </TabsContent>

          {/* Radar Tab */}
          <TabsContent value="radar">
            <RadarMap className="w-full" />
          </TabsContent>

          {/* Environmental Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Environmental Trends */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Environmental Trends</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Temperature Stability</span>
                    <span className="text-lg font-bold text-success">Stable</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Humidity Range</span>
                    <span className="text-lg font-bold text-primary">45-75%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Wind Consistency</span>
                    <span className="text-lg font-bold text-warning">Variable</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm font-medium">Precipitation Pattern</span>
                    <span className="text-lg font-bold text-accent">Normal</span>
                  </div>
                </div>
              </Card>

              {/* Air Quality Monitoring */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Air Quality Monitoring</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">PM2.5 Particles</span>
                      <span className="text-sm font-medium">12 μg/m³</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">PM10 Particles</span>
                      <span className="text-sm font-medium">28 μg/m³</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Ozone Level</span>
                      <span className="text-sm font-medium">65 ppb</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Historical Data */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Historical Weather Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Temperature</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">7-day avg:</span>
                        <span className="font-medium">68°F</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly avg:</span>
                        <span className="font-medium">72°F</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yearly avg:</span>
                        <span className="font-medium">65°F</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Precipitation</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">7-day total:</span>
                        <span className="font-medium">1.2"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly total:</span>
                        <span className="font-medium">3.8"</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yearly total:</span>
                        <span className="font-medium">42.5"</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Wind</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">7-day avg:</span>
                        <span className="font-medium">8.5 mph</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max gust:</span>
                        <span className="font-medium">32 mph</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prevailing dir:</span>
                        <span className="font-medium">SW</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Alert Management Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alert Configuration */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Alert Configuration
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Temperature Thresholds</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>High: &gt; 85°F • Low: &lt; 35°F</div>
                      <div>Optimal range: 50°F - 80°F</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Precipitation Alerts</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Heavy rain: &gt; 0.5&quot; per hour</div>
                      <div>Storm warning: &gt; 1.0&quot; per hour</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Wind Speed Alerts</span>
                      <Badge variant="default" className="text-xs">Active</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>High wind: &gt; 20 mph sustained</div>
                      <div>Critical: &gt; 35 mph sustained</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <span className="font-medium">Email Alerts</span>
                      <p className="text-sm text-muted-foreground">Critical weather notifications</p>
                    </div>
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <span className="font-medium">SMS Alerts</span>
                      <p className="text-sm text-muted-foreground">Emergency notifications only</p>
                    </div>
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <span className="font-medium">Dashboard Alerts</span>
                      <p className="text-sm text-muted-foreground">Real-time system notifications</p>
                    </div>
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <div>
                      <span className="font-medium">Mobile Push</span>
                      <p className="text-sm text-muted-foreground">Field team notifications</p>
                    </div>
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                  </div>
                </div>
              </Card>

              {/* System Health */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Weather Station Network</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="font-medium text-success">Primary Station</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Location: Headquarters</div>
                      <div>Status: Online • Data Quality: Excellent</div>
                      <div>Last Update: 30 seconds ago</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="font-medium text-success">Remote Station A</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Location: Highway 101</div>
                      <div>Status: Online • Data Quality: Good</div>
                      <div>Last Update: 1 minute ago</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                      <span className="font-medium text-warning">Remote Station B</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Location: Industrial District</div>
                      <div>Status: Intermittent • Data Quality: Fair</div>
                      <div>Last Update: 15 minutes ago</div>
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
            <p className="text-muted-foreground">Loading weather station data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherStation;