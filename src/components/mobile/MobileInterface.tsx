import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Smartphone,
  MapPin,
  Camera,
  Mic,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Truck,
  Cloud,
  DollarSign,
  Thermometer,
  Wind,
  Droplets,
  Navigation,
  Zap,
  Settings,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  RefreshCw,
  Upload,
  Download,
  Eye,
  Target,
  Activity,
  Shield
} from 'lucide-react';
import { api } from '@/services/api';
import { Project, Employee, Vehicle, WorkSession } from '@/types/database';
import { capacitorNative } from '@/services/capacitor-native';

interface MobileInterfaceProps {
  userId?: string;
  className?: string;
}

interface FieldReport {
  id: string;
  type: 'progress' | 'issue' | 'completion' | 'weather' | 'safety';
  title: string;
  description: string;
  location: { lat: number; lng: number; address: string };
  timestamp: string;
  photos: string[];
  voice_notes: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'submitted' | 'acknowledged';
}

interface MobileMetrics {
  connection_status: 'online' | 'offline' | 'limited';
  battery_level: number;
  signal_strength: number;
  sync_status: 'synced' | 'pending' | 'failed';
  last_sync: string;
  active_session?: WorkSession;
  current_project?: Project;
  weather_status: string;
  crew_count: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
  priority: boolean;
}

