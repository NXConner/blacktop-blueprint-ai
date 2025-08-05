import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone,
  Download,
  Wifi,
  Camera,
  Mic,
  MapPin,
  Settings,
  Shield,
  Zap,
  CheckCircle,
  Users,
  Cloud,
  Activity,
  AlertTriangle,
  QrCode,
  Apple,
  Globe
} from 'lucide-react';
import MobileInterface from '@/components/mobile/MobileInterface';

const MobileApp: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    user_agent: '',
    platform: '',
    is_mobile: false,
    supports_pwa: false
  });
  const [appStats, setAppStats] = useState({
    active_users: 0,
    reports_submitted: 0,
    sync_success_rate: 0,
    average_response_time: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeviceInfo();
    loadAppStats();
  }, []);

  const loadDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;

    setDeviceInfo({
      user_agent: userAgent,
      platform,
      is_mobile: isMobile,
      supports_pwa: supportsPWA
    });
  };

  const loadAppStats = async () => {
    try {
      // Simulate loading app statistics
      setAppStats({
        active_users: Math.floor(Math.random() * 150) + 50,
        reports_submitted: Math.floor(Math.random() * 500) + 200,
        sync_success_rate: 95 + Math.random() * 5,
        average_response_time: 150 + Math.random() * 100
      });
    } catch (error) {
      console.error('Failed to load app stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Camera className="w-5 h-5" />,
      title: 'Photo Capture',
      description: 'Capture high-quality photos with automatic GPS tagging and metadata'
    },
    {
      icon: <Mic className="w-5 h-5" />,
      title: 'Voice Notes',
      description: 'Record voice notes for detailed field observations and instructions'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: 'GPS Tracking',
      description: 'Real-time location tracking with automatic check-in/check-out'
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: 'Offline Mode',
      description: 'Work seamlessly without internet connection, sync when online'
    },
    {
      icon: <Cloud className="w-5 h-5" />,
      title: 'Real-time Sync',
      description: 'Instant synchronization with central command when connected'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Emergency Alerts',
      description: 'One-tap emergency alerts to dispatch and nearby crews'
    }
  ];

  const installPWA = () => {
    // This would normally trigger PWA installation
    console.log('Installing PWA...');
  };

  const downloadQR = () => {
    // Generate QR code for app download
    console.log('Generating QR code...');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-glow-primary mb-2">
              MOBILE FIELD APP
            </h1>
            <p className="text-muted-foreground text-lg">
              Companion Application for Field Operations // {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="glass-card text-success">
              <Smartphone className="w-4 h-4 mr-2" />
              {appStats.active_users} Active Users
            </Badge>
            <Badge variant="outline" className="glass-card text-primary">
              <Activity className="w-4 h-4 mr-2" />
              {appStats.sync_success_rate.toFixed(1)}% Sync Rate
            </Badge>
            {deviceInfo.supports_pwa && (
              <Badge variant="outline" className="glass-card text-accent">
                <Zap className="w-4 h-4 mr-2" />
                PWA Ready
              </Badge>
            )}
            <Button
              variant="outline"
              className="glass-card"
              onClick={installPWA}
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          </div>
        </div>

        {/* Device Compatibility */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Device Compatibility</h3>
            <div className="flex items-center gap-2">
              {deviceInfo.is_mobile ? (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Mobile Optimized
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Desktop Preview
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/10 rounded-lg">
              <div className="text-lg font-bold text-primary">iOS</div>
              <div className="text-sm text-muted-foreground">iPhone & iPad</div>
              <CheckCircle className="w-4 h-4 text-success mx-auto mt-1" />
            </div>
            <div className="text-center p-3 bg-muted/10 rounded-lg">
              <div className="text-lg font-bold text-success">Android</div>
              <div className="text-sm text-muted-foreground">All Devices</div>
              <CheckCircle className="w-4 h-4 text-success mx-auto mt-1" />
            </div>
            <div className="text-center p-3 bg-muted/10 rounded-lg">
              <div className="text-lg font-bold text-accent">PWA</div>
              <div className="text-sm text-muted-foreground">Progressive Web App</div>
              <CheckCircle className="w-4 h-4 text-success mx-auto mt-1" />
            </div>
            <div className="text-center p-3 bg-muted/10 rounded-lg">
              <div className="text-lg font-bold text-warning">Offline</div>
              <div className="text-sm text-muted-foreground">Works Offline</div>
              <CheckCircle className="w-4 h-4 text-success mx-auto mt-1" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Live Preview
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="download" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Live Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mobile Interface Preview */}
            <div className="lg:col-span-2">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 text-center">Interactive Mobile Preview</h3>
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Phone Frame */}
                    <div className="w-80 h-[600px] bg-black rounded-[2rem] p-2 shadow-2xl">
                      <div className="w-full h-full bg-background rounded-[1.5rem] overflow-hidden">
                        <MobileInterface userId="demo-user" />
                      </div>
                    </div>
                    
                    {/* Frame Details */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-800 rounded-full"></div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {deviceInfo.is_mobile ? 
                    "You're viewing this on a mobile device! Try the interactive features above." :
                    "This is a live preview of the mobile app interface. Best experienced on mobile devices."
                  }
                </p>
              </Card>
            </div>

            {/* App Info */}
            <div className="space-y-4">
              <Card className="glass-card p-4">
                <h4 className="font-semibold mb-3">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reports Today</span>
                    <span className="font-medium">{Math.floor(appStats.reports_submitted / 7)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Response</span>
                    <span className="font-medium">{appStats.average_response_time.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="font-medium text-success">99.8%</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-4">
                <h4 className="font-semibold mb-3">System Requirements</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>iOS 12.0+ or Android 8.0+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>GPS/Location Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>Camera Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>Microphone Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span>50MB Storage</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-4">
                <h4 className="font-semibold mb-3">Security</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-success" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-success" />
                    <span>Biometric authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-success" />
                    <span>Secure data transmission</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Integrated Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Field Reporting</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Progress reports with photo documentation</li>
                  <li>• Issue tracking with priority levels</li>
                  <li>• Safety incident reporting</li>
                  <li>• Weather condition updates</li>
                  <li>• Equipment status reports</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Real-time Integration</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Live sync with OverWatch System</li>
                  <li>• Weather data integration</li>
                  <li>• Cost tracking and reporting</li>
                  <li>• Crew coordination and messaging</li>
                  <li>• Emergency alert system</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Download Tab */}
        <TabsContent value="download" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Download Options */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Download Options</h3>
              <div className="space-y-4">
                <Button className="w-full justify-start glow-primary" size="lg">
                  <Apple className="w-5 h-5 mr-3" />
                  Download for iOS
                </Button>
                
                <Button className="w-full justify-start glow-primary" size="lg">
                  <Globe className="w-5 h-5 mr-3" />
                  Download for Android
                </Button>
                
                <Button 
                  className="w-full justify-start glass-card" 
                  size="lg"
                  variant="outline"
                  onClick={installPWA}
                >
                  <Zap className="w-5 h-5 mr-3" />
                  Install Progressive Web App
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 glass-card" 
                    variant="outline"
                    onClick={downloadQR}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button className="flex-1 glass-card" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Setup
                  </Button>
                </div>
              </div>
            </Card>

            {/* Installation Guide */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Installation Guide</h3>
              <div className="space-y-4">
                <div className="p-3 bg-muted/10 rounded-lg">
                  <h4 className="font-medium mb-2">Step 1: Download</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose your platform and download the app or install the PWA
                  </p>
                </div>
                
                <div className="p-3 bg-muted/10 rounded-lg">
                  <h4 className="font-medium mb-2">Step 2: Permissions</h4>
                  <p className="text-sm text-muted-foreground">
                    Grant camera, microphone, and location permissions when prompted
                  </p>
                </div>
                
                <div className="p-3 bg-muted/10 rounded-lg">
                  <h4 className="font-medium mb-2">Step 3: Login</h4>
                  <p className="text-sm text-muted-foreground">
                    Use your Blacktop Blackout credentials to sign in
                  </p>
                </div>
                
                <div className="p-3 bg-muted/10 rounded-lg">
                  <h4 className="font-medium mb-2">Step 4: Sync</h4>
                  <p className="text-sm text-muted-foreground">
                    Initial sync will download your projects and crew assignments
                  </p>
                </div>
              </div>
            </Card>

            {/* Support */}
            <Card className="glass-card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Support & Training</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/10 rounded-lg">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Training Videos</h4>
                  <p className="text-sm text-muted-foreground">Step-by-step tutorials</p>
                </div>
                
                <div className="text-center p-4 bg-muted/10 rounded-lg">
                  <Settings className="w-8 h-8 text-success mx-auto mb-2" />
                  <h4 className="font-medium mb-1">24/7 Support</h4>
                  <p className="text-sm text-muted-foreground">Technical assistance</p>
                </div>
                
                <div className="text-center p-4 bg-muted/10 rounded-lg">
                  <Activity className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Updates</h4>
                  <p className="text-sm text-muted-foreground">Regular feature releases</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Statistics */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                  <span className="text-sm font-medium">Daily Active Users</span>
                  <span className="text-lg font-bold text-primary">{appStats.active_users}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                  <span className="text-sm font-medium">Reports Submitted</span>
                  <span className="text-lg font-bold text-success">{appStats.reports_submitted}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                  <span className="text-sm font-medium">Sync Success Rate</span>
                  <span className="text-lg font-bold text-accent">{appStats.sync_success_rate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
                  <span className="text-sm font-medium">Avg Response Time</span>
                  <span className="text-lg font-bold text-warning">{appStats.average_response_time.toFixed(0)}ms</span>
                </div>
              </div>
            </Card>

            {/* Feature Usage */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Photo Capture</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress Reports</span>
                    <span>87%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>GPS Tracking</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Voice Notes</span>
                    <span>64%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-warning h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Emergency Alerts</span>
                    <span>8%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading mobile app interface...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileApp;