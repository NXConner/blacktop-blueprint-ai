import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import OverWatch from "./pages/OverWatch";
import PavementScan from "./pages/PavementScan";
import AtlasHub from "./pages/AtlasHub";
import CrewManagement from "./pages/CrewManagement";
import WeatherStation from "./pages/WeatherStation";
import CostControl from "./pages/CostControl";
import MobileApp from "./pages/MobileApp";
import AIOptimization from "./pages/AIOptimization";
import ReportingAnalytics from "./pages/ReportingAnalytics";
import SecurityCompliance from "./pages/SecurityCompliance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <main className="lg:ml-72 pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/overwatch" element={<OverWatch />} />
                <Route path="/pavement-scan" element={<PavementScan />} />
                <Route path="/atlas-hub" element={<AtlasHub />} />
                <Route path="/crew-management" element={<CrewManagement />} />
                <Route path="/weather-station" element={<WeatherStation />} />
                <Route path="/cost-control" element={<CostControl />} />
                <Route path="/mobile-app" element={<MobileApp />} />
                <Route path="/ai-optimization" element={<AIOptimization />} />
                <Route path="/reporting-analytics" element={<ReportingAnalytics />} />
                <Route path="/security-compliance" element={<SecurityCompliance />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
                      </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
