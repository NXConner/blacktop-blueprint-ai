import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Activity, Crosshair, Layers, Map, Radar } from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
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

const UnifiedMap: React.FC = () => {
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
    const load = async () => {
      try {
        setStatus('connecting');
        const [v, c, a] = await Promise.all([
          api.gps.getCurrentLocations(),
          api.crews.getAll(),
          api.alerts.getActive(),
        ]);
        if (v.success) setVehicles(v.data || []);
        if (c.success) setCrews(c.data || []);
        if (a.success) setAlerts(a.data || []);
        setStatus('connected');
      } catch {
        setStatus('disconnected');
      }
    };
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
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

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Unified Map Command Center</h1>
          <Badge variant="outline" className={`ml-2 ${status==='connected'?'text-success':status==='connecting'?'text-warning':'text-destructive'}`}>
            <Activity className="w-3 h-3 mr-1" /> {status}
          </Badge>
        </div>
        <div className="flex gap-2">
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
            <label htmlFor="vehToggle">Vehicles</label>
            <input id="crewToggle" type="checkbox" className="ml-3" checked={showCrews} onChange={e => setShowCrews(e.target.checked)} />
            <label htmlFor="crewToggle">Crews</label>
            <input id="alertToggle" type="checkbox" className="ml-3" checked={showAlerts} onChange={e => setShowAlerts(e.target.checked)} />
            <label htmlFor="alertToggle">Alerts</label>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-56">
              <div className="text-[10px] mb-1">Radius: {radiusMiles} mi</div>
              <Slider value={[radiusMiles]} min={1} max={50} step={1} onValueChange={(v) => setRadiusMiles(v[0] as number)} />
            </div>
          </div>
        </div>

        <div style={{ height: '70vh' }}>
          <MapContainer center={center as [number, number]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <RecenterMap center={center} />
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

            {showVehicles && vehicles.map(v => (
              <Marker key={v.vehicle_id} position={[v.location.coordinates[1], v.location.coordinates[0]] as any} icon={DefaultIcon} />
            ))}

            {showCrews && crews.map(c => (
              <Marker key={c.crew_id} position={[36.64 + Math.random()*0.1, -80.26 + Math.random()*0.1] as any} icon={DefaultIcon} />
            ))}

            {showAlerts && alerts.map(a => (
              <Marker key={a.id} position={[36.61 + Math.random()*0.15, -80.24 + Math.random()*0.15] as any} icon={DefaultIcon} />
            ))}
          </MapContainer>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedMap;