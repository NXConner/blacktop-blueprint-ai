import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Layers, 
  Plus,
  Trash2, 
  Copy,
  Save,
  Upload,
  Download,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Map,
  Satellite,
  Navigation,
  Building,
  TreePine,
  Zap,
  Camera,
  Activity,
  Database,
  Globe,
  Target
} from 'lucide-react';

export interface MapOverlay {
  id: string;
  name: string;
  type: 'gis' | 'satellite' | 'weather' | 'traffic' | 'demographics' | 'environmental' | 'custom' | 'wms' | 'geojson';
  url?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  locked: boolean;
  source: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  properties: Record<string, any>;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  lastUpdated: Date;
}

interface MapOverlayManagerProps {
  overlays: MapOverlay[];
  onOverlaysChange: (overlays: MapOverlay[]) => void;
  className?: string;
}

interface OverlayTemplate {
  id: string;
  name: string;
  type: MapOverlay['type'];
  icon: React.ReactNode;
  description: string;
  source: string;
  defaultUrl?: string;
  properties: Record<string, any>;
}

const overlayTemplates: OverlayTemplate[] = [
  {
    id: 'patrick-county-parcels',
    name: 'Patrick County Parcels',
    type: 'gis',
    icon: <Building className="w-4 h-4" />,
    description: 'Property parcels and boundaries for Patrick County, VA',
    source: 'Patrick County GIS',
    defaultUrl: 'https://gis.patrickcountyva.gov/server/rest/services/Parcels/MapServer',
    properties: { layer: 'parcels', format: 'esri' }
  },
  {
    id: 'virginia-transportation',
    name: 'VA Transportation',
    type: 'gis',
    icon: <Navigation className="w-4 h-4" />,
    description: 'Virginia Department of Transportation road networks',
    source: 'VDOT',
    defaultUrl: 'https://gismaps.vgin.virginia.gov/arcgis/rest/services/Transportation/MapServer',
    properties: { layer: 'roads', format: 'esri' }
  },
  {
    id: 'usgs-elevation',
    name: 'USGS Elevation',
    type: 'gis',
    icon: <Target className="w-4 h-4" />,
    description: 'USGS Digital Elevation Model data',
    source: 'USGS',
    defaultUrl: 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer',
    properties: { layer: 'elevation', format: 'raster' }
  },
  {
    id: 'weather-radar',
    name: 'Weather Radar',
    type: 'weather',
    icon: <Activity className="w-4 h-4" />,
    description: 'Real-time weather radar imagery',
    source: 'NOAA',
    defaultUrl: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi',
    properties: { layer: 'nexrad-n0r', refresh: 300 }
  },
  {
    id: 'satellite-imagery',
    name: 'Recent Satellite',
    type: 'satellite',
    icon: <Satellite className="w-4 h-4" />,
    description: 'Recent high-resolution satellite imagery',
    source: 'Various',
    defaultUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    properties: { layer: 'imagery', maxZoom: 19 }
  },
  {
    id: 'environmental-data',
    name: 'Environmental Monitoring',
    type: 'environmental',
    icon: <TreePine className="w-4 h-4" />,
    description: 'Air quality, water quality, and environmental sensors',
    source: 'EPA',
    defaultUrl: 'https://geodata.epa.gov/arcgis/rest/services/OEI/FRS_INTERESTS/MapServer',
    properties: { layer: 'environmental', format: 'json' }
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    type: 'gis',
    icon: <Zap className="w-4 h-4" />,
    description: 'Utilities, power lines, and infrastructure data',
    source: 'Multiple',
    properties: { layer: 'infrastructure', category: 'utilities' }
  },
  {
    id: 'demographics',
    name: 'Census Demographics',
    type: 'demographics',
    icon: <Database className="w-4 h-4" />,
    description: 'US Census demographic and economic data',
    source: 'US Census Bureau',
    defaultUrl: 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2019/MapServer',
    properties: { layer: 'demographics', year: 2019 }
  }
];

const MapOverlayManager: React.FC<MapOverlayManagerProps> = ({
  overlays,
  onOverlaysChange,
  className = ''
}) => {
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [newOverlayUrl, setNewOverlayUrl] = useState('');
  const [newOverlayName, setNewOverlayName] = useState('');

  const addOverlay = (template: OverlayTemplate, customUrl?: string) => {
    const newOverlay: MapOverlay = {
      id: `overlay-${Date.now()}-${Math.random()}`,
      name: template.name,
      type: template.type,
      url: customUrl || template.defaultUrl,
      visible: true,
      opacity: 80,
      zIndex: overlays.length + 1,
      locked: false,
      source: template.source,
      description: template.description,
      icon: template.icon,
      color: getTypeColor(template.type),
      properties: { ...template.properties },
      lastUpdated: new Date()
    };

    onOverlaysChange([...overlays, newOverlay]);
  };

  const addCustomOverlay = () => {
    if (!newOverlayUrl || !newOverlayName) return;

    const newOverlay: MapOverlay = {
      id: `custom-overlay-${Date.now()}`,
      name: newOverlayName,
      type: 'custom',
      url: newOverlayUrl,
      visible: true,
      opacity: 80,
      zIndex: overlays.length + 1,
      locked: false,
      source: 'Custom',
      description: 'Custom overlay layer',
      icon: <Globe className="w-4 h-4" />,
      color: '#6b7280',
      properties: {},
      lastUpdated: new Date()
    };

    onOverlaysChange([...overlays, newOverlay]);
    setNewOverlayUrl('');
    setNewOverlayName('');
    setShowAddOverlay(false);
  };

  const removeOverlay = (id: string) => {
    onOverlaysChange(overlays.filter(o => o.id !== id));
    if (selectedOverlay === id) {
      setSelectedOverlay(null);
    }
  };

  const updateOverlay = (id: string, updates: Partial<MapOverlay>) => {
    onOverlaysChange(overlays.map(o => 
      o.id === id ? { ...o, ...updates, lastUpdated: new Date() } : o
    ));
  };

  const duplicateOverlay = (overlay: MapOverlay) => {
    const duplicated: MapOverlay = {
      ...overlay,
      id: `overlay-${Date.now()}-${Math.random()}`,
      name: `${overlay.name} (Copy)`,
      zIndex: overlays.length + 1,
      lastUpdated: new Date()
    };

    onOverlaysChange([...overlays, duplicated]);
  };

  const moveOverlay = (id: string, direction: 'up' | 'down') => {
    const overlay = overlays.find(o => o.id === id);
    if (!overlay) return;

    const newZIndex = direction === 'up' ? overlay.zIndex + 1 : overlay.zIndex - 1;
    const overlayAtTarget = overlays.find(o => o.zIndex === newZIndex);

    if (overlayAtTarget) {
      updateOverlay(overlay.id, { zIndex: newZIndex });
      updateOverlay(overlayAtTarget.id, { zIndex: overlay.zIndex });
    }
  };

  const getTypeColor = (type: MapOverlay['type']): string => {
    const colors = {
      gis: '#3b82f6',
      satellite: '#8b5cf6',
      weather: '#06b6d4',
      traffic: '#ef4444',
      demographics: '#f59e0b',
      environmental: '#22c55e',
      custom: '#6b7280',
      wms: '#ec4899',
      geojson: '#14b8a6'
    };
    return colors[type] || '#6b7280';
  };

  const getTypeIcon = (type: MapOverlay['type']) => {
    const icons = {
      gis: <Building className="w-4 h-4" />,
      satellite: <Satellite className="w-4 h-4" />,
      weather: <Activity className="w-4 h-4" />,
      traffic: <Navigation className="w-4 h-4" />,
      demographics: <Database className="w-4 h-4" />,
      environmental: <TreePine className="w-4 h-4" />,
      custom: <Globe className="w-4 h-4" />,
      wms: <Map className="w-4 h-4" />,
      geojson: <Target className="w-4 h-4" />
    };
    return icons[type] || <Map className="w-4 h-4" />;
  };

  const exportOverlays = () => {
    const exportData = {
      overlays: overlays.map(o => ({
        ...o,
        lastUpdated: o.lastUpdated.toISOString()
      })),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `map-overlays-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAllOverlays = (visible: boolean) => {
    onOverlaysChange(overlays.map(o => ({ ...o, visible })));
  };

  const getOverlaySummary = () => {
    return {
      total: overlays.length,
      visible: overlays.filter(o => o.visible).length,
      byType: overlays.reduce((acc, overlay) => {
        acc[overlay.type] = (acc[overlay.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  const summary = getOverlaySummary();
  const sortedOverlays = [...overlays].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <Card className={`glass-card ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Map Overlays
          </h4>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllOverlays(false)}
              disabled={overlays.length === 0}
              className="h-8 w-8 p-0"
            >
              <EyeOff className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleAllOverlays(true)}
              disabled={overlays.length === 0}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportOverlays}
              disabled={overlays.length === 0}
              className="h-8 w-8 p-0"
            >
              <Save className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overlays" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overlays">Active</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overlays" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {summary.visible} of {summary.total} overlays visible
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddOverlay(!showAddOverlay)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Custom
              </Button>
            </div>

            {showAddOverlay && (
              <div className="space-y-2 p-3 bg-muted/20 rounded">
                <input
                  type="text"
                  placeholder="Overlay name..."
                  value={newOverlayName}
                  onChange={(e) => setNewOverlayName(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-background border rounded"
                />
                <input
                  type="url"
                  placeholder="WMS/WFS URL or GeoJSON URL..."
                  value={newOverlayUrl}
                  onChange={(e) => setNewOverlayUrl(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-background border rounded"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCustomOverlay}>Add</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddOverlay(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {overlays.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No overlays added</p>
                <p className="text-xs">Add overlays from the Available tab</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {sortedOverlays.map((overlay) => (
                  <div
                    key={overlay.id}
                    className={`p-3 rounded border ${
                      selectedOverlay === overlay.id ? 'bg-accent border-primary' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Switch
                        checked={overlay.visible}
                        onCheckedChange={(checked) => updateOverlay(overlay.id, { visible: checked })}
                      />
                      
                      <div 
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: overlay.color }}
                      >
                        {overlay.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{overlay.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {overlay.source} • Layer {overlay.zIndex}
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {overlay.type}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveOverlay(overlay.id, 'up')}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveOverlay(overlay.id, 'down')}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateOverlay(overlay.id, { locked: !overlay.locked })}
                        >
                          {overlay.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => duplicateOverlay(overlay)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeOverlay(overlay.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {overlay.visible && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium">Opacity: {overlay.opacity}%</label>
                          <Slider
                            value={[overlay.opacity]}
                            onValueChange={([value]) => updateOverlay(overlay.id, { opacity: value })}
                            min={10}
                            max={100}
                            step={10}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {overlay.description}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="space-y-3 mt-4">
            <div className="text-sm font-medium">Pre-configured Overlays</div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {overlayTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 p-3 rounded border border-border hover:bg-accent/50 cursor-pointer"
                  onClick={() => addOverlay(template)}
                >
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${getTypeColor(template.type)}20`, color: getTypeColor(template.type) }}
                  >
                    {template.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Source: {template.source}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {template.type}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <div>
              <h5 className="font-medium text-sm mb-3">Overlay Statistics</h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Overlays:</span>
                    <span className="font-medium">{summary.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currently Visible:</span>
                    <span className="font-medium">{summary.visible}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>GIS Layers:</span>
                    <span className="font-medium">{summary.byType.gis || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom Layers:</span>
                    <span className="font-medium">{summary.byType.custom || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h5 className="font-medium text-sm mb-3">Global Settings</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Auto-refresh Overlays</div>
                    <div className="text-xs text-muted-foreground">
                      Automatically refresh time-sensitive overlays
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Cache Overlay Data</div>
                    <div className="text-xs text-muted-foreground">
                      Cache overlay data for faster loading
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Show Attribution</div>
                    <div className="text-xs text-muted-foreground">
                      Display data source attribution on map
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Upload className="w-3 h-3 mr-1" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={exportOverlays}>
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default MapOverlayManager;
export type { MapOverlay, OverlayTemplate };