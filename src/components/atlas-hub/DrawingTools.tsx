import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Pen, 
  Pencil, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  MapPin, 
  Trash2, 
  Copy,
  Save,
  Undo,
  Redo,
  MousePointer,
  Palette,
  Edit3,
  Minus,
  ArrowRight,
  Move,
  RotateCw,
  Layers
} from 'lucide-react';

export interface DrawingElement {
  id: string;
  type: 'freehand' | 'line' | 'rectangle' | 'circle' | 'polygon' | 'text' | 'marker' | 'arrow';
  points: Array<{ x: number; y: number }>;
  style: {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    opacity: number;
    dashPattern?: number[];
  };
  text?: string;
  fontSize?: number;
  label: string;
  layer: string;
  visible: boolean;
  locked: boolean;
  timestamp: Date;
}

export interface DrawingLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
}

interface DrawingToolsProps {
  drawings: DrawingElement[];
  onDrawingsChange: (drawings: DrawingElement[]) => void;
  layers: DrawingLayer[];
  onLayersChange: (layers: DrawingLayer[]) => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
  className?: string;
}

interface DrawingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'selection' | 'shapes' | 'lines' | 'text' | 'markers';
}

const drawingTools: DrawingTool[] = [
  // Selection tools
  {
    id: 'select',
    name: 'Select',
    icon: <MousePointer className="w-4 h-4" />,
    description: 'Select and modify drawings',
    category: 'selection'
  },
  {
    id: 'move',
    name: 'Move',
    icon: <Move className="w-4 h-4" />,
    description: 'Move selected elements',
    category: 'selection'
  },
  
  // Line tools
  {
    id: 'freehand',
    name: 'Freehand',
    icon: <Pencil className="w-4 h-4" />,
    description: 'Draw freehand lines',
    category: 'lines'
  },
  {
    id: 'line',
    name: 'Line',
    icon: <Minus className="w-4 h-4" />,
    description: 'Draw straight lines',
    category: 'lines'
  },
  {
    id: 'arrow',
    name: 'Arrow',
    icon: <ArrowRight className="w-4 h-4" />,
    description: 'Draw arrows',
    category: 'lines'
  },
  
  // Shape tools
  {
    id: 'rectangle',
    name: 'Rectangle',
    icon: <Square className="w-4 h-4" />,
    description: 'Draw rectangles',
    category: 'shapes'
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: <Circle className="w-4 h-4" />,
    description: 'Draw circles',
    category: 'shapes'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: <Triangle className="w-4 h-4" />,
    description: 'Draw custom polygons',
    category: 'shapes'
  },
  
  // Text and markers
  {
    id: 'text',
    name: 'Text',
    icon: <Type className="w-4 h-4" />,
    description: 'Add text annotations',
    category: 'text'
  },
  {
    id: 'marker',
    name: 'Marker',
    icon: <MapPin className="w-4 h-4" />,
    description: 'Place location markers',
    category: 'markers'
  }
];

const predefinedColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#000000'
];

const DrawingTools: React.FC<DrawingToolsProps> = ({
  drawings,
  onDrawingsChange,
  layers,
  onLayersChange,
  activeTool,
  onToolChange,
  className = ''
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [drawingHistory, setDrawingHistory] = useState<DrawingElement[][]>([]);
  const [redoHistory, setRedoHistory] = useState<DrawingElement[][]>([]);
  const [activeLayer, setActiveLayer] = useState<string>(layers[0]?.id || 'default');
  
  const [currentStyle, setCurrentStyle] = useState({
    strokeColor: '#ef4444',
    fillColor: '#ef4444',
    strokeWidth: 2,
    opacity: 80,
    dashPattern: undefined as number[] | undefined
  });

  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(14);

  const saveToHistory = () => {
    setDrawingHistory(prev => [...prev, drawings]);
    setRedoHistory([]); // Clear redo history when new action is performed
  };

  const addDrawing = (drawing: Omit<DrawingElement, 'id' | 'timestamp'>) => {
    saveToHistory();
    
    const newDrawing: DrawingElement = {
      ...drawing,
      id: `drawing-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    
    onDrawingsChange([...drawings, newDrawing]);
  };

  const removeDrawing = (id: string) => {
    saveToHistory();
    onDrawingsChange(drawings.filter(d => d.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const updateDrawing = (id: string, updates: Partial<DrawingElement>) => {
    saveToHistory();
    onDrawingsChange(drawings.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const duplicateDrawing = (drawing: DrawingElement) => {
    saveToHistory();
    const duplicated: DrawingElement = {
      ...drawing,
      id: `drawing-${Date.now()}-${Math.random()}`,
      label: `${drawing.label} (Copy)`,
      timestamp: new Date(),
      points: drawing.points.map(p => ({ ...p, x: p.x + 10, y: p.y + 10 }))
    };
    
    onDrawingsChange([...drawings, duplicated]);
  };

  const clearAllDrawings = () => {
    saveToHistory();
    onDrawingsChange([]);
    setSelectedElement(null);
  };

  const undo = () => {
    if (drawingHistory.length > 0) {
      const lastState = drawingHistory[drawingHistory.length - 1];
      setRedoHistory(prev => [drawings, ...prev]);
      onDrawingsChange(lastState);
      setDrawingHistory(prev => prev.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoHistory.length > 0) {
      const nextState = redoHistory[0];
      setDrawingHistory(prev => [...prev, drawings]);
      onDrawingsChange(nextState);
      setRedoHistory(prev => prev.slice(1));
    }
  };

  const addLayer = () => {
    const newLayer: DrawingLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      color: predefinedColors[layers.length % predefinedColors.length],
      opacity: 100
    };
    
    onLayersChange([...layers, newLayer]);
    setActiveLayer(newLayer.id);
  };

  const removeLayer = (layerId: string) => {
    if (layers.length <= 1) return; // Keep at least one layer
    
    saveToHistory();
    
    // Remove all drawings from this layer
    onDrawingsChange(drawings.filter(d => d.layer !== layerId));
    
    // Remove the layer
    onLayersChange(layers.filter(l => l.id !== layerId));
    
    // Set active layer to first remaining layer
    const remainingLayers = layers.filter(l => l.id !== layerId);
    if (remainingLayers.length > 0) {
      setActiveLayer(remainingLayers[0].id);
    }
  };

  const updateLayer = (layerId: string, updates: Partial<DrawingLayer>) => {
    onLayersChange(layers.map(l => l.id === layerId ? { ...l, ...updates } : l));
  };

  const exportDrawings = () => {
    const exportData = {
      drawings: drawings.map(d => ({
        ...d,
        timestamp: d.timestamp.toISOString()
      })),
      layers,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getToolsByCategory = (category: string) => {
    return drawingTools.filter(tool => tool.category === category);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      selection: <MousePointer className="w-4 h-4" />,
      lines: <Edit3 className="w-4 h-4" />,
      shapes: <Square className="w-4 h-4" />,
      text: <Type className="w-4 h-4" />,
      markers: <MapPin className="w-4 h-4" />
    };
    return icons[category] || <Pen className="w-4 h-4" />;
  };

  const getDrawingSummary = () => {
    return {
      total: drawings.length,
      byType: drawingTools.reduce((acc, tool) => {
        acc[tool.id] = drawings.filter(d => d.type === tool.id).length;
        return acc;
      }, {} as Record<string, number>),
      byLayer: layers.reduce((acc, layer) => {
        acc[layer.name] = drawings.filter(d => d.layer === layer.id).length;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  const summary = getDrawingSummary();

  return (
    <Card className={`glass-card ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Pen className="w-4 h-4" />
            Drawing Tools
          </h4>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={drawingHistory.length === 0}
              className="h-8 w-8 p-0"
            >
              <Undo className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={redoHistory.length === 0}
              className="h-8 w-8 p-0"
            >
              <Redo className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllDrawings}
              disabled={drawings.length === 0}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportDrawings}
              disabled={drawings.length === 0}
              className="h-8 w-8 p-0"
            >
              <Save className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="drawings">List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="space-y-4 mt-4">
            {['selection', 'lines', 'shapes', 'text', 'markers'].map(category => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(category)}
                  <span className="text-sm font-medium capitalize">{category}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {getToolsByCategory(category).map((tool) => (
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
              </div>
            ))}

            {activeTool === 'text' && (
              <div className="space-y-2 p-3 bg-muted/20 rounded">
                <label className="text-sm font-medium">Text Content</label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full px-2 py-1 text-sm bg-background border rounded"
                />
                <div>
                  <label className="text-sm font-medium">Font Size: {fontSize}px</label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    min={8}
                    max={32}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="layers" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Drawing Layers</span>
              <Button variant="outline" size="sm" onClick={addLayer}>
                <Layers className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 p-2 rounded border ${
                    activeLayer === layer.id ? 'bg-accent border-primary' : 'border-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={(e) => updateLayer(layer.id, { visible: e.target.checked })}
                    className="rounded"
                  />
                  
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0 border"
                    style={{ backgroundColor: layer.color }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={layer.name}
                      onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium border-none outline-none"
                      onClick={() => setActiveLayer(layer.id)}
                    />
                    <div className="text-xs text-muted-foreground">
                      {summary.byLayer[layer.name] || 0} items
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => updateLayer(layer.id, { locked: !layer.locked })}
                    >
                      {layer.locked ? '🔒' : '🔓'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeLayer(layer.id)}
                      disabled={layers.length <= 1}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Stroke Color</label>
              <div className="grid grid-cols-5 gap-1 mb-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 ${
                      currentStyle.strokeColor === color ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentStyle(prev => ({ ...prev, strokeColor: color }))}
                  />
                ))}
              </div>
              <input
                type="color"
                value={currentStyle.strokeColor}
                onChange={(e) => setCurrentStyle(prev => ({ ...prev, strokeColor: e.target.value }))}
                className="w-full h-8 border rounded"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Fill Color</label>
              <div className="grid grid-cols-5 gap-1 mb-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 ${
                      currentStyle.fillColor === color ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentStyle(prev => ({ ...prev, fillColor: color }))}
                  />
                ))}
              </div>
              <input
                type="color"
                value={currentStyle.fillColor}
                onChange={(e) => setCurrentStyle(prev => ({ ...prev, fillColor: e.target.value }))}
                className="w-full h-8 border rounded"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Stroke Width: {currentStyle.strokeWidth}px</label>
              <Slider
                value={[currentStyle.strokeWidth]}
                onValueChange={([value]) => setCurrentStyle(prev => ({ ...prev, strokeWidth: value }))}
                min={1}
                max={10}
                step={1}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Opacity: {currentStyle.opacity}%</label>
              <Slider
                value={[currentStyle.opacity]}
                onValueChange={([value]) => setCurrentStyle(prev => ({ ...prev, opacity: value }))}
                min={10}
                max={100}
                step={10}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Line Style</label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={!currentStyle.dashPattern ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => setCurrentStyle(prev => ({ ...prev, dashPattern: undefined }))}
                >
                  Solid Line
                </Button>
                <Button
                  variant={JSON.stringify(currentStyle.dashPattern) === JSON.stringify([5, 5]) ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => setCurrentStyle(prev => ({ ...prev, dashPattern: [5, 5] }))}
                >
                  Dashed Line
                </Button>
                <Button
                  variant={JSON.stringify(currentStyle.dashPattern) === JSON.stringify([2, 3]) ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => setCurrentStyle(prev => ({ ...prev, dashPattern: [2, 3] }))}
                >
                  Dotted Line
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="drawings" className="space-y-2 mt-4">
            {drawings.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <Pen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No drawings yet</p>
                <p className="text-xs">Select a tool and start drawing</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {drawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className={`flex items-center gap-2 p-2 rounded border text-sm cursor-pointer hover:bg-accent/50 ${
                      selectedElement === drawing.id ? 'bg-accent border-primary' : 'border-border'
                    }`}
                    onClick={() => setSelectedElement(
                      selectedElement === drawing.id ? null : drawing.id
                    )}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: drawing.style.strokeColor }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{drawing.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {drawing.type} • {layers.find(l => l.id === drawing.layer)?.name}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDrawing(drawing.id, { visible: !drawing.visible });
                        }}
                      >
                        {drawing.visible ? '👁️' : '🙈'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateDrawing(drawing);
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
                          removeDrawing(drawing.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Separator />
            
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total drawings:</span>
                <span className="font-medium">{summary.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Active layer:</span>
                <span className="font-medium">
                  {layers.find(l => l.id === activeLayer)?.name || 'None'}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default DrawingTools;
export type { DrawingElement, DrawingLayer, DrawingTool };