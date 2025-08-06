import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { 
  Map, 
  Globe, 
  Satellite, 
  Navigation, 
  MapPin, 
  Layers, 
  ChevronDown,
  Building,
  Mountain,
  TreePine,
  Compass,
  Target,
  Route,
  Radar
} from 'lucide-react';

export interface MapService {
  id: string;
  name: string;
  provider: string;
  type: 'satellite' | 'street' | 'terrain' | 'hybrid' | 'gis' | 'topographic' | 'specialty';
  description: string;
  icon: React.ReactNode;
  capabilities: string[];
  region?: string;
  url?: string;
  apiKey?: string;
  free: boolean;
}

interface MapServiceSelectorProps {
  selectedService: string;
  onServiceChange: (service: MapService) => void;
  className?: string;
}

const mapServices: MapService[] = [
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    provider: 'OSM Foundation',
    type: 'street',
    description: 'Collaborative street map with global coverage',
    icon: <Map className="w-4 h-4" />,
    capabilities: ['Street View', 'POI Data', 'Routing', 'Free Usage'],
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    free: true
  },
  {
    id: 'google-satellite',
    name: 'Google Satellite',
    provider: 'Google Maps',
    type: 'satellite',
    description: 'High-resolution satellite imagery',
    icon: <Satellite className="w-4 h-4" />,
    capabilities: ['High Resolution', 'Global Coverage', 'Recent Imagery', 'Street View'],
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    free: false
  },
  {
    id: 'google-terrain',
    name: 'Google Terrain',
    provider: 'Google Maps',
    type: 'terrain',
    description: 'Topographic terrain with elevation data',
    icon: <Mountain className="w-4 h-4" />,
    capabilities: ['Terrain Data', 'Elevation', 'Contour Lines', 'Trail Maps'],
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    free: false
  },
  {
    id: 'esri-world-imagery',
    name: 'ESRI World Imagery',
    provider: 'ESRI/ArcGIS',
    type: 'satellite',
    description: 'High-quality satellite and aerial imagery',
    icon: <Globe className="w-4 h-4" />,
    capabilities: ['ArcGIS Integration', 'High Quality', 'Global Coverage', 'GIS Features'],
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    free: true
  },
  {
    id: 'esri-topo',
    name: 'ESRI Topographic',
    provider: 'ESRI/ArcGIS',
    type: 'topographic',
    description: 'Detailed topographic maps with contours',
    icon: <Compass className="w-4 h-4" />,
    capabilities: ['Topographic Data', 'Contour Lines', 'Trail Information', 'Elevation'],
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    free: true
  },
  {
    id: 'usgs-topo',
    name: 'USGS Topographic',
    provider: 'US Geological Survey',
    type: 'topographic',
    description: 'Official USGS topographic quadrangle maps',
    icon: <Target className="w-4 h-4" />,
    capabilities: ['Official USGS', 'Detailed Contours', 'Survey Grade', 'Historical Data'],
    region: 'United States',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    free: true
  },
  {
    id: 'patrick-county-gis',
    name: 'Patrick County GIS',
    provider: 'Patrick County, VA',
    type: 'gis',
    description: 'Local GIS data for Patrick County, Virginia',
    icon: <Building className="w-4 h-4" />,
    capabilities: ['Property Data', 'Local Infrastructure', 'Zoning', 'Tax Maps'],
    region: 'Patrick County, Virginia',
    url: 'https://gis.patrickcountyva.gov/arcgis/rest/services/Public/MapServer/tile/{z}/{y}/{x}',
    free: true
  },
  {
    id: 'qgis-server',
    name: 'QGIS Server',
    provider: 'QGIS Project',
    type: 'gis',
    description: 'Open source GIS server with custom layers',
    icon: <Layers className="w-4 h-4" />,
    capabilities: ['Custom Layers', 'WMS/WFS', 'Open Source', 'Advanced Analysis'],
    url: 'custom-qgis-server',
    free: true
  },
  {
    id: 'cartodb-positron',
    name: 'CartoDB Positron',
    provider: 'CartoDB/CARTO',
    type: 'street',
    description: 'Clean, minimal basemap for data visualization',
    icon: <Navigation className="w-4 h-4" />,
    capabilities: ['Data Visualization', 'Clean Design', 'Minimal Style', 'Analytics'],
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    free: true
  },
  {
    id: 'nasa-modis',
    name: 'NASA MODIS',
    provider: 'NASA',
    type: 'satellite',
    description: 'NASA satellite imagery from MODIS sensors',
    icon: <Radar className="w-4 h-4" />,
    capabilities: ['Scientific Data', 'Environmental', 'Weather Patterns', 'Real-time'],
    url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/YYYY-MM-DD/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    free: true
  },
  {
    id: 'stamen-terrain',
    name: 'Stamen Terrain',
    provider: 'Stamen Design',
    type: 'terrain',
    description: 'Beautiful hand-crafted terrain maps',
    icon: <TreePine className="w-4 h-4" />,
    capabilities: ['Artistic Design', 'Terrain Features', 'Natural Colors', 'Hiking'],
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
    free: true
  },
  {
    id: 'virginia-gis',
    name: 'Virginia State GIS',
    provider: 'Commonwealth of Virginia',
    type: 'gis',
    description: 'Statewide GIS data for Virginia',
    icon: <MapPin className="w-4 h-4" />,
    capabilities: ['State Data', 'Infrastructure', 'Demographics', 'Land Use'],
    region: 'Virginia',
    url: 'https://gismaps.vgin.virginia.gov/arcgis/rest/services/VBMP_Basemap/MapServer/tile/{z}/{y}/{x}',
    free: true
  },
  {
    id: 'here-satellite',
    name: 'HERE Satellite',
    provider: 'HERE Technologies',
    type: 'satellite',
    description: 'HERE satellite imagery with traffic data',
    icon: <Route className="w-4 h-4" />,
    capabilities: ['Traffic Data', 'Real-time Updates', 'Navigation', 'Commercial Grade'],
    url: 'requires-api-key',
    free: false
  }
];

const MapServiceSelector: React.FC<MapServiceSelectorProps> = ({
  selectedService,
  onServiceChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentService = mapServices.find(service => service.id === selectedService) || mapServices[0];
  
  const servicesByType = mapServices.reduce((acc, service) => {
    if (!acc[service.type]) {
      acc[service.type] = [];
    }
    acc[service.type].push(service);
    return acc;
  }, {} as Record<string, MapService[]>);

  const handleServiceSelect = (service: MapService) => {
    onServiceChange(service);
    setIsOpen(false);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      satellite: 'Satellite & Aerial',
      street: 'Street Maps',
      terrain: 'Terrain & Topographic',
      gis: 'GIS & Government',
      specialty: 'Specialty Maps'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      satellite: <Satellite className="w-4 h-4" />,
      street: <Map className="w-4 h-4" />,
      terrain: <Mountain className="w-4 h-4" />,
      gis: <Building className="w-4 h-4" />,
      specialty: <Compass className="w-4 h-4" />
    };
    return icons[type] || <Map className="w-4 h-4" />;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between glass-card hover:glass-card-hover"
          >
            <div className="flex items-center gap-2">
              {currentService.icon}
              <span className="font-medium">{currentService.name}</span>
              {currentService.region && (
                <Badge variant="secondary" className="text-xs">
                  {currentService.region}
                </Badge>
              )}
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 max-h-96 overflow-y-auto glass-elevated"
          align="start"
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-primary">
            <Globe className="w-4 h-4" />
            Select Map Service
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(servicesByType).map(([type, services]) => (
            <div key={type}>
              <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {getTypeIcon(type)}
                {getTypeLabel(type)}
              </DropdownMenuLabel>
              
              {services.map((service) => (
                <DropdownMenuItem
                  key={service.id}
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50"
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {service.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{service.name}</span>
                      {service.free ? (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                          Free
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                          API Key
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1">
                      {service.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {service.capabilities.slice(0, 3).map((capability) => (
                        <Badge 
                          key={capability} 
                          variant="secondary" 
                          className="text-xs px-1.5 py-0.5"
                        >
                          {capability}
                        </Badge>
                      ))}
                      {service.capabilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          +{service.capabilities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Service Details */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Provider: {currentService.provider}</span>
        <div className="flex items-center gap-2">
          {currentService.free ? (
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              Free Service
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
              Requires API Key
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapServiceSelector;
export { mapServices };
export type { MapService };