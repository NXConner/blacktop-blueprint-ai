import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Maximize2,
  Map,
  Pen,
  Settings
} from 'lucide-react';
import { api } from '@/services/api';
import { AtlasPointCloud, Project } from '@/types/database';
import MapServiceSelector, { MapService, mapServices } from './MapServiceSelector';
import MeasuringTools, { Measurement } from './MeasuringTools';
import DrawingTools, { DrawingElement, DrawingLayer } from './DrawingTools';
import MapOverlayManager, { MapOverlay } from './MapOverlayManager';

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

  // New state for enhanced features
  const [selectedMapService, setSelectedMapService] = useState<string>('openstreetmap');
  const [activeTool, setActiveTool] = useState<string>('none');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [drawingLayers, setDrawingLayers] = useState<DrawingLayer[]>([
    {
      id: 'default',
      name: 'Default Layer',
      visible: true,
      locked: false,
      color: '#3b82f6',
      opacity: 100
    }
  ]);
  const [mapOverlays, setMapOverlays] = useState<MapOverlay[]>([]);

  const loadProjectPointClouds = useCallback(async () => {
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
  }, [projectId]);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initial render
    renderTerrain();
  }, []);

  const renderTerrain = useCallback(() => {


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

    // Render drawings
    drawings
      .filter(drawing => drawing.visible)
      .sort((a, b) => drawingLayers.find(l => l.id === a.layer)?.opacity || 0 - drawingLayers.find(l => l.id === b.layer)?.opacity || 0)
      .forEach(drawing => {
        renderDrawing(ctx, drawing);
      });

    ctx.restore();
  }, [visualizations, viewSettings, selectedPointCloud, measurements, drawings, drawingLayers]);

  useEffect(() => {
    if (projectId) {
      loadProjectPointClouds();
    }
    initializeCanvas();
  }, [projectId, loadProjectPointClouds, initializeCanvas]);

  useEffect(() => {
    renderTerrain();
  }, [renderTerrain]);

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

  const renderMeasurement = (ctx: CanvasRenderingContext2D, measurement: Measurement) => {
    if (!measurement.visible || measurement.points.length < 2) return;
    
    ctx.strokeStyle = measurement.color;
    ctx.fillStyle = measurement.color;
    ctx.lineWidth = 2;
    
    // Draw measurement
    ctx.beginPath();
    measurement.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    
    if (measurement.closed && measurement.points.length > 2) {
      ctx.closePath();
      ctx.fillStyle = measurement.color + '20'; // Semi-transparent fill
      ctx.fill();
    }
    
    ctx.stroke();
    
    // Draw measurement label
    const centerX = measurement.points.reduce((sum, p) => sum + p.x, 0) / measurement.points.length;
    const centerY = measurement.points.reduce((sum, p) => sum + p.y, 0) / measurement.points.length;
    
    ctx.font = '12px sans-serif';
    ctx.fillStyle = measurement.color;
    ctx.fillText(measurement.label, centerX, centerY);
  };

  const renderDrawing = (ctx: CanvasRenderingContext2D, drawing: DrawingElement) => {
    if (!drawing.visible || drawing.points.length === 0) return;
    
    const layer = drawingLayers.find(l => l.id === drawing.layer);
    if (!layer?.visible) return;
    
    ctx.strokeStyle = drawing.style.strokeColor;
    ctx.fillStyle = drawing.style.fillColor;
    ctx.lineWidth = drawing.style.strokeWidth;
    ctx.globalAlpha = (drawing.style.opacity / 100) * (layer.opacity / 100);
    
    if (drawing.style.dashPattern) {
      ctx.setLineDash(drawing.style.dashPattern);
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.beginPath();
    
    switch (drawing.type) {
      case 'freehand':
      case 'line':
      case 'polygon':
        drawing.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        if (drawing.type === 'polygon' && drawing.points.length > 2) {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();
        break;
        
      case 'rectangle':
        if (drawing.points.length >= 2) {
          const [start, end] = drawing.points;
          const width = end.x - start.x;
          const height = end.y - start.y;
          ctx.rect(start.x, start.y, width, height);
          ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'circle':
        if (drawing.points.length >= 2) {
          const [center, edge] = drawing.points;
          const radius = Math.sqrt(
            Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2)
          );
          ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'text':
        if (drawing.points.length > 0 && drawing.text) {
          const point = drawing.points[0];
          ctx.font = `${drawing.fontSize || 14}px sans-serif`;
          ctx.fillText(drawing.text, point.x, point.y);
        }
        break;
        
      case 'marker':
        if (drawing.points.length > 0) {
          const point = drawing.points[0];
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Draw marker pin shape
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(point.x - 4, point.y - 8);
          ctx.lineTo(point.x + 4, point.y - 8);
          ctx.closePath();
          ctx.fill();
        }
        break;
    }
    
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  };

  const handleMapServiceChange = (service: MapService) => {
    setSelectedMapService(service.id);
    // In a real implementation, this would update the base map layer
    console.log('Map service changed to:', service.name);
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

    // Process point cloud data with real analysis
    try {
      const analysisResults = await processPointCloudData(file);
      
      setProcessingSession(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        resultData: analysisResults
      }));

      // Save to database if project ID provided
      if (projectId) {
        await savePointCloudData(file, analysisResults);
      }
    } catch (error) {
      console.error('Point cloud processing failed:', error);
      setProcessingSession(prev => ({
        ...prev,
        status: 'error',
        progress: 100
      }));
    }
  };

  const processPointCloudData = async (file: File): Promise<TerrainAnalysis> => {
    const { getEnv } = await import("@/lib/env");
    const apiKey = getEnv("VITE_POINT_CLOUD_API_KEY");
    if (!apiKey) {
      throw new Error('Point cloud processing API key not configured');
    }

    // Upload file to point cloud processing service
    const formData = new FormData();
    formData.append('point_cloud', file);
    formData.append('analysis_type', 'comprehensive');
    formData.append('output_format', 'json');

    const uploadResponse = await fetch('https://api.pointcloudtech.com/v1/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();
    const processingId = uploadData.processing_id;

    // Poll for processing completion
    let processingComplete = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max

    while (!processingComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.pointcloudtech.com/v1/status/${processingId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        processingComplete = true;
      } else if (statusData.status === 'failed') {
        throw new Error(`Processing failed: ${statusData.error}`);
      }
      
      attempts++;
    }

    if (!processingComplete) {
      throw new Error('Processing timeout - analysis took too long');
    }

    // Fetch results
    const resultsResponse = await fetch(`https://api.pointcloudtech.com/v1/results/${processingId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!resultsResponse.ok) {
      throw new Error(`Results fetch failed: ${resultsResponse.statusText}`);
    }

    const resultsData = await resultsResponse.json();
    
    // Transform results to our format
    return {
      minElevation: resultsData.elevation_analysis.min_elevation,
      maxElevation: resultsData.elevation_analysis.max_elevation,
      averageElevation: resultsData.elevation_analysis.avg_elevation,
      totalArea: resultsData.area_analysis.total_area,
      cutVolume: resultsData.volume_analysis.cut_volume,
      fillVolume: resultsData.volume_analysis.fill_volume,
      netVolume: resultsData.volume_analysis.net_volume,
      averageSlope: resultsData.slope_analysis.avg_slope,
      maxSlope: resultsData.slope_analysis.max_slope,
      contourInterval: resultsData.contour_analysis.interval
    };
  };

  const getCurrentCoordinates = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.warn('Could not get GPS coordinates:', error);
          // Fallback to default coordinates
          resolve([-98.5795, 39.8283]); // Center of US
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const savePointCloudData = async (file: File, results: TerrainAnalysis) => {
    if (!projectId) return;

    try {
      await api.atlas.savePointCloud({
        project_id: projectId,
        scan_location: {
          type: 'Point',
          coordinates: await getCurrentCoordinates() // Get real GPS coordinates
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Terrain View */}
        <div className="xl:col-span-8">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Advanced Map Viewer</h3>
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

            {/* Map Service Selector */}
            <div className="mb-4">
              <MapServiceSelector
                selectedService={selectedMapService}
                onServiceChange={handleMapServiceChange}
              />
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

        {/* Enhanced Controls Panel */}
        <div className="xl:col-span-4 space-y-4">
          {/* Tools Tabs */}
          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="visualization" className="text-xs">
                <Layers className="w-3 h-3 mr-1" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="measuring" className="text-xs">
                <Ruler className="w-3 h-3 mr-1" />
                Measure
              </TabsTrigger>
              <TabsTrigger value="drawing" className="text-xs">
                <Pen className="w-3 h-3 mr-1" />
                Draw
              </TabsTrigger>
              <TabsTrigger value="overlays" className="text-xs">
                <Map className="w-3 h-3 mr-1" />
                GIS
              </TabsTrigger>
            </TabsList>

            {/* Visualization Layers Tab */}
            <TabsContent value="visualization">
              <Card className="glass-card p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Terrain Layers
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

              {/* View Controls */}
              <div className="mt-6 pt-4 border-t border-glass-border">
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
          </div>
        </Card>
      </TabsContent>

            {/* Measuring Tools Tab */}
            <TabsContent value="measuring">
              <MeasuringTools
                measurements={measurements}
                onMeasurementsChange={setMeasurements}
                activeTool={activeTool}
                onToolChange={setActiveTool}
              />
            </TabsContent>

            {/* Drawing Tools Tab */}
            <TabsContent value="drawing">
              <DrawingTools
                drawings={drawings}
                onDrawingsChange={setDrawings}
                layers={drawingLayers}
                onLayersChange={setDrawingLayers}
                activeTool={activeTool}
                onToolChange={setActiveTool}
              />
            </TabsContent>

            {/* Map Overlays Tab */}
            <TabsContent value="overlays">
              <MapOverlayManager
                overlays={mapOverlays}
                onOverlaysChange={setMapOverlays}
              />
            </TabsContent>
          </Tabs>

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