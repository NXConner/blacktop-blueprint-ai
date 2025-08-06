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
  Search, 
  Star, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Zap, 
  Award,
  Building,
  Truck,
  Factory,
  Globe,
  Cpu,
  Heart,
  Calculator,
  Medal,
  Hammer,
  Home,
  Wrench,
  Leaf,
  Package,
  Lock,
  Smartphone,
  BarChart3,
  ShoppingCart,
  Settings,
  Sparkles,
  Target,
  CheckCircle,
  Clock,
  Users,
  FileDown,
  ExternalLink
} from 'lucide-react';

// Module categories and their addons
const moduleCategories = {
  'financial': {
    name: 'Financial & Accounting',
    icon: <Calculator className="h-6 w-6" />,
    color: 'bg-green-500',
    modules: [
      {
        id: 'quickbooks',
        name: 'QuickBooks Integration',
        description: 'Two-way sync with QuickBooks Online/Desktop',
        price: 299,
        rating: 4.8,
        downloads: 1250,
        status: 'available',
        features: ['Automated invoicing', 'Expense tracking', 'Financial reporting', 'Tax preparation'],
        category: 'financial',
        implementation: 'src/integrations/quickbooks/',
        benefits: ['60% faster accounting', 'Reduced errors', 'Real-time sync'],
        requirements: ['QuickBooks Online/Desktop', 'API Access'],
        estimatedTime: '2-3 days'
      },
      {
        id: 'accounting-suite',
        name: 'Advanced Accounting Suite',
        description: 'Full double-entry bookkeeping system',
        price: 499,
        rating: 4.9,
        downloads: 890,
        status: 'available',
        features: ['General ledger', 'AP/AR management', 'Bank reconciliation', 'Multi-currency'],
        category: 'financial',
        implementation: 'src/services/accounting/',
        benefits: ['60% overhead reduction', 'GAAP compliance', 'Real-time reporting'],
        requirements: ['Database access', 'Accounting knowledge'],
        estimatedTime: '1-2 weeks'
      },
      {
        id: 'payroll',
        name: 'Payroll Management System',
        description: 'Complete payroll processing solution',
        price: 399,
        rating: 4.7,
        downloads: 670,
        status: 'available',
        features: ['Time tracking integration', 'Tax calculations', 'Direct deposit', 'Benefits admin'],
        category: 'financial',
        implementation: 'src/services/payroll/',
        benefits: ['ADP/Paychex compatible', 'Compliance automation', 'Cost savings'],
        requirements: ['Bank integration', 'Tax ID numbers'],
        estimatedTime: '3-5 days'
      },
      {
        id: 'tax-management',
        name: 'Tax Management & Compliance',
        description: 'Automated tax compliance and reporting',
        price: 249,
        rating: 4.6,
        downloads: 445,
        status: 'available',
        features: ['Sales tax automation', '1099 management', 'Quarterly reports', 'Audit trails'],
        category: 'financial',
        implementation: 'src/services/tax-compliance/',
        benefits: ['80% time reduction', 'Error prevention', 'Audit ready'],
        requirements: ['Business license', 'Tax registrations'],
        estimatedTime: '1-2 days'
      },
      {
        id: 'banking',
        name: 'Banking & Financial Services',
        description: 'Real-time banking integration',
        price: 199,
        rating: 4.5,
        downloads: 320,
        status: 'available',
        features: ['Bank monitoring', 'Payment processing', 'Credit management', 'Cash flow'],
        category: 'financial',
        implementation: 'src/integrations/banking/',
        benefits: ['Real-time updates', 'Automated reconciliation', 'Risk management'],
        requirements: ['Bank API access', 'Security compliance'],
        estimatedTime: '2-4 days'
      }
    ]
  },
  'veteran': {
    name: 'Veteran & Military',
    icon: <Medal className="h-6 w-6" />,
    color: 'bg-blue-600',
    modules: [
      {
        id: 'veteran-certification',
        name: 'Veteran Business Certification',
        description: 'VOSB/SDVOSB compliance tracking',
        price: 349,
        rating: 4.9,
        downloads: 234,
        status: 'available',
        features: ['Certification management', 'Contract alerts', 'Set-aside tracking', 'Reporting'],
        category: 'veteran',
        implementation: 'src/services/veteran-services/',
        benefits: ['$500B+ contract access', 'Compliance automation', 'Opportunity alerts'],
        requirements: ['Veteran status verification', 'Business registration'],
        estimatedTime: '1-2 days'
      },
      {
        id: 'military-contracts',
        name: 'Military Contract Management',
        description: 'Defense contractor capabilities',
        price: 599,
        rating: 4.8,
        downloads: 156,
        status: 'available',
        features: ['DCAA compliance', 'Security clearance', 'Military specs', 'Base access'],
        category: 'veteran',
        implementation: 'src/services/military-contracts/',
        benefits: ['ISO 9001 ready', 'Defense contracts', 'Compliance tracking'],
        requirements: ['Security clearance', 'Defense contractor registration'],
        estimatedTime: '1-3 weeks'
      },
      {
        id: 'veteran-employment',
        name: 'Veteran Employment Services',
        description: 'Veteran hiring incentives and management',
        price: 299,
        rating: 4.7,
        downloads: 189,
        status: 'available',
        features: ['Candidate sourcing', 'Skills translation', 'Training programs', 'Tax credits'],
        category: 'veteran',
        implementation: 'src/services/veteran-employment/',
        benefits: ['Up to $9,600 per hire', 'Skilled workforce', 'Tax incentives'],
        requirements: ['HR system integration', 'WOTC registration'],
        estimatedTime: '3-5 days'
      }
    ]
  },
  'auction': {
    name: 'Auction & Marketplace',
    icon: <Hammer className="h-6 w-6" />,
    color: 'bg-orange-500',
    modules: [
      {
        id: 'government-surplus',
        name: 'Government Surplus Auction',
        description: 'GSAauctions.gov integration',
        price: 199,
        rating: 4.6,
        downloads: 445,
        status: 'available',
        features: ['Auction bidding', 'Surplus alerts', 'Bid management', 'Transportation'],
        category: 'auction',
        implementation: 'src/integrations/gsa-auctions/',
        benefits: ['40-70% cost savings', 'Equipment access', 'Automated bidding'],
        requirements: ['GSA registration', 'Bidding authorization'],
        estimatedTime: '1-2 days'
      },
      {
        id: 'equipment-auctions',
        name: 'Construction Equipment Auctions',
        description: 'Multi-platform auction management',
        price: 299,
        rating: 4.7,
        downloads: 332,
        status: 'available',
        features: ['Ritchie Bros integration', 'IronPlanet bidding', 'Valuation tools', 'Finance'],
        category: 'auction',
        implementation: 'src/services/equipment-auctions/',
        benefits: ['30-50% savings', 'Equipment variety', 'Finance options'],
        requirements: ['Auction platform accounts', 'Credit verification'],
        estimatedTime: '2-3 days'
      },
      {
        id: 'material-exchange',
        name: 'Material Exchange Marketplace',
        description: 'B2B construction material trading',
        price: 399,
        rating: 4.5,
        downloads: 278,
        status: 'available',
        features: ['Material listing', 'Quality verification', 'Transportation', 'Escrow'],
        category: 'auction',
        implementation: 'src/services/material-exchange/',
        benefits: ['25% waste reduction', 'Cost savings', 'Sustainability'],
        requirements: ['Material inventory', 'Quality standards'],
        estimatedTime: '3-5 days'
      }
    ]
  },
  'property': {
    name: 'Real Estate & Property',
    icon: <Home className="h-6 w-6" />,
    color: 'bg-purple-500',
    modules: [
      {
        id: 'property-management',
        name: 'Property Management Suite',
        description: 'Complete property oversight',
        price: 449,
        rating: 4.8,
        downloads: 567,
        status: 'available',
        features: ['Lease management', 'Tenant portal', 'Maintenance', 'Rent collection'],
        category: 'property',
        implementation: 'src/services/property-management/',
        benefits: ['$18B market access', 'Automated collections', 'Tenant satisfaction'],
        requirements: ['Property data', 'Legal compliance'],
        estimatedTime: '1-2 weeks'
      },
      {
        id: 'land-development',
        name: 'Land Development Planning',
        description: 'Development project management',
        price: 599,
        rating: 4.7,
        downloads: 234,
        status: 'available',
        features: ['Zoning compliance', 'Permit management', 'Environmental', 'Survey data'],
        category: 'property',
        implementation: 'src/services/land-development/',
        benefits: ['40% faster permitting', 'Compliance tracking', 'Risk reduction'],
        requirements: ['Planning permissions', 'Survey data'],
        estimatedTime: '2-3 weeks'
      }
    ]
  },
  'construction': {
    name: 'Specialized Construction',
    icon: <Wrench className="h-6 w-6" />,
    color: 'bg-yellow-500',
    modules: [
      {
        id: 'hvac',
        name: 'HVAC Systems Management',
        description: 'Climate control specialization',
        price: 399,
        rating: 4.9,
        downloads: 445,
        status: 'available',
        features: ['System design', 'Energy calculations', 'Equipment specs', 'Maintenance'],
        category: 'construction',
        implementation: 'src/services/hvac/',
        benefits: ['NATE certified', 'EPA Section 608', 'Energy efficiency'],
        requirements: ['HVAC certification', 'Equipment database'],
        estimatedTime: '1-2 weeks'
      },
      {
        id: 'electrical',
        name: 'Electrical Contracting Suite',
        description: 'Electrical project management',
        price: 449,
        rating: 4.8,
        downloads: 378,
        status: 'available',
        features: ['Circuit design', 'Code compliance', 'Permits', 'Safety tracking'],
        category: 'construction',
        implementation: 'src/services/electrical/',
        benefits: ['50% incident reduction', 'Code compliance', 'Safety first'],
        requirements: ['Electrical license', 'Code knowledge'],
        estimatedTime: '1-2 weeks'
      },
      {
        id: 'plumbing',
        name: 'Plumbing & Utilities Management',
        description: 'Plumbing project oversight',
        price: 349,
        rating: 4.7,
        downloads: 289,
        status: 'available',
        features: ['Pipe specification', 'Pressure testing', 'Water quality', 'Utilities'],
        category: 'construction',
        implementation: 'src/services/plumbing/',
        benefits: ['ICC certified', 'IAPMO compliant', 'Quality assurance'],
        requirements: ['Plumbing license', 'Water permits'],
        estimatedTime: '1-2 weeks'
      }
    ]
  },
  'environmental': {
    name: 'Environmental & Green',
    icon: <Leaf className="h-6 w-6" />,
    color: 'bg-green-600',
    modules: [
      {
        id: 'environmental-compliance',
        name: 'Environmental Compliance Suite',
        description: 'EPA regulation compliance',
        price: 499,
        rating: 4.8,
        downloads: 334,
        status: 'available',
        features: ['Air quality', 'Water management', 'Soil tracking', 'Carbon footprint'],
        category: 'environmental',
        implementation: 'src/services/environmental/',
        benefits: ['EPA compliant', 'OSHA ready', 'Risk mitigation'],
        requirements: ['Environmental permits', 'Monitoring equipment'],
        estimatedTime: '2-3 weeks'
      },
      {
        id: 'green-building',
        name: 'Green Building Certification',
        description: 'LEED/Green building tracking',
        price: 399,
        rating: 4.9,
        downloads: 456,
        status: 'available',
        features: ['Sustainable materials', 'Energy monitoring', 'Water conservation', 'IAQ'],
        category: 'environmental',
        implementation: 'src/services/green-building/',
        benefits: ['$264B market', 'LEED certification', 'Sustainability'],
        requirements: ['Green building knowledge', 'Material sourcing'],
        estimatedTime: '2-4 weeks'
      },
      {
        id: 'solar-renewable',
        name: 'Solar & Renewable Energy',
        description: 'Renewable energy project management',
        price: 599,
        rating: 4.7,
        downloads: 267,
        status: 'available',
        features: ['Solar tracking', 'Energy monitoring', 'Incentives', 'Grid connection'],
        category: 'environmental',
        implementation: 'src/services/renewable-energy/',
        benefits: ['200% market growth', 'Tax incentives', 'Future ready'],
        requirements: ['Solar certification', 'Grid permissions'],
        estimatedTime: '3-4 weeks'
      }
    ]
  }
};

