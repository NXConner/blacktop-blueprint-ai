import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Cloud, 
  Sun, 
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Gauge,
  Navigation
} from 'lucide-react';
import { api } from '@/services/api';
import { WeatherData, Project } from '@/types/database';

interface WeatherMonitorProps {
  projectId?: string;
  className?: string;
}

interface WeatherAlert {
  id: string;
  type: 'temperature' | 'precipitation' | 'wind' | 'humidity' | 'visibility' | 'severe';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  action_required: boolean;
  affected_operations: string[];
}

interface WeatherForecast {
  date: string;
  temperature_high: number;
  temperature_low: number;
  condition: string;
  precipitation_chance: number;
  wind_speed: number;
  humidity: number;
  uv_index: number;
  work_suitability: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended';
}

interface OperationalImpact {
  operation: string;
  current_status: 'safe' | 'caution' | 'delayed' | 'suspended';
  impact_factors: string[];
  recommended_action: string;
  next_window?: string;
}

const WeatherMonitor: React.FC<WeatherMonitorProps> = ({ 
  projectId,
  className = '' 
}) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [operationalImpacts, setOperationalImpacts] = useState<OperationalImpact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('headquarters');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
    const interval = setInterval(loadWeatherData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [projectId, selectedLocation]);

  const loadWeatherData = async () => {
    try {
      setIsLoading(true);
      
      // Load current weather
      const weatherResponse = await api.weather.getCurrent(selectedLocation);
      if (weatherResponse.success) {
        setCurrentWeather(weatherResponse.data);
      }

      // Generate mock forecast data
      generateWeatherForecast();
      
      // Generate mock alerts
      generateWeatherAlerts();
      
      // Generate operational impacts
      generateOperationalImpacts();

      // Load projects for location selection
      const projectsResponse = await api.projects.getAll();
      if (projectsResponse.success) {
        setProjects(projectsResponse.data);
      }

    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeatherForecast = () => {
    const forecast: WeatherForecast[] = [];
    const conditions = ['sunny', 'partly_cloudy', 'cloudy', 'rainy', 'stormy'];
    const workSuitability = ['excellent', 'good', 'fair', 'poor', 'not_recommended'];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const baseTemp = 65 + Math.random() * 20;
      const precipChance = Math.random() * 100;
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      let suitability = workSuitability[0]; // excellent
      if (precipChance > 70 || condition === 'stormy') suitability = workSuitability[4]; // not_recommended
      else if (precipChance > 50) suitability = workSuitability[3]; // poor
      else if (precipChance > 30) suitability = workSuitability[2]; // fair
      else if (precipChance > 10) suitability = workSuitability[1]; // good

      forecast.push({
        date: date.toISOString(),
        temperature_high: Math.round(baseTemp + Math.random() * 10),
        temperature_low: Math.round(baseTemp - Math.random() * 15),
        condition,
        precipitation_chance: Math.round(precipChance),
        wind_speed: Math.round(5 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40),
        uv_index: Math.round(1 + Math.random() * 10),
        work_suitability: suitability as 'excellent' | 'good' | 'fair' | 'poor' | 'hazardous'
      });
    }
    
    setWeatherForecast(forecast);
  };

  const generateWeatherAlerts = () => {
    const alerts: WeatherAlert[] = [];
    
    // Generate some mock alerts based on weather conditions
    if (Math.random() > 0.7) {
      alerts.push({
        id: '1',
        type: 'precipitation',
        severity: 'high',
        title: 'Heavy Rain Warning',
        message: 'Heavy rainfall expected in the next 2 hours. Consider suspending asphalt operations.',
        timestamp: new Date().toISOString(),
        action_required: true,
        affected_operations: ['paving', 'crack_sealing', 'surface_prep']
      });
    }

    if (Math.random() > 0.8) {
      alerts.push({
        id: '2',
        type: 'temperature',
        severity: 'medium',
        title: 'Temperature Advisory',
        message: 'Temperatures will drop below optimal range for asphalt work after 4 PM.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        action_required: false,
        affected_operations: ['paving', 'hot_mix']
      });
    }

    if (Math.random() > 0.9) {
      alerts.push({
        id: '3',
        type: 'wind',
        severity: 'critical',
        title: 'High Wind Alert',
        message: 'Wind speeds exceeding 25 mph. Suspend all overhead operations immediately.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        action_required: true,
        affected_operations: ['crane_work', 'material_transport', 'safety_flagging']
      });
    }

    setWeatherAlerts(alerts);
  };

  const generateOperationalImpacts = () => {
    const impacts: OperationalImpact[] = [
      {
        operation: 'Asphalt Paving',
        current_status: 'safe',
        impact_factors: ['Temperature: Optimal', 'Precipitation: None', 'Wind: Light'],
        recommended_action: 'Continue operations as planned',
        next_window: undefined
      },
      {
        operation: 'Crack Sealing',
        current_status: 'caution',
        impact_factors: ['Humidity: High (85%)', 'Temperature: Acceptable'],
        recommended_action: 'Monitor conditions closely, reduce application rate',
        next_window: undefined
      },
      {
        operation: 'Surface Preparation',
        current_status: 'delayed',
        impact_factors: ['Recent precipitation', 'Surface moisture present'],
        recommended_action: 'Wait for surface to dry completely',
        next_window: 'Tomorrow 9:00 AM (if no rain)'
      },
      {
        operation: 'Material Transport',
        current_status: 'safe',
        impact_factors: ['Visibility: Good', 'Wind: Acceptable', 'Road conditions: Dry'],
        recommended_action: 'Normal operations permitted',
        next_window: undefined
      }
    ];

    setOperationalImpacts(impacts);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'partly_cloudy': return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'stormy': return <Zap className="w-6 h-6 text-purple-500" />;
      case 'snowy': return <Snowflake className="w-6 h-6 text-blue-300" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-destructive bg-destructive/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-warning bg-warning/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-muted bg-muted/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-success';
      case 'caution': return 'text-warning';
      case 'delayed': return 'text-orange-500';
      case 'suspended': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe': return 'default';
      case 'caution': return 'secondary';
      case 'delayed': return 'outline';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-orange-500';
      case 'not_recommended': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setWeatherAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Conditions Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {currentWeather ? getWeatherIcon(currentWeather.condition || 'sunny') : <Sun className="w-6 h-6" />}
            <h2 className="text-2xl font-bold text-glow-primary">Weather Center</h2>
            <Badge variant="outline" className="glass-card text-accent">
              <MapPin className="w-3 h-3 mr-1" />
              Live Monitoring
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="glass-card">
              <Clock className="w-3 h-3 mr-1" />
              Updated {new Date().toLocaleTimeString()}
            </Badge>
            {weatherAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {weatherAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length} Active Alerts
              </Badge>
            )}
          </div>
        </div>

        {/* Current Weather Display */}
        {currentWeather && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="glass-card p-4 md:col-span-2">
              <div className="flex items-center gap-3">
                {getWeatherIcon(currentWeather.condition || 'sunny')}
                <div>
                  <p className="text-3xl font-bold">{currentWeather.temperature?.toFixed(1) || '72'}°F</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {currentWeather.condition?.replace('_', ' ') || 'Partly Cloudy'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Humidity</span>
              </div>
              <p className="text-xl font-bold">{currentWeather.humidity?.toFixed(0) || '65'}%</p>
            </Card>

            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Wind</span>
              </div>
              <p className="text-xl font-bold">{currentWeather.wind_speed?.toFixed(0) || '8'} mph</p>
            </Card>

            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Precipitation</span>
              </div>
              <p className="text-xl font-bold">{currentWeather.precipitation?.toFixed(1) || '0.0'}"</p>
            </Card>

            <Card className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Visibility</span>
              </div>
              <p className="text-xl font-bold">{(Math.random() * 5 + 5).toFixed(1)} mi</p>
            </Card>
          </div>
        )}
      </Card>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <div className="space-y-3">
          {weatherAlerts.map((alert) => (
            <Alert key={alert.id} className={`${getAlertColor(alert.severity)} border-l-4`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>{alert.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {alert.severity}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              </AlertTitle>
              <AlertDescription>
                <p className="mb-2">{alert.message}</p>
                <div className="text-xs text-muted-foreground">
                  Affected Operations: {alert.affected_operations.join(', ')}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            7-Day Forecast
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Operational Impact
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Live Monitoring
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Work Planning
          </TabsTrigger>
        </TabsList>

        {/* 7-Day Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weatherForecast.map((day, index) => (
              <Card key={index} className="glass-card p-4">
                <div className="text-center">
                  <div className="text-sm font-medium mb-2">
                    {index === 0 ? 'Today' : 
                     index === 1 ? 'Tomorrow' : 
                     new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
                    }
                  </div>
                  
                  <div className="flex justify-center mb-3">
                    {getWeatherIcon(day.condition)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-lg font-bold">
                      {day.temperature_high}°<span className="text-muted-foreground">/{day.temperature_low}°</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>☔ {day.precipitation_chance}%</div>
                      <div>💨 {day.wind_speed} mph</div>
                      <div>💧 {day.humidity}%</div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSuitabilityColor(day.work_suitability)}`}
                    >
                      {day.work_suitability.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Operational Impact Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {operationalImpacts.map((impact, index) => (
              <Card key={index} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{impact.operation}</h3>
                  <Badge variant={getStatusBadge(impact.current_status) as "default" | "destructive" | "outline" | "secondary"}>
                    {impact.current_status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Impact Factors</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {impact.impact_factors.map((factor, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Recommended Action</h4>
                    <p className="text-sm text-muted-foreground">{impact.recommended_action}</p>
                  </div>
                  
                  {impact.next_window && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Next Safe Window</h4>
                      <p className="text-sm text-accent">{impact.next_window}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Trends */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">24-Hour Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-bold">+5°F</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Humidity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-warning" />
                    <span className="text-sm font-bold">-8%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Wind Speed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-bold">+12 mph</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Monitoring Stations */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Monitoring Stations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Headquarters Station</span>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Temp:</span>
                      <span className="ml-1 font-medium">72°F</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity:</span>
                      <span className="ml-1 font-medium">65%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Wind:</span>
                      <span className="ml-1 font-medium">8 mph</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Highway 101 Station</span>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Temp:</span>
                      <span className="ml-1 font-medium">74°F</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Humidity:</span>
                      <span className="ml-1 font-medium">62%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Wind:</span>
                      <span className="ml-1 font-medium">12 mph</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Industrial District</span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Offline
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Last reading: 2 hours ago</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Work Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimal Work Windows */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Optimal Work Windows</h3>
              <div className="space-y-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="font-medium text-success">Today 8:00 AM - 6:00 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Excellent conditions for all operations</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Temp: 65-75°F • Humidity: 45-65% • No precipitation
                  </div>
                </div>
                
                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    <span className="font-medium text-warning">Tomorrow 10:00 AM - 3:00 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Limited window due to afternoon rain</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Rain expected after 4:00 PM • Complete operations early
                  </div>
                </div>
                
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-destructive">Thursday - Not Recommended</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Heavy rain and high winds forecast</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Consider rescheduling outdoor operations
                  </div>
                </div>
              </div>
            </Card>

            {/* Operation Recommendations */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Operation Recommendations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Asphalt Paving</span>
                    <Badge variant="default" className="text-xs bg-success text-white">Proceed</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ideal temperature and dry conditions. Complete by 5:00 PM.
                  </p>
                </div>
                
                <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Crack Sealing</span>
                    <Badge variant="outline" className="text-xs text-warning">Monitor</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    High humidity may affect curing. Reduce application rate.
                  </p>
                </div>
                
                <div className="p-3 bg-muted/10 rounded-lg border border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Surface Preparation</span>
                    <Badge variant="destructive" className="text-xs">Delay</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Surface moisture detected. Wait for complete drying.
                  </p>
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
            <p className="text-sm text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMonitor;