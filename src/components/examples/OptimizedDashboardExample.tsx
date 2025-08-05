import * as React from "react"
import { 
  DashboardLayout,
  OperationsDashboard,
  AnalyticsDashboard 
} from "@/components/layouts/DashboardLayout"
import {
  GlassCard,
  GlassButton,
  StatusBadge,
  LiveIndicator,
  HealthIndicator,
  MetricCard,
  SectionContainer,
  GridContainer,
  AnimatedContainer,
  FloatingElement,
  PulsingIndicator,
  SkeletonLoader,
  ProgressRing
} from "@/components/ui"
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Settings,
  RefreshCw
} from "lucide-react"

// Example of using the optimized dashboard layout
export function OptimizedDashboardExample() {
  const [isLoading, setIsLoading] = React.useState(false)

  // Example metrics data
  const metrics = [
    {
      title: "Active Operations",
      value: "247",
      subtitle: "Currently running",
      icon: <Activity className="w-5 h-5" />,
      trend: { value: 12, direction: "up" as const, label: "vs last hour" },
      status: "success" as const
    },
    {
      title: "System Health",
      value: "98.5%",
      subtitle: "All systems operational",
      icon: <Shield className="w-5 h-5" />,
      trend: { value: 2, direction: "up" as const, label: "vs yesterday" },
      status: "success" as const
    },
    {
      title: "Active Users",
      value: "1,234",
      subtitle: "Connected users",
      icon: <Users className="w-5 h-5" />,
      trend: { value: 8, direction: "up" as const, label: "vs last hour" },
      status: "info" as const
    },
    {
      title: "Performance",
      value: "99.2%",
      subtitle: "Response time",
      icon: <Zap className="w-5 h-5" />,
      trend: { value: 1, direction: "down" as const, label: "vs average" },
      status: "warning" as const
    }
  ]

  // Example system status data
  const systemStatus = [
    { name: "API Gateway", status: "online" as const, health: 98, lastUpdate: "2 min ago" },
    { name: "Database", status: "online" as const, health: 95, lastUpdate: "1 min ago" },
    { name: "Cache Layer", status: "online" as const, health: 87, lastUpdate: "3 min ago" },
    { name: "Message Queue", status: "warning" as const, health: 72, lastUpdate: "5 min ago" },
    { name: "File Storage", status: "online" as const, health: 93, lastUpdate: "1 min ago" },
    { name: "Search Engine", status: "online" as const, health: 89, lastUpdate: "4 min ago" }
  ]

  const breadcrumbs = [
    { label: "Home", onClick: () => console.log("Navigate to home") },
    { label: "Operations", onClick: () => console.log("Navigate to operations") },
    { label: "Dashboard" }
  ]

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <OperationsDashboard
      subtitle="Real-time monitoring and system status"
      breadcrumbs={breadcrumbs}
      metrics={metrics}
      systemStatus={systemStatus}
      actions={
        <div className="flex items-center gap-3">
          <GlassButton
            variant="accent"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </GlassButton>
          <GlassButton variant="floating" size="sm">
            <Settings className="w-4 h-4" />
            Settings
          </GlassButton>
        </div>
      }
    >
      {/* Operations Overview Section */}
      <SectionContainer
        title="Operations Overview"
        subtitle="Current operational metrics and performance indicators"
        headerActions={
          <div className="flex items-center gap-2">
            <PulsingIndicator color="success" size="sm" />
            <span className="text-sm text-muted-foreground">Live Data</span>
          </div>
        }
      >
        <GridContainer columns={2} gap="lg">
          {/* Real-time Metrics */}
          <GlassCard padding="lg" hover="lift" animated>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-glow-accent">Real-time Metrics</h3>
                <LiveIndicator online showLabel label="Live" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <ProgressRing progress={85} size={80} showLabel />
                  <p className="text-sm text-muted-foreground mt-2">CPU Usage</p>
                </div>
                <div className="text-center">
                  <ProgressRing progress={67} size={80} showLabel />
                  <p className="text-sm text-muted-foreground mt-2">Memory</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Network I/O</span>
                  <StatusBadge status="success" size="sm">Active</StatusBadge>
                </div>
                <HealthIndicator 
                  health="excellent" 
                  variant="bar" 
                  percentage={94} 
                  showPercentage 
                />
              </div>
            </div>
          </GlassCard>

          {/* System Alerts */}
          <GlassCard padding="lg" hover="lift" animated>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-glow-accent">System Alerts</h3>
                <StatusBadge status="warning" animated="pulse">
                  3 Active
                </StatusBadge>
              </div>

              <div className="space-y-4">
                <AnimatedContainer animation="slide-left" delay="100">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <PulsingIndicator color="warning" variant="ring" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">High Memory Usage</p>
                      <p className="text-xs text-muted-foreground">Cache server #3</p>
                    </div>
                  </div>
                </AnimatedContainer>

                <AnimatedContainer animation="slide-left" delay="200">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-info/10 border border-info/30">
                    <PulsingIndicator color="info" variant="ring" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Scheduled Maintenance</p>
                      <p className="text-xs text-muted-foreground">Tomorrow 2:00 AM</p>
                    </div>
                  </div>
                </AnimatedContainer>

                <AnimatedContainer animation="slide-left" delay="300">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
                    <PulsingIndicator color="success" variant="ring" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Backup Completed</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                </AnimatedContainer>
              </div>
            </div>
          </GlassCard>
        </GridContainer>
      </SectionContainer>

      {/* Performance Analytics */}
      <SectionContainer
        title="Performance Analytics"
        subtitle="Detailed performance metrics and trends"
      >
        <GridContainer columns={3}>
          <AnimatedContainer animation="scale-in" delay="100">
            <MetricCard
              title="Response Time"
              value="127ms"
              subtitle="Average across all endpoints"
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: 15, direction: "down", label: "improvement" }}
              status="success"
              hover="scale"
            />
          </AnimatedContainer>

          <AnimatedContainer animation="scale-in" delay="200">
            <MetricCard
              title="Throughput"
              value="2.3K"
              subtitle="Requests per second"
              icon={<Activity className="w-5 h-5" />}
              trend={{ value: 8, direction: "up", label: "vs baseline" }}
              status="info"
              hover="scale"
            />
          </AnimatedContainer>

          <AnimatedContainer animation="scale-in" delay="300">
            <MetricCard
              title="Error Rate"
              value="0.02%"
              subtitle="4xx and 5xx responses"
              icon={<Shield className="w-5 h-5" />}
              trend={{ value: 45, direction: "down", label: "reduction" }}
              status="success"
              hover="scale"
            />
          </AnimatedContainer>
        </GridContainer>
      </SectionContainer>

      {/* Loading State Example */}
      {isLoading && (
        <SectionContainer title="Loading New Data">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        </SectionContainer>
      )}
    </OperationsDashboard>
  )
}

