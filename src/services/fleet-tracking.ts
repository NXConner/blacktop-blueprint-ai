import { supabase } from '@/integrations/supabase/client';
import { realtimeService } from './realtime';
import type { 
  GPSTracking, 
  LiveVehicleLocation, 
  GeoCoordinate,
  MaintenanceRecord,
  Alert
} from '@/types/database';

// Fleet tracking configuration
interface FleetConfig {
  updateInterval: number; // milliseconds
  geoFenceRadius: number; // meters
  speedThreshold: number; // km/h
  idleTimeout: number; // minutes
}

const DEFAULT_CONFIG: FleetConfig = {
  updateInterval: 30000, // 30 seconds
  geoFenceRadius: 500, // 500 meters
  speedThreshold: 120, // 120 km/h speed alert
  idleTimeout: 30, // 30 minutes idle alert
};

interface VehicleStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline' | 'maintenance';
  lastUpdate: string;
  location?: GeoCoordinate;
  speed?: number;
  heading?: number;
  fuel_level?: number;
  odometer?: number;
  driver_id?: string;
  alerts: string[];
}

interface GeoFence {
  id: string;
  name: string;
  center: GeoCoordinate;
  radius: number;
  type: 'work_site' | 'depot' | 'restricted' | 'maintenance';
  active: boolean;
}

interface TripRecord {
  id: string;
  vehicle_id: string;
  driver_id?: string;
  start_time: string;
  end_time?: string;
  start_location: GeoCoordinate;
  end_location?: GeoCoordinate;
  distance: number;
  duration?: number;
  fuel_consumed?: number;
  route_points: GeoCoordinate[];
  status: 'active' | 'completed';
}

class FleetTrackingService {
  private vehicleStatuses: Map<string, VehicleStatus> = new Map();
  private geoFences: Map<string, GeoFence> = new Map();
  private activeTripIds: Set<string> = new Set();
  private trackingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private config: FleetConfig = DEFAULT_CONFIG;

  constructor() {
    this.initializeRealtimeSubscriptions();
    this.loadGeoFences();
  }

  // Initialize real-time subscriptions for vehicle tracking
  private initializeRealtimeSubscriptions(): void {
    // Subscribe to GPS location updates
    realtimeService.subscribeToVehicleLocations((gpsData: GPSTracking) => {
      this.handleGPSUpdate(gpsData);
    });

    // Subscribe to fleet vehicle status changes
    realtimeService.subscribeToFleetStatus((payload) => {
      this.handleFleetStatusUpdate(payload);
    });
  }

  // Handle incoming GPS updates
  private async handleGPSUpdate(gpsData: GPSTracking): Promise<void> {
    const vehicleId = gpsData.vehicle_id;
    const currentStatus = this.vehicleStatuses.get(vehicleId);

    // Update vehicle status
    const updatedStatus: VehicleStatus = {
      id: vehicleId,
      name: currentStatus?.name || `Vehicle ${vehicleId}`,
      status: this.determineVehicleStatus(gpsData),
      lastUpdate: gpsData.timestamp,
      location: gpsData.location_coordinates,
      speed: gpsData.speed,
      heading: gpsData.heading,
      fuel_level: currentStatus?.fuel_level,
      odometer: currentStatus?.odometer,
      driver_id: currentStatus?.driver_id,
      alerts: currentStatus?.alerts || [],
    };

    this.vehicleStatuses.set(vehicleId, updatedStatus);

    // Check for alerts
    await this.checkVehicleAlerts(vehicleId, gpsData);

    // Update trip if active
    await this.updateActiveTrip(vehicleId, gpsData);

    // Check geofence violations
    await this.checkGeoFenceViolations(vehicleId, gpsData.location_coordinates);
  }

  // Handle fleet status updates
  private handleFleetStatusUpdate(payload: unknown): void {
    const { old: oldData, new: newData, eventType } = payload;

    if (eventType === 'UPDATE' && newData) {
      const vehicleId = newData.id;
      const currentStatus = this.vehicleStatuses.get(vehicleId);

      if (currentStatus) {
        currentStatus.fuel_level = newData.fuel_level;
        currentStatus.odometer = newData.odometer;
        currentStatus.status = newData.status;
        
        this.vehicleStatuses.set(vehicleId, currentStatus);
      }
    }
  }

