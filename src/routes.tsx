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