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
  { path: '/downloads', element: Downloads },
  { path: '/settings', element: Settings, requiresAuth: true },
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
  '/downloads': () => import('./pages/Downloads'),
  '/settings': () => import('./pages/Settings'),
};

export function prefetchRoute(path: string): Promise<void> {
  const loader = routeLoaders[path];
  return loader ? loader().then(() => {}) : Promise.resolve();
}

export const protectedPaths = routes.filter(r => r.requiresAuth).map(r => r.path);