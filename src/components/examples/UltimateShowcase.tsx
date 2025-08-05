import * as React from "react"
import {
  // Layout & Structure
  OperationsDashboard,
  PageHeader,
  MetricCard,
  SectionContainer,
  GridContainer,
  
  // Glass & Visual Effects
  GlassCard,
  HolographicCard,
  MeshGradient,
  AmbientParticles,
  EnergyPulse,
  LiquidMetal,
  
  // Micro-interactions
  MagneticButton,
  TiltCard,
  MorphingIcon,
  FloatingActionButton,
  SmartTooltip,
  
  // Data Visualization
  DataStream,
  ParticleCloud,
  HolographicGrid,
  NeuralNetworkVisualization,
  MetricsDashboard,
  
  // Contextual Backgrounds
  ContextualBackground,
  AmbientScene,
  DynamicThemeAdapter,
  
  // Advanced Typography
  HolographicHeading,
  Typography,
  Typewriter,
  GlitchText,
  MatrixText,
  VariableFont,
  TextReveal,
  
  // Animation & Status
  AnimatedContainer,
  RevealOnScroll,
  StatusBadge,
  LiveIndicator,
  HealthIndicator,
  PulsingIndicator,
} from "@/components/ui"

import { 
  Activity, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Star,
  Heart,
  Cpu,
  Database,
  Globe,
  Lock
} from "lucide-react"

// Ultimate Showcase Component
export function UltimateShowcase() {
  const [isPlaying, setIsPlaying] = React.useState(false)
  
  // Generate sample data
  const realTimeMetrics = React.useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      value: 50 + Math.sin(i * 0.2) * 30 + Math.random() * 20,
      timestamp: Date.now() - (50 - i) * 1000,
      label: `Data Point ${i}`
    }))
  }, [])

  const particleData = React.useMemo(() => {
    return Array.from({ length: 100 }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      z: (Math.random() - 0.5) * 200,
      value: Math.random(),
      label: `Node ${Math.floor(Math.random() * 1000)}`
    }))
  }, [])

  const gridData = React.useMemo(() => {
    return Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => Math.random())
    )
  }, [])

  const metrics = [
    {
      title: "System Performance",
      value: "98.5%",
      subtitle: "All systems operational",
      icon: <Cpu className="w-5 h-5" />,
      trend: { value: 12, direction: "up" as const, label: "vs last hour" },
      status: "success" as const
    },
    {
      title: "Active Connections", 
      value: "1,247",
      subtitle: "Real-time users",
      icon: <Users className="w-5 h-5" />,
      trend: { value: 8, direction: "up" as const, label: "vs baseline" },
      status: "info" as const
    },
    {
      title: "Data Throughput",
      value: "2.3 GB/s",
      subtitle: "Network activity",
      icon: <Activity className="w-5 h-5" />,
      trend: { value: 15, direction: "up" as const, label: "increase" },
      status: "success" as const
    },
    {
      title: "Security Status",
      value: "Protected",
      subtitle: "All threats mitigated",
      icon: <Shield className="w-5 h-5" />,
      trend: { value: 0, direction: "neutral" as const, label: "stable" },
      status: "success" as const
    }
  ]

  const systemStatus = [
    { name: "Core Systems", status: "online" as const, health: 98, lastUpdate: "1 min ago" },
    { name: "Database Cluster", status: "online" as const, health: 95, lastUpdate: "2 min ago" },
    { name: "API Gateway", status: "online" as const, health: 87, lastUpdate: "1 min ago" },
    { name: "Cache Layer", status: "warning" as const, health: 72, lastUpdate: "3 min ago" },
    { name: "Load Balancer", status: "online" as const, health: 93, lastUpdate: "1 min ago" },
    { name: "Security Layer", status: "online" as const, health: 99, lastUpdate: "30 sec ago" }
  ]

  const kpiMetrics = [
    { name: "Uptime", value: 99.9, unit: "%", color: "#10B981", trend: "up" as const },
    { name: "Response Time", value: 127, unit: "ms", color: "#3B82F6", trend: "down" as const },
    { name: "Error Rate", value: 0.02, unit: "%", color: "#EF4444", trend: "down" as const },
    { name: "Throughput", value: 2.3, unit: "K/s", color: "#8B5CF6", trend: "up" as const },
    { name: "CPU Usage", value: 68, unit: "%", color: "#F59E0B", trend: "stable" as const }
  ]

  return (
    <AmbientScene scene="cyberpunk" intensity="medium" interactive>
      {/* Contextual Background Effects */}
      <MeshGradient 
        colors={["#FF0080", "#00FFFF", "#8000FF", "#FF8000"]}
        intensity="medium"
        animated
        className="fixed inset-0 z-0"
      />
      
      <AmbientParticles 
        count={80}
        speed="medium"
        color="#00FFFF"
        opacity={0.4}
        className="fixed inset-0 z-0"
      />

      <div className="relative z-10 min-h-screen">
        {/* Hero Section with Advanced Typography */}
        <AnimatedContainer animation="fade-in" className="text-center py-20">
          <HolographicHeading level={1} intensity="intense" animated>
            <TextReveal stagger delay={150}>
              ISAC OS Ultimate Interface
            </TextReveal>
          </HolographicHeading>
          
          <AnimatedContainer animation="slide-up" delay="500" className="mt-6">
            <Typography variant="gradient" size="xl" weight="medium">
              <Typewriter 
                text="Next-generation command and control system"
                speed={80}
                delay={1000}
              />
            </Typography>
          </AnimatedContainer>

          <AnimatedContainer animation="scale-in" delay="1000" className="mt-8">
            <GlitchText intensity="medium" color="#00FFFF">
              <VariableFont trigger="auto" minWeight={300} maxWeight={900}>
                SYSTEMS ONLINE
              </VariableFont>
            </GlitchText>
          </AnimatedContainer>
        </AnimatedContainer>

        {/* Main Dashboard */}
        <div className="container mx-auto px-6">
          {/* Interactive Controls */}
          <RevealOnScroll direction="up">
            <SectionContainer 
              title="System Control Center"
              subtitle="Real-time monitoring and advanced interactions"
              headerActions={
                <div className="flex items-center gap-4">
                  <SmartTooltip content="Toggle live data stream" interactive>
                    <MagneticButton
                      magneticStrength={0.3}
                      hapticFeedback
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      <MorphingIcon
                        fromIcon={<Play className="w-4 h-4" />}
                        toIcon={<Pause className="w-4 h-4" />}
                        trigger="click"
                      />
                      {isPlaying ? "Pause" : "Play"} Live Data
                    </MagneticButton>
                  </SmartTooltip>

                  <StatusBadge status="success" variant="glass" animated="glow">
                    <LiveIndicator online size="sm" /> System Active
                  </StatusBadge>
                </div>
              }
            >
              {/* Metrics Grid with Enhanced Effects */}
              <GridContainer columns={4} gap="lg">
                {metrics.map((metric, index) => (
                  <TiltCard key={index} maxTilt={10} glareEffect>
                    <HolographicCard intensity="subtle" animated>
                      <MetricCard
                        title={metric.title}
                        value={metric.value}
                        subtitle={metric.subtitle}
                        icon={metric.icon}
                        trend={metric.trend}
                        status={metric.status}
                        hover="scale"
                      />
                    </HolographicCard>
                  </TiltCard>
                ))}
              </GridContainer>
            </SectionContainer>
          </RevealOnScroll>

          {/* Advanced Data Visualizations */}
          <RevealOnScroll direction="up" className="mt-16">
            <SectionContainer
              title="Data Visualization Suite"
              subtitle="Immersive 3D analytics and real-time monitoring"
            >
              <GridContainer columns={2} gap="xl">
                {/* Real-time Data Stream */}
                <LiquidMetal intensity="medium">
                  <GlassCard padding="lg" hover="glow" animated>
                    <div className="mb-4 flex items-center justify-between">
                      <Typography variant="holographic" size="lg" weight="bold">
                        Live Performance Metrics
                      </Typography>
                      <PulsingIndicator color="success" size="sm" />
                    </div>
                    <DataStream 
                      data={realTimeMetrics}
                      height={200}
                      animated={isPlaying}
                      color="#00FFFF"
                    />
                  </GlassCard>
                </LiquidMetal>

                {/* 3D Particle Cloud */}
                <EnergyPulse color="#8000FF" intensity="medium" pattern="circle">
                  <GlassCard padding="lg" hover="glow" animated>
                    <div className="mb-4">
                      <Typography variant="holographic" size="lg" weight="bold">
                        Network Topology
                      </Typography>
                    </div>
                    <ParticleCloud 
                      data={particleData}
                      width={400}
                      height={250}
                      rotationSpeed={0.008}
                      interactive
                    />
                  </GlassCard>
                </EnergyPulse>

                {/* Holographic Data Grid */}
                <TiltCard maxTilt={8} glareEffect>
                  <GlassCard padding="lg" hover="lift" animated>
                    <div className="mb-4">
                      <Typography variant="holographic" size="lg" weight="bold">
                        System Heatmap
                      </Typography>
                    </div>
                    <HolographicGrid 
                      data={gridData}
                      animated
                      interactive
                    />
                  </GlassCard>
                </TiltCard>

                {/* Neural Network Visualization */}
                <GlassCard padding="lg" hover="glow" animated>
                  <div className="mb-4">
                    <Typography variant="holographic" size="lg" weight="bold">
                      AI Processing Network
                    </Typography>
                  </div>
                  <NeuralNetworkVisualization 
                    layers={[8, 6, 4, 3]}
                    animated
                    interactive
                  />
                </GlassCard>
              </GridContainer>
            </SectionContainer>
          </RevealOnScroll>

          {/* System Status with Advanced Indicators */}
          <RevealOnScroll direction="up" className="mt-16">
            <SectionContainer
              title="System Health Matrix"
              subtitle="Real-time operational status monitoring"
              headerActions={
                <div className="flex items-center gap-3">
                  <StatusBadge 
                    status={systemStatus.every(s => s.status === "online") ? "success" : "warning"}
                    variant="glass"
                    animated="pulse"
                  >
                    {systemStatus.filter(s => s.status === "online").length}/{systemStatus.length} Systems Online
                  </StatusBadge>
                </div>
              }
            >
              <GridContainer columns={3} gap="lg">
                {systemStatus.map((system, index) => (
                  <AnimatedContainer
                    key={index}
                    animation="scale-in"
                    delay={`${(index + 1) * 100}` as any}
                  >
                    <HolographicCard intensity="subtle">
                      <GlassCard padding="md" hover="lift">
                        <div className="flex items-center justify-between mb-3">
                          <Typography variant="neon" weight="medium" size="sm">
                            {system.name}
                          </Typography>
                          <LiveIndicator 
                            online={system.status === "online"} 
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        
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
                        
                        <Typography variant="ethereal" size="xs" className="mt-2">
                          Updated {system.lastUpdate}
                        </Typography>
                      </GlassCard>
                    </HolographicCard>
                  </AnimatedContainer>
                ))}
              </GridContainer>
            </SectionContainer>
          </RevealOnScroll>

          {/* KPI Dashboard with Circular Layout */}
          <RevealOnScroll direction="up" className="mt-16">
            <SectionContainer
              title="Key Performance Indicators"
              subtitle="Critical metrics in real-time circular display"
            >
              <div className="flex justify-center">
                <MetricsDashboard 
                  metrics={kpiMetrics}
                  layout="circular"
                  animated
                />
              </div>
            </SectionContainer>
          </RevealOnScroll>

          {/* Matrix Text Effect Demo */}
          <RevealOnScroll direction="up" className="mt-16">
            <SectionContainer
              title="Terminal Interface"
              subtitle="Matrix-style command line visualization"
            >
              <MatrixText 
                text="ISAC NEURAL NETWORK ACTIVE THREAT ASSESSMENT COMPLETE SYSTEMS NOMINAL"
                density="medium"
                speed="medium"
                className="h-64 bg-black/20 rounded-lg"
              />
            </SectionContainer>
          </RevealOnScroll>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          icon={<Settings className="w-6 h-6" />}
          label="System Settings"
          position="bottom-right"
          hapticFeedback
          onClick={() => console.log("Settings opened")}
        />

        {/* Additional FAB for quick actions */}
        <FloatingActionButton
          icon={<Zap className="w-6 h-6" />}
          label="Quick Analysis"
          position="bottom-left"
          hapticFeedback
          onClick={() => console.log("Analysis started")}
        />
      </div>
    </AmbientScene>
  )
}

// Simplified Demo Component
export function QuickDemo() {
  return (
    <ContextualBackground context="ai" intensity="medium" animated>
      <div className="container mx-auto px-6 py-12">
        {/* Quick Header */}
        <AnimatedContainer animation="slide-up">
          <HolographicHeading level={2} intensity="medium">
            <GlitchText intensity="subtle">
              Enhanced UI Demo
            </GlitchText>
          </HolographicHeading>
        </AnimatedContainer>

        {/* Quick Grid */}
        <GridContainer columns={2} className="mt-8">
          <TiltCard maxTilt={15} glareEffect>
            <HolographicCard intensity="medium">
              <div className="p-6">
                <Typography variant="holographic" size="lg" weight="bold">
                  Holographic Card
                </Typography>
                <Typography className="mt-2">
                  Interactive card with mouse-following effects
                </Typography>
              </div>
            </HolographicCard>
          </TiltCard>

          <GlassCard padding="lg" hover="glow">
            <Typography variant="neon" size="lg" weight="bold">
              Glass Morphism
            </Typography>
            <Typography className="mt-2">
              Beautiful glass effect with backdrop blur
            </Typography>
            <MagneticButton magneticStrength={0.4} className="mt-4">
              Try Magnetic Button
            </MagneticButton>
          </GlassCard>
        </GridContainer>
      </div>
    </ContextualBackground>
  )
}

export default UltimateShowcase