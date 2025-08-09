import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { ErrorBoundary, ErrorFallback } from "@/components/ui/error-boundary";
import { ParticleSystem } from "@/components/ui/particle-system";
import { Suspense } from "react";
import { PageLoading } from "@/components/ui/loading";
import { routes } from "./routes";
import { toast } from "@/hooks/use-toast";
import { RouteFocus } from "@/components/router/RouteFocus";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, _query) => {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({ title: "Request failed", description: message, variant: "destructive" });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, _mutation) => {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({ title: "Action failed", description: message, variant: "destructive" });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 2,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10_000),
    },
    mutations: {
      retry: 0,
    },
  },
});

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

function RouteBoundary({ children }: { children: JSX.Element }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>{children}</ErrorBoundary>
  );
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
                <RouteFocus />
                <main id="main-content" className="lg:ml-72 pt-16 relative z-10 min-h-screen" aria-live="polite">
                  <Suspense fallback={<PageLoading text="Loading module..." /> }>
                    <Routes>
                      {routes.map(({ path, element: Element, requiresAuth }) => {
                        const node = (
                          <RouteBoundary>
                            <Element />
                          </RouteBoundary>
                        );
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
