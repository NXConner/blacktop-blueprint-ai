import { lazy } from 'react';

export type AppRoute = {
  path: string;
  element: React.LazyExoticComponent<() => JSX.Element>;
  requiresAuth?: boolean;
};

// Lazy-loaded pages to reduce initial bundle size
const Index = lazy(() => import('./pages/Index'));
const OverWatch = lazy(() => import('./pages/OverWatch'));
const PavementScan = lazy(() => import('./pages/PavementScan'));
const AtlasHub = lazy(() => import('./pages/AtlasHub'));
const CrewManagement = lazy(() => import('./pages/CrewManagement'));
const WeatherStation = lazy(() => import('./pages/WeatherStation'));
const CostControl = lazy(() => import('./pages/CostControl'));
const MobileApp = lazy(() => import('./pages/MobileApp'));
const AIOptimization = lazy(() => import('./pages/AIOptimization'));
const ReportingAnalytics = lazy(() => import('./pages/ReportingAnalytics'));
const SecurityCompliance = lazy(() => import('./pages/SecurityCompliance'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Downloads = lazy(() => import('./pages/Downloads'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MaterialsCatalog = lazy(() => import('./pages/MaterialsCatalog'));
const Estimator = lazy(() => import('./pages/Estimator'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Estimates = lazy(() => import('./pages/Estimates'));
const Invoices = lazy(() => import('./pages/Invoices'));
const FleetFuel = lazy(() => import('./pages/FleetFuel'));
const SupplierReceipts = lazy(() => import('./pages/SupplierReceipts'));
const UnifiedMap = lazy(() => import('./pages/UnifiedMap'));
const EmployeeCompliance = lazy(() => import('./pages/EmployeeCompliance'));
const VeteransDashboard = lazy(() => import('./pages/VeteransDashboard'));
const IndustryStandards = lazy(() => import('./pages/IndustryStandards'));
const Offline = lazy(() => import('./pages/Offline'));

export const routes: AppRoute[] = [
  { path: '/', element: Index },
  { path: '/overwatch', element: OverWatch },
  { path: '/pavement-scan', element: PavementScan },
  { path: '/atlas-hub', element: AtlasHub },
  { path: '/crew-management', element: CrewManagement, requiresAuth: true },
  { path: '/weather-station', element: WeatherStation },
  { path: '/cost-control', element: CostControl, requiresAuth: true },
  { path: '/mobile-app', element: MobileApp },
  { path: '/ai-optimization', element: AIOptimization },
  { path: '/reporting-analytics', element: ReportingAnalytics, requiresAuth: true },
  { path: '/security-compliance', element: SecurityCompliance, requiresAuth: true },
  { path: '/catalog', element: Catalog },
  { path: '/marketplace', element: Catalog },
  { path: '/estimator', element: Estimator },
  { path: '/payroll', element: Payroll, requiresAuth: true },
  { path: '/materials', element: MaterialsCatalog },
  { path: '/estimates', element: Estimates },
  { path: '/invoices', element: Invoices },
  { path: '/fleet-fuel', element: FleetFuel },
  { path: '/supplier-receipts', element: SupplierReceipts },
  { path: '/unified-map', element: UnifiedMap },
  { path: '/downloads', element: Downloads },
  { path: '/settings', element: Settings, requiresAuth: true },
  { path: '/employee-compliance', element: EmployeeCompliance, requiresAuth: true },
  { path: '/veterans', element: VeteransDashboard },
  { path: '/standards', element: IndustryStandards },
  { path: '/offline', element: Offline },
  { path: '*', element: NotFound },
];

// Direct dynamic import loaders for prefetching
export const routeLoaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('./pages/Index'),
  '/overwatch': () => import('./pages/OverWatch'),
  '/pavement-scan': () => import('./pages/PavementScan'),
  '/atlas-hub': () => import('./pages/AtlasHub'),
  '/crew-management': () => import('./pages/CrewManagement'),
  '/weather-station': () => import('./pages/WeatherStation'),
  '/cost-control': () => import('./pages/CostControl'),
  '/mobile-app': () => import('./pages/MobileApp'),
  '/ai-optimization': () => import('./pages/AIOptimization'),
  '/reporting-analytics': () => import('./pages/ReportingAnalytics'),
  '/security-compliance': () => import('./pages/SecurityCompliance'),
  '/catalog': () => import('./pages/Catalog'),
  '/marketplace': () => import('./pages/Catalog'),
  '/estimator': () => import('./pages/Estimator'),
  '/payroll': () => import('./pages/Payroll'),
  '/materials': () => import('./pages/MaterialsCatalog'),
  '/estimates': () => import('./pages/Estimates'),
  '/invoices': () => import('./pages/Invoices'),
  '/fleet-fuel': () => import('./pages/FleetFuel'),
  '/supplier-receipts': () => import('./pages/SupplierReceipts'),
  '/unified-map': () => import('./pages/UnifiedMap'),
  '/downloads': () => import('./pages/Downloads'),
  '/settings': () => import('./pages/Settings'),
  '/employee-compliance': () => import('./pages/EmployeeCompliance'),
  '/veterans': () => import('./pages/VeteransDashboard'),
  '/standards': () => import('./pages/IndustryStandards'),
  '/offline': () => import('./pages/Offline'),
};

export function prefetchRoute(path: string): Promise<void> {
  const loader = routeLoaders[path];
  return loader ? loader().then(() => {}) : Promise.resolve();
}

export const protectedPaths = routes.filter(r => r.requiresAuth).map(r => r.path);

// Human-friendly titles per route for document titles and command menu
export const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/overwatch': 'OverWatch',
  '/pavement-scan': 'Pavement Scan',
  '/atlas-hub': 'Atlas Hub',
  '/crew-management': 'Crew Management',
  '/weather-station': 'Weather Station',
  '/cost-control': 'Cost Control',
  '/mobile-app': 'Mobile App',
  '/ai-optimization': 'AI Optimization',
  '/reporting-analytics': 'Reporting & Analytics',
  '/security-compliance': 'Security & Compliance',
  '/catalog': 'Marketplace',
  '/marketplace': 'Marketplace',
  '/estimator': 'Estimator',
  '/payroll': 'Payroll',
  '/materials': 'Materials',
  '/estimates': 'Estimates',
  '/invoices': 'Invoices',
  '/fleet-fuel': 'Fleet Fuel',
  '/supplier-receipts': 'Supplier Receipts',
  '/unified-map': 'Unified Map',
  '/downloads': 'Downloads',
  '/settings': 'Settings',
  '/employee-compliance': 'Employee Compliance',
  '/veterans': 'Veterans',
  '/standards': 'Industry Standards',
  '/offline': 'Offline',
};