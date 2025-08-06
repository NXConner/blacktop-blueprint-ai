import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import InstallationGuides from '@/components/installation/InstallationGuides';
import QRCodeGenerator from '@/components/qr/QRCodeGenerator';
import { 
  Download, 
  Smartphone, 
  Monitor,
  Package,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Star,
  Shield,
  Zap,
  Globe,
  Apple,
  Laptop,
  Server,
  HardDrive,
  FileArchive,
  ExternalLink,
  BookOpen
} from 'lucide-react';

const Downloads: React.FC = () => {
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [installedApps, setInstalledApps] = useState(new Set());
  const { toast } = useToast();

  // Mobile app versions
  const mobileApps = [
    {
      id: 'android-main',
      name: 'Blackout Construction Manager',
      platform: 'Android',
      version: '2.1.4',
      size: '32.5 MB',
      icon: <Smartphone className="w-8 h-8 text-green-500" />,
      downloadUrl: '/downloads/blackout-construction-v2.1.4.apk',
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iNDAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4=',
      description: 'Full-featured mobile construction management app with offline capabilities',
      features: ['Offline Mode', 'GPS Tracking', 'Photo Capture', 'Voice Notes', 'Real-time Sync'],
      requirements: 'Android 7.0+ (API 24)',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'ios-main',
      name: 'Blackout Construction Manager',
      platform: 'iOS',
      version: '2.1.3',
      size: '28.7 MB',
      icon: <Apple className="w-8 h-8 text-gray-700" />,
      downloadUrl: 'https://apps.apple.com/app/blackout-construction',
      description: 'iOS version available on the App Store',
      features: ['Face ID Support', 'iOS Widgets', 'Apple Watch Support', 'Siri Shortcuts'],
      requirements: 'iOS 14.0+',
      lastUpdated: '2024-01-12'
    }
  ];

  // Module installation packages
  const modulePackages = [
    {
      id: 'financial-suite',
      name: 'Financial & Accounting Suite',
      description: 'Complete financial management modules package',
      platforms: [
        { name: 'Windows', file: 'financial-suite-v1.2.3.msi', size: '145 MB', icon: <Monitor className="w-5 h-5" /> },
        { name: 'Linux (Ubuntu/Debian)', file: 'financial-suite_1.2.3_amd64.deb', size: '128 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'Linux (RHEL/CentOS)', file: 'financial-suite-1.2.3-1.x86_64.rpm', size: '132 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'macOS', file: 'financial-suite-v1.2.3.dmg', size: '138 MB', icon: <Laptop className="w-5 h-5" /> }
      ],
      modules: ['QuickBooks Integration', 'Advanced Accounting Suite', 'Payroll Management', 'Tax Management'],
      version: '1.2.3'
    },
    {
      id: 'construction-tools',
      name: 'Construction Tools Package',
      description: 'Essential construction management and planning tools',
      platforms: [
        { name: 'Windows', file: 'construction-tools-v2.0.1.msi', size: '234 MB', icon: <Monitor className="w-5 h-5" /> },
        { name: 'Linux (Ubuntu/Debian)', file: 'construction-tools_2.0.1_amd64.deb', size: '198 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'Linux (RHEL/CentOS)', file: 'construction-tools-2.0.1-1.x86_64.rpm', size: '205 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'macOS', file: 'construction-tools-v2.0.1.dmg', size: '221 MB', icon: <Laptop className="w-5 h-5" /> }
      ],
      modules: ['Project Planning Suite', 'Resource Management', 'Quality Control', 'Safety Compliance'],
      version: '2.0.1'
    },
    {
      id: 'equipment-fleet',
      name: 'Equipment & Fleet Management',
      description: 'Comprehensive equipment tracking and fleet management',
      platforms: [
        { name: 'Windows', file: 'equipment-fleet-v1.8.7.msi', size: '187 MB', icon: <Monitor className="w-5 h-5" /> },
        { name: 'Linux (Ubuntu/Debian)', file: 'equipment-fleet_1.8.7_amd64.deb', size: '164 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'Linux (RHEL/CentOS)', file: 'equipment-fleet-1.8.7-1.x86_64.rpm', size: '171 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'macOS', file: 'equipment-fleet-v1.8.7.dmg', size: '179 MB', icon: <Laptop className="w-5 h-5" /> }
      ],
      modules: ['Fleet Tracking', 'Maintenance Scheduler', 'Equipment Analytics', 'Fuel Management'],
      version: '1.8.7'
    },
    {
      id: 'analytics-reporting',
      name: 'Analytics & Reporting Suite',
      description: 'Advanced analytics and comprehensive reporting tools',
      platforms: [
        { name: 'Windows', file: 'analytics-reporting-v3.1.2.msi', size: '289 MB', icon: <Monitor className="w-5 h-5" /> },
        { name: 'Linux (Ubuntu/Debian)', file: 'analytics-reporting_3.1.2_amd64.deb', size: '267 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'Linux (RHEL/CentOS)', file: 'analytics-reporting-3.1.2-1.x86_64.rpm', size: '275 MB', icon: <Server className="w-5 h-5" /> },
        { name: 'macOS', file: 'analytics-reporting-v3.1.2.dmg', size: '283 MB', icon: <Laptop className="w-5 h-5" /> }
      ],
      modules: ['Power BI Integration', 'Custom Dashboard Builder', 'Advanced Analytics Engine', 'Export Manager'],
      version: '3.1.2'
    }
  ];

  const handleDownload = async (downloadUrl: string, filename: string) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [filename]: 0 }));
      
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setDownloadProgress(prev => ({ ...prev, [filename]: i }));
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadProgress(prev => ({ ...prev, [filename]: undefined }));
      toast({
        title: "Download Started",
        description: `${filename} download has been initiated.`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "There was an error starting the download. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = (url: string) => {
    // Simple QR code placeholder - in production, use a proper QR code library
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="20" height="20" fill="black"/>
        <rect x="40" y="20" width="20" height="20" fill="black"/>
        <rect x="60" y="20" width="20" height="20" fill="black"/>
        <rect x="100" y="20" width="20" height="20" fill="black"/>
        <rect x="120" y="20" width="20" height="20" fill="black"/>
        <rect x="140" y="20" width="20" height="20" fill="black"/>
        <rect x="160" y="20" width="20" height="20" fill="black"/>
        <rect x="20" y="40" width="20" height="20" fill="black"/>
        <rect x="160" y="40" width="20" height="20" fill="black"/>
        <rect x="20" y="60" width="20" height="20" fill="black"/>
        <rect x="60" y="60" width="20" height="20" fill="black"/>
        <rect x="80" y="60" width="20" height="20" fill="black"/>
        <rect x="100" y="60" width="20" height="20" fill="black"/>
        <rect x="160" y="60" width="20" height="20" fill="black"/>
        <text x="100" y="190" text-anchor="middle" font-size="8" fill="black">Scan to Download</text>
      </svg>
    `)}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Downloads Center
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Download mobile apps and installation packages for all Blackout Construction modules
        </p>
      </div>

      <Tabs defaultValue="mobile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile Apps
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Module Packages
          </TabsTrigger>
          <TabsTrigger value="enterprise" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Enterprise Tools
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Installation Guides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-6">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Download our mobile apps to manage construction projects on the go. All apps support offline mode and real-time synchronization.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {mobileApps.map((app) => (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {app.icon}
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <CardDescription>{app.platform} v{app.version}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{app.size}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{app.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {app.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="text-center space-y-2">
                      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                        {app.qrCode ? (
                          <img src={app.qrCode} alt="QR Code" className="w-20 h-20" />
                        ) : (
                          <QrCode className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Scan QR Code</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Requirements:</p>
                        <p className="text-sm font-medium">{app.requirements}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Updated:</p>
                        <p className="text-sm">{app.lastUpdated}</p>
                      </div>
                    </div>
                  </div>

                  {downloadProgress[app.id] !== undefined ? (
                    <div className="space-y-2">
                      <Progress value={downloadProgress[app.id]} className="w-full" />
                      <p className="text-sm text-center text-muted-foreground">
                        Downloading... {downloadProgress[app.id]}%
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDownload(app.downloadUrl, `${app.name.toLowerCase().replace(/\s+/g, '-')}-${app.version}.${app.platform === 'Android' ? 'apk' : 'ipa'}`)}
                        className="flex-1"
                        disabled={app.platform === 'iOS'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {app.platform === 'iOS' ? 'App Store' : 'Download APK'}
                      </Button>
                      {app.platform === 'iOS' && (
                        <Button variant="outline" asChild>
                          <a href={app.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              Download complete module packages for your operating system. Each package includes multiple related modules and dependencies.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {modulePackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">v{pkg.version}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Included Modules:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pkg.modules.map((module, index) => (
                        <Badge key={index} variant="outline">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {pkg.platforms.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {platform.icon}
                          <div>
                            <p className="font-medium text-sm">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">{platform.size}</p>
                          </div>
                        </div>
                        {downloadProgress[platform.file] !== undefined ? (
                          <div className="w-20">
                            <Progress value={downloadProgress[platform.file]} className="w-full h-2" />
                          </div>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleDownload(`/downloads/${platform.file}`, platform.file)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Enterprise-grade tools and utilities for large-scale deployments. Includes management consoles, database tools, and integration utilities.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Server Management Console
                </CardTitle>
                <CardDescription>Complete server administration and monitoring tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Windows Server</span>
                    <Button size="sm" variant="outline" onClick={() => handleDownload('/downloads/server-console-windows.msi', 'server-console-windows.msi')}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Linux (Docker)</span>
                    <Button size="sm" variant="outline" onClick={() => handleDownload('/downloads/server-console-docker.tar.gz', 'server-console-docker.tar.gz')}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Database Migration Tools
                </CardTitle>
                <CardDescription>Tools for migrating data between different database systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Migration Toolkit</span>
                    <Button size="sm" variant="outline" onClick={() => handleDownload('/downloads/db-migration-toolkit.zip', 'db-migration-toolkit.zip')}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Schema Validator</span>
                    <Button size="sm" variant="outline" onClick={() => handleDownload('/downloads/schema-validator.jar', 'schema-validator.jar')}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              Detailed step-by-step installation guides for all platforms and modules. Follow these instructions to ensure proper installation.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <InstallationGuides 
                platform="android" 
                moduleName="Blackout Construction Manager" 
                fileName="blackout-construction-v2.1.4.apk" 
              />
              <InstallationGuides 
                platform="windows" 
                moduleName="Financial & Accounting Suite" 
                fileName="financial-suite-v1.2.3.msi" 
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <InstallationGuides 
                platform="linux" 
                moduleName="Construction Tools Package" 
                fileName="construction-tools_2.0.1_amd64.deb" 
              />
              <InstallationGuides 
                platform="macos" 
                moduleName="Equipment & Fleet Management" 
                fileName="equipment-fleet-v1.8.7.dmg" 
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Generator</CardTitle>
              <CardDescription>Generate QR codes for easy mobile app downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <QRCodeGenerator 
                  url={`${window.location.origin}/downloads/blackout-construction-v2.1.4.apk`}
                  title="Android App Download"
                  description="Scan to download APK"
                  size={180}
                />
                <div className="space-y-4">
                  <h4 className="font-medium">How to use QR codes:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Open your mobile camera app</li>
                    <li>Point the camera at the QR code</li>
                    <li>Tap the notification that appears</li>
                    <li>Follow the download instructions</li>
                  </ol>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Always verify QR codes are from trusted sources before scanning to ensure security.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Installation Support
          </CardTitle>
          <CardDescription>Need help with installation? Check our resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => {
                // Switch to guides tab
                const guidesTab = document.querySelector('[value="guides"]') as HTMLElement;
                guidesTab?.click();
              }}
            >
              <div className="text-left">
                <p className="font-medium">Installation Guides</p>
                <p className="text-sm text-muted-foreground">Step-by-step instructions</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => {
                toast({
                  title: "Video Tutorials",
                  description: "Video tutorials will be available soon! Check our installation guides for now.",
                });
              }}
            >
              <div className="text-left">
                <p className="font-medium">Video Tutorials</p>
                <p className="text-sm text-muted-foreground">Watch guided installations</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => {
                toast({
                  title: "Technical Support",
                  description: "For technical support, please contact our team at support@blackout-construction.com",
                });
              }}
            >
              <div className="text-left">
                <p className="font-medium">Technical Support</p>
                <p className="text-sm text-muted-foreground">Get expert assistance</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Downloads;