const MobileInterface: React.FC<MobileInterfaceProps> = ({ 
  userId,
  className = '' 
}) => {
  const [mobileMetrics, setMobileMetrics] = useState<MobileMetrics>({
    connection_status: 'online',
    battery_level: 85,
    signal_strength: 75,
    sync_status: 'synced',
    last_sync: new Date().toISOString(),
    weather_status: 'Clear',
    crew_count: 0
  });

  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [newReport, setNewReport] = useState<Partial<FieldReport>>({
    type: 'progress',
    priority: 'medium',
    title: '',
    description: '',
    photos: [],
    voice_notes: []
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMobileApp();
    getCurrentLocation();
    setupPeriodicSync();
  }, []);

  const initializeMobileApp = async () => {
    try {
      setIsLoading(true);

      // Simulate loading mobile data
      await loadMobileMetrics();
      await loadFieldReports();

      // Check device capabilities
      checkDeviceCapabilities();

    } catch (error) {
      console.error('Failed to initialize mobile app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMobileMetrics = async () => {
    // Simulate device metrics
    setMobileMetrics(prev => ({
      ...prev,
      connection_status: navigator.onLine ? 'online' : 'offline',
      battery_level: 85 + Math.random() * 15,
      signal_strength: 60 + Math.random() * 40,
      sync_status: Math.random() > 0.9 ? 'pending' : 'synced',
      crew_count: Math.floor(Math.random() * 8) + 3
    }));
  };

  const loadFieldReports = async () => {
    // Generate mock field reports
    const mockReports: FieldReport[] = [
      {
        id: '1',
        type: 'progress',
        title: 'Section A Base Layer Complete',
        description: 'Base layer application completed for Section A. Material temperature optimal at 155°F.',
        location: { lat: 40.7128, lng: -74.0060, address: 'Highway 101, Mile 15' },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        photos: ['photo1.jpg', 'photo2.jpg'],
        voice_notes: ['note1.wav'],
        priority: 'medium',
        status: 'submitted'
      },
      {
        id: '2',
        type: 'issue',
        title: 'Equipment Malfunction',
        description: 'Paver experiencing intermittent hydraulic issues. Maintenance requested.',
        location: { lat: 40.7130, lng: -74.0058, address: 'Highway 101, Mile 15.2' },
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        photos: ['issue1.jpg'],
        voice_notes: [],
        priority: 'high',
        status: 'acknowledged'
      }
    ];

    setFieldReports(mockReports);
  };

  const getCurrentLocation = async () => {
    try {
      if (capacitorNative.isNativeApp()) {
        // Use native geolocation on mobile app
        const position = await capacitorNative.getCurrentPosition();
        if (position) {
          setCurrentLocation(position);
        }
      } else {
        // Fallback to web geolocation API
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
          );
        }
      }
    } catch (error) {
      console.error('Location access error:', error);
    }
  };

  const checkDeviceCapabilities = () => {
    // Check for camera access
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      console.log('Camera available');
    }

    // Check for audio recording
    if ('MediaRecorder' in window) {
      console.log('Audio recording available');
    }

    // Check for offline storage
    if ('serviceWorker' in navigator) {
      console.log('Offline capabilities available');
    }
  };

  const setupPeriodicSync = () => {
    const syncInterval = setInterval(() => {
      syncDataWithServer();
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  };

  const syncDataWithServer = async () => {
    try {
      if (navigator.onLine) {
        setMobileMetrics(prev => ({ ...prev, sync_status: 'pending' }));
        
        // Simulate data sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMobileMetrics(prev => ({
          ...prev,
          sync_status: 'synced',
          last_sync: new Date().toISOString()
        }));
      }
    } catch (error) {
      setMobileMetrics(prev => ({ ...prev, sync_status: 'failed' }));
    }
  };

  const capturePhoto = async () => {
    try {
      if (capacitorNative.isNativeApp()) {
        // Use native camera on mobile app
        const photoData = await capacitorNative.capturePhoto();
        if (photoData) {
          setNewReport(prev => ({
            ...prev,
            photos: [...(prev.photos || []), photoData]
          }));
        }
      } else {
        // Fallback to web camera API
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        // Create video element for photo capture
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        // This would normally open a camera interface
        console.log('Camera opened for photo capture');
        
        // Add photo to current report
        setNewReport(prev => ({
          ...prev,
          photos: [...(prev.photos || []), `photo_${Date.now()}.jpg`]
        }));

        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      setIsRecording(true);
      mediaRecorder.start();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Add voice note to current report
          setNewReport(prev => ({
            ...prev,
            voice_notes: [...(prev.voice_notes || []), `voice_${Date.now()}.wav`]
          }));
        }
      };

      // Stop recording after 30 seconds or when user stops
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
        }
      }, 30000);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
  };

  const submitFieldReport = async () => {
    if (!newReport.title || !newReport.description) return;

    const report: FieldReport = {
      id: Date.now().toString(),
      type: newReport.type as 'progress' | 'issue' | 'completion' | 'weather' | 'safety',
      title: newReport.title,
      description: newReport.description,
      location: currentLocation ? 
        { ...currentLocation, address: 'Current Location' } :
        { lat: 0, lng: 0, address: 'Unknown Location' },
      timestamp: new Date().toISOString(),
      photos: newReport.photos || [],
      voice_notes: newReport.voice_notes || [],
      priority: newReport.priority as 'low' | 'medium' | 'high' | 'critical',
      status: 'submitted'
    };

    setFieldReports(prev => [report, ...prev]);
    
    // Reset form
    setNewReport({
      type: 'progress',
      priority: 'medium',
      title: '',
      description: '',
      photos: [],
      voice_notes: []
    });

    // Trigger sync
    syncDataWithServer();
  };

  const quickActions: QuickAction[] = [
    {
      id: 'emergency',
      title: 'Emergency Alert',
      icon: <AlertTriangle className="w-5 h-5" />,
      action: () => console.log('Emergency alert triggered'),
      priority: true
    },
    {
      id: 'photo',
      title: 'Take Photo',
      icon: <Camera className="w-5 h-5" />,
      action: capturePhoto,
      priority: false
    },
    {
      id: 'location',
      title: 'Mark Location',
      icon: <MapPin className="w-5 h-5" />,
      action: getCurrentLocation,
      priority: false
    },
    {
      id: 'weather',
      title: 'Weather Check',
      icon: <Cloud className="w-5 h-5" />,
      action: () => setActiveTab('weather'),
      priority: false
    }
  ];

  const getConnectionIcon = () => {
    switch (mobileMetrics.connection_status) {
      case 'online': return <Wifi className="w-4 h-4 text-success" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-destructive" />;
      case 'limited': return <Wifi className="w-4 h-4 text-warning" />;
      default: return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSyncIcon = () => {
    switch (mobileMetrics.sync_status) {
      case 'synced': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <RefreshCw className="w-4 h-4 text-warning animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'progress': return <Activity className="w-4 h-4 text-primary" />;
      case 'issue': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'completion': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'weather': return <Cloud className="w-4 h-4 text-accent" />;
      case 'safety': return <Shield className="w-4 h-4 text-warning" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-warning';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className={`max-w-md mx-auto bg-background min-h-screen ${className}`}>
      {/* Mobile Status Bar */}
      <div className="flex items-center justify-between p-3 bg-muted/20 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Field App</span>
        </div>
        
        <div className="flex items-center gap-3">
          {getConnectionIcon()}
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <span className="text-xs">{mobileMetrics.signal_strength}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3" />
            <span className="text-xs">{mobileMetrics.battery_level.toFixed(0)}%</span>
          </div>
          {getSyncIcon()}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mx-3 mt-3">
          <TabsTrigger value="dashboard" className="text-xs">
            <Activity className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">
            <Send className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="weather" className="text-xs">
            <Cloud className="w-3 h-3" />
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">
            <Settings className="w-3 h-3" />
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="p-3 space-y-4">
          {/* Current Status */}
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Current Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Project:</span>
                <span className="text-sm font-medium">{mobileMetrics.current_project?.project_name || 'Highway Resurfacing'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Crew Size:</span>
                <span className="text-sm font-medium">{mobileMetrics.crew_count} workers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Weather:</span>
                <span className="text-sm font-medium">{mobileMetrics.weather_status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Sync:</span>
                <span className="text-sm font-medium">
                  {new Date(mobileMetrics.last_sync).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.priority ? "destructive" : "outline"}
                  size="sm"
                  className={`${action.priority ? 'glow-destructive' : 'glass-card'} flex flex-col items-center gap-2 h-auto py-3`}
                  onClick={action.action}
                >
                  {action.icon}
                  <span className="text-xs">{action.title}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Recent Reports */}
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Recent Reports</h3>
            <div className="space-y-2">
              {fieldReports.slice(0, 3).map((report) => (
                <div key={report.id} className="p-2 bg-muted/10 rounded border border-glass-border">
                  <div className="flex items-start gap-2">
                    {getReportIcon(report.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="p-3 space-y-4">
          {/* New Report Form */}
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Create Field Report</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value as 'progress' | 'issue' | 'completion' | 'weather' | 'safety' }))}>
                  <SelectTrigger className="glass-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="issue">Issue</SelectItem>
                    <SelectItem value="completion">Completion</SelectItem>
                    <SelectItem value="weather">Weather</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={newReport.priority} onValueChange={(value) => setNewReport(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' | 'critical' }))}>
                  <SelectTrigger className="glass-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Report title..."
                value={newReport.title}
                onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                className="glass-card"
              />

              <Textarea
                placeholder="Describe the situation..."
                value={newReport.description}
                onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                className="glass-card"
                rows={3}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-card flex-1"
                  onClick={capturePhoto}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Photo ({newReport.photos?.length || 0})
                </Button>

                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  className={`${isRecording ? 'glow-destructive' : 'glass-card'} flex-1`}
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
              </div>

              <Button
                className="w-full glow-primary"
                onClick={submitFieldReport}
                disabled={!newReport.title || !newReport.description}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            </div>
          </Card>

          {/* Reports History */}
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Field Reports</h3>
            <div className="space-y-3">
              {fieldReports.map((report) => (
                <div key={report.id} className="p-3 bg-muted/10 rounded border border-glass-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getReportIcon(report.type)}
                      <span className="font-medium text-sm">{report.title}</span>
                    </div>
                    <Badge 
                      variant={report.status === 'acknowledged' ? 'default' : 'outline'} 
                      className="text-xs"
                    >
                      {report.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(report.timestamp).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      {report.photos.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          {report.photos.length}
                        </span>
                      )}
                      {report.voice_notes.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Mic className="w-3 h-3" />
                          {report.voice_notes.length}
                        </span>
                      )}
                      <span className={getPriorityColor(report.priority)}>
                        {report.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="p-3 space-y-4">
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Current Conditions
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Temperature:</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Thermometer className="w-3 h-3" />
                  72°F
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Humidity:</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  65%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Wind:</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  8 mph SW
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Conditions:</span>
                <span className="text-sm font-medium">Clear</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Work Suitability</h3>
            <div className="space-y-3">
              <div className="p-3 bg-success/10 rounded border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="font-medium text-success">Excellent</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optimal conditions for all asphalt operations
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>• Temperature: Optimal range</p>
                <p>• No precipitation expected</p>
                <p>• Light winds favorable</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="p-3 space-y-4">
          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">App Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-sync</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Location tracking</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Photo compression</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Offline mode</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Data Management</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full glass-card">
                <Download className="w-4 h-4 mr-2" />
                Download Updates
              </Button>
              <Button variant="outline" size="sm" className="w-full glass-card">
                <Upload className="w-4 h-4 mr-2" />
                Sync All Data
              </Button>
              <Button variant="outline" size="sm" className="w-full glass-card">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <h3 className="font-semibold mb-3">Emergency</h3>
            <Button variant="destructive" size="sm" className="w-full glow-destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Alert
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Sends immediate alert to dispatch and nearby crews
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading mobile app...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileInterface;