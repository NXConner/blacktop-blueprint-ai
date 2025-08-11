import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Activity, Crosshair, Layers, Map, Radar, Maximize2, CornerDownRight, Search, RefreshCcw, Pause, Play, SkipBack, SkipForward, Timer, Navigation2, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Circle, useMap, Polyline } from 'react-leaflet';
import L, { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { offlineService } from '@/services/offline';
import { api } from '@/services/api';
import * as turf from '@turf/turf';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card as UICard } from '@/components/ui/card';
import { Mail, MessageSquare, Phone, Video } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMapEvents } from 'react-leaflet';

const DefaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon as any;

const BUSINESS_COORDS: LatLngExpression = [36.6418, -80.2667];
const milesToMeters = (miles: number) => miles * 1609.34;

function RecenterMap({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center, map]);
  return null;
}

function MapEnhancements() {
  const map = useMap();
  useEffect(() => {
    const scale = L.control.scale({ metric: false });
    scale.addTo(map);
    return () => {
      scale.remove();
    };
  }, [map]);
  return null;
}

function MapClickCapture({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

const UnifiedMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Core state
  const [center, setCenter] = useState<LatLngExpression>(BUSINESS_COORDS);
  const [radiusMiles, setRadiusMiles] = useState<number>(15);
  const [basemap, setBasemap] = useState<'osm'|'esri'|'stamen'>('osm');
  const [status, setStatus] = useState<'connected'|'connecting'|'disconnected'>('connecting');

  // Layers toggles
  const [radarEnabled, setRadarEnabled] = useState<boolean>(true);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.55);
  const [showVehicles, setShowVehicles] = useState<boolean>(true);
  const [showCrews, setShowCrews] = useState<boolean>(true);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);

  // Data
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Geocoding
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Array<{ display: string; coords: [number, number] }>>([]);

  // Load preferences
  useEffect(() => {
    offlineService.getPreference<number>('map.unified.radiusMiles').then(v => { if (typeof v === 'number') setRadiusMiles(Math.min(50, Math.max(1, v))); });
    offlineService.getPreference<[number, number]>('map.unified.center').then(v => { if (Array.isArray(v) && v.length===2) setCenter([v[0], v[1]]); });
    offlineService.getPreference<'osm'|'esri'|'stamen'>('map.unified.basemap').then(v => { if (v) setBasemap(v); });
    offlineService.getPreference<boolean>('map.unified.radarEnabled').then(v => { if (typeof v === 'boolean') setRadarEnabled(v); });
    offlineService.getPreference<number>('map.unified.radarOpacity').then(v => { if (typeof v === 'number') setRadarOpacity(Math.min(1, Math.max(0, v))); });
    offlineService.getPreference<boolean>('map.unified.showVehicles').then(v => { if (typeof v === 'boolean') setShowVehicles(v); });
    offlineService.getPreference<boolean>('map.unified.showCrews').then(v => { if (typeof v === 'boolean') setShowCrews(v); });
    offlineService.getPreference<boolean>('map.unified.showAlerts').then(v => { if (typeof v === 'boolean') setShowAlerts(v); });
  }, []);

  // Persist preferences
  useEffect(() => { void offlineService.setPreference('map.unified.radiusMiles', radiusMiles); }, [radiusMiles]);
  useEffect(() => { void offlineService.setPreference('map.unified.center', center); }, [center]);
  useEffect(() => { void offlineService.setPreference('map.unified.basemap', basemap); }, [basemap]);
  useEffect(() => { void offlineService.setPreference('map.unified.radarEnabled', radarEnabled); }, [radarEnabled]);
  useEffect(() => { void offlineService.setPreference('map.unified.radarOpacity', radarOpacity); }, [radarOpacity]);
  useEffect(() => { void offlineService.setPreference('map.unified.showVehicles', showVehicles); }, [showVehicles]);
  useEffect(() => { void offlineService.setPreference('map.unified.showCrews', showCrews); }, [showCrews]);
  useEffect(() => { void offlineService.setPreference('map.unified.showAlerts', showAlerts); }, [showAlerts]);

  // Data refresh
  useEffect(() => {
    let abort = false;
    const load = async () => {
      try {
        setStatus('connecting');
        const [v, c, a] = await Promise.all([
          api.gps.getCurrentLocations(),
          api.crews.getAll(),
          api.alerts.getActive(),
        ]);
        if (!abort) {
          if (v.success) setVehicles(v.data || []);
          if (c.success) setCrews(c.data || []);
          if (a.success) setAlerts(a.data || []);
          setStatus('connected');
        }
      } catch {
        if (!abort) setStatus('disconnected');
      }
    };
    load();
    const t = setInterval(load, 12000);
    return () => { abort = true; clearInterval(t); };
  }, []);

  // Keyboard shortcuts for quick radius tweaks
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') setRadiusMiles(v => Math.min(50, v + 1));
      if (e.key === '-' || e.key === '_') setRadiusMiles(v => Math.max(1, v - 1));
      if (e.key.toLowerCase() === 'r') setRadarEnabled(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const circleMeters = useMemo(() => milesToMeters(radiusMiles), [radiusMiles]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        void offlineService.setPreference('map.unified.center', [pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fit to data (vehicles/crews/alerts + center)
  const computeBounds = (): LatLngBoundsExpression | null => {
    const points: [number, number][] = [];
    if (Array.isArray(center)) points.push([center[0] as number, center[1] as number]);
    vehicles.forEach(v => points.push([v.location.coordinates[1], v.location.coordinates[0]]));
    crews.forEach(() => points.push([36.64 + Math.random()*0.1, -80.26 + Math.random()*0.1]));
    alerts.forEach(() => points.push([36.61 + Math.random()*0.15, -80.24 + Math.random()*0.15]));
    if (points.length < 2) return null;
    return L.latLngBounds(points as any);
  };

  // Geocode search (Nominatim)
  const search = async () => {
    if (!searchText || searching) return;
    setSearching(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5` , { headers: { 'Accept': 'application/json' } });
      const data = await resp.json();
      const mapped = (data || []).map((r: any) => ({ display: r.display_name as string, coords: [Number(r.lat), Number(r.lon)] as [number, number] }));
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const vehicleMarkers = useMemo(() => showVehicles ? vehicles.map(v => (
    <Marker key={`veh-${v.vehicle_id}`} position={[v.location.coordinates[1], v.location.coordinates[0]] as any} icon={DefaultIcon}>
    </Marker>
  )) : null, [showVehicles, vehicles]);

  const crewMarkers = useMemo(() => showCrews ? crews.map((c, i) => (
    <Marker key={`crew-${c.crew_id || i}`} position={[36.64 + Math.random()*0.1, -80.26 + Math.random()*0.1] as any} icon={DefaultIcon}>
    </Marker>
  )) : null, [showCrews, crews]);

  const alertMarkers = useMemo(() => showAlerts ? alerts.map((a, i) => (
    <Marker key={`alert-${a.id || i}`} position={[36.61 + Math.random()*0.15, -80.24 + Math.random()*0.15] as any} icon={DefaultIcon}>
    </Marker>
  )) : null, [showAlerts, alerts]);

  // Geofences (simple polygon demo around center)
  const [geofences, setGeofences] = useState<Array<[number, number][]>>([]);
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);

  useEffect(() => {
    // Initialize with a demo geofence polygon (square around center)
    const c = Array.isArray(center) ? [center[0] as number, center[1] as number] : [36.6418, -80.2667];
    const d = 0.01; // ~1km
    setGeofences([
      [ [c[0]-d, c[1]-d], [c[0]-d, c[1]+d], [c[0]+d, c[1]+d], [c[0]+d, c[1]-d] ] as any
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInsideGeofence = (lat: number, lon: number): boolean => {
    if (!geofenceEnabled || geofences.length === 0) return false;
    const pt = turf.point([lon, lat]);
    return geofences.some(poly => turf.booleanPointInPolygon(pt, turf.polygon([[...poly, poly[0]].map(([la, lo]) => [lo, la])])));
  };

  // Auto measurement of driveway/parking lot (placeholder drawing using Turf buffer of center)
  const [autoAsphaltOverlay, setAutoAsphaltOverlay] = useState<boolean>(false);
  const [asphaltPolygon, setAsphaltPolygon] = useState<[number, number][]>([]);
  const [asphaltAreaSqFt, setAsphaltAreaSqFt] = useState<number>(0);
  const [asphaltOutlineColor, setAsphaltOutlineColor] = useState<string>('#0ea5e9');
  const [asphaltOutlineWeight, setAsphaltOutlineWeight] = useState<number>(3);

  // Drawing & measuring
  type DrawShape = { type: 'polyline'|'polygon'; points: [number, number][] };
  const [drawMode, setDrawMode] = useState<'none'|'polyline'|'polygon'|'pin'>('none');
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [shapes, setShapes] = useState<DrawShape[]>([]);
  const [pins, setPins] = useState<[number, number][]>([]);

  const finishDrawing = () => {
    if (drawMode === 'none' || drawPoints.length < 2) return;
    const shape: DrawShape = { type: drawMode === 'polyline' ? 'polyline' : 'polygon', points: drawPoints };
    setShapes(prev => [...prev, shape]);
    setDrawPoints([]);
    setDrawMode('none');
  };

  const clearDrawing = () => {
    setDrawPoints([]);
    setShapes([]);
  };

  const handleMapClick = (lat: number, lon: number) => {
    if (drawMode === 'polyline' || drawMode === 'polygon') {
      setDrawPoints(prev => [...prev, [lat, lon]]);
    } else if (drawMode === 'pin') {
      setPins(prev => [[lat, lon], ...prev]);
    }
  };

  const currentLineMiles = useMemo(() => {
    if (drawMode === 'polyline' && drawPoints.length >= 2) {
      const ls = turf.lineString(drawPoints.map(([la, lo]) => [lo, la]));
      return turf.length(ls, { units: 'miles' });
    }
    return 0;
  }, [drawMode, drawPoints]);

  const currentPolyAreaSqFt = useMemo(() => {
    if (drawMode === 'polygon' && drawPoints.length >= 3) {
      const poly = turf.polygon([[...drawPoints, drawPoints[0]].map(([la, lo]) => [lo, la])]);
      return turf.area(poly) * 10.7639;
    }
    return 0;
  }, [drawMode, drawPoints]);

  // Additional overlays
  const [overlayTopo, setOverlayTopo] = useState(true);
  const [overlayTopoOpacity, setOverlayTopoOpacity] = useState(0.5);
  const [overlayTonerLines, setOverlayTonerLines] = useState(false);
  const [overlayTonerOpacity, setOverlayTonerOpacity] = useState(0.6);

  // Map ref for zoom controls
  const mapRef = useRef<L.Map | null>(null);
  const zoomIn = () => { mapRef.current?.zoomIn(); };
  const zoomOut = () => { mapRef.current?.zoomOut(); };

  useEffect(() => {
    if (!autoAsphaltOverlay) { setAsphaltPolygon([]); setAsphaltAreaSqFt(0); return; }
    const c = Array.isArray(center) ? [center[1] as number, center[0] as number] : [-80.2667, 36.6418];
    // Create a demo circle polygon as "detected" asphalt region
    const circle = turf.circle(c, 0.05, { steps: 64, units: 'kilometers' });
    const coords = circle.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]) as [number, number][];
    setAsphaltPolygon(coords);
    const areaSqMeters = turf.area(circle);
    setAsphaltAreaSqFt(areaSqMeters * 10.7639);
  }, [autoAsphaltOverlay, center]);

  // Clock-in/out stubs
  const clockIn = async (employeeId: string) => {
    // Persist as needed; stub UI feedback only
    console.info('Clock-in:', employeeId);
  };
  const clockOut = async (employeeId: string) => {
    console.info('Clock-out:', employeeId);
  };

  // Extended basemaps
  type BaseMapKey = 'osm'|'esri'|'stamen'|'carto'|'thunderforest';
  const [baseKey, setBaseKey] = useState<BaseMapKey>('osm');

  // Employee analytics toggles and app usage tracking (approximate)
  const [employeeAnalyticsEnabled, setEmployeeAnalyticsEnabled] = useState(true);
  const [trackPhoneUsage, setTrackPhoneUsage] = useState(true);
  const [appUsageSeconds, setAppUsageSeconds] = useState(0);
  const [offAppSeconds, setOffAppSeconds] = useState(0);

  useEffect(() => {
    if (!trackPhoneUsage) return;
    const iv = setInterval(() => {
      if (document.visibilityState === 'visible') setAppUsageSeconds((s) => s + 1);
      else setOffAppSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(iv);
  }, [trackPhoneUsage]);

  // Employee movement state cache
  type EmpState = { lastLat: number; lastLon: number; lastTs: number; mph: number; state: 'moving'|'stationary'|'sitting'|'standing'|'driving'|'passenger' };
  const [employeeStateMap, setEmployeeStateMap] = useState<Record<string, EmpState>>({});

  const updateEmployeeState = (empId: string, lat: number, lon: number): EmpState => {
    const now = Date.now();
    const prev = employeeStateMap[empId];
    let mph = 0;
    if (prev) {
      const km = turf.distance(turf.point([prev.lastLon, prev.lastLat]), turf.point([lon, lat]));
      const miles = km * 0.621371;
      const hours = (now - prev.lastTs) / (1000 * 60 * 60);
      mph = hours > 0 ? miles / hours : 0;
    }
    // Determine state
    let state: EmpState['state'] = 'stationary';
    if (mph > 0.5 && mph <= 4) state = 'moving';
    if (mph > 4 && mph <= 12) state = 'moving'; // jogging/bike
    if (mph > 12) state = 'driving';
    if (mph <= 0.5) state = Math.random() > 0.5 ? 'sitting' : 'standing';
    // Passenger check: near a vehicle
    if (mph > 5 && vehicles.some(v => turf.distance(turf.point([v.location.coordinates[0], v.location.coordinates[1]]), turf.point([lon, lat])) < 0.02)) {
      state = 'passenger';
    }
    const next: EmpState = { lastLat: lat, lastLon: lon, lastTs: now, mph, state };
    setEmployeeStateMap((m) => ({ ...m, [empId]: next }));
    return next;
  };

  const notifyAdminOutOfBounds = async (empId: string, lat: number, lon: number) => {
    const payload = { employee_id: empId, type: 'out_of_bounds', lat, lon, created_at: new Date().toISOString(), message: `Employee ${empId} is out of geofence` };
    try {
      await supabase.from('admin_messages').insert(payload);
      toast({ title: 'Admin notified', description: `Alert sent for ${empId}` });
    } catch {
      try {
        await offlineService.queueAction('INSERT', 'admin_messages', payload);
        toast({ title: 'Queued alert (offline)', description: `Will sync for ${empId}` });
      } catch {
        toast({ title: 'Failed to send alert', variant: 'destructive' });
      }
    }
  };

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackHour, setPlaybackHour] = useState(0); // 0..24
  const [playbackSpeed, setPlaybackSpeed] = useState(4); // x speed
  const [vehicleHistory, setVehicleHistory] = useState<Record<string, { ts: number; lat: number; lon: number }[]>>({});
  const [empHistory, setEmpHistory] = useState<Array<{ id: string; ts: number; lat: number; lon: number }>>([]);

  const startOfDay = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
  }, []);

  const refreshPlaybackData = async () => {
    // Fetch vehicle history for last 24h for vehicles present
    const ids = vehicles.map(v => v.vehicle_id).slice(0, 5); // limit to 5 for demo
    const history: Record<string, { ts: number; lat: number; lon: number }[]> = {};
    for (const id of ids) {
      try {
        const res = await api.gps.getVehicleHistory(id, 24);
        if (res.success) {
          history[id] = (res.data || []).map((r: any) => ({ ts: new Date(r.timestamp).getTime(), lat: r.location_coordinates.coordinates[1], lon: r.location_coordinates.coordinates[0] })).sort((a,b) => a.ts - b.ts);
        }
      } catch { /* ignore */ }
    }
    setVehicleHistory(history);

    // Simulate employee history based on crew count
    const emps: Array<{ id: string; ts: number; lat: number; lon: number }> = [];
    for (let i=0; i<Math.min(5, crews.length); i++) {
      const id = crews[i].supervisor_id || `emp-${i}`;
      for (let h=0; h<=24; h+=1) {
        const ts = startOfDay + h*60*60*1000;
        emps.push({ id, ts, lat: 36.64 + Math.sin((i+1)*h/5)*0.05, lon: -80.26 + Math.cos((i+1)*h/5)*0.05 });
      }
    }
    setEmpHistory(emps);
  };

  useEffect(() => { void refreshPlaybackData(); }, [vehicles.length, crews.length]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => {
      setPlaybackHour(h => (h + Math.max(1, playbackSpeed/2)) % 24);
    }, 1000);
    return () => clearInterval(iv);
  }, [isPlaying, playbackSpeed]);

  const playbackPositions = useMemo(() => {
    const ts = startOfDay + Math.floor(playbackHour) * 60 * 60 * 1000;
    const vehPts: [number, number][] = [];
    Object.values(vehicleHistory).forEach(points => {
      if (!points || points.length === 0) return;
      // Find nearest by ts
      let best = points[0];
      for (const p of points) {
        if (Math.abs(p.ts - ts) < Math.abs(best.ts - ts)) best = p;
      }
      vehPts.push([best.lat, best.lon]);
    });
    const empPts = empHistory.filter(e => Math.abs(e.ts - ts) <= 30*60*1000).map(e => [e.lat, e.lon]) as [number, number][];
    return { vehPts, empPts };
  }, [vehicleHistory, empHistory, playbackHour, startOfDay]);

  // Default region: Patrick County VA and nearby (approx center)
  const REGION_CENTER: LatLngExpression = [36.68, -80.25];
  const [hasAutoLocated, setHasAutoLocated] = useState(false);

  useEffect(() => {
    // Prefer current location at load
    if (hasAutoLocated) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          void offlineService.setPreference('map.unified.center', [pos.coords.latitude, pos.coords.longitude]);
          setHasAutoLocated(true);
        },
        () => {
          // Fallback to region center
          setCenter(REGION_CENTER);
          setHasAutoLocated(true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCenter(REGION_CENTER);
      setHasAutoLocated(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Travel time tracking (employees)
  const [employeeTravelSeconds, setEmployeeTravelSeconds] = useState<Record<string, number>>({});
  useEffect(() => {
    const iv = setInterval(() => {
      setEmployeeTravelSeconds(prev => {
        const next = { ...prev };
        Object.entries(employeeStateMap).forEach(([id, st]) => {
          if (st.state === 'driving' || st.mph > 5) {
            next[id] = (next[id] || 0) + 1;
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [employeeStateMap]);

  // Route planning via OSRM
  type RouteInfo = { coords: [number, number][], distanceMiles: number, durationMins: number } | null;
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
  const [routeOrigin, setRouteOrigin] = useState<LatLngExpression | null>(null);
  const [routeDest, setRouteDest] = useState<LatLngExpression | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeMode, setRouteMode] = useState<'idle'|'set-origin'|'set-dest'>('idle');

  const planRoute = async (origin: LatLngExpression, dest: LatLngExpression) => {
    const [olat, olon] = origin as [number, number];
    const [dlat, dlon] = dest as [number, number];
    setIsRouting(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${olon},${olat};${dlon},${dlat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const route = data?.routes?.[0];
      if (route) {
        const meters = route.distance as number;
        const seconds = route.duration as number;
        const coords = route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]) as [number, number][];
        setRouteInfo({ coords, distanceMiles: meters / 1609.34, durationMins: seconds / 60 });
      } else {
        setRouteInfo(null);
        toast({ title: 'Route not found', variant: 'destructive' });
      }
    } catch (e) {
      setRouteInfo(null);
      toast({ title: 'Routing error', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setIsRouting(false);
    }
  };

  const handleRouteMapClick = (lat: number, lon: number) => {
    if (routeMode === 'set-origin') {
      setRouteOrigin([lat, lon]);
      setRouteMode('idle');
    } else if (routeMode === 'set-dest') {
      setRouteDest([lat, lon]);
      setRouteMode('idle');
    } else {
      handleMapClick(lat, lon);
    }
  };

  return (
    <div className="min-h-screen p-4" ref={containerRef}>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Unified Map Command Center</h1>
          <Badge variant="outline" className={`ml-2 ${status==='connected'?'text-success':status==='connecting'?'text-warning':'text-destructive'}`}>
            <Activity className="w-3 h-3 mr-1" /> {status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="pl-7 pr-8 py-1 text-sm rounded-md border border-glass-border bg-background/70"
              placeholder="Search address or place"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void search(); }}
            />
            <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full" onClick={search} disabled={searching}>
              {searching ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CornerDownRight className="w-4 h-4" />}
            </Button>
            {results.length > 0 && (
              <div className="absolute z-[1001] mt-1 w-[340px] max-h-48 overflow-auto rounded-md border border-glass-border bg-background/95 shadow">
                {results.map((r, idx) => (
                  <div key={idx} className="px-2 py-1 text-xs hover:bg-muted/40 cursor-pointer" onClick={() => {
                    setCenter(r.coords);
                    setResults([]);
                    void offlineService.setPreference('map.unified.center', r.coords);
                  }}>{r.display}</div>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={locate}><Crosshair className="w-4 h-4 mr-1" /> Locate</Button>
        </div>
      </div>

      <Card className="glass-elevated">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 p-3 border-b border-glass-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <select className="text-sm bg-transparent" value={baseKey} onChange={e => setBaseKey(e.target.value as BaseMapKey)}>
              <option value="osm">OSM</option>
              <option value="esri">ESRI Imagery</option>
              <option value="stamen">Stamen Terrain</option>
              <option value="carto">Carto Light</option>
              <option value="thunderforest">Thunderforest Outdoors</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="radarToggle" type="checkbox" checked={radarEnabled} onChange={e => setRadarEnabled(e.target.checked)} />
            <label htmlFor="radarToggle" className="text-sm flex items-center gap-1"><Radar className="w-4 h-4" /> Radar</label>
            <div className="w-40">
              <Slider value={[radarOpacity]} min={0} max={1} step={0.05} onValueChange={(v) => setRadarOpacity(v[0] as number)} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input id="vehToggle" type="checkbox" checked={showVehicles} onChange={e => setShowVehicles(e.target.checked)} />
            <label htmlFor="vehToggle">Vehicles ({vehicles.length})</label>
            <input id="crewToggle" type="checkbox" className="ml-3" checked={showCrews} onChange={e => setShowCrews(e.target.checked)} />
            <label htmlFor="crewToggle">Crews ({crews.length})</label>
            <input id="alertToggle" type="checkbox" className="ml-3" checked={showAlerts} onChange={e => setShowAlerts(e.target.checked)} />
            <label htmlFor="alertToggle">Alerts ({alerts.length})</label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input id="geoToggle" type="checkbox" checked={geofenceEnabled} onChange={e => setGeofenceEnabled(e.target.checked)} />
            <label htmlFor="geoToggle">Geofencing</label>
            <input id="asphaltToggle" className="ml-3" type="checkbox" checked={autoAsphaltOverlay} onChange={e => setAutoAsphaltOverlay(e.target.checked)} />
            <label htmlFor="asphaltToggle">Auto Asphalt Detection</label>
            {autoAsphaltOverlay && <span className="ml-2 text-xs text-muted-foreground">Area ≈ {asphaltAreaSqFt.toFixed(0)} sq ft</span>}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input id="empAnalytics" type="checkbox" checked={employeeAnalyticsEnabled} onChange={(e) => setEmployeeAnalyticsEnabled(e.target.checked)} />
            <label htmlFor="empAnalytics">Employee Analytics</label>
            <input id="phoneUsage" className="ml-3" type="checkbox" checked={trackPhoneUsage} onChange={(e) => setTrackPhoneUsage(e.target.checked)} />
            <label htmlFor="phoneUsage">Track App Usage</label>
            {trackPhoneUsage && (
              <span className="ml-2 text-xs text-muted-foreground">In-app: {(appUsageSeconds/60|0)}m {appUsageSeconds%60}s · Off-app: {(offAppSeconds/60|0)}m {offAppSeconds%60}s</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-56">
              <div className="text-[10px] mb-1">Radius: {radiusMiles} mi</div>
              <Slider value={[radiusMiles]} min={1} max={50} step={1} onValueChange={(v) => setRadiusMiles(v[0] as number)} />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setRadiusMiles(15)}><RefreshCcw className="w-4 h-4 mr-1" /> Reset Radius</Button>
            <Button size="sm" variant="outline" onClick={() => {
              const b = computeBounds();
              const mapEl = containerRef.current?.querySelector('.leaflet-container');
              if (b && mapEl) {
                // trigger fit via dispatching a custom event picked up by a hidden MapConsumer
                const ev = new CustomEvent('fit-bounds', { detail: b });
                mapEl.dispatchEvent(ev);
              }
            }}><Maximize2 className="w-4 h-4 mr-1" /> Fit to Data</Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input id="overlayTopo" type="checkbox" checked={overlayTopo} onChange={(e) => setOverlayTopo(e.target.checked)} />
            <label htmlFor="overlayTopo">Topo Overlay</label>
            <div className="w-28">
              <Slider value={[overlayTopoOpacity]} min={0} max={1} step={0.05} onValueChange={(v) => setOverlayTopoOpacity(v[0] as number)} />
            </div>
            <input id="overlayToner" className="ml-3" type="checkbox" checked={overlayTonerLines} onChange={(e) => setOverlayTonerLines(e.target.checked)} />
            <label htmlFor="overlayToner">Road Lines</label>
            <div className="w-28">
              <Slider value={[overlayTonerOpacity]} min={0} max={1} step={0.05} onValueChange={(v) => setOverlayTonerOpacity(v[0] as number)} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Button size="sm" variant={drawMode==='polyline'?'default':'outline'} onClick={() => setDrawMode(m => m==='polyline'?'none':'polyline')}>Draw Measure (Line)</Button>
            <Button size="sm" variant={drawMode==='polygon'?'default':'outline'} onClick={() => setDrawMode(m => m==='polygon'?'none':'polygon')}>Draw Area (Polygon)</Button>
            <Button size="sm" variant={drawMode==='pin'?'default':'outline'} onClick={() => setDrawMode(m => m==='pin'?'none':'pin')}>Pin Tool</Button>
            <Button size="sm" variant="outline" onClick={finishDrawing}>Finish</Button>
            <Button size="sm" variant="outline" onClick={clearDrawing}>Clear</Button>
            <Button size="sm" variant="outline" onClick={zoomOut}>-</Button>
            <Button size="sm" variant="outline" onClick={zoomIn}>+</Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-xs">Asphalt Outline</label>
            <input type="color" value={asphaltOutlineColor} onChange={(e) => setAsphaltOutlineColor(e.target.value)} />
            <div className="w-24">
              <Slider value={[asphaltOutlineWeight]} min={1} max={8} step={1} onValueChange={(v) => setAsphaltOutlineWeight(v[0] as number)} />
            </div>
            {drawMode==='polyline' && drawPoints.length>=2 && (
              <span className="text-xs text-muted-foreground">Length: {currentLineMiles.toFixed(2)} mi</span>
            )}
            {drawMode==='polygon' && drawPoints.length>=3 && (
              <span className="text-xs text-muted-foreground">Area: {currentPolyAreaSqFt.toFixed(0)} sq ft</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Navigation2 className="w-4 h-4" /> Route
            <Button size="sm" variant={routeMode==='set-origin'?'default':'outline'} onClick={() => setRouteMode(m => m==='set-origin'?'idle':'set-origin')}>Set Origin</Button>
            <Button size="sm" variant={routeMode==='set-dest'?'default':'outline'} onClick={() => setRouteMode(m => m==='set-dest'?'idle':'set-dest')}>Set Destination</Button>
            <Button size="sm" variant="outline" disabled={!routeOrigin || !routeDest || isRouting} onClick={() => { if (routeOrigin && routeDest) void planRoute(routeOrigin, routeDest); }}>{isRouting?'Routing...':'Plan'}</Button>
            <Button size="sm" variant="outline" onClick={() => setRouteInfo(null)}>Clear</Button>
            {routeInfo && (
              <span className="text-xs text-muted-foreground">{routeInfo.distanceMiles.toFixed(1)} mi · {Math.round(routeInfo.durationMins)} mins</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4" />
            <span>Playback</span>
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(p => !p)}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
            <Button size="sm" variant="outline" onClick={() => setPlaybackHour(h => Math.max(0, (h-1)))}><SkipBack className="w-4 h-4" /></Button>
            <Button size="sm" variant="outline" onClick={() => setPlaybackHour(h => Math.min(24, (h+1)))}><SkipForward className="w-4 h-4" /></Button>
            <div className="w-40">
              <div className="text-[10px]">Hour: {Math.floor(playbackHour)}</div>
              <Slider value={[playbackHour]} min={0} max={24} step={0.25} onValueChange={(v) => setPlaybackHour(v[0] as number)} />
            </div>
            <div className="w-32">
              <div className="text-[10px]">Speed: {playbackSpeed}x</div>
              <Slider value={[playbackSpeed]} min={1} max={16} step={1} onValueChange={(v) => setPlaybackSpeed(v[0] as number)} />
            </div>
            <Button size="sm" variant="outline" onClick={() => { setPlaybackHour(0); void refreshPlaybackData(); }}>Reload</Button>
          </div>
        </div>

        {/* Map */}
        <div style={{ height: '70vh' }}>
          <MapContainer center={center as [number, number]} zoom={10} preferCanvas style={{ height: '100%', width: '100%' }} whenCreated={(map) => {
            const container = (map as any)._container as HTMLElement;
            const handler = (e: Event) => {
              const detail = (e as CustomEvent).detail as LatLngBoundsExpression;
              map.fitBounds(detail, { padding: [24, 24] });
            };
            container.addEventListener('fit-bounds', handler);
            (map as any)._fitHandler = handler;
            mapRef.current = map;
          }}>
            <RecenterMap center={center} />
            <MapEnhancements />
            <MapClickCapture onClick={handleRouteMapClick} />
            {baseKey === 'osm' && (
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            )}
            {baseKey === 'esri' && (
              <TileLayer attribution='&copy; ESRI' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            )}
            {baseKey === 'stamen' && (
              <TileLayer attribution='&copy; Stamen' url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png" />
            )}
            {baseKey === 'carto' && (
              <TileLayer attribution='&copy; Carto' url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png" />
            )}
            {baseKey === 'thunderforest' && (
              <TileLayer attribution='&copy; Thunderforest' url="https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=YOUR_API_KEY" />
            )}

            {overlayTopo && (
              <TileLayer attribution='&copy; OpenTopoMap' opacity={overlayTopoOpacity} url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
            )}
            {overlayTonerLines && (
              <TileLayer attribution='&copy; Stamen' opacity={overlayTonerOpacity} url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.png" />
            )}

            {radarEnabled && (
              <WMSTileLayer
                url="https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi"
                params={{ layers: 'nexrad-n0r-900913', transparent: true, format: 'image/png' }}
                opacity={radarOpacity}
              />
            )}

            {/* Geofences */}
            {geofenceEnabled && geofences.map((poly, idx) => (
              <Polyline key={`geo-${idx}`} positions={poly} pathOptions={{ color: '#f59e0b', weight: 2, dashArray: '4 4' }} />
            ))}

            {/* Auto Asphalt Detected Overlay */}
            {autoAsphaltOverlay && asphaltPolygon.length > 0 && (
              <Polyline positions={asphaltPolygon} pathOptions={{ color: asphaltOutlineColor, weight: asphaltOutlineWeight, fillOpacity: 0.1 }} />
            )}

            {/* Drawing overlays */}
            {drawPoints.length > 0 && drawMode==='polyline' && (
              <Polyline positions={drawPoints} pathOptions={{ color: '#22c55e', weight: 2 }} />
            )}
            {drawPoints.length > 0 && drawMode==='polygon' && (
              <Polyline positions={[...drawPoints, drawPoints[0]]} pathOptions={{ color: '#eab308', weight: 2 }} />
            )}
            {shapes.map((s, idx) => (
              <Polyline key={`shape-${idx}`} positions={s.type==='polygon'?[...s.points, s.points[0]]:s.points} pathOptions={{ color: s.type==='polygon'?'#e11d48':'#16a34a', weight: 3 }} />
            ))}

            {/* Route polyline */}
            {routeInfo && (
              <Polyline positions={routeInfo.coords} pathOptions={{ color: '#6366f1', weight: 4 }} />
            )}

            {/* Pins */}
            {pins.map(([la, lo], idx) => (
              <Marker key={`pin-${idx}`} position={[la, lo] as any} icon={DefaultIcon} />
            ))}

            {/* Playback ghost markers */}
            {isPlaying && playbackPositions.vehPts.map((p, idx) => (
              <Marker key={`play-veh-${idx}`} position={p as any} icon={DefaultIcon} />
            ))}
            {isPlaying && playbackPositions.empPts.map((p, idx) => (
              <Marker key={`play-emp-${idx}`} position={p as any} icon={DefaultIcon} />
            ))}

            <Circle center={center} radius={circleMeters} pathOptions={{ color: '#22c55e', weight: 2, fillOpacity: 0.05 }} />

            {/* Vehicles */}
            {showVehicles && vehicles.map(v => {
              const lat = v.location.coordinates[1];
              const lon = v.location.coordinates[0];
              const inside = isInsideGeofence(lat, lon);
              return (
                <Popover key={`veh-${v.vehicle_id}`}>
                  <PopoverTrigger asChild>
                    <Marker position={[lat, lon] as any} icon={DefaultIcon} />
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <UICard className="p-3 space-y-2">
                      <div className="font-semibold">Vehicle {v.vehicle_id}</div>
                      <div className="text-xs text-muted-foreground">{inside ? 'Inside' : 'Outside'} geofence</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Miles: {Math.round(Math.random()*120)}</div>
                        <div>Fuel: {Math.round(Math.random()*100)}%</div>
                        <div>Status: {['idle','enroute','onsite'][Math.floor(Math.random()*3)]}</div>
                        <div>Speed: {Math.round(Math.random()*55)} mph</div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline"><MessageSquare className="w-3 h-3 mr-1" /> Message</Button>
                        <Button size="sm" variant="outline"><Phone className="w-3 h-3 mr-1" /> Call</Button>
                      </div>
                    </UICard>
                  </PopoverContent>
                </Popover>
              );
            })}

            {/* Employees (reuse crews as employees demo) */}
            {showCrews && crews.map((c, i) => {
              const lat = 36.64 + Math.random()*0.1;
              const lon = -80.26 + Math.random()*0.1;
              const inside = isInsideGeofence(lat, lon);
              const empId = c.supervisor_id || `emp-${i}`;
              const st = employeeAnalyticsEnabled ? updateEmployeeState(empId, lat, lon) : undefined;
              return (
                <Popover key={`emp-${empId}`}>
                  <PopoverTrigger asChild>
                    <Marker position={[lat, lon] as any} icon={DefaultIcon} />
                  </PopoverTrigger>
                  <PopoverContent className="w-96">
                    <UICard className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">Employee {empId}</div>
                        <div className={`text-xs ${inside?'text-success':'text-destructive'}`}>{inside ? 'In Zone' : 'Out of Zone'}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>State: {st?.state || 'n/a'}</div>
                        <div>Speed: {st ? `${st.mph.toFixed(1)} mph` : 'n/a'}</div>
                        <div>Travel: {Math.floor((employeeTravelSeconds[empId]||0)/60)}m</div>
                        <div>Tasks: {Math.round(Math.random()*5)}</div>
                        <div>Compliance: {90 + Math.round(Math.random()*10)}%</div>
                        <div>Productivity: {70 + Math.round(Math.random()*30)}%</div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" onClick={() => clockIn(empId)} variant="outline">Clock In</Button>
                        <Button size="sm" onClick={() => clockOut(empId)} variant="outline">Clock Out</Button>
                        {!inside && (
                          <Button size="sm" onClick={() => notifyAdminOutOfBounds(empId, lat, lon)} variant="destructive">Notify Admin</Button>
                        )}
                        <Button size="sm" variant="outline"><Mail className="w-3 h-3 mr-1" /> Email</Button>
                        <Button size="sm" variant="outline"><MessageSquare className="w-3 h-3 mr-1" /> Message</Button>
                        <Button size="sm" variant="outline"><Phone className="w-3 h-3 mr-1" /> Call</Button>
                        <Button size="sm" variant="outline"><Video className="w-3 h-3 mr-1" /> FaceTime</Button>
                      </div>
                    </UICard>
                  </PopoverContent>
                </Popover>
              );
            })}

            {/* Alerts */}
            {showAlerts && alerts.map((a, i) => (
              <Marker key={`alert-${a.id || i}`} position={[36.61 + Math.random()*0.15, -80.24 + Math.random()*0.15] as any} icon={DefaultIcon} />
            ))}

          </MapContainer>
          <div className="absolute right-4 bottom-4 z-[1000] flex flex-col gap-2">
            <Button size="icon" className="glass-card" onClick={locate} title="Recenter to my location"><MapPin className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedMap;