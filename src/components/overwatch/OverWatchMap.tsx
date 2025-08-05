import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Truck, 
  Users, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Navigation,
  Activity,
  Settings
} from 'lucide-react';
import { api } from '@/services/api';
import { LiveVehicleLocation, LiveCrewStatus, Alert } from '@/types/database';

interface OverWatchMapProps {
  className?: string;
  height?: string;
  companyId?: string;
}

interface MapState {
  center: [number, number];
  zoom: number;
  vehicles: LiveVehicleLocation[];
  crews: LiveCrewStatus[];
  alerts: Alert[];
  selectedEntity: string | null;
  followMode: boolean;
  lastUpdate: Date;
}

const OverWatchMap: React.FC<OverWatchMapProps> = ({ 
  className = '', 
  height = '600px',
  companyId 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState<MapState>({
    center: [40.7128, -74.0060], // Default to NYC
    zoom: 12,
    vehicles: [],
    crews: [],
    alerts: [],
    selectedEntity: null,
    followMode: false,
    lastUpdate: new Date()
  });

  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  // Simulate real-time updates (in production, use WebSocket or real-time subscriptions)
  useEffect(() => {
    const updateInterval = setInterval(async () => {
      await fetchLiveData();
    }, 5000); // Update every 5 seconds

    // Initial load
    fetchLiveData();

    return () => clearInterval(updateInterval);
  }, [companyId]);

  const fetchLiveData = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Fetch current vehicle locations
      const vehiclesResponse = await api.gps.getCurrentLocations();
      
      // Fetch crew status
      const crewsResponse = await api.crews.getAll(companyId);
      
      // Fetch active alerts
      const alertsResponse = await api.alerts.getActive();

      if (vehiclesResponse.success && crewsResponse.success && alertsResponse.success) {
        setMapState(prev => ({
          ...prev,
          vehicles: vehiclesResponse.data || [],
          crews: crewsResponse.data || [],
          alerts: alertsResponse.data || [],
          lastUpdate: new Date()
        }));
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    setMapState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }));
  };

  const handleZoomOut = () => {
    setMapState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 1) }));
  };

  const handleRecenter = () => {
    setMapState(prev => ({
      ...prev,
      center: [40.7128, -74.0060],
      zoom: 12,
      selectedEntity: null
    }));
  };

  const handleEntitySelect = (entityId: string, entityType: 'vehicle' | 'crew' | 'alert') => {
    setMapState(prev => ({ ...prev, selectedEntity: entityId }));
    
    // Center map on selected entity
    if (entityType === 'vehicle') {
      const vehicle = mapState.vehicles.find(v => v.vehicle_id === entityId);
      if (vehicle) {
        setMapState(prev => ({
          ...prev,
          center: vehicle.location.coordinates,
          zoom: 15
        }));
      }
    }
  };

  const toggleFollowMode = () => {
    setMapState(prev => ({ ...prev, followMode: !prev.followMode }));
  };

  const getVehicleStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'idle': return 'text-warning';
      case 'maintenance': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={`glass-elevated ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-glow-accent">OverWatch Map</h3>
            <Badge 
              variant="outline" 
              className={`glass-card ${
                connectionStatus === 'connected' ? 'text-success' : 
                connectionStatus === 'disconnected' ? 'text-destructive' : 
                'text-warning'
              }`}
            >
              <Activity className="w-3 h-3 mr-1" />
              {connectionStatus}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={toggleFollowMode}
            >
              <Navigation className={`w-4 h-4 ${mapState.followMode ? 'text-primary' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={handleRecenter}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>{mapState.vehicles.length} Vehicles</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{mapState.crews.length} Crews</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{mapState.alerts.filter(a => a.severity === 'critical').length} Critical Alerts</span>
          </div>
          <div className="ml-auto">
            Last Update: {mapState.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="bg-muted/10 relative overflow-hidden"
          style={{ height }}
        >
          {/* Simulated Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          {/* Vehicle Markers */}
          {mapState.vehicles.map((vehicle, index) => (
            <div
              key={vehicle.vehicle_id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                ${mapState.selectedEntity === vehicle.vehicle_id ? 'z-20' : 'z-10'}`}
              style={{
                left: `${30 + (index % 5) * 150}px`,
                top: `${100 + Math.floor(index / 5) * 120}px`
              }}
              onClick={() => handleEntitySelect(vehicle.vehicle_id, 'vehicle')}
            >
              <div className={`p-2 rounded-full bg-background border-2 border-primary
                ${mapState.selectedEntity === vehicle.vehicle_id ? 'ring-2 ring-primary' : ''}`}>
                <Truck className={`w-5 h-5 ${getVehicleStatusColor(vehicle.status)}`} />
              </div>
              
              {mapState.selectedEntity === vehicle.vehicle_id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30">
                  <div className="bg-background border border-glass-border rounded-lg p-3 min-w-48 shadow-lg">
                    <h4 className="font-semibold text-sm">{vehicle.vehicle_number}</h4>
                    <p className="text-xs text-muted-foreground">Speed: {vehicle.speed} mph</p>
                    <p className="text-xs text-muted-foreground">Heading: {vehicle.heading}°</p>
                    <p className="text-xs text-muted-foreground">Status: {vehicle.status}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated: {new Date(vehicle.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Crew Markers */}
          {mapState.crews.map((crew, index) => (
            <div
              key={crew.crew_id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                ${mapState.selectedEntity === crew.crew_id ? 'z-20' : 'z-10'}`}
              style={{
                left: `${100 + (index % 4) * 180}px`,
                top: `${200 + Math.floor(index / 4) * 140}px`
              }}
              onClick={() => handleEntitySelect(crew.crew_id, 'crew')}
            >
              <div className={`p-2 rounded-full bg-background border-2 border-accent
                ${mapState.selectedEntity === crew.crew_id ? 'ring-2 ring-accent' : ''}`}>
                <Users className="w-5 h-5 text-accent" />
              </div>
              
              {mapState.selectedEntity === crew.crew_id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30">
                  <div className="bg-background border border-glass-border rounded-lg p-3 min-w-48 shadow-lg">
                    <h4 className="font-semibold text-sm">{crew.crew_name}</h4>
                    <p className="text-xs text-muted-foreground">Size: {crew.members_count} members</p>
                    <p className="text-xs text-muted-foreground">Status: {crew.status}</p>
                    {crew.current_project && (
                      <p className="text-xs text-muted-foreground">Project: {crew.current_project}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Alert Markers */}
          {mapState.alerts.map((alert, index) => (
            <div
              key={alert.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
                ${mapState.selectedEntity === alert.id ? 'z-20' : 'z-10'}`}
              style={{
                left: `${200 + (index % 3) * 200}px`,
                top: `${150 + Math.floor(index / 3) * 160}px`
              }}
              onClick={() => handleEntitySelect(alert.id, 'alert')}
            >
              <div className={`p-2 rounded-full bg-background border-2 border-destructive animate-pulse
                ${mapState.selectedEntity === alert.id ? 'ring-2 ring-destructive' : ''}`}>
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              
              {mapState.selectedEntity === alert.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-30">
                  <div className="bg-background border border-glass-border rounded-lg p-3 min-w-56 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading OverWatch data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 border border-glass-border rounded-lg p-3">
          <h4 className="text-sm font-semibold mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-success" />
              <span>Active Vehicle</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              <span>Crew Location</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span>Critical Alert</span>
            </div>
          </div>
        </div>

        {/* Coordinates Display */}
        <div className="absolute bottom-4 right-4 bg-background/90 border border-glass-border rounded-lg p-2">
          <div className="text-xs text-muted-foreground">
            <div>Zoom: {mapState.zoom}</div>
            <div>Center: {mapState.center[0].toFixed(4)}, {mapState.center[1].toFixed(4)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OverWatchMap;