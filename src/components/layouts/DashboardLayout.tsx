import * as React from "react"
import { 
  PageHeader, 
  MetricCard, 
  SectionContainer, 
  GridContainer,
  GlassCard,
  StatusBadge,
  LiveIndicator,
  HealthIndicator,
  AnimatedContainer,
  RevealOnScroll
} from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Dashboard Layout Props
export interface DashboardLayoutProps {
  title: string
  subtitle?: string
  badge?: {
    text: string
    variant?: "outline" | "default" | "secondary" | "destructive"
  }
  status?: {
    text: string
    type: "success" | "warning" | "error" | "info" | "pending" | "active" | "inactive"
  }
  actions?: React.ReactNode
  backButton?: {
    onClick: () => void
    label?: string
  }
  breadcrumbs?: Array<{
    label: string
    href?: string
    onClick?: () => void
  }>
  metrics?: Array<{
    title: string
    value: string | number
    subtitle?: string
    icon?: React.ReactNode
    trend?: {
      value: number
      label?: string
      direction: "up" | "down" | "neutral"
    }
    status?: "success" | "warning" | "error" | "info"
    loading?: boolean
  }>
  children: React.ReactNode
  className?: string
  systemStatus?: Array<{
    name: string
    status: "online" | "offline" | "warning" | "error"
    health?: number
    lastUpdate?: string
  }>
}

export function DashboardLayout({
  title,
  subtitle,
  badge,
  status,
  actions,
  backButton,
  breadcrumbs,
  metrics = [],
  children,
  className,
  systemStatus = []
}: DashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background p-6 animate-fade-in", className)}>
      {/* Page Header */}
      <AnimatedContainer animation="slide-up">
        <PageHeader
          title={title}
          subtitle={subtitle}
          badge={badge}
          status={status}
          actions={actions}
          backButton={backButton}
          breadcrumbs={breadcrumbs}
        />
      </AnimatedContainer>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <RevealOnScroll direction="up">
          <SectionContainer
            title="System Metrics"
            subtitle="Real-time performance indicators"
            contentClassName="mb-8"
          >
            <GridContainer columns={metrics.length > 4 ? 4 : (metrics.length as 1 | 2 | 3 | 4)}>
              {metrics.map((metric, index) => (
                <AnimatedContainer
                  key={index}
                  animation="scale-in"
                  delay={`${(index + 1) * 100}` as "100" | "150" | "200" | "300" | "500"}
                >
                  <MetricCard
                    title={metric.title}
                    value={metric.value}
                    subtitle={metric.subtitle}
                    icon={metric.icon}
                    trend={metric.trend}
                    status={metric.status}
                    loading={metric.loading}
                    hover="glow"
                  />
                </AnimatedContainer>
              ))}
            </GridContainer>
          </SectionContainer>
        </RevealOnScroll>
      )}

      {/* System Status */}
      {systemStatus.length > 0 && (
        <RevealOnScroll direction="up">
          <SectionContainer
            title="System Status"
            subtitle="Current operational status"
            headerActions={
              <StatusBadge 
                status={systemStatus.every(s => s.status === "online") ? "success" : "warning"}
                variant="glass"
                animated="glow"
              >
                {systemStatus.filter(s => s.status === "online").length}/{systemStatus.length} Online
              </StatusBadge>
            }
            contentClassName="mb-8"
          >
            <GridContainer columns={3}>
              {systemStatus.map((system, index) => (
                <AnimatedContainer
                  key={index}
                  animation="scale-in"
                  delay={`${(index + 1) * 75}` as "75" | "150" | "200" | "300"}
                >
                  <GlassCard padding="md" hover="lift" animated>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">{system.name}</h4>
                      <LiveIndicator 
                        online={system.status === "online"} 
                        size="sm" 
                      />
                    </div>
                    {system.health !== undefined && (
                      <HealthIndicator
                        health={
                          system.health >= 90 ? "excellent" :
                          system.health >= 75 ? "good" :
                          system.health >= 50 ? "fair" :
                          system.health >= 25 ? "poor" : "critical"
                        }
                        variant="bar"
                        percentage={system.health}
                        showPercentage
                        size="sm"
                      />
                    )}
                    {system.lastUpdate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated {system.lastUpdate}
                      </p>
                    )}
                  </GlassCard>
                </AnimatedContainer>
              ))}
            </GridContainer>
          </SectionContainer>
        </RevealOnScroll>
      )}

      {/* Main Content */}
      <RevealOnScroll direction="up">
        <SectionContainer contentClassName="space-y-8">
          {children}
        </SectionContainer>
      </RevealOnScroll>
    </div>
  )
}

// Pre-configured Dashboard Templates
export function OperationsDashboard({ children, ...props }: Omit<DashboardLayoutProps, 'title' | 'badge'>) {
  return (
    <DashboardLayout
      title="Operations Dashboard"
      badge={{ text: "Live", variant: "destructive" }}
      status={{ text: "All Systems Operational", type: "success" }}
      {...props}
    >
      {children}
    </DashboardLayout>
  )
}

export function AnalyticsDashboard({ children, ...props }: Omit<DashboardLayoutProps, 'title' | 'badge'>) {
  return (
    <DashboardLayout
      title="Analytics Dashboard"
      badge={{ text: "Real-time", variant: "default" }}
      {...props}
    >
      {children}
    </DashboardLayout>
  )
}

export function SystemDashboard({ children, ...props }: Omit<DashboardLayoutProps, 'title' | 'badge'>) {
  return (
    <DashboardLayout
      title="System Dashboard"
      badge={{ text: "Monitoring", variant: "secondary" }}
      {...props}
    >
      {children}
    </DashboardLayout>
  )
}