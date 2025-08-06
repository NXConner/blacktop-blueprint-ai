import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Play, 
  Pause, 
  Trash2, 
  Settings, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search,
  Filter,
  RefreshCw,
  Upload,
  Code,
  Eye,
  ExternalLink
} from 'lucide-react';

import { moduleRegistry, RealModule } from '@/services/module-registry';
import { moduleLoader, LoadedModuleInstance } from '@/services/module-loader';
import { modulePackageBuilder, moduleBuilder } from '@/services/module-package-builder';

// ================================
// MAIN MODULE MANAGER COMPONENT
// ================================

export default function ModuleManager() {
  const [activeTab, setActiveTab] = useState('installed');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [installedModules, setInstalledModules] = useState<RealModule[]>([]);
  const [loadedModules, setLoadedModules] = useState<LoadedModuleInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadModuleData();
  }, []);

  const loadModuleData = async () => {
    setIsLoading(true);
    try {
      const installed = moduleRegistry.getAllModules();
      const loaded = moduleLoader.getAllLoadedModules();
      
      setInstalledModules(installed);
      setLoadedModules(loaded);
    } catch (error) {
      console.error('Failed to load module data:', error);
      toast({
        title: "Error",
        description: "Failed to load module data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadModuleData();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Manager</h1>
          <p className="text-muted-foreground">
            Manage, install, and configure your system modules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <CreateModuleDialog onModuleCreated={loadModuleData} />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          <option value="financial">Financial</option>
          <option value="environmental">Environmental</option>
          <option value="construction">Construction</option>
          <option value="security">Security</option>
          <option value="logistics">Logistics</option>
        </select>
      </div>

      {/* Module Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="installed">
            Installed ({installedModules.length})
          </TabsTrigger>
          <TabsTrigger value="running">
            Running ({loadedModules.filter(m => m.isActive).length})
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="developer">
            Developer Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="mt-6">
          <InstalledModulesTab 
            modules={installedModules}
            searchTerm={searchTerm}
            filterCategory={filterCategory}
            onRefresh={loadModuleData}
          />
        </TabsContent>

        <TabsContent value="running" className="mt-6">
          <RunningModulesTab 
            modules={loadedModules}
            onRefresh={loadModuleData}
          />
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
          <MarketplaceTab onModuleInstalled={loadModuleData} />
        </TabsContent>

        <TabsContent value="developer" className="mt-6">
          <DeveloperToolsTab onModuleCreated={loadModuleData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ================================
// INSTALLED MODULES TAB
// ================================

function InstalledModulesTab({ 
  modules, 
  searchTerm, 
  filterCategory, 
  onRefresh 
}: {
  modules: RealModule[];
  searchTerm: string;
  filterCategory: string;
  onRefresh: () => void;
}) {
  const { toast } = useToast();

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActivateModule = async (moduleId: string) => {
    try {
      await moduleLoader.loadModule(moduleId);
      toast({
        title: "Module Activated",
        description: `Module ${moduleId} has been activated successfully`,
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to activate module:', error);
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeactivateModule = async (moduleId: string) => {
    try {
      await moduleLoader.unloadModule(moduleId);
      toast({
        title: "Module Deactivated",
        description: `Module ${moduleId} has been deactivated`,
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to deactivate module:', error);
      toast({
        title: "Deactivation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUninstallModule = async (moduleId: string) => {
    try {
      await moduleRegistry.unregisterModule(moduleId);
      toast({
        title: "Module Uninstalled",
        description: `Module ${moduleId} has been uninstalled`,
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to uninstall module:', error);
      toast({
        title: "Uninstall Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {filteredModules.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Install modules from the marketplace to get started'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onActivate={() => handleActivateModule(module.id)}
              onDeactivate={() => handleDeactivateModule(module.id)}
              onUninstall={() => handleUninstallModule(module.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ================================
// RUNNING MODULES TAB
// ================================

function RunningModulesTab({ 
  modules, 
  onRefresh 
}: {
  modules: LoadedModuleInstance[];
  onRefresh: () => void;
}) {
  const { toast } = useToast();

  const handleStopModule = async (moduleId: string) => {
    try {
      await moduleLoader.unloadModule(moduleId);
      toast({
        title: "Module Stopped",
        description: `Module ${moduleId} has been stopped`,
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to stop module:', error);
      toast({
        title: "Stop Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No running modules</h3>
              <p className="text-muted-foreground">
                Activate modules from the installed modules tab
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((instance) => (
            <RunningModuleCard
              key={instance.id}
              instance={instance}
              onStop={() => handleStopModule(instance.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ================================
// MARKETPLACE TAB
// ================================

function MarketplaceTab({ onModuleInstalled }: { onModuleInstalled: () => void }) {
  const [availableModules] = useState([
    {
      id: 'quickbooks-integration',
      name: 'QuickBooks Integration',
      description: 'Seamless integration with QuickBooks for financial data synchronization',
      category: 'financial',
      version: '1.0.0',
      author: 'Blacktop Blackout Systems',
      price: 299,
      rating: 4.8,
      downloads: 1250,
      downloadUrl: '/modules/quickbooks-integration.zip'
    },
    {
      id: 'environmental-compliance',
      name: 'Environmental Compliance',
      description: 'EPA compliance tracking and environmental monitoring',
      category: 'environmental',
      version: '1.0.0',
      author: 'Blacktop Blackout Systems',
      price: 499,
      rating: 4.9,
      downloads: 834,
      downloadUrl: '/modules/environmental-compliance.zip'
    }
  ]);

  const { toast } = useToast();

  const handleInstallModule = async (moduleInfo: any) => {
    try {
      toast({
        title: "Installing Module",
        description: `Installing ${moduleInfo.name}...`,
      });

      // Simulate module installation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Module Installed",
        description: `${moduleInfo.name} has been installed successfully`,
      });

      onModuleInstalled();
    } catch (error) {
      console.error('Failed to install module:', error);
      toast({
        title: "Installation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableModules.map((module) => (
          <MarketplaceModuleCard
            key={module.id}
            module={module}
            onInstall={() => handleInstallModule(module)}
          />
        ))}
      </div>
    </div>
  );
}

// ================================
// DEVELOPER TOOLS TAB
// ================================

function DeveloperToolsTab({ onModuleCreated }: { onModuleCreated: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Development Tools</CardTitle>
          <CardDescription>
            Create, test, and package custom modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CreateModuleCard onModuleCreated={onModuleCreated} />
            <PackageModuleCard />
          </div>
        </CardContent>
      </Card>

      <ModuleTemplatesCard />
      <ModuleDocumentationCard />
    </div>
  );
}

// ================================
// MODULE CARD COMPONENTS
// ================================

function ModuleCard({ 
  module, 
  onActivate, 
  onDeactivate, 
  onUninstall 
}: {
  module: RealModule;
  onActivate: () => void;
  onDeactivate: () => void;
  onUninstall: () => void;
}) {
  const isActive = module.isActive;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{module.name}</CardTitle>
            <CardDescription className="text-sm">
              {module.description}
            </CardDescription>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>v{module.version}</span>
          <span>{module.category}</span>
        </div>

        <div className="flex space-x-2">
          {isActive ? (
            <Button 
              onClick={onDeactivate} 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Deactivate
            </Button>
          ) : (
            <Button 
              onClick={onActivate} 
              size="sm"
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={onUninstall} 
            variant="outline" 
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RunningModuleCard({ 
  instance, 
  onStop 
}: {
  instance: LoadedModuleInstance;
  onStop: () => void;
}) {
  const getStatusColor = (errorCount: number) => {
    if (errorCount === 0) return 'text-green-500';
    if (errorCount < 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (errorCount: number) => {
    if (errorCount === 0) return CheckCircle;
    if (errorCount < 5) return AlertCircle;
    return AlertCircle;
  };

  const StatusIcon = getStatusIcon(instance.errorCount);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{instance.module.name}</CardTitle>
            <CardDescription className="text-sm">
              Running since {instance.loadedAt.toLocaleTimeString()}
            </CardDescription>
          </div>
          <StatusIcon className={`h-5 w-5 ${getStatusColor(instance.errorCount)}`} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Components:</span>
            <span>{instance.components.size}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Services:</span>
            <span>{instance.services.size}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Errors:</span>
            <span className={getStatusColor(instance.errorCount)}>
              {instance.errorCount}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={onStop} 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Pause className="h-4 w-4 mr-2" />
            Stop
          </Button>
          
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketplaceModuleCard({ 
  module, 
  onInstall 
}: {
  module: any;
  onInstall: () => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-lg">{module.name}</CardTitle>
          <CardDescription className="text-sm">
            {module.description}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            ${module.price}/month
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <span>⭐ {module.rating}</span>
            <span>•</span>
            <span>{module.downloads} downloads</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>v{module.version}</span>
          <span>{module.author}</span>
        </div>

        <Button onClick={onInstall} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Install Module
        </Button>
      </CardContent>
    </Card>
  );
}

// ================================
// DEVELOPER TOOL COMPONENTS
// ================================

function CreateModuleCard({ onModuleCreated }: { onModuleCreated: () => void }) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateModule = async () => {
    setIsCreating(true);
    try {
      const sampleModule = await moduleBuilder.createModule({
        id: 'sample-module',
        name: 'Sample Module',
        version: '1.0.0',
        description: 'A sample module for testing',
        author: 'Developer',
        category: 'custom',
        entryPoint: 'index.js',
        files: {
          'index.js': `
            const React = require('react');
            
            const SampleComponent = () => {
              return React.createElement('div', { 
                style: { padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }
              }, 'Hello from Sample Module!');
            };
            
            module.exports = {
              components: { SampleComponent },
              services: {},
              api: {}
            };
          `
        }
      });

      await moduleRegistry.registerModule(sampleModule);
      
      toast({
        title: "Module Created",
        description: "Sample module has been created and registered",
      });

      onModuleCreated();
    } catch (error) {
      console.error('Failed to create module:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Module</CardTitle>
        <CardDescription>
          Generate a new module from template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleCreateModule}
          disabled={isCreating}
          className="w-full"
        >
          <Code className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create Sample Module'}
        </Button>
      </CardContent>
    </Card>
  );
}

function PackageModuleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Module</CardTitle>
        <CardDescription>
          Build and package module for distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">
          <Package className="h-4 w-4 mr-2" />
          Package Module
        </Button>
      </CardContent>
    </Card>
  );
}

function ModuleTemplatesCard() {
  const templates = [
    { name: 'Basic Module', description: 'Simple module template' },
    { name: 'React Component Module', description: 'Module with React components' },
    { name: 'Service Module', description: 'Backend service module' },
    { name: 'Integration Module', description: 'External API integration' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Templates</CardTitle>
        <CardDescription>
          Quick start templates for different module types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template, index) => (
            <Button key={index} variant="outline" className="h-auto p-3">
              <div className="text-left">
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground">
                  {template.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleDocumentationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentation</CardTitle>
        <CardDescription>
          Learn how to develop and distribute modules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            Module Development Guide
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            API Reference
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            Best Practices
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ================================
// CREATE MODULE DIALOG
// ================================

function CreateModuleDialog({ onModuleCreated }: { onModuleCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category: 'custom',
    author: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const modulePackage = await moduleBuilder.createModule({
        ...formData,
        version: '1.0.0',
        entryPoint: 'index.js',
        files: {
          'index.js': `
            const React = require('react');
            
            const ${formData.name.replace(/\s+/g, '')}Component = () => {
              return React.createElement('div', {
                style: { 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  textAlign: 'center'
                }
              }, 'Hello from ${formData.name}!');
            };
            
            module.exports = {
              components: { ${formData.name.replace(/\s+/g, '')}Component },
              services: {},
              api: {},
              install: async () => console.log('${formData.name} installed'),
              activate: async () => console.log('${formData.name} activated'),
              deactivate: async () => console.log('${formData.name} deactivated'),
              uninstall: async () => console.log('${formData.name} uninstalled')
            };
          `
        }
      });

      await moduleRegistry.registerModule(modulePackage);
      
      toast({
        title: "Module Created",
        description: `${formData.name} has been created successfully`,
      });

      setOpen(false);
      setFormData({ id: '', name: '', description: '', category: 'custom', author: '' });
      onModuleCreated();
    } catch (error) {
      console.error('Failed to create module:', error);
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Create Module
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Module</DialogTitle>
          <DialogDescription>
            Create a custom module for your application
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Module ID</label>
            <Input
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              placeholder="my-custom-module"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Module Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="My Custom Module"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="A custom module for..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="custom">Custom</option>
              <option value="financial">Financial</option>
              <option value="environmental">Environmental</option>
              <option value="construction">Construction</option>
              <option value="security">Security</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Author</label>
            <Input
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              placeholder="Your Name"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}