  // Determine vehicle status based on GPS data
  private determineVehicleStatus(gpsData: GPSTracking): 'active' | 'idle' | 'offline' | 'maintenance' {
    const now = new Date();
    const lastUpdate = new Date(gpsData.timestamp);
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    if (minutesSinceUpdate > 60) {
      return 'offline';
    }

    if (gpsData.speed !== undefined && gpsData.speed > 5) {
      return 'active';
    }

    if (minutesSinceUpdate > this.config.idleTimeout) {
      return 'idle';
    }

    return 'active';
  }

  // Check for vehicle alerts
  private async checkVehicleAlerts(vehicleId: string, gpsData: GPSTracking): Promise<void> {
    const alerts: string[] = [];

    // Speed alerts
    if (gpsData.speed && gpsData.speed > this.config.speedThreshold) {
      alerts.push(`Excessive speed: ${gpsData.speed} km/h`);
      await this.createAlert(vehicleId, 'speed', `Vehicle exceeding speed limit: ${gpsData.speed} km/h`, 'high');
    }

    // Accuracy alerts
    if (gpsData.accuracy && gpsData.accuracy > 50) {
      alerts.push(`Poor GPS accuracy: ${gpsData.accuracy}m`);
    }

    // Update vehicle alerts
    const status = this.vehicleStatuses.get(vehicleId);
    if (status) {
      status.alerts = alerts;
      this.vehicleStatuses.set(vehicleId, status);
    }
  }

