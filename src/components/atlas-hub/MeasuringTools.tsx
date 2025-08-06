import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ruler, 
  Calculator, 
  Grid3x3, 
  Box, 
  Target, 
  Trash2, 
  Copy,
  Save,
  Undo,
  MousePointer,
  Square,
  Circle,
  Triangle,
  Polygon,
  Minus
} from 'lucide-react';

export interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'perimeter' | 'volume' | 'point';
  points: Array<{ x: number; y: number; lat?: number; lng?: number }>;
  value: number;
  unit: string;
  label: string;
  color: string;
  timestamp: Date;
  closed: boolean;
}

interface MeasuringToolsProps {
  measurements: Measurement[];
  onMeasurementsChange: (measurements: Measurement[]) => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
  className?: string;
}

interface MeasurementTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requiresMultiplePoints: boolean;
  requiresClosed: boolean;
}

const measurementTools: MeasurementTool[] = [
  {
    id: 'none',
    name: 'Select',
    icon: <MousePointer className="w-4 h-4" />,
    description: 'Select and move measurements',
    requiresMultiplePoints: false,
    requiresClosed: false
  },
  {
    id: 'distance',
    name: 'Distance',
    icon: <Ruler className="w-4 h-4" />,
    description: 'Measure straight-line distance',
    requiresMultiplePoints: true,
    requiresClosed: false
  },
  {
    id: 'perimeter',
    name: 'Perimeter',
    icon: <Minus className="w-4 h-4" />,
    description: 'Measure perimeter of a shape',
    requiresMultiplePoints: true,
    requiresClosed: false
  },
  {
    id: 'area',
    name: 'Area',
    icon: <Square className="w-4 h-4" />,
    description: 'Measure area of a polygon',
    requiresMultiplePoints: true,
    requiresClosed: true
  },
  {
    id: 'circle-area',
    name: 'Circle Area',
    icon: <Circle className="w-4 h-4" />,
    description: 'Measure area of a circle',
    requiresMultiplePoints: false,
    requiresClosed: true
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: <Box className="w-4 h-4" />,
    description: 'Calculate volume with elevation data',
    requiresMultiplePoints: true,
    requiresClosed: true
  }
];

