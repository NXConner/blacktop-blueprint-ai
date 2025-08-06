import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown,
  ChevronRight,
  Monitor,
  Server,
  Laptop,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Info,
  Terminal,
  Package,
  Shield,
  Download
} from 'lucide-react';

interface InstallationStep {
  step: number;
  title: string;
  description: string;
  command?: string;
  note?: string;
  warning?: string;
}

interface InstallationGuideProps {
  platform: 'windows' | 'linux' | 'macos' | 'android';
  moduleName: string;
  fileName: string;
}

const InstallationGuides: React.FC<InstallationGuideProps> = ({ platform, moduleName, fileName }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getWindowsSteps = (): InstallationStep[] => [
    {
      step: 1,
      title: "Download the MSI Installer",
      description: `Download ${fileName} from the downloads page.`,
      note: "Make sure to download from the official source to ensure security."
    },
    {
      step: 2,
      title: "Run as Administrator",
      description: "Right-click the downloaded MSI file and select 'Run as administrator'.",
      warning: "Administrator privileges are required for system-level installation."
    },
    {
      step: 3,
      title: "Follow Installation Wizard",
      description: "Click 'Next' through the installation wizard, accepting the license agreement.",
      note: "Default installation path is recommended unless you have specific requirements."
    },
    {
      step: 4,
      title: "Complete Installation",
      description: "Click 'Install' and wait for the process to complete.",
      note: "Installation may take 5-10 minutes depending on your system."
    },
    {
      step: 5,
      title: "Verify Installation",
      description: "Launch the application from the Start Menu to confirm successful installation.",
      command: "Start Menu > Blackout Construction > " + moduleName
    }
  ];

  const getLinuxSteps = (): InstallationStep[] => [
    {
      step: 1,
      title: "Download Package",
      description: `Download the appropriate package for your distribution (.deb or .rpm).`,
      note: "Choose .deb for Ubuntu/Debian or .rpm for RHEL/CentOS/Fedora."
    },
    {
      step: 2,
      title: "Install Dependencies",
      description: "Update your package manager and install required dependencies.",
      command: fileName.includes('.deb') 
        ? "sudo apt update && sudo apt install -y wget curl"
        : "sudo yum update && sudo yum install -y wget curl"
    },
    {
      step: 3,
      title: "Install Package",
      description: "Install the downloaded package using your package manager.",
      command: fileName.includes('.deb')
        ? `sudo dpkg -i ${fileName} && sudo apt-get install -f`
        : `sudo rpm -ivh ${fileName}`
    },
    {
      step: 4,
      title: "Configure Service",
      description: "Enable and start the service if applicable.",
      command: `sudo systemctl enable blackout-${moduleName.toLowerCase().replace(/\s+/g, '-')} && sudo systemctl start blackout-${moduleName.toLowerCase().replace(/\s+/g, '-')}`
    },
    {
      step: 5,
      title: "Verify Installation",
      description: "Check service status and test the installation.",
      command: `sudo systemctl status blackout-${moduleName.toLowerCase().replace(/\s+/g, '-')}`
    }
  ];

  const getMacOSSteps = (): InstallationStep[] => [
    {
      step: 1,
      title: "Download DMG File",
      description: `Download ${fileName} from the downloads page.`,
      note: "The DMG file will be saved to your Downloads folder by default."
    },
    {
      step: 2,
      title: "Mount DMG",
      description: "Double-click the DMG file to mount it.",
      note: "A new window will open showing the application bundle."
    },
    {
      step: 3,
      title: "Install Application",
      description: "Drag the application to your Applications folder.",
      warning: "You may need to allow installation from 'identified developers' in System Preferences > Security & Privacy."
    },
    {
      step: 4,
      title: "Grant Permissions",
      description: "Launch the application and grant necessary permissions when prompted.",
      note: "The app may request access to files, network, or other system resources."
    },
    {
      step: 5,
      title: "Verify Installation",
      description: "Find and launch the application from Launchpad or Applications folder.",
      command: "Applications > " + moduleName
    }
  ];

  const getAndroidSteps = (): InstallationStep[] => [
    {
      step: 1,
      title: "Enable Unknown Sources",
      description: "Go to Settings > Security > Enable 'Unknown sources' or 'Install unknown apps'.",
      warning: "This allows installation of apps from sources other than the Play Store."
    },
    {
      step: 2,
      title: "Download APK",
      description: `Download ${fileName} using your mobile browser or scan the QR code.`,
      note: "The APK will be saved to your Downloads folder."
    },
    {
      step: 3,
      title: "Install APK",
      description: "Navigate to Downloads and tap the APK file to install.",
      note: "You may see a security warning - this is normal for APK installations."
    },
    {
      step: 4,
      title: "Grant Permissions",
      description: "Allow necessary permissions when prompted during first launch.",
      note: "The app needs location, camera, and storage permissions to function properly."
    },
    {
      step: 5,
      title: "Setup Account",
      description: "Log in with your existing account or create a new one.",
      note: "Your account will sync with the main system automatically."
    }
  ];

  const getPlatformIcon = () => {
    switch (platform) {
      case 'windows': return <Monitor className="w-6 h-6" />;
      case 'linux': return <Server className="w-6 h-6" />;
      case 'macos': return <Laptop className="w-6 h-6" />;
      case 'android': return <Smartphone className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'windows': return 'Windows';
      case 'linux': return 'Linux';
      case 'macos': return 'macOS';
      case 'android': return 'Android';
      default: return 'Unknown';
    }
  };

  const getSteps = () => {
    switch (platform) {
      case 'windows': return getWindowsSteps();
      case 'linux': return getLinuxSteps();
      case 'macos': return getMacOSSteps();
      case 'android': return getAndroidSteps();
      default: return [];
    }
  };

  const steps = getSteps();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getPlatformIcon()}
          <div>
            <CardTitle className="text-xl">
              {moduleName} Installation Guide
            </CardTitle>
            <CardDescription>
              Step-by-step installation instructions for {getPlatformName()}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto">
            {getPlatformName()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please follow these steps in order. If you encounter any issues, contact our support team.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {steps.map((step) => (
            <Collapsible
              key={step.step}
              open={openSections[`step-${step.step}`]}
              onOpenChange={() => toggleSection(`step-${step.step}`)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {step.step}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {openSections[`step-${step.step}`] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="ml-11 space-y-3">
                  {step.command && (
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-4 h-4" />
                        <span className="text-sm font-medium">Command:</span>
                      </div>
                      <code className="text-sm font-mono">{step.command}</code>
                    </div>
                  )}
                  {step.note && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Note:</strong> {step.note}
                      </AlertDescription>
                    </Alert>
                  )}
                  {step.warning && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Warning:</strong> {step.warning}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Need Help?
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            If you encounter any issues during installation, our support team is here to help.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
            <Button variant="outline" size="sm">
              View Documentation
            </Button>
            <Button variant="outline" size="sm">
              Watch Video Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallationGuides;