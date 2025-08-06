import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X,
  Home,
  Eye,
  Scan,
  MapPin,
  Users,
  Cloud,
  DollarSign,
  Smartphone,
  Zap,
  BarChart3,
  Shield,
  Settings,
  ChevronRight,
  Bell,
  LogIn,
  LogOut,
  User,
  Package,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home,
    description: 'Overview and system status'
  },
  { 
    name: 'OverWatch', 
    href: '/overwatch', 
    icon: Eye,
    description: 'Real-time monitoring system'
  },
  { 
    name: 'Pavement Scan', 
    href: '/pavement-scan', 
    icon: Scan,
    description: 'Road surface analysis'
  },
  { 
    name: 'Atlas Hub', 
    href: '/atlas-hub', 
    icon: MapPin,
    description: 'Geographic coordination center'
  },
  { 
    name: 'Crew Management', 
    href: '/crew-management', 
    icon: Users,
    description: 'Personnel coordination'
  },
  { 
    name: 'Weather Station', 
    href: '/weather-station', 
    icon: Cloud,
    description: 'Environmental monitoring'
  },
  { 
    name: 'Cost Control', 
    href: '/cost-control', 
    icon: DollarSign,
    description: 'Financial oversight'
  },
  { 
    name: 'Mobile App', 
    href: '/mobile-app', 
    icon: Smartphone,
    description: 'Field operations interface'
  },
  { 
    name: 'AI Optimization', 
    href: '/ai-optimization', 
    icon: Zap,
    badge: 'AI',
    description: 'Intelligent system enhancement'
  },
  { 
    name: 'Reporting & Analytics', 
    href: '/reporting-analytics', 
    icon: BarChart3,
    description: 'Data insights and reports'
  },
  { 
    name: 'Security & Compliance', 
    href: '/security-compliance', 
    icon: Shield,
    badge: 'SEC',
    description: 'System security management'
  },
  { 
    name: 'Marketplace', 
    href: '/catalog', 
    icon: Package,
    badge: 'NEW',
    description: 'Browse and install addon modules'
  },
  { 
    name: 'Downloads', 
    href: '/downloads', 
    icon: Download,
    description: 'Download mobile apps and installers'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'System configuration and preferences'
  },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "glass-elevated border-b border-glass-border",
        "h-16 px-4 sm:px-6 flex items-center justify-between",
        "backdrop-blur-md bg-background/80",
        className
      )}>
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden glass-card hover:glow-primary min-h-[44px] min-w-[44px]"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-glow-primary">ISAC OS</h1>
              <p className="text-xs text-muted-foreground -mt-1">Integrated Systems Command</p>
            </div>
          </div>
        </div>

        {/* Center Section - Quick Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navigationItems.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                "transition-all duration-200 hover:glass-card",
                isActiveRoute(item.href) 
                  ? "glass-card glow-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden xl:inline">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="glass-card hover:glow-accent relative min-h-[44px] min-w-[44px]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
          <ThemeSwitcher />
          
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 glass-card px-3 py-2 rounded-lg">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium truncate max-w-24">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="glass-card hover:glow-destructive min-h-[44px] min-w-[44px]"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAuthModalOpen(true)}
              className="glass-card hover:glow-primary min-h-[44px] min-w-[44px]"
              title="Sign In"
              aria-label="Sign In"
            >
              <LogIn className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="glass-card hover:glow-secondary min-h-[44px] min-w-[44px]"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 bottom-0 z-40 w-72 max-w-[90vw]",
        "glass-elevated border-r border-glass-border",
        "transform transition-transform duration-300 ease-out lg:translate-x-0",
        "backdrop-blur-md bg-background/95",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:static lg:top-0 lg:h-screen lg:pt-16 lg:max-w-none"
      )}>
        <div className="h-full overflow-y-auto p-4">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="glass-card min-h-[44px] min-w-[44px]"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  "transition-all duration-200 group",
                  isActiveRoute(item.href)
                    ? "glass-card glow-primary text-primary border border-primary/20"
                    : "hover:glass-card hover:text-foreground text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform opacity-0 group-hover:opacity-100",
                  isActiveRoute(item.href) && "opacity-100"
                )} />
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="mt-8 pt-4 border-t border-glass-border">
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium">System Status</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
              <div className="flex gap-1 mt-2">
                <div className="h-1 w-full bg-success/20 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-success rounded-full" />
                </div>
                <span className="text-xs text-muted-foreground">85%</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
}