const MeasuringTools: React.FC<MeasuringToolsProps> = ({
  measurements,
  onMeasurementsChange,
  activeTool,
  onToolChange,
  className = ''
}) => {
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [measurementHistory, setMeasurementHistory] = useState<Measurement[][]>([]);
  const [units, setUnits] = useState({
    distance: 'feet',
    area: 'sq-feet',
    volume: 'cubic-feet'
  });

  const calculateDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const pixels = Math.sqrt(dx * dx + dy * dy);
    
    // Convert pixels to real-world units (assuming 1 pixel = 1 foot for demo)
    // In a real implementation, this would use the map scale and projection
    return pixels;
  };

  const calculateArea = (points: Array<{ x: number; y: number }>): number => {
    if (points.length < 3) return 0;
    
    // Shoelace formula for polygon area
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const calculatePerimeter = (points: Array<{ x: number; y: number }>): number => {
    if (points.length < 2) return 0;
    
    let perimeter = 0;
    for (let i = 0; i < points.length - 1; i++) {
      perimeter += calculateDistance(points[i], points[i + 1]);
    }
    return perimeter;
  };

  const calculateVolume = (points: Array<{ x: number; y: number }>, baseElevation: number = 0): number => {
    const area = calculateArea(points);
    // Simplified volume calculation - in reality would use elevation data
    const estimatedHeight = 10; // feet
    return area * estimatedHeight;
  };

  const formatValue = (value: number, type: string): string => {
    const unit = units[type as keyof typeof units] || 'units';
    
    if (value > 5280 && type === 'distance') {
      return `${(value / 5280).toFixed(2)} miles`;
    } else if (value > 43560 && type === 'area') {
      return `${(value / 43560).toFixed(2)} acres`;
    }
    
    return `${value.toFixed(2)} ${unit}`;
  };

  const addMeasurement = (measurement: Omit<Measurement, 'id' | 'timestamp'>) => {
    const newMeasurement: Measurement = {
      ...measurement,
      id: `measurement-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    
    // Save current state to history
    setMeasurementHistory(prev => [...prev, measurements]);
    
    onMeasurementsChange([...measurements, newMeasurement]);
  };

  const removeMeasurement = (id: string) => {
    setMeasurementHistory(prev => [...prev, measurements]);
    onMeasurementsChange(measurements.filter(m => m.id !== id));
    if (selectedMeasurement === id) {
      setSelectedMeasurement(null);
    }
  };

  const clearAllMeasurements = () => {
    setMeasurementHistory(prev => [...prev, measurements]);
    onMeasurementsChange([]);
    setSelectedMeasurement(null);
  };

  const undoLastAction = () => {
    if (measurementHistory.length > 0) {
      const lastState = measurementHistory[measurementHistory.length - 1];
      onMeasurementsChange(lastState);
      setMeasurementHistory(prev => prev.slice(0, -1));
    }
  };

  const duplicateMeasurement = (measurement: Measurement) => {
    const duplicated: Measurement = {
      ...measurement,
      id: `measurement-${Date.now()}-${Math.random()}`,
      label: `${measurement.label} (Copy)`,
      timestamp: new Date(),
      points: measurement.points.map(p => ({ ...p, x: p.x + 10, y: p.y + 10 }))
    };
    
    setMeasurementHistory(prev => [...prev, measurements]);
    onMeasurementsChange([...measurements, duplicated]);
  };

  const exportMeasurements = () => {
    const exportData = {
      measurements: measurements.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      })),
      units,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurements-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMeasurementSummary = () => {
    const summary = {
      total: measurements.length,
      distances: measurements.filter(m => m.type === 'distance').length,
      areas: measurements.filter(m => m.type === 'area').length,
      perimeters: measurements.filter(m => m.type === 'perimeter').length,
      volumes: measurements.filter(m => m.type === 'volume').length,
      totalDistance: measurements
        .filter(m => m.type === 'distance')
        .reduce((sum, m) => sum + m.value, 0),
      totalArea: measurements
        .filter(m => m.type === 'area')
        .reduce((sum, m) => sum + m.value, 0)
    };
    
    return summary;
  };

  const summary = getMeasurementSummary();

  return (
    <Card className={`glass-card ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Measuring Tools
          </h4>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={undoLastAction}
              disabled={measurementHistory.length === 0}
              className="h-8 w-8 p-0"
            >
              <Undo className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllMeasurements}
              disabled={measurements.length === 0}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportMeasurements}
              disabled={measurements.length === 0}
              className="h-8 w-8 p-0"
            >
              <Save className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="measurements">List</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {measurementTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2 h-auto p-2 text-left"
                  onClick={() => onToolChange(tool.id)}
                >
                  <div className="flex-shrink-0">
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs">{tool.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {tool.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {activeTool !== 'none' && (
              <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
                <strong>Instructions:</strong>
                {activeTool === 'distance' && ' Click two points to measure distance.'}
                {activeTool === 'area' && ' Click multiple points to create a polygon, then close it.'}
                {activeTool === 'perimeter' && ' Click multiple points to measure the perimeter.'}
                {activeTool === 'circle-area' && ' Click center, then drag to set radius.'}
                {activeTool === 'volume' && ' Create a polygon area and set elevation data.'}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="measurements" className="space-y-2 mt-4">
            {measurements.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No measurements yet</p>
                <p className="text-xs">Select a tool and start measuring</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className={`flex items-center gap-2 p-2 rounded border text-sm cursor-pointer hover:bg-accent/50 ${
                      selectedMeasurement === measurement.id ? 'bg-accent border-primary' : 'border-border'
                    }`}
                    onClick={() => setSelectedMeasurement(
                      selectedMeasurement === measurement.id ? null : measurement.id
                    )}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: measurement.color }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{measurement.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatValue(measurement.value, measurement.type)}
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {measurement.type}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateMeasurement(measurement);
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMeasurement(measurement.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{summary.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distances:</span>
                  <span className="font-medium">{summary.distances}</span>
                </div>
                <div className="flex justify-between">
                  <span>Areas:</span>
                  <span className="font-medium">{summary.areas}</span>
                </div>
                <div className="flex justify-between">
                  <span>Perimeters:</span>
                  <span className="font-medium">{summary.perimeters}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Distance:</span>
                  <span className="font-medium">{formatValue(summary.totalDistance, 'distance')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Area:</span>
                  <span className="font-medium">{formatValue(summary.totalArea, 'area')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volumes:</span>
                  <span className="font-medium">{summary.volumes}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Unit Settings</h5>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Distance:</span>
                  <select 
                    value={units.distance} 
                    onChange={(e) => setUnits(prev => ({ ...prev, distance: e.target.value }))}
                    className="text-xs bg-background border rounded px-2 py-1"
                  >
                    <option value="feet">Feet</option>
                    <option value="meters">Meters</option>
                    <option value="yards">Yards</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span>Area:</span>
                  <select 
                    value={units.area} 
                    onChange={(e) => setUnits(prev => ({ ...prev, area: e.target.value }))}
                    className="text-xs bg-background border rounded px-2 py-1"
                  >
                    <option value="sq-feet">Sq Feet</option>
                    <option value="sq-meters">Sq Meters</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span>Volume:</span>
                  <select 
                    value={units.volume} 
                    onChange={(e) => setUnits(prev => ({ ...prev, volume: e.target.value }))}
                    className="text-xs bg-background border rounded px-2 py-1"
                  >
                    <option value="cubic-feet">Cubic Feet</option>
                    <option value="cubic-meters">Cubic Meters</option>
                    <option value="cubic-yards">Cubic Yards</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default MeasuringTools;
export type { Measurement, MeasurementTool };