// Additional categories for the remaining modules
const additionalCategories = {
  'logistics': {
    name: 'Logistics & Supply Chain',
    icon: <Package className="h-6 w-6" />,
    color: 'bg-indigo-500',
    modules: [
      {
        id: 'supply-chain',
        name: 'Supply Chain Optimization',
        description: 'End-to-end supply management',
        price: 699,
        rating: 4.8,
        downloads: 445,
        status: 'available',
        features: ['Vendor management', 'Inventory optimization', 'Forecasting', 'JIT delivery'],
        category: 'logistics',
        benefits: ['15-25% cost reduction', 'Efficiency gains', 'Risk mitigation']
      },
      {
        id: 'transportation',
        name: 'Transportation Management',
        description: 'Logistics coordination',
        price: 449,
        rating: 4.7,
        downloads: 334,
        status: 'available',
        features: ['Route optimization', 'Load planning', 'Carrier management', 'Tracking'],
        category: 'logistics',
        benefits: ['30% faster deliveries', 'Cost optimization', 'Real-time tracking']
      },
      {
        id: 'warehouse',
        name: 'Warehouse Management System',
        description: 'Inventory control and optimization',
        price: 549,
        rating: 4.9,
        downloads: 289,
        status: 'available',
        features: ['RFID tracking', 'Pick/pack optimization', 'Cycle counting', 'Storage'],
        category: 'logistics',
        benefits: ['99.9% accuracy', 'Space optimization', 'Labor efficiency']
      }
    ]
  },
  'security': {
    name: 'Security & Compliance',
    icon: <Lock className="h-6 w-6" />,
    color: 'bg-red-500',
    modules: [
      {
        id: 'cybersecurity',
        name: 'Cybersecurity Suite',
        description: 'Enterprise security management',
        price: 799,
        rating: 4.9,
        downloads: 567,
        status: 'available',
        features: ['Threat detection', 'Vulnerability scanning', 'Access control', 'Incident response'],
        category: 'security',
        benefits: ['SOC 2 compliant', 'ISO 27001', 'Risk reduction']
      },
      {
        id: 'safety-management',
        name: 'Safety Management System',
        description: 'Workplace safety oversight',
        price: 399,
        rating: 4.8,
        downloads: 445,
        status: 'available',
        features: ['Incident reporting', 'Safety training', 'Equipment inspection', 'OSHA compliance'],
        category: 'security',
        benefits: ['60% incident reduction', 'OSHA compliant', 'Training efficiency']
      },
      {
        id: 'quality-assurance',
        name: 'Quality Assurance Program',
        description: 'Quality control management',
        price: 349,
        rating: 4.7,
        downloads: 356,
        status: 'available',
        features: ['Inspection scheduling', 'Defect tracking', 'Corrective actions', 'Auditing'],
        category: 'security',
        benefits: ['ISO 9001', 'Six Sigma', 'Quality improvement']
      }
    ]
  },
  'mobile': {
    name: 'Mobile & Field Services',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-cyan-500',
    modules: [
      {
        id: 'field-service',
        name: 'Field Service Management',
        description: 'Mobile workforce management',
        price: 349,
        rating: 4.8,
        downloads: 678,
        status: 'available',
        features: ['Work order dispatch', 'GPS tracking', 'Time attendance', 'Documentation'],
        category: 'mobile',
        benefits: ['25% efficiency increase', 'Real-time updates', 'Cost savings']
      },
      {
        id: 'iot-integration',
        name: 'Equipment IoT Integration',
        description: 'Smart equipment monitoring',
        price: 599,
        rating: 4.9,
        downloads: 334,
        status: 'available',
        features: ['Sensor data', 'Predictive maintenance', 'Remote diagnostics', 'Analytics'],
        category: 'mobile',
        benefits: ['95%+ uptime', 'Predictive insights', 'Cost reduction']
      },
      {
        id: 'drone-services',
        name: 'Drone & Aerial Inspection',
        description: 'Unmanned aerial services',
        price: 799,
        rating: 4.7,
        downloads: 234,
        status: 'available',
        features: ['Flight planning', 'Aerial photography', '3D modeling', 'Progress monitoring'],
        category: 'mobile',
        benefits: ['80% faster inspections', 'Safety improvement', 'Detailed insights']
      }
    ]
  },
  'business-intelligence': {
    name: 'Business Intelligence',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'bg-violet-500',
    modules: [
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics Suite',
        description: 'AI-powered business insights',
        price: 899,
        rating: 4.9,
        downloads: 445,
        status: 'available',
        features: ['Predictive modeling', 'Trend analysis', 'Dashboards', 'Automated reporting'],
        category: 'business-intelligence',
        benefits: ['300% decision improvement', 'Data-driven insights', 'Competitive advantage']
      },
      {
        id: 'ai-optimization',
        name: 'AI-Powered Optimization',
        description: 'Machine learning automation',
        price: 1299,
        rating: 4.8,
        downloads: 234,
        status: 'available',
        features: ['Resource allocation', 'Predictive maintenance', 'Demand forecasting', 'Process automation'],
        category: 'business-intelligence',
        benefits: ['70% manual task reduction', 'Optimization', 'Future-ready']
      }
    ]
  }
};

// Combine all categories
const allCategories = { ...moduleCategories, ...additionalCategories };

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModule, setSelectedModule] = useState(null);
  const [installedModules, setInstalledModules] = useState(new Set());
  const [installProgress, setInstallProgress] = useState({});
  const { toast } = useToast();

  // Get all modules from all categories
  const getAllModules = () => {
    return Object.values(allCategories).flatMap(category => category.modules);
  };

  // Filter modules based on search and category
  const filteredModules = getAllModules().filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle module installation
  const handleInstall = async (moduleId) => {
    if (installedModules.has(moduleId)) {
      toast({
        title: "Already Installed",
        description: "This module is already installed.",
        variant: "default"
      });
      return;
    }

    setInstallProgress(prev => ({ ...prev, [moduleId]: 0 }));
    
    // Simulate installation progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setInstallProgress(prev => ({ ...prev, [moduleId]: i }));
    }

    setInstalledModules(prev => new Set([...prev, moduleId]));
    setInstallProgress(prev => ({ ...prev, [moduleId]: undefined }));
    
    toast({
      title: "Installation Complete",
      description: `${selectedModule?.name || 'Module'} has been successfully installed.`,
      variant: "default"
    });
  };

  const getCategoryStats = () => {
    const stats = {};
    Object.entries(allCategories).forEach(([key, category]) => {
      stats[key] = {
        total: category.modules.length,
        installed: category.modules.filter(m => installedModules.has(m.id)).length,
        avgRating: (category.modules.reduce((sum, m) => sum + m.rating, 0) / category.modules.length).toFixed(1)
      };
    });
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Blacktop Blackout Marketplace
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover and install powerful modules to extend your construction management platform. 
          Choose from 46+ specialized addons covering every aspect of your business.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{getAllModules().length}</p>
                <p className="text-sm text-muted-foreground">Total Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{installedModules.size}</p>
                <p className="text-sm text-muted-foreground">Installed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">$5.1M+</p>
                <p className="text-sm text-muted-foreground">Revenue Potential</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules, features, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          {Object.entries(allCategories).map(([key, category]) => (
            <option key={key} value={key}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 xl:grid-cols-9">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(allCategories).slice(0, 8).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {category.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                isInstalled={installedModules.has(module.id)}
                installProgress={installProgress[module.id]}
                onInstall={() => handleInstall(module.id)}
                onViewDetails={(module) => setSelectedModule(module)}
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(allCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${category.color} text-white`}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <p className="text-muted-foreground">
                    {stats[key]?.installed}/{stats[key]?.total} modules installed • 
                    {stats[key]?.avgRating}★ average rating
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  isInstalled={installedModules.has(module.id)}
                  installProgress={installProgress[module.id]}
                  onInstall={() => handleInstall(module.id)}
                  onViewDetails={(module) => setSelectedModule(module)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Module Details Modal */}
      <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedModule && (
            <ModuleDetails
              module={selectedModule}
              isInstalled={installedModules.has(selectedModule.id)}
              installProgress={installProgress[selectedModule.id]}
              onInstall={() => handleInstall(selectedModule.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Module Card Component
function ModuleCard({ module, isInstalled, installProgress, onInstall, onViewDetails }) {
  const category = allCategories[module.category];
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${category?.color} text-white text-sm`}>
              {category?.icon}
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {module.name}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {category?.name}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">${module.price}</p>
            <p className="text-xs text-muted-foreground">/month</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {module.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{module.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-4 w-4 text-muted-foreground" />
            <span>{module.downloads.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Key Features:</p>
          <div className="flex flex-wrap gap-1">
            {module.features?.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {module.features?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{module.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          {isInstalled ? (
            <Button disabled className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Installed
            </Button>
          ) : installProgress !== undefined ? (
            <div className="flex-1 space-y-2">
              <Progress value={installProgress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Installing... {installProgress}%
              </p>
            </div>
          ) : (
            <Button onClick={onInstall} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          )}
          <Button variant="outline" onClick={() => onViewDetails(module)}>
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Module Details Component
function ModuleDetails({ module, isInstalled, installProgress, onInstall }) {
  const category = allCategories[module.category];
  
  return (
    <>
      <DialogHeader>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${category?.color} text-white`}>
            {category?.icon}
          </div>
          <div>
            <DialogTitle className="text-2xl">{module.name}</DialogTitle>
            <DialogDescription className="text-lg">
              {module.description}
            </DialogDescription>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-primary">${module.price}</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Features</h3>
            <div className="space-y-2">
              {module.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Benefits</h3>
            <div className="space-y-2">
              {module.benefits?.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Module Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                <p className="text-lg font-bold">{module.rating}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Download className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold">{module.downloads?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <div className="space-y-2">
              {module.requirements?.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{req}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Implementation</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Estimated time: {module.estimatedTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-sm font-mono text-xs">{module.implementation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-6 border-t">
        <Badge variant="secondary" className="text-sm">
          {category?.name}
        </Badge>
        
        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <a href="/downloads" target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4 mr-2" />
              Download Installer
            </a>
          </Button>
          {isInstalled ? (
            <Button disabled size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Installed
            </Button>
          ) : installProgress !== undefined ? (
            <div className="space-y-2 min-w-[200px]">
              <Progress value={installProgress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Installing... {installProgress}%
              </p>
            </div>
          ) : (
            <Button onClick={onInstall} size="lg">
              <Download className="h-4 w-4 mr-2" />
              Install Module - ${module.price}/month
            </Button>
          )}
        </div>
      </div>
    </>
  );
}