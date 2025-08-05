import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  MapPin, 
  Wrench, 
  Fuel,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Activity,
  Navigation,
  Gauge
} from 'lucide-react';
import { api } from '@/services/api';
import { Vehicle, MaintenanceRecord, GPSTracking } from '@/types/database';

interface FleetDashboardProps {
  companyId?: string;
  className?: string;
}

interface VehicleWithStatus extends Vehicle {
  maintenance_status: 'overdue' | 'due_soon' | 'current';
  current_location?: GPSTracking;
  recent_maintenance?: MaintenanceRecord[];
}

interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  availableVehicles: number;
  avgFuelLevel: number;
  totalMileage: number;
  maintenanceOverdue: number;
  utilization: number;
}

const FleetDashboard: React.FC<FleetDashboardProps> = ({ 
  companyId,
  className = '' 
}) => {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleWithStatus[]>([]);
  const [fleetMetrics, setFleetMetrics] = useState<FleetMetrics>({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    availableVehicles: 0,
    avgFuelLevel: 0,
    totalMileage: 0,
    maintenanceOverdue: 0,
    utilization: 0
  });
  
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFleetData();
  const loadFleetData = useCallback(async () => {
    try {
      const response = await api.vehicles.getFleetStatus(companyId);
      if (response.success) {
        const vehiclesWithLocation = await Promise.all(
          response.data.map(async (vehicle: Vehicle) => {
            // Get current location
            const locationResponse = await api.gps.getVehicleHistory(vehicle.id, 1);
            const currentLocation = locationResponse.success && locationResponse.data.length > 0
              ? locationResponse.data[0]
              : null;

            // Get recent maintenance
            const maintenanceResponse = await api.maintenance.getVehicleHistory(vehicle.id);
            const recentMaintenance = maintenanceResponse.success 
              ? maintenanceResponse.data.slice(0, 3)
              : [];

            return {
              ...vehicle,
              current_location: currentLocation,
              recent_maintenance: recentMaintenance
            };
          })
        );

        setVehicles(vehiclesWithLocation);
        calculateFleetMetrics(vehiclesWithLocation);
      }
    } catch (error) {
      console.error('Failed to load fleet data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const filterVehicles = useCallback(() => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.vehicle_type === typeFilter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    loadFleetData();
    const interval = setInterval(loadFleetData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadFleetData]);

  useEffect(() => {
    filterVehicles();
  }, [filterVehicles]);

  const calculateFleetMetrics = (vehicleData: VehicleWithStatus[]) => {
    const metrics: FleetMetrics = {
      totalVehicles: vehicleData.length,
      activeVehicles: vehicleData.filter(v => v.status === 'in_use').length,
      maintenanceVehicles: vehicleData.filter(v => v.status === 'maintenance').length,
      availableVehicles: vehicleData.filter(v => v.status === 'available').length,
      avgFuelLevel: vehicleData.reduce((sum, v) => sum + v.current_fuel_level, 0) / vehicleData.length,
      totalMileage: vehicleData.reduce((sum, v) => sum + v.odometer_reading, 0),
      maintenanceOverdue: vehicleData.filter(v => v.maintenance_status === 'overdue').length,
      utilization: (vehicleData.filter(v => v.status === 'in_use').length / vehicleData.length) * 100
    };

    setFleetMetrics(metrics);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-success';
      case 'in_use': return 'text-primary';
      case 'maintenance': return 'text-warning';
      case 'out_of_service': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'in_use': return 'secondary';
      case 'maintenance': return 'outline';
      case 'out_of_service': return 'destructive';
      default: return 'outline';
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'text-success';
      case 'due_soon': return 'text-warning';
      case 'overdue': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level <= 15) return 'text-destructive';
    if (level <= 30) return 'text-warning';
    return 'text-success';
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'truck': return <Truck className="w-4 h-4" />;
      case 'paver': return <Truck className="w-4 h-4" />;
      case 'roller': return <Truck className="w-4 h-4" />;
      default: return <Truck className="w-4 h-4" />;
    }
  };

  const updateVehicleStatus = async (vehicleId: string, newStatus: string) => {
    try {
      const response = await api.vehicles.updateStatus(vehicleId, newStatus);
      if (response.success) {
        loadFleetData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update vehicle status:', error);
    }
  };

  const scheduleMaintenanceAlert = async (vehicleId: string) => {
    try {
      await api.alerts.create({
        alert_type: 'maintenance',
        severity: 'medium',
        title: 'Maintenance Reminder',
        message: `Vehicle requires scheduled maintenance`,
        related_entity_type: 'vehicle',
        related_entity_id: vehicleId
      });
    } catch (error) {
      console.error('Failed to create maintenance alert:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Fleet</p>
              <p className="text-3xl font-bold">{fleetMetrics.totalVehicles}</p>
            </div>
            <Truck className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Now</p>
              <p className="text-3xl font-bold text-success">{fleetMetrics.activeVehicles}</p>
            </div>
            <Activity className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Fuel</p>
              <p className="text-3xl font-bold text-accent">{fleetMetrics.avgFuelLevel.toFixed(0)}%</p>
            </div>
            <Fuel className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Maintenance Due</p>
              <p className="text-3xl font-bold text-warning">{fleetMetrics.maintenanceOverdue}</p>
            </div>
            <Wrench className="w-8 h-8 text-warning" />
          </div>
        </Card>
      </div>

      {/* Fleet Utilization */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Fleet Utilization</h3>
          <Badge variant="outline" className="glass-card">
            {fleetMetrics.utilization.toFixed(1)}% Active
          </Badge>
        </div>
        <Progress value={fleetMetrics.utilization} className="h-3" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{fleetMetrics.activeVehicles} vehicles in use</span>
          <span>{fleetMetrics.availableVehicles} available</span>
        </div>
      </Card>

      {/* Vehicle Management */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Vehicle Management</h3>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="glass-card">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 glass-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out_of_service">Out of Service</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 glass-card">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="paver">Paver</SelectItem>
              <SelectItem value="roller">Roller</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="glass-card">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Vehicle Grid */}
        {!isLoading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <Card 
                key={vehicle.id} 
                className={`glass-card p-4 cursor-pointer transition-all duration-200 hover:glass-elevated
                  ${selectedVehicle === vehicle.id ? 'ring-2 ring-primary' : ''}
                `}
                onClick={() => setSelectedVehicle(selectedVehicle === vehicle.id ? null : vehicle.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getVehicleTypeIcon(vehicle.vehicle_type)}
                    <div>
                      <h4 className="font-semibold">{vehicle.vehicle_number}</h4>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusBadge(vehicle.status) as "default" | "destructive" | "outline" | "secondary"} className="text-xs">
                      {vehicle.status.replace('_', ' ')}
                    </Badge>
                    {vehicle.maintenance_status === 'overdue' && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Fuel Level */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fuel Level</span>
                    <span className={`text-sm font-medium ${getFuelLevelColor(vehicle.current_fuel_level)}`}>
                      {vehicle.current_fuel_level.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={vehicle.current_fuel_level} 
                    className="h-2"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-muted-foreground" />
                    <span>{vehicle.odometer_reading.toLocaleString()} mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span>{vehicle.current_location ? 'Tracked' : 'No GPS'}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedVehicle === vehicle.id && (
                  <div className="mt-4 pt-4 border-t border-glass-border space-y-3">
                    {/* Location */}
                    {vehicle.current_location && (
                      <div>
                        <h5 className="text-sm font-medium mb-1">Current Location</h5>
                        <div className="text-xs text-muted-foreground">
                          <p>Speed: {vehicle.current_location.speed || 0} mph</p>
                          <p>Last Update: {new Date(vehicle.current_location.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    )}

                    {/* Maintenance */}
                    <div>
                      <h5 className="text-sm font-medium mb-1">Maintenance</h5>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.next_maintenance_due && (
                          <p className={getMaintenanceStatusColor(vehicle.maintenance_status)}>
                            Next Due: {new Date(vehicle.next_maintenance_due).toLocaleDateString()}
                          </p>
                        )}
                        {vehicle.recent_maintenance && vehicle.recent_maintenance.length > 0 && (
                          <p>Last: {new Date(vehicle.recent_maintenance[0].performed_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        Track
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          scheduleMaintenanceAlert(vehicle.id);
                        }}
                      >
                        <Wrench className="w-3 h-3 mr-1" />
                        Service
                      </Button>
                    </div>

                    {/* Status Update */}
                    <div className="flex gap-1">
                      {vehicle.status !== 'available' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateVehicleStatus(vehicle.id, 'available');
                          }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Available
                        </Button>
                      )}
                      {vehicle.status !== 'maintenance' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateVehicleStatus(vehicle.id, 'maintenance');
                          }}
                        >
                          <Wrench className="w-3 h-3 mr-1" />
                          Maintenance
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
            <p className="text-muted-foreground">
              {vehicles.length === 0 
                ? "Add vehicles to start managing your fleet"
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        )}
      </Card>

      <Card className="glass-card p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading fleet data...</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FleetDashboard;