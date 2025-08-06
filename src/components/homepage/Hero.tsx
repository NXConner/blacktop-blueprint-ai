import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

export function Hero() {
  const { currentTheme } = useTheme();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6">
          <Badge 
            variant="secondary" 
            className="glass-card px-4 py-2 text-sm font-medium mb-4"
          >
            <Zap className="w-4 h-4 mr-2" />
            {currentTheme.name} Theme Active
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-glow-primary leading-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            ISAC OS
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
          Integrated Systems Analysis & Command Operating System
        </p>
        
        <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Advanced tactical command interface with real-time monitoring, 
          AI-powered optimization, and comprehensive operational oversight.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            asChild
            size="lg" 
            className="glass-card glow-primary hover:glow-primary border border-primary/20"
          >
            <Link to="/overwatch">
              <Eye className="w-5 h-5 mr-2" />
              Launch OverWatch
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="lg"
            className="glass-card border-glass-border hover:glow-accent"
          >
            <Link to="/reporting-analytics">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="glass-card p-6 rounded-xl border border-glass-border">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-Time Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              24/7 surveillance and analysis of all operational parameters with instant alerts.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-glass-border">
            <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Machine learning algorithms optimize resource allocation and predict maintenance needs.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl border border-glass-border">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Operations</h3>
            <p className="text-sm text-muted-foreground">
              Military-grade security protocols ensure data integrity and operational safety.
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 glass-card p-4 rounded-xl border border-glass-border max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success">Operational</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-primary">12</div>
              <div className="text-xs text-muted-foreground">Active Crews</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent">99.8%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">5</div>
              <div className="text-xs text-muted-foreground">Jobs Active</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}