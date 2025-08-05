import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Mountain, 
  Scan, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Download,
  Upload,
  Activity,
  Layers,
  Ruler,
  Calculator,
  Eye,
  Grid3x3,
  Maximize2
} from 'lucide-react';
import { api } from '@/services/api';
import { AtlasPointCloud, Project } from '@/types/database';

interface TerrainMapperProps {
  projectId?: string;
  className?: string;
}

interface TerrainVisualization {
  id: string;
  type: 'elevation' | 'slope' | 'contour' | 'volume' | 'point_cloud';
  name: string;
  visible: boolean;
  opacity: number;
  color: string;
}

interface TerrainAnalysis {
  minElevation: number;
  maxElevation: number;
  averageElevation: number;
  totalArea: number;
  cutVolume: number;
  fillVolume: number;
  netVolume: number;
  averageSlope: number;
  maxSlope: number;
  contourInterval: number;
}

interface ProcessingSession {
  id: string;
  status: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  pointCloudFile?: File;
  resultData?: TerrainAnalysis;
  processingSteps: string[];
  currentStep: number;
}

const TerrainMapper: React.FC<TerrainMapperProps> = ({ 
  projectId,
  className = '' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [processingSession, setProcessingSession] = useState<ProcessingSession>({
    id: 'session-' + Date.now(),
    status: 'idle',
    progress: 0,
    processingSteps: [
      'Parsing point cloud data',
      'Generating elevation model',
      'Calculating terrain analysis',
      'Creating visualizations',
      'Finalizing results'
    ],
    currentStep: 0
  });

  const [pointClouds, setPointClouds] = useState<AtlasPointCloud[]>([]);
  const [selectedPointCloud, setSelectedPointCloud] = useState<string | null>(null);
  const [visualizations, setVisualizations] = useState<TerrainVisualization[]>([
    { id: 'elevation', type: 'elevation', name: 'Elevation Map', visible: true, opacity: 100, color: '#3b82f6' },
    { id: 'slope', type: 'slope', name: 'Slope Analysis', visible: false, opacity: 80, color: '#ef4444' },
    { id: 'contour', type: 'contour', name: 'Contour Lines', visible: true, opacity: 60, color: '#10b981' },
    { id: 'volume', type: 'volume', name: 'Volume Analysis', visible: false, opacity: 70, color: '#f59e0b' },
    { id: 'points', type: 'point_cloud', name: 'Point Cloud', visible: false, opacity: 90, color: '#8b5cf6' }
  ]);

  const [viewSettings, setViewSettings] = useState({
    rotation: { x: 45, y: 0, z: 0 },
    zoom: 100,
    pan: { x: 0, y: 0 },
    showGrid: true,
    showAxes: true,
    lighting: 80
  });

  const [measurementMode, setMeasurementMode] = useState<'none' | 'distance' | 'area' | 'volume'>('none');
  const [measurements, setMeasurements] = useState<any[]>([]);

  useEffect(() => {
    if (projectId) {
      loadProjectPointClouds();
    }
    initializeCanvas();
  }, [projectId]);

  useEffect(() => {
    renderTerrain();
  }, [visualizations, viewSettings, selectedPointCloud]);

  const loadProjectPointClouds = async () => {
    if (!projectId) return;
    
    try {
      const response = await api.atlas.getProjectPointClouds(projectId);
      if (response.success) {
        setPointClouds(response.data);
        if (response.data.length > 0) {
          setSelectedPointCloud(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load point clouds:', error);
    }
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initial render
    renderTerrain();
  };

  const renderTerrain = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up 3D-like perspective
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation and zoom
    const scale = viewSettings.zoom / 100;
    ctx.scale(scale, scale);
    ctx.translate(viewSettings.pan.x, viewSettings.pan.y);

    // Render background gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(canvas.width, canvas.height));
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);

    // Render grid if enabled
    if (viewSettings.showGrid) {
      renderGrid(ctx, canvas);
    }

    // Render active visualizations
    visualizations.forEach(viz => {
      if (viz.visible) {
        renderVisualization(ctx, viz, canvas);
      }
    });

    // Render measurements
    measurements.forEach(measurement => {
      renderMeasurement(ctx, measurement);
    });

    ctx.restore();
  };

  const renderGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    const gridExtent = 400;
    
    // Vertical lines
    for (let x = -gridExtent; x <= gridExtent; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -gridExtent);
      ctx.lineTo(x, gridExtent);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -gridExtent; y <= gridExtent; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-gridExtent, y);
      ctx.lineTo(gridExtent, y);
      ctx.stroke();
    }
  };

  const renderVisualization = (ctx: CanvasRenderingContext2D, viz: TerrainVisualization, canvas: HTMLCanvasElement) => {
    const alpha = viz.opacity / 100;
    
    switch (viz.type) {
      case 'elevation':
        renderElevationMap(ctx, viz.color, alpha);
        break;
      case 'slope':
        renderSlopeAnalysis(ctx, viz.color, alpha);
        break;
      case 'contour':
        renderContourLines(ctx, viz.color, alpha);
        break;
      case 'volume':
        renderVolumeAnalysis(ctx, viz.color, alpha);
        break;
      case 'point_cloud':
        renderPointCloud(ctx, viz.color, alpha);
        break;
    }
  };

  const renderElevationMap = (ctx: CanvasRenderingContext2D, color: string, alpha: number) => {
    // Simulate elevation data with gradient fills
    const gradient = ctx.createLinearGradient(-200, -200, 200, 200);
    gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha * 0.8})`); // Blue (low)
    gradient.addColorStop(0.3, `rgba(16, 185, 129, ${alpha * 0.6})`); // Green (medium-low)
    gradient.addColorStop(0.6, `rgba(245, 158, 11, ${alpha * 0.7})`); // Yellow (medium-high)
    gradient.addColorStop(1, `rgba(239, 68, 68, ${alpha * 0.9})`); // Red (high)
    
    ctx.fillStyle = gradient;
    
    // Draw terrain patches
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 400;
      const size = 20 + Math.random() * 40;
      
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const renderSlopeAnalysis = (ctx: CanvasRenderingContext2D, color: string, alpha: number) => {
    ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
    ctx.lineWidth = 2;
    
    // Draw slope vectors
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 300;
      const y = (Math.random() - 0.5) * 300;
      const angle = Math.random() * Math.PI * 2;
      const length = 20 + Math.random() * 30;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
      
      // Arrow head
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.lineTo(x + Math.cos(angle + 2.8) * (length - 5), y + Math.sin(angle + 2.8) * (length - 5));
      ctx.lineTo(x + Math.cos(angle - 2.8) * (length - 5), y + Math.sin(angle - 2.8) * (length - 5));
      ctx.closePath();
      ctx.fill();
    }
  };

  const renderContourLines = (ctx: CanvasRenderingContext2D, color: string, alpha: number) => {
    ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
    ctx.lineWidth = 1.5;
    
    // Draw contour lines
    for (let i = 0; i < 8; i++) {
      const radius = 50 + i * 25;
      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 100;
      
      ctx.beginPath();
      ctx.ellipse(offsetX, offsetY, radius, radius * 0.7, Math.random() * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const renderVolumeAnalysis = (ctx: CanvasRenderingContext2D, color: string, alpha: number) => {
    // Draw 3D-like volume blocks
    ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.6})`;
    ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 12; i++) {
      const x = (Math.random() - 0.5) * 300;
      const y = (Math.random() - 0.5) * 300;
      const w = 15 + Math.random() * 25;
      const h = 15 + Math.random() * 25;
      const depth = 5 + Math.random() * 15;
      
      // Front face
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      
      // Top face (isometric)
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + depth, y - depth);
      ctx.lineTo(x + w + depth, y - depth);
      ctx.lineTo(x + w, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Right face
      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.lineTo(x + w + depth, y - depth);
      ctx.lineTo(x + w + depth, y + h - depth);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  };

  const renderPointCloud = (ctx: CanvasRenderingContext2D, color: string, alpha: number) => {
    ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
    
    // Draw point cloud
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 350;
      const y = (Math.random() - 0.5) * 350;
      const size = 1 + Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const renderMeasurement = (ctx: CanvasRenderingContext2D, measurement: any) => {
    // Render measurement overlays
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 2;
    
    // Draw measurement line/area
    ctx.beginPath();
    ctx.moveTo(measurement.start.x, measurement.start.y);
    ctx.lineTo(measurement.end.x, measurement.end.y);
    ctx.stroke();
    
    // Draw measurement label
    const midX = (measurement.start.x + measurement.end.x) / 2;
    const midY = (measurement.start.y + measurement.end.y) / 2;
    
    ctx.font = '12px sans-serif';
    ctx.fillText(measurement.label, midX, midY);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingSession(prev => ({
      ...prev,
      status: 'uploading',
      progress: 0,
      pointCloudFile: file,
      currentStep: 0
    }));

    // Simulate file upload and processing
    simulateProcessing(file);
  };

  const simulateProcessing = async (file: File) => {
    const steps = processingSession.processingSteps;
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingSession(prev => ({
        ...prev,
        status: i === 0 ? 'uploading' : i < steps.length - 1 ? 'processing' : 'analyzing',
        currentStep: i,
        progress: ((i + 1) / steps.length) * 100
      }));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate mock analysis results
    const mockResults: TerrainAnalysis = {
      minElevation: 145.2,
      maxElevation: 187.8,
      averageElevation: 166.5,
      totalArea: 12847.3,
      cutVolume: 2847.6,
      fillVolume: 3156.2,
      netVolume: -308.6,
      averageSlope: 4.2,
      maxSlope: 18.7,
      contourInterval: 1.0
    };

    setProcessingSession(prev => ({
      ...prev,
      status: 'complete',
      progress: 100,
      resultData: mockResults
    }));

    // Save to database if project ID provided
    if (projectId) {
      await savePointCloudData(file, mockResults);
    }
  };

  const savePointCloudData = async (file: File, results: TerrainAnalysis) => {
    if (!projectId) return;

    try {
      await api.atlas.savePointCloud({
        project_id: projectId,
        scan_location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128] // Mock coordinates
        },
        point_cloud_file_url: `uploads/${file.name}`,
        elevation_data: {
          min: results.minElevation,
          max: results.maxElevation,
          average: results.averageElevation
        },
        terrain_analysis: results,
        capture_timestamp: new Date().toISOString(),
        processing_status: 'completed'
      });

      loadProjectPointClouds(); // Refresh list
    } catch (error) {
      console.error('Failed to save point cloud data:', error);
    }
  };

  const toggleVisualization = (id: string) => {
    setVisualizations(prev => 
      prev.map(viz => 
        viz.id === id ? { ...viz, visible: !viz.visible } : viz
      )
    );
  };

  const updateVisualizationOpacity = (id: string, opacity: number) => {
    setVisualizations(prev => 
      prev.map(viz => 
        viz.id === id ? { ...viz, opacity } : viz
      )
    );
  };

  const resetView = () => {
    setViewSettings({
      rotation: { x: 45, y: 0, z: 0 },
      zoom: 100,
      pan: { x: 0, y: 0 },
      showGrid: true,
      showAxes: true,
      lighting: 80
    });
  };

  const exportResults = () => {
    if (!processingSession.resultData) return;

    const exportData = {
      analysis: processingSession.resultData,
      visualizations: visualizations.filter(v => v.visible),
      timestamp: new Date().toISOString(),
      project_id: projectId
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terrain-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mountain className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow-primary">Atlas Hub</h2>
            <Badge variant="outline" className="glass-card text-accent">
              <Activity className="w-3 h-3 mr-1" />
              Terrain Analysis
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`glass-card ${
                processingSession.status === 'complete' ? 'text-success' :
                processingSession.status === 'error' ? 'text-destructive' :
                processingSession.status === 'idle' ? 'text-muted-foreground' :
                'text-warning'
              }`}
            >
              {processingSession.status === 'idle' && 'Ready'}
              {processingSession.status === 'uploading' && 'Uploading...'}
              {processingSession.status === 'processing' && 'Processing...'}
              {processingSession.status === 'analyzing' && 'Analyzing...'}
              {processingSession.status === 'complete' && 'Complete'}
              {processingSession.status === 'error' && 'Error'}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Point Cloud
            </Button>
          </div>
        </div>

        {/* Processing Progress */}
        {(processingSession.status !== 'idle' && processingSession.status !== 'complete') && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {processingSession.processingSteps[processingSession.currentStep]}
              </span>
              <span className="text-sm font-bold">{Math.round(processingSession.progress)}%</span>
            </div>
            <Progress value={processingSession.progress} className="h-2" />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Terrain View */}
        <div className="xl:col-span-3">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">3D Terrain Visualization</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewSettings(prev => ({ ...prev, zoom: Math.min(prev.zoom + 20, 200) }))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewSettings(prev => ({ ...prev, zoom: Math.max(prev.zoom - 20, 50) }))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetView}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative aspect-video bg-muted/10 rounded-lg overflow-hidden border border-glass-border">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
              />
              
              {processingSession.status === 'idle' && !selectedPointCloud && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                  <div className="text-center">
                    <Mountain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No terrain data loaded</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload a point cloud file to begin</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          {/* Layer Controls */}
          <Card className="glass-card p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Visualization Layers
            </h4>
            
            <div className="space-y-3">
              {visualizations.map((viz) => (
                <div key={viz.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={viz.visible}
                        onChange={() => toggleVisualization(viz.id)}
                        className="rounded"
                      />
                      {viz.name}
                    </label>
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: viz.color }}
                    />
                  </div>
                  
                  {viz.visible && (
                    <div className="ml-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Opacity:</span>
                        <Slider
                          value={[viz.opacity]}
                          onValueChange={([value]) => updateVisualizationOpacity(viz.id, value)}
                          max={100}
                          step={10}
                          className="flex-1"
                        />
                        <span>{viz.opacity}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* View Controls */}
          <Card className="glass-card p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Controls
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Zoom: {viewSettings.zoom}%</label>
                <Slider
                  value={[viewSettings.zoom]}
                  onValueChange={([value]) => setViewSettings(prev => ({ ...prev, zoom: value }))}
                  min={50}
                  max={200}
                  step={10}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Lighting: {viewSettings.lighting}%</label>
                <Slider
                  value={[viewSettings.lighting]}
                  onValueChange={([value]) => setViewSettings(prev => ({ ...prev, lighting: value }))}
                  min={0}
                  max={100}
                  step={10}
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Grid</span>
                <input
                  type="checkbox"
                  checked={viewSettings.showGrid}
                  onChange={(e) => setViewSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Axes</span>
                <input
                  type="checkbox"
                  checked={viewSettings.showAxes}
                  onChange={(e) => setViewSettings(prev => ({ ...prev, showAxes: e.target.checked }))}
                  className="rounded"
                />
              </div>
            </div>
          </Card>

          {/* Measurement Tools */}
          <Card className="glass-card p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Measurement Tools
            </h4>
            
            <div className="space-y-2">
              <Button 
                variant={measurementMode === 'distance' ? "default" : "outline"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setMeasurementMode(measurementMode === 'distance' ? 'none' : 'distance')}
              >
                <Ruler className="w-4 h-4 mr-2" />
                Distance
              </Button>
              <Button 
                variant={measurementMode === 'area' ? "default" : "outline"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setMeasurementMode(measurementMode === 'area' ? 'none' : 'area')}
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Area
              </Button>
              <Button 
                variant={measurementMode === 'volume' ? "default" : "outline"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setMeasurementMode(measurementMode === 'volume' ? 'none' : 'volume')}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Volume
              </Button>
            </div>
          </Card>

          {/* Analysis Results */}
          {processingSession.resultData && (
            <Card className="glass-card p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Analysis Results
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Min Elevation:</span>
                  <span className="font-medium">{processingSession.resultData.minElevation.toFixed(1)}ft</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Elevation:</span>
                  <span className="font-medium">{processingSession.resultData.maxElevation.toFixed(1)}ft</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Area:</span>
                  <span className="font-medium">{processingSession.resultData.totalArea.toFixed(1)}ft²</span>
                </div>
                <div className="flex justify-between">
                  <span>Cut Volume:</span>
                  <span className="font-medium text-destructive">{processingSession.resultData.cutVolume.toFixed(1)}ft³</span>
                </div>
                <div className="flex justify-between">
                  <span>Fill Volume:</span>
                  <span className="font-medium text-success">{processingSession.resultData.fillVolume.toFixed(1)}ft³</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Volume:</span>
                  <span className={`font-medium ${processingSession.resultData.netVolume < 0 ? 'text-destructive' : 'text-success'}`}>
                    {processingSession.resultData.netVolume.toFixed(1)}ft³
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Slope:</span>
                  <span className="font-medium">{processingSession.resultData.averageSlope.toFixed(1)}%</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={exportResults}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".las,.laz,.xyz,.ply,.pcd"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default TerrainMapper;