  // Start tracking a vehicle
  async startTracking(vehicleId: string): Promise<void> {
    try {
      // Get vehicle details
      const { data: vehicle, error } = await supabase
        .from('fleet_vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

      if (error || !vehicle) {
        throw new Error(`Vehicle ${vehicleId} not found`);
      }

      // Initialize vehicle status
      const status: VehicleStatus = {
        id: vehicleId,
        name: vehicle.name,
        status: 'offline',
        lastUpdate: new Date().toISOString(),
        alerts: [],
      };

      this.vehicleStatuses.set(vehicleId, status);

      // Start periodic status checks
      const interval = setInterval(() => {
        this.checkVehicleTimeout(vehicleId);
      }, this.config.updateInterval);

      this.trackingIntervals.set(vehicleId, interval);

      console.log(`✅ Started tracking vehicle: ${vehicle.name}`);
    } catch (error) {
      console.error(`Failed to start tracking vehicle ${vehicleId}:`, error);
    }
  }

  // Stop tracking a vehicle
  stopTracking(vehicleId: string): void {
    const interval = this.trackingIntervals.get(vehicleId);
    if (interval) {
      clearInterval(interval);
      this.trackingIntervals.delete(vehicleId);
    }

    this.vehicleStatuses.delete(vehicleId);
    console.log(`Stopped tracking vehicle: ${vehicleId}`);
  }

  // Check for vehicle timeout
  private checkVehicleTimeout(vehicleId: string): void {
    const status = this.vehicleStatuses.get(vehicleId);
    if (!status) return;

    const now = new Date();
    const lastUpdate = new Date(status.lastUpdate);
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

    if (minutesSinceUpdate > 60 && status.status !== 'offline') {
      status.status = 'offline';
      status.alerts.push('Vehicle offline - no GPS signal');
      this.vehicleStatuses.set(vehicleId, status);
      
      this.createAlert(vehicleId, 'offline', 'Vehicle has gone offline', 'medium');
    }
  }

  // Start a new trip
  async startTrip(vehicleId: string, driverId?: string): Promise<string> {
    try {
      const vehicle = this.vehicleStatuses.get(vehicleId);
      if (!vehicle || !vehicle.location) {
        throw new Error('Vehicle location not available');
      }

      const tripId = crypto.randomUUID();
      const trip: TripRecord = {
        id: tripId,
        vehicle_id: vehicleId,
        driver_id: driverId,
        start_time: new Date().toISOString(),
        start_location: vehicle.location,
        distance: 0,
        route_points: [vehicle.location],
        status: 'active',
      };

      // Store trip in database
      await supabase.from('routes').insert({
        id: tripId,
        assigned_vehicle_id: vehicleId,
        assigned_driver_id: driverId,
        start_time: trip.start_time,
        waypoints: trip.route_points,
        status: 'active',
        name: `Trip ${tripId.slice(0, 8)}`,
      });

      this.activeTripIds.add(tripId);
      console.log(`Started trip ${tripId} for vehicle ${vehicleId}`);
      
      return tripId;
    } catch (error) {
      console.error('Failed to start trip:', error);
      throw error;
    }
  }

  // End a trip
  async endTrip(tripId: string): Promise<void> {
    try {
      const { data: trip, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error || !trip) {
        throw new Error(`Trip ${tripId} not found`);
      }

      const endTime = new Date().toISOString();
      const startTime = new Date(trip.start_time);
      const duration = Date.now() - startTime.getTime();

      // Calculate total distance
      const routePoints = trip.waypoints as GeoCoordinate[];
      const distance = this.calculateTotalDistance(routePoints);

      // Update trip record
      await supabase
        .from('routes')
        .update({
          end_time: endTime,
          estimated_distance: distance,
          estimated_duration: Math.round(duration / 1000), // Convert to seconds
          status: 'completed',
        })
        .eq('id', tripId);

      this.activeTripIds.delete(tripId);
      console.log(`Ended trip ${tripId}, distance: ${distance.toFixed(2)} km`);
    } catch (error) {
      console.error('Failed to end trip:', error);
    }
  }

  // Update active trip with new GPS point
  private async updateActiveTrip(vehicleId: string, gpsData: GPSTracking): Promise<void> {
    try {
      const { data: activeTrip, error } = await supabase
        .from('routes')
        .select('*')
        .eq('assigned_vehicle_id', vehicleId)
        .eq('status', 'active')
        .single();

      if (error || !activeTrip) {
        return; // No active trip
      }

      const routePoints = activeTrip.waypoints as GeoCoordinate[];
      routePoints.push(gpsData.location_coordinates);

      const distance = this.calculateTotalDistance(routePoints);

      await supabase
        .from('routes')
        .update({
          waypoints: routePoints,
          estimated_distance: distance,
        })
        .eq('id', activeTrip.id);

    } catch (error) {
      console.error('Failed to update active trip:', error);
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coord1.coordinates[1];
    const lon1 = coord1.coordinates[0];
    const lat2 = coord2.coordinates[1];
    const lon2 = coord2.coordinates[0];

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate total distance for a route
  private calculateTotalDistance(points: GeoCoordinate[]): number {
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += this.calculateDistance(points[i - 1], points[i]);
    }
    return totalDistance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Geofence management
  async createGeoFence(
    name: string,
    center: GeoCoordinate,
    radius: number,
    type: GeoFence['type']
  ): Promise<string> {
    const id = crypto.randomUUID();
    const geoFence: GeoFence = {
      id,
      name,
      center,
      radius,
      type,
      active: true,
    };

    this.geoFences.set(id, geoFence);

    // Store in database
    await supabase.from('geofences').insert({
      id,
      name,
      center_latitude: center.coordinates[1],
      center_longitude: center.coordinates[0],
      radius,
      type,
      is_active: true,
    });

    return id;
  }

  // Check geofence violations
  private async checkGeoFenceViolations(vehicleId: string, location: GeoCoordinate): Promise<void> {
    for (const [fenceId, fence] of this.geoFences) {
      if (!fence.active) continue;

      const distance = this.calculateDistance(location, fence.center) * 1000; // Convert to meters
      const isInside = distance <= fence.radius;

      // Handle geofence events based on type
      if (fence.type === 'restricted' && isInside) {
        await this.createAlert(
          vehicleId,
          'geofence',
          `Vehicle entered restricted area: ${fence.name}`,
          'high'
        );
      } else if (fence.type === 'work_site' && !isInside) {
        // Vehicle left work site - this might be normal, log for analytics
        console.log(`Vehicle ${vehicleId} left work site: ${fence.name}`);
      }
    }
  }

  // Load geofences from database
  private async loadGeoFences(): Promise<void> {
    try {
      const { data: geofences, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      geofences.forEach(fence => {
        const geoFence: GeoFence = {
          id: fence.id,
          name: fence.name,
          center: {
            type: 'Point',
            coordinates: [fence.center_longitude, fence.center_latitude],
          },
          radius: fence.radius,
          type: fence.type,
          active: fence.is_active,
        };

        this.geoFences.set(fence.id, geoFence);
      });

      console.log(`Loaded ${geofences.length} geofences`);
    } catch (error) {
      console.error('Failed to load geofences:', error);
    }
  }

  // Create alert
  private async createAlert(
    vehicleId: string,
    type: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        title: `Fleet Alert - ${type}`,
        message,
        type: 'fleet',
        data: {
          vehicle_id: vehicleId,
          alert_type: type,
          severity,
        },
      });
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }

  // Get all vehicle statuses
  getAllVehicleStatuses(): VehicleStatus[] {
    return Array.from(this.vehicleStatuses.values());
  }

  // Get specific vehicle status
  getVehicleStatus(vehicleId: string): VehicleStatus | undefined {
    return this.vehicleStatuses.get(vehicleId);
  }

  // Get vehicle location history
  async getLocationHistory(
    vehicleId: string,
    startTime: string,
    endTime: string
  ): Promise<GPSTracking[]> {
    try {
      const { data, error } = await supabase
        .from('gps_locations')
        .select('*')
        .eq('device_id', vehicleId) // Assuming device_id maps to vehicle
        .gte('timestamp', startTime)
        .lte('timestamp', endTime)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data.map(record => ({
        id: record.id,
        vehicle_id: vehicleId,
        location_coordinates: {
          type: 'Point',
          coordinates: [record.longitude, record.latitude],
        },
        speed: record.speed,
        heading: record.heading,
        altitude: record.altitude,
        timestamp: record.timestamp,
        accuracy: record.accuracy,
      }));
    } catch (error) {
      console.error('Failed to get location history:', error);
      return [];
    }
  }

  // Get fleet analytics
  async getFleetAnalytics(timeframe: 'day' | 'week' | 'month'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    try {
      // Get trip data
      const { data: trips, error } = await supabase
        .from('routes')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .eq('status', 'completed');

      if (error) throw error;

      const analytics = {
        totalTrips: trips.length,
        totalDistance: trips.reduce((sum, trip) => sum + (trip.estimated_distance || 0), 0),
        totalDuration: trips.reduce((sum, trip) => sum + (trip.estimated_duration || 0), 0),
        averageSpeed: 0,
        activeVehicles: this.vehicleStatuses.size,
        alertsCount: Array.from(this.vehicleStatuses.values())
          .reduce((sum, vehicle) => sum + vehicle.alerts.length, 0),
      };

      if (analytics.totalDuration > 0) {
        analytics.averageSpeed = (analytics.totalDistance / (analytics.totalDuration / 3600)); // km/h
      }

      return analytics;
    } catch (error) {
      console.error('Failed to get fleet analytics:', error);
      return null;
    }
  }

  // Start tracking all vehicles
  async startTrackingAll(): Promise<void> {
    try {
      const { data: vehicles, error } = await supabase
        .from('fleet_vehicles')
        .select('id');

      if (error) throw error;

      const trackingPromises = vehicles.map(vehicle => 
        this.startTracking(vehicle.id)
      );

      await Promise.allSettled(trackingPromises);
      console.log(`Started tracking ${vehicles.length} vehicles`);
    } catch (error) {
      console.error('Failed to start tracking all vehicles:', error);
    }
  }

  // Stop tracking all vehicles
  stopTrackingAll(): void {
    const vehicleIds = Array.from(this.vehicleStatuses.keys());
    vehicleIds.forEach(id => this.stopTracking(id));
    console.log('Stopped tracking all vehicles');
  }

  // Update configuration
  updateConfig(newConfig: Partial<FleetConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Fleet tracking configuration updated:', this.config);
  }
}

// Export singleton instance
export const fleetTrackingService = new FleetTrackingService();

// React hook for fleet tracking
export function useFleetTracking() {
  const [vehicleStatuses, setVehicleStatuses] = React.useState<VehicleStatus[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const updateStatuses = () => {
      setVehicleStatuses(fleetTrackingService.getAllVehicleStatuses());
      setLoading(false);
    };

    // Initial load
    updateStatuses();

    // Update every 10 seconds
    const interval = setInterval(updateStatuses, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    vehicleStatuses,
    loading,
    startTracking: fleetTrackingService.startTracking.bind(fleetTrackingService),
    stopTracking: fleetTrackingService.stopTracking.bind(fleetTrackingService),
    startTrip: fleetTrackingService.startTrip.bind(fleetTrackingService),
    endTrip: fleetTrackingService.endTrip.bind(fleetTrackingService),
    getLocationHistory: fleetTrackingService.getLocationHistory.bind(fleetTrackingService),
    getFleetAnalytics: fleetTrackingService.getFleetAnalytics.bind(fleetTrackingService),
  };
}

import React from 'react';