import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { MapPin, Crosshair, Radar, RefreshCw } from 'lucide-react';
import { offlineService } from '@/services/offline';

import { MapContainer, TileLayer, WMSTileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths for Leaflet in bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

interface RadarMapProps {
  className?: string;
  height?: string;
}

const BUSINESS_COORDS: LatLngExpression = [36.6418, -80.2667]; // Stuart, VA approx

function RecenterMap({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const milesToMeters = (miles: number) => miles * 1609.34;

const RadarMap: React.FC<RadarMapProps> = ({ className = '', height = '520px' }) => {
  const [center, setCenter] = useState<LatLngExpression>(BUSINESS_COORDS);
  const [radiusMiles, setRadiusMiles] = useState<number>(15);
  const [locStatus, setLocStatus] = useState<'idle' | 'locating' | 'located' | 'error'>('idle');
  const [radarEnabled, setRadarEnabled] = useState<boolean>(true);
  const [radarOpacity, setRadarOpacity] = useState<number>(0.6);

  useEffect(() => {
    // Load saved preference
    offlineService.getPreference<number>('map.radiusMiles').then((saved) => {
      if (typeof saved === 'number') setRadiusMiles(Math.min(50, Math.max(1, saved)));
    });
    offlineService.getPreference<[number, number]>('map.center').then((saved) => {
      if (Array.isArray(saved) && saved.length === 2) setCenter([saved[0], saved[1]]);
    });
    offlineService.getPreference<boolean>('map.radarEnabled').then((v) => { if (typeof v === 'boolean') setRadarEnabled(v); });
    offlineService.getPreference<number>('map.radarOpacity').then((v) => { if (typeof v === 'number') setRadarOpacity(Math.min(1, Math.max(0, v))); });
  }, []);

  useEffect(() => {
    // Persist preference
    void offlineService.setPreference('map.radiusMiles', radiusMiles);
  }, [radiusMiles]);

  useEffect(() => {
    void offlineService.setPreference('map.radarEnabled', radarEnabled);
  }, [radarEnabled]);

  useEffect(() => {
    void offlineService.setPreference('map.radarOpacity', radarOpacity);
  }, [radarOpacity]);

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
        setCenter(next);
        void offlineService.setPreference('map.center', [pos.coords.latitude, pos.coords.longitude]);
        setLocStatus('located');
      },
      () => setLocStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const circleMeters = useMemo(() => milesToMeters(radiusMiles), [radiusMiles]);

  return (
    <Card className={`glass-card ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Rain Radar & Radius</h3>
          <Badge variant="outline" className="ml-2">{radiusMiles} mi</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setRadiusMiles(15)}>
            <RefreshCw className="w-4 h-4 mr-1" /> Default 15mi
          </Button>
          <Button variant="outline" size="sm" onClick={locate}>
            <Crosshair className="w-4 h-4 mr-1" /> {locStatus === 'locating' ? 'Locating...' : 'Use My Location'}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 text-sm text-muted-foreground">Adjust radius (1 - 50 miles)</div>
        <Slider
          value={[radiusMiles]}
          min={1}
          max={50}
          step={1}
          onValueChange={(v) => setRadiusMiles(v[0])}
          className="max-w-md"
        />
      </div>

      <div style={{ height }} className="relative">
        <div className="absolute z-[1000] m-2 p-2 bg-background/80 rounded border border-glass-border space-y-2">
          <div className="flex items-center gap-2">
            <input id="radarToggle" type="checkbox" checked={radarEnabled} onChange={(e) => setRadarEnabled(e.target.checked)} />
            <label htmlFor="radarToggle" className="text-xs">Radar</label>
          </div>
          <div className="w-40">
            <div className="text-[10px] mb-1">Radar Opacity</div>
            <Slider value={[radarOpacity]} min={0} max={1} step={0.05} onValueChange={(v) => setRadarOpacity(v[0] as number)} />
          </div>
        </div>
        <MapContainer center={center as [number, number]} zoom={10} zoomControl className="rounded-b-lg" style={{ height: '100%', width: '100%' }}>
          <RecenterMap center={center} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* NOAA NEXRAD WMS */}
          {radarEnabled && (
            <WMSTileLayer
              url="https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi"
              params={{
                layers: 'nexrad-n0r-900913',
                transparent: true,
                format: 'image/png'
              }}
              opacity={radarOpacity}
            />
          )}

          <Marker position={center} icon={DefaultIcon} />
          <Circle center={center} radius={circleMeters} pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.08 }} />
        </MapContainer>
      </div>

      <div className="p-4 text-xs text-muted-foreground border-t border-glass-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>Center defaults to your location if permitted, otherwise business HQ (Stuart, VA).</span>
        </div>
      </div>
    </Card>
  );
};

export default RadarMap;