import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ParticleSystem } from "@/components/ui/particle-system";
import { Suspense } from "react";
import { PageLoading } from "@/components/ui/loading";
import { routes } from "./routes";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <PageLoading text="Verifying access..." />;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen">
              <Toaster />
              <Sonner />
              <ParticleSystem 
                intensity="medium" 
                interactive={true}
                className="animate-fade-in"
              />
              <BrowserRouter>
                <Navigation />
                <main className="lg:ml-72 pt-16 relative z-10 min-h-screen" aria-live="polite">
                  <Suspense fallback={<PageLoading text="Loading module..." /> }>
                    <Routes>
                      {routes.map(({ path, element: Element, requiresAuth }) => {
                        const node = <Element />;
                        return (
                          <Route
                            key={path}
                            path={path}
                            element={requiresAuth ? <ProtectedRoute>{node}</ProtectedRoute> : node}
                          />
                        );
                      })}
                    </Routes>
                  </Suspense>
                </main>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
