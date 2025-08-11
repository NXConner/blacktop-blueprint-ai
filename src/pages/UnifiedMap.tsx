import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Activity, Crosshair, Layers, Map, Radar, Maximize2, CornerDownRight, Search, RefreshCcw } from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Circle, useMap, Polyline } from 'react-leaflet';
import L, { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { offlineService } from '@/services/offline';
import { api } from '@/services/api';

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

const UnifiedMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen p-4" ref={containerRef}>
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
        <div className="flex flex-wrap items-center gap-3 p-3 border-b border-glass-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <select className="text-sm bg-transparent" value={basemap} onChange={e => setBasemap(e.target.value as any)}>
              <option value="osm">OSM</option>
              <option value="esri">ESRI Imagery</option>
              <option value="stamen">Stamen Terrain</option>
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
        </div>

        <div style={{ height: '70vh' }}>
          <MapContainer center={center as [number, number]} zoom={10} preferCanvas style={{ height: '100%', width: '100%' }} whenCreated={(map) => {
            // Custom event listener to call fitBounds from above button
            const container = (map as any)._container as HTMLElement;
            const handler = (e: Event) => {
              const detail = (e as CustomEvent).detail as LatLngBoundsExpression;
              map.fitBounds(detail, { padding: [24, 24] });
            };
            container.addEventListener('fit-bounds', handler);
            (map as any)._fitHandler = handler;
          }}>
            <RecenterMap center={center} />
            <MapEnhancements />
            {basemap === 'osm' && (
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            )}
            {basemap === 'esri' && (
              <TileLayer attribution='&copy; ESRI' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            )}
            {basemap === 'stamen' && (
              <TileLayer attribution='&copy; Stamen' url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png" />
            )}

            {radarEnabled && (
              <WMSTileLayer
                url="https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi"
                params={{ layers: 'nexrad-n0r-900913', transparent: true, format: 'image/png' }}
                opacity={radarOpacity}
              />
            )}

            <Circle center={center} radius={circleMeters} pathOptions={{ color: '#22c55e', weight: 2, fillOpacity: 0.05 }} />

            {vehicleMarkers}
            {crewMarkers}
            {alertMarkers}
          </MapContainer>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedMap;