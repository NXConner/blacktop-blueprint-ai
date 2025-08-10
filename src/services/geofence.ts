import { offlineService } from '@/services/offline';
import { weatherService } from '@/services/weather';
import type { GeoCoordinate } from '@/types/database';

export interface GeofenceWeatherRisk {
  center: [number, number];
  radiusMiles: number;
  upcomingRain: boolean;
  precipitationChance: number;
  windowHours: number;
}

export async function getGeofenceWeatherRisk(windowHours: number = 12): Promise<GeofenceWeatherRisk | null> {
  const centerPref = await offlineService.getPreference<[number, number]>('map.center');
  const radius = (await offlineService.getPreference<number>('map.radiusMiles')) ?? 15;
  const center: [number, number] = Array.isArray(centerPref) ? [centerPref[0], centerPref[1]] : [36.6418, -80.2667];

  const location: GeoCoordinate = { type: 'Point', coordinates: [center[1], center[0]] };
  const forecast = await weatherService.getWeatherForecast(location);
  const now = new Date();
  const horizon = new Date(now.getTime() + windowHours * 3600 * 1000);
  const upcoming = (forecast.forecasts || []).filter(f => {
    const t = new Date(f.forecast_timestamp);
    return t >= now && t <= horizon;
  });
  const maxChance = upcoming.reduce((m, f) => Math.max(m, f.precipitation_probability || 0), 0);
  return {
    center,
    radiusMiles: radius,
    upcomingRain: maxChance >= 40,
    precipitationChance: maxChance,
    windowHours,
  };
}