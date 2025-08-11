import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Truck, Users, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { api } from '@/services/api';
import { offlineService } from '@/services/offline';

const DefaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon as any;

const milesToMeters = (miles: number) => miles * 1609.34;

const OverWatchLeafletMap: React.FC<{ height?: string }> = ({ height = '600px' }) => {
  const [center, setCenter] = useState<[number, number]>([36.6418, -80.2667]);
  const [radiusMiles, setRadiusMiles] = useState<number>(15);
  const [basemap, setBasemap] = useState<'osm' | 'esri' | 'stamen'>('osm');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [status, setStatus] = useState<'connected'|'connecting'|'disconnected'>('connecting');

  useEffect(() => {
    offlineService.getPreference<number>('map.radiusMiles').then(v => { if (typeof v === 'number') setRadiusMiles(v); });
    offlineService.getPreference<[number, number]>('map.center').then(v => { if (Array.isArray(v) && v.length===2) setCenter([v[0], v[1]]); });
    offlineService.getPreference<'osm'|'esri'|'stamen'>('map.basemap').then(v => { if (v) setBasemap(v); });
  }, []);

  useEffect(() => {
    offlineService.setPreference('map.basemap', basemap);
  }, [basemap]);

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

  return (
    <Card className="glass-elevated">
      <div className="flex items-center justify-between p-3 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`glass-card ${status==='connected'?'text-success':status==='connecting'?'text-warning':'text-destructive'}`}>
            <Activity className="w-3 h-3 mr-1" /> {status}
          </Badge>
          <div className="text-xs text-muted-foreground">{vehicles.length} Vehicles · {crews.length} Crews · {alerts.length} Alerts</div>
        </div>
      </div>
      <div style={{ height }}>
        <div className="absolute z-[1000] m-2 p-1 bg-background/80 rounded border border-glass-border">
          <select className="text-xs bg-transparent" value={basemap} onChange={e => setBasemap(e.target.value as any)}>
            <option value="osm">OSM</option>
            <option value="esri">ESRI Imagery</option>
            <option value="stamen">Stamen Terrain</option>
          </select>
        </div>
        <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
          {basemap === 'osm' && (
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          )}
          {basemap === 'esri' && (
            <TileLayer attribution='&copy; ESRI' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          )}
          {basemap === 'stamen' && (
            <TileLayer attribution='&copy; Stamen' url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png" />
          )}
          <WMSTileLayer url="https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi" params={{ layers: 'nexrad-n0r-900913', transparent: true, format: 'image/png' }} opacity={0.5} />
          <Circle center={center} radius={circleMeters} pathOptions={{ color: '#22c55e', weight: 2, fillOpacity: 0.05 }} />
          {vehicles.map(v => (
            <Marker key={v.vehicle_id} position={[v.location.coordinates[1], v.location.coordinates[0]] as any} icon={DefaultIcon} />
          ))}
          {crews.map(c => (
            <Marker key={c.crew_id} position={[36.64 + Math.random()*0.1, -80.26 + Math.random()*0.1] as any} icon={DefaultIcon} />
          ))}
        </MapContainer>
      </div>
    </Card>
  );
};

export default OverWatchLeafletMap;