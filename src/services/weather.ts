import { supabase } from '@/integrations/supabase/client';
import type { WeatherData, WeatherForecast, WeatherAlert, GeoCoordinate } from '@/types/database';

// Weather API configuration
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo_key';
const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather condition mappings
const WEATHER_CONDITION_MAP: Record<string, 'clear' | 'cloudy' | 'rain' | 'snow'> = {
  'clear sky': 'clear',
  'few clouds': 'clear',
  'scattered clouds': 'cloudy',
  'broken clouds': 'cloudy',
  'overcast clouds': 'cloudy',
  'light rain': 'rain',
  'moderate rain': 'rain',
  'heavy intensity rain': 'rain',
  'light snow': 'snow',
  'snow': 'snow',
  'heavy snow': 'snow',
};

interface OpenWeatherMapResponse {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}

interface ForecastResponse {
  list: Array<{
    dt: number;
    main: OpenWeatherMapResponse['main'];
    weather: OpenWeatherMapResponse['weather'];
    wind: OpenWeatherMapResponse['wind'];
    rain?: OpenWeatherMapResponse['rain'];
    snow?: OpenWeatherMapResponse['snow'];
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
  };
}

class WeatherService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Get current weather for a location
  async getCurrentWeather(location: GeoCoordinate): Promise<WeatherData> {
    const cacheKey = `current_${location.coordinates[1]}_${location.coordinates[0]}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const [longitude, latitude] = location.coordinates;
      const response = await fetch(
        `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenWeatherMapResponse = await response.json();
      const weatherData = this.transformCurrentWeatherData(data, location);

      // Cache the result
      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });

      // Store in database
      await this.storeWeatherData(weatherData);

      return weatherData;
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      
      // Fallback to cached data or default values
      const fallbackData: WeatherData = {
        id: crypto.randomUUID(),
        location_coordinates: location,
        temperature: undefined,
        humidity: undefined,
        wind_speed: undefined,
        wind_direction: undefined,
        precipitation: undefined,
        precipitation_probability: undefined,
        weather_condition: 'clear',
        forecast_timestamp: new Date().toISOString(),
        data_source: 'weather_api',
        created_at: new Date().toISOString(),
      };

      return fallbackData;
    }
  }

  // Get 5-day weather forecast
  async getWeatherForecast(location: GeoCoordinate): Promise<WeatherForecast> {
    const cacheKey = `forecast_${location.coordinates[1]}_${location.coordinates[0]}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const [longitude, latitude] = location.coordinates;
      const response = await fetch(
        `${WEATHER_API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: ForecastResponse = await response.json();
      const forecast = this.transformForecastData(data, location);

      // Cache the result
      this.cache.set(cacheKey, { data: forecast, timestamp: Date.now() });

      // Store forecast data in database
      await Promise.all(
        forecast.forecasts.map(forecastData => this.storeWeatherData(forecastData))
      );

      return forecast;
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      
      return {
        location,
        forecasts: [],
        alerts: [],
      };
    }
  }

  // Get weather alerts for a location
  async getWeatherAlerts(location: GeoCoordinate): Promise<WeatherAlert[]> {
    try {
      const [longitude, latitude] = location.coordinates;
      const response = await fetch(
        `${WEATHER_API_BASE_URL}/onecall?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&exclude=minutely,hourly&units=metric`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return this.transformWeatherAlerts(data.alerts || [], location);
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      return [];
    }
  }

  // Monitor weather conditions for projects
  async monitorProjectWeather(projectId: string): Promise<void> {
    try {
      // Get project location from database
      const { data: project } = await supabase
        .from('projects')
        .select('site_address, name')
        .eq('id', projectId)
        .single();

      if (!project?.site_address) {
        return;
      }

      // For demo purposes, use a default location (in production, geocode the address)
      const location: GeoCoordinate = {
        type: 'Point',
        coordinates: [-74.006, 40.7128] // NYC coordinates as example
      };

      const [currentWeather, forecast, alerts] = await Promise.all([
        this.getCurrentWeather(location),
        this.getWeatherForecast(location),
        this.getWeatherAlerts(location)
      ]);

      // Check for weather conditions that may affect work
      await this.checkWeatherImpact(projectId, currentWeather, forecast, alerts);

    } catch (error) {
      console.error(`Failed to monitor weather for project ${projectId}:`, error);
    }
  }

  // Check if weather conditions impact construction work
  private async checkWeatherImpact(
    projectId: string,
    current: WeatherData,
    forecast: WeatherForecast,
    alerts: WeatherAlert[]
  ): Promise<void> {
    const impacts: string[] = [];

    // Temperature checks
    if (current.temperature !== undefined) {
      if (current.temperature < 4) {
        impacts.push('Temperature too low for asphalt laying (< 4°C)');
      }
      if (current.temperature > 35) {
        impacts.push('Temperature too high for optimal work conditions (> 35°C)');
      }
    }

    // Precipitation checks
    if (current.precipitation !== undefined && current.precipitation > 0) {
      impacts.push('Active precipitation may delay outdoor work');
    }

    // Wind speed checks
    if (current.wind_speed !== undefined && current.wind_speed > 15) {
      impacts.push('High wind speeds may affect equipment operation');
    }

    // Check upcoming forecast for planning
    const next24Hours = forecast.forecasts.filter(f => {
      const forecastTime = new Date(f.forecast_timestamp);
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return forecastTime >= now && forecastTime <= twentyFourHoursFromNow;
    });

    const upcomingRain = next24Hours.some(f => 
      f.weather_condition === 'rain' || (f.precipitation && f.precipitation > 0)
    );

    if (upcomingRain) {
      impacts.push('Rain forecast within 24 hours - consider work scheduling');
    }

    // Create alerts for significant impacts
    if (impacts.length > 0) {
      await this.createWeatherAlert(projectId, impacts, alerts);
    }
  }

  // Create weather-related alerts
  private async createWeatherAlert(
    projectId: string,
    impacts: string[],
    weatherAlerts: WeatherAlert[]
  ): Promise<void> {
    try {
      const alertMessage = impacts.join('; ');
      const severity = this.determineSeverity(impacts, weatherAlerts);

      await supabase.from('notifications').insert({
        title: 'Weather Impact Alert',
        message: alertMessage,
        type: 'weather',
        data: {
          project_id: projectId,
          weather_impacts: impacts,
          alert_count: weatherAlerts.length,
        },
      });

      console.log(`Weather alert created for project ${projectId}: ${alertMessage}`);
    } catch (error) {
      console.error('Failed to create weather alert:', error);
    }
  }

  // Determine alert severity
  private determineSeverity(impacts: string[], alerts: WeatherAlert[]): 'low' | 'medium' | 'high' | 'critical' {
    if (alerts.some(alert => alert.severity === 'warning')) {
      return 'critical';
    }
    if (impacts.some(impact => impact.includes('too low') || impact.includes('too high'))) {
      return 'high';
    }
    if (impacts.length > 2) {
      return 'medium';
    }
    return 'low';
  }

  // Store weather data in database
  private async storeWeatherData(weatherData: WeatherData): Promise<void> {
    try {
      await supabase.from('weather_station_data').insert({
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        wind_speed: weatherData.wind_speed,
        wind_direction: weatherData.wind_direction,
        precipitation: weatherData.precipitation,
        weather_condition: weatherData.weather_condition,
        recorded_at: weatherData.forecast_timestamp,
        location: `POINT(${weatherData.location_coordinates.coordinates[0]} ${weatherData.location_coordinates.coordinates[1]})`,
        data_source: weatherData.data_source,
      });
    } catch (error) {
      console.error('Failed to store weather data:', error);
    }
  }

  // Transform OpenWeatherMap data to our format
  private transformCurrentWeatherData(data: OpenWeatherMapResponse, location: GeoCoordinate): WeatherData {
    const description = data.weather[0]?.description.toLowerCase() || 'clear';
    const weatherCondition = WEATHER_CONDITION_MAP[description] || 'clear';

    return {
      id: crypto.randomUUID(),
      location_coordinates: location,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      wind_direction: data.wind.deg,
      precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
      precipitation_probability: undefined, // Not available in current weather
      weather_condition: weatherCondition,
      forecast_timestamp: new Date(data.dt * 1000).toISOString(),
      data_source: 'weather_api',
      created_at: new Date().toISOString(),
    };
  }

  // Transform forecast data
  private transformForecastData(data: ForecastResponse, location: GeoCoordinate): WeatherForecast {
    const forecasts: WeatherData[] = data.list.map((item, index) => {
      const description = item.weather[0]?.description.toLowerCase() || 'clear';
      const weatherCondition = WEATHER_CONDITION_MAP[description] || 'clear';

      return {
        id: crypto.randomUUID(),
        location_coordinates: location,
        temperature: Math.round(item.main.temp),
        humidity: item.main.humidity,
        wind_speed: Math.round(item.wind.speed * 3.6),
        wind_direction: item.wind.deg,
        precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
        precipitation_probability: undefined,
        weather_condition: weatherCondition,
        forecast_timestamp: new Date(item.dt * 1000).toISOString(),
        data_source: 'weather_api',
        created_at: new Date().toISOString(),
      };
    });

    return {
      location,
      forecasts,
      alerts: [], // Will be populated separately
    };
  }

  // Transform weather alerts
  private transformWeatherAlerts(alerts: unknown[], location: GeoCoordinate): WeatherAlert[] {
    return alerts.map(alert => ({
      id: crypto.randomUUID(),
      type: this.mapAlertType(alert.event),
      severity: this.mapAlertSeverity(alert.severity),
      message: alert.description,
      start_time: new Date(alert.start * 1000).toISOString(),
      end_time: new Date(alert.end * 1000).toISOString(),
      affected_area: {
        type: 'Polygon',
        coordinates: [[
          [location.coordinates[0] - 0.1, location.coordinates[1] - 0.1],
          [location.coordinates[0] + 0.1, location.coordinates[1] - 0.1],
          [location.coordinates[0] + 0.1, location.coordinates[1] + 0.1],
          [location.coordinates[0] - 0.1, location.coordinates[1] + 0.1],
          [location.coordinates[0] - 0.1, location.coordinates[1] - 0.1],
        ]],
      },
    }));
  }

  private mapAlertType(event: string): 'precipitation' | 'temperature' | 'wind' | 'severe' {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('rain') || eventLower.includes('snow')) return 'precipitation';
    if (eventLower.includes('wind')) return 'wind';
    if (eventLower.includes('heat') || eventLower.includes('cold')) return 'temperature';
    return 'severe';
  }

  private mapAlertSeverity(severity: string): 'watch' | 'warning' | 'advisory' {
    const severityLower = severity?.toLowerCase() || '';
    if (severityLower.includes('warning')) return 'warning';
    if (severityLower.includes('watch')) return 'watch';
    return 'advisory';
  }

  // Get weather history for analytics
  async getWeatherHistory(
    location: GeoCoordinate,
    startDate: string,
    endDate: string
  ): Promise<WeatherData[]> {
    try {
      const { data, error } = await supabase
        .from('weather_station_data')
        .select('*')
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate)
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      return data.map(record => ({
        id: record.id,
        location_coordinates: location,
        temperature: record.temperature,
        humidity: record.humidity,
        wind_speed: record.wind_speed,
        wind_direction: record.wind_direction,
        precipitation: record.precipitation,
        precipitation_probability: record.precipitation_probability,
        weather_condition: record.weather_condition as any,
        forecast_timestamp: record.recorded_at,
        data_source: record.data_source || 'local_sensor',
        created_at: record.created_at,
      }));
    } catch (error) {
      console.error('Failed to fetch weather history:', error);
      return [];
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Start monitoring all active projects
  async startProjectMonitoring(): Promise<void> {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('status', 'active');

      if (projects) {
        const monitoringPromises = projects.map(project => 
          this.monitorProjectWeather(project.id)
        );
        
        await Promise.allSettled(monitoringPromises);
      }
    } catch (error) {
      console.error('Failed to start project monitoring:', error);
    }
  }
}

// Export singleton instance
export const weatherService = new WeatherService();

// React hook for weather data
export function useWeatherData(location: GeoCoordinate) {
  const [currentWeather, setCurrentWeather] = React.useState<WeatherData | null>(null);
  const [forecast, setForecast] = React.useState<WeatherForecast | null>(null);
  const [alerts, setAlerts] = React.useState<WeatherAlert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [current, forecast, alerts] = await Promise.all([
          weatherService.getCurrentWeather(location),
          weatherService.getWeatherForecast(location),
          weatherService.getWeatherAlerts(location),
        ]);

        if (mounted) {
          setCurrentWeather(current);
          setForecast(forecast);
          setAlerts(alerts);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchWeatherData();

    // Set up periodic updates every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [location.coordinates[0], location.coordinates[1]]);

  return {
    currentWeather,
    forecast,
    alerts,
    loading,
    error,
    refetch: () => weatherService.clearCache(),
  };
}

import React from 'react';