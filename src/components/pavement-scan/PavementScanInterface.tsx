import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Scan, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Download,
  Upload,
  RefreshCw,
  ZoomIn,
  Target,
  Activity,
  ExternalLink
} from 'lucide-react';
import { api } from '@/services/api';
import { PavementScan } from '@/types/database';

interface ScanInterfaceProps {
  projectId?: string;
  className?: string;
}

interface ScanSession {
  id: string;
  status: 'idle' | 'scanning' | 'analyzing' | 'complete' | 'error';
  progress: number;
  results?: PavementAnalysisResults;
  images: string[];
  startTime?: Date;
  endTime?: Date;
}

interface PavementAnalysisResults {
  surfaceConditionScore: number;
  crackDensity: number;
  potholeCount: number;
  roughnessIndex: number;
  ruttingDepth: number;
  aiConfidenceScore: number;
  defects: PavementDefect[];
  recommendations: string[];
}

interface PavementDefect {
  id: string;
  type: 'crack' | 'pothole' | 'rutting' | 'spalling' | 'bleeding';
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: { x: number; y: number; width: number; height: number };
  confidence: number;
  description: string;
}

const PavementScanInterface: React.FC<ScanInterfaceProps> = ({ 
  projectId,
  className = '' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanSession, setScanSession] = useState<ScanSession>({
    id: 'session-' + Date.now(),
    status: 'idle',
    progress: 0,
    images: []
  });
  
  const [cameraActive, setCameraActive] = useState(false);
  const [scanHistory, setScanHistory] = useState<PavementScan[]>([]);
  const [selectedDefect, setSelectedDefect] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'live' | 'analysis' | 'history'>('live');

  useEffect(() => {
    if (projectId) {
      loadScanHistory();
    }
  }, [projectId]);

  const loadScanHistory = async () => {
    if (!projectId) return;
    
    try {
      const response = await api.pavementScan.getProjectScans(projectId);
      if (response.success) {
        setScanHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load scan history:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    
    return null;
  };

  const startScan = async () => {
    if (!cameraActive) {
      await startCamera();
      return;
    }

    setScanSession(prev => ({
      ...prev,
      status: 'scanning',
      progress: 0,
      startTime: new Date(),
      images: []
    }));

    // Simulate scanning process
    const scanInterval = setInterval(() => {
      setScanSession(prev => {
        const newProgress = Math.min(prev.progress + 10, 100);
        
        // Capture images during scanning
        if (newProgress % 20 === 0) {
          const image = captureImage();
          if (image) {
            prev.images.push(image);
          }
        }
        
        if (newProgress >= 100) {
          clearInterval(scanInterval);
          setTimeout(() => analyzeScan(), 1000);
          return {
            ...prev,
            status: 'analyzing',
            progress: newProgress
          };
        }
        
        return {
          ...prev,
          progress: newProgress
        };
      });
    }, 500);
  };

  const analyzeScan = async () => {
    try {
      // Use real AI analysis service
      const analysisResults = await performAIAnalysis(scanSession.capturedImages);
      
      setScanSession(prev => ({
        ...prev,
        status: 'complete',
        results: analysisResults,
        endTime: new Date()
      }));

      // Save scan to database if project ID provided
      if (projectId) {
        saveScanResults(analysisResults);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      setScanSession(prev => ({
        ...prev,
        status: 'error',
        endTime: new Date()
      }));
    }
  };

  const performAIAnalysis = async (images: string[]): Promise<PavementAnalysisResults> => {
    const aiApiKey = process.env.VITE_AI_ANALYSIS_API_KEY;
    if (!aiApiKey) {
      throw new Error('AI Analysis API key not configured');
    }

    // Send images to AI analysis service
    const formData = new FormData();
    for (const imageUrl of images) {
      // Convert base64 to blob if needed
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      formData.append('images', blob);
    }

    const aiResponse = await fetch('https://api.pavementai.com/v1/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'X-Analysis-Type': 'comprehensive'
      },
      body: formData
    });

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.statusText}`);
    }

    const analysisData = await aiResponse.json();
    
    // Transform AI response to our format
    return {
      surfaceConditionScore: analysisData.overall_condition_score,
      crackDensity: analysisData.crack_analysis.density,
      potholeCount: analysisData.pothole_analysis.count,
      roughnessIndex: analysisData.surface_metrics.roughness_iri,
      ruttingDepth: analysisData.deformation_analysis.max_rut_depth,
      aiConfidenceScore: analysisData.confidence_score,
      defects: analysisData.defects?.map((defect: any) => ({
        id: defect.id,
        type: defect.type,
        severity: defect.severity_level,
        coordinates: {
          x: defect.bounding_box.x,
          y: defect.bounding_box.y,
          width: defect.bounding_box.width,
          height: defect.bounding_box.height
        },
        confidence: defect.confidence,
        description: defect.description
      })) || [],
      recommendations: analysisData.recommendations || []
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

  const saveScanResults = async (results: PavementAnalysisResults) => {
    if (!projectId) return;

    try {
      await api.pavementScan.saveScan({
        project_id: projectId,
        scan_location: {
          type: 'Point',
          coordinates: await getCurrentCoordinates() // Get real GPS coordinates
        },
        scan_timestamp: new Date().toISOString(),
        scan_type: 'progress',
        surface_condition_score: results.surfaceConditionScore,
        crack_density: results.crackDensity,
        pothole_count: results.potholeCount,
        roughness_index: results.roughnessIndex,
        rutting_depth: results.ruttingDepth,
        ai_confidence_score: results.aiConfidenceScore,
        image_urls: scanSession.images,
        analysis_data: results
      });

      loadScanHistory(); // Refresh history
    } catch (error) {
      console.error('Failed to save scan results:', error);
    }
  };

  const getConditionColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getConditionLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="glass-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Scan className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-glow-primary">PavementScan Pro</h2>
            <Badge variant="outline" className="glass-card text-accent">
              <Activity className="w-3 h-3 mr-1" />
              AI-Powered Analysis
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`glass-card ${
                scanSession.status === 'complete' ? 'text-success' :
                scanSession.status === 'error' ? 'text-destructive' :
                scanSession.status === 'idle' ? 'text-muted-foreground' :
                'text-warning'
              }`}
            >
              {scanSession.status === 'idle' && 'Ready'}
              {scanSession.status === 'scanning' && 'Scanning...'}
              {scanSession.status === 'analyzing' && 'Analyzing...'}
              {scanSession.status === 'complete' && 'Complete'}
              {scanSession.status === 'error' && 'Error'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="glass-card"
              onClick={() => setViewMode(viewMode === 'live' ? 'analysis' : 'live')}
            >
              <Eye className="w-4 h-4" />
              {viewMode === 'live' ? 'Live View' : 'Analysis View'}
            </Button>
          </div>
        </div>

        {/* Scan Progress */}
        {(scanSession.status === 'scanning' || scanSession.status === 'analyzing') && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {scanSession.status === 'scanning' ? 'Scanning Surface...' : 'AI Analysis in Progress...'}
              </span>
              <span className="text-sm font-bold">{scanSession.progress}%</span>
            </div>
            <Progress value={scanSession.progress} className="h-2" />
          </div>
        )}
      </Card>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'live' | 'analysis' | 'history')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Scanning</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        {/* Live Scanning Tab */}
        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera Feed */}
            <div className="lg:col-span-2">
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Live Camera Feed</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={cameraActive ? "destructive" : "default"}
                      size="sm"
                      onClick={cameraActive ? stopCamera : startCamera}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {cameraActive ? 'Stop Camera' : 'Start Camera'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startScan}
                      disabled={!cameraActive || scanSession.status !== 'idle'}
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      Start Scan
                    </Button>
                  </div>
                </div>
                
                <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Camera not active</p>
                        <p className="text-sm text-muted-foreground mt-1">Click "Start Camera" to begin</p>
                      </div>
                    </div>
                  )}

                  {/* Scanning Overlay */}
                  {scanSession.status === 'scanning' && (
                    <div className="absolute inset-0 bg-primary/20">
                      <div className="absolute inset-4 border-2 border-primary animate-pulse rounded">
                        <div className="absolute top-2 left-2 right-2 h-0.5 bg-primary animate-ping"></div>
                        <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-primary animate-ping"></div>
                      </div>
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded text-sm">
                        Scanning... {scanSession.progress}%
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Scan Controls */}
            <div className="space-y-4">
              {/* Current Scan Info */}
              <Card className="glass-card p-4">
                <h4 className="font-semibold mb-3">Current Scan</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium capitalize">{scanSession.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images Captured:</span>
                    <span className="font-medium">{scanSession.images.length}</span>
                  </div>
                  {scanSession.startTime && (
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span className="font-medium text-xs">
                        {scanSession.startTime.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {scanSession.endTime && (
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-xs">
                        {scanSession.endTime.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Scan Settings */}
              <Card className="glass-card p-4">
                <h4 className="font-semibold mb-3">Scan Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Detection</span>
                    <Badge variant="default" className="text-xs">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resolution</span>
                    <Badge variant="outline" className="text-xs">1280x720</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analysis Mode</span>
                    <Badge variant="outline" className="text-xs">Real-time</Badge>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card p-4">
                <h4 className="font-semibold mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Results
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Session
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analysis Results Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {scanSession.results ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Assessment */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Surface Assessment</h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getConditionColor(scanSession.results.surfaceConditionScore)}`}>
                      {scanSession.results.surfaceConditionScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Condition Score</div>
                    <Badge variant="outline" className="mt-2">
                      {getConditionLabel(scanSession.results.surfaceConditionScore)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-xl font-bold">{scanSession.results.crackDensity}</div>
                      <div className="text-xs text-muted-foreground">Crack Density (ft/ft²)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{scanSession.results.potholeCount}</div>
                      <div className="text-xs text-muted-foreground">Potholes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{scanSession.results.roughnessIndex}</div>
                      <div className="text-xs text-muted-foreground">Roughness Index</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{scanSession.results.ruttingDepth}"</div>
                      <div className="text-xs text-muted-foreground">Max Rutting</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-glass-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Confidence</span>
                      <span className="font-medium">{scanSession.results.aiConfidenceScore}%</span>
                    </div>
                    <Progress value={scanSession.results.aiConfidenceScore} className="h-2 mt-2" />
                  </div>
                </div>
              </Card>

              {/* Detected Defects */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Detected Defects</h3>
                
                <div className="space-y-3">
                  {scanSession.results.defects.map((defect) => (
                    <div 
                      key={defect.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors
                        ${selectedDefect === defect.id ? 'border-primary bg-primary/5' : 'border-glass-border'}
                      `}
                      onClick={() => setSelectedDefect(selectedDefect === defect.id ? null : defect.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium capitalize">{defect.type}</div>
                          <div className="text-xs text-muted-foreground">{defect.description}</div>
                        </div>
                        <Badge variant={getSeverityBadge(defect.severity) as "default" | "destructive" | "outline" | "secondary"}>
                          {defect.severity}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Confidence: {Math.round(defect.confidence * 100)}%</span>
                        <span>
                          {defect.coordinates.width}×{defect.coordinates.height}px
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
                
                <div className="space-y-3">
                  {scanSession.results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/10 rounded-lg">
                      <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="glass-card p-12">
              <div className="text-center">
                <Scan className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scan Results</h3>
                <p className="text-muted-foreground mb-4">Complete a scan to view analysis results</p>
                <Button onClick={() => setViewMode('live')}>
                  <Camera className="w-4 h-4 mr-2" />
                  Start New Scan
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Scan History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
            
            {scanHistory.length > 0 ? (
              <div className="space-y-3">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="p-4 border border-glass-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium capitalize">{scan.scan_type} Scan</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(scan.scan_timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={scan.surface_condition_score && scan.surface_condition_score >= 70 ? "default" : "secondary"}>
                        Score: {scan.surface_condition_score || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cracks:</span>
                        <span className="ml-1 font-medium">{scan.crack_density || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Potholes:</span>
                        <span className="ml-1 font-medium">{scan.pothole_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">AI Confidence:</span>
                        <span className="ml-1 font-medium">{scan.ai_confidence_score || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scan className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No scan history available</p>
                <p className="text-sm text-muted-foreground mt-1">Complete scans will appear here</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="analysis">
        <TabsList>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="drone">Drone & 3D</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis">
          {/* existing analysis UI would render here */}
        </TabsContent>
        <TabsContent value="drone">
          <div className="p-4 border rounded">
            <div className="flex items-center gap-2 mb-2"><Camera className="w-4 h-4" /><div className="font-medium">Drone & 3D Capture</div></div>
            <p className="text-sm text-muted-foreground mb-3">Use SkyeBrowse or PropertyIntel to capture 3D scans and upload outputs (LAS/LAZ/PLY). This stub prepares the integration points.</p>
            <div className="flex gap-2 text-sm">
              <a className="underline" href="https://www.skyebrowse.com" target="_blank" rel="noreferrer"><ExternalLink className="inline w-3 h-3" /> SkyeBrowse</a>
              <a className="underline" href="https://www.propertyintel.com" target="_blank" rel="noreferrer"><ExternalLink className="inline w-3 h-3" /> PropertyIntel</a>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PavementScanInterface;