// Alternative Analytics Dashboard Example
export function AnalyticsDashboardExample() {
  return (
    <AnalyticsDashboard
      subtitle="Business intelligence and data insights"
      metrics={[
        {
          title: "Revenue",
          value: "$124.5K",
          trend: { value: 12, direction: "up", label: "vs last month" },
          status: "success"
        },
        {
          title: "Conversions",
          value: "3.4%",
          trend: { value: 0.8, direction: "up", label: "improvement" },
          status: "success"
        },
        {
          title: "Bounce Rate",
          value: "42.1%",
          trend: { value: 5, direction: "down", label: "reduction" },
          status: "warning"
        }
      ]}
    >
      <SectionContainer title="Analytics Overview">
        <GridContainer columns={2}>
          <GlassCard padding="lg" hover="glow">
            <h3 className="text-lg font-bold mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Organic Search</span>
                <span className="font-medium">45.2%</span>
              </div>
              <HealthIndicator health="excellent" variant="bar" percentage={45} />
              
              <div className="flex justify-between">
                <span>Direct</span>
                <span className="font-medium">28.7%</span>
              </div>
              <HealthIndicator health="good" variant="bar" percentage={29} />
              
              <div className="flex justify-between">
                <span>Social Media</span>
                <span className="font-medium">16.4%</span>
              </div>
              <HealthIndicator health="fair" variant="bar" percentage={16} />
            </div>
          </GlassCard>

          <GlassCard padding="lg" hover="glow">
            <h3 className="text-lg font-bold mb-4">User Engagement</h3>
            <div className="flex justify-center">
              <ProgressRing progress={73} size={120} />
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Overall engagement score</p>
            </div>
          </GlassCard>
        </GridContainer>
      </SectionContainer>
    </AnalyticsDashboard>
  )
}