import * as React from "react"
import { cn } from "@/lib/utils"
import { MeshGradient } from "./visual-effects"
import { AmbientParticles } from "./visual-effects"
import { NeuralNetwork } from "./visual-effects"

// Contextual Background System
export interface ContextualBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  context?: "dashboard" | "analytics" | "operations" | "settings" | "security" | "ai" | "network"
  timeOfDay?: "morning" | "afternoon" | "evening" | "night"
  weather?: "sunny" | "cloudy" | "rainy" | "stormy" | "clear"
  intensity?: "minimal" | "subtle" | "medium" | "intense" | "maximum"
  animated?: boolean
  children: React.ReactNode
}

export const ContextualBackground = React.forwardRef<HTMLDivElement, ContextualBackgroundProps>(
  ({ 
    className, 
    context = "dashboard", 
    timeOfDay = "evening", 
    weather = "clear", 
    intensity = "medium",
    animated = true,
    children, 
    ...props 
  }, ref) => {
    // Context-based color schemes
    const contextColors = {
      dashboard: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
      analytics: ["#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"],
      operations: ["#10B981", "#059669", "#06B6D4", "#3B82F6"],
      settings: ["#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6"],
      security: ["#EF4444", "#DC2626", "#B91C1C", "#991B1B"],
      ai: ["#8B5CF6", "#A855F7", "#C084FC", "#DDD6FE"],
      network: ["#06B6D4", "#0891B2", "#0E7490", "#155E75"]
    }

    // Time-based adjustments
    const timeAdjustments = {
      morning: { brightness: 1.2, saturation: 1.1, warmth: 1.1 },
      afternoon: { brightness: 1.0, saturation: 1.0, warmth: 1.0 },
      evening: { brightness: 0.9, saturation: 1.2, warmth: 1.3 },
      night: { brightness: 0.7, saturation: 0.8, warmth: 0.8 }
    }

    // Weather-based effects
    const weatherEffects = {
      sunny: { particles: 30, speed: "slow", opacity: 0.3 },
      cloudy: { particles: 50, speed: "medium", opacity: 0.5 },
      rainy: { particles: 80, speed: "fast", opacity: 0.7 },
      stormy: { particles: 120, speed: "fast", opacity: 0.9 },
      clear: { particles: 20, speed: "slow", opacity: 0.2 }
    }

    const colors = contextColors[context]
    const timeAdj = timeAdjustments[timeOfDay]
    const weatherEff = weatherEffects[weather]

    // Adjust colors based on time and weather
    const adjustedColors = colors.map(color => {
      // Simple color adjustment (in real implementation, you'd use proper color manipulation)
      return color
    })

    const backgroundLayers = React.useMemo(() => {
      const layers = []

      // Base mesh gradient
      if (intensity !== "minimal") {
        layers.push(
          <MeshGradient
            key="mesh"
            colors={adjustedColors}
            intensity={intensity}
            animated={animated}
            className="absolute inset-0"
          />
        )
      }

      // Particle effects based on weather
      if (intensity !== "minimal" && intensity !== "subtle") {
        layers.push(
          <AmbientParticles
            key="particles"
            count={weatherEff.particles}
            speed={weatherEff.speed as any}
            opacity={weatherEff.opacity}
            color={adjustedColors[0]}
            className="absolute inset-0"
          />
        )
      }

      // Neural network for AI context
      if (context === "ai" && intensity !== "minimal") {
        layers.push(
          <NeuralNetwork
            key="neural"
            nodes={intensity === "maximum" ? 30 : 20}
            connections={intensity === "maximum" ? 25 : 15}
            animated={animated}
            color={adjustedColors[0]}
            className="absolute inset-0 opacity-20"
          />
        )
      }

      return layers
    }, [context, timeOfDay, weather, intensity, animated, adjustedColors])

    return (
      <div 
        className={cn("relative min-h-screen", className)} 
        ref={ref}
        style={{
          filter: `brightness(${timeAdj.brightness}) saturate(${timeAdj.saturation})`,
        }}
        {...props}
      >
        {/* Background layers */}
        <div className="absolute inset-0 overflow-hidden">
          {backgroundLayers}
        </div>

        {/* Content overlay */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
ContextualBackground.displayName = "ContextualBackground"

// Ambient Scene Manager
export interface AmbientSceneProps extends React.HTMLAttributes<HTMLDivElement> {
  scene: "cyberpunk" | "ethereal" | "corporate" | "nature" | "space" | "ocean"
  intensity?: "subtle" | "medium" | "intense"
  interactive?: boolean
  children: React.ReactNode
}

export const AmbientScene = React.forwardRef<HTMLDivElement, AmbientSceneProps>(
  ({ className, scene, intensity = "medium", interactive = true, children, ...props }, ref) => {
    const sceneConfig = {
      cyberpunk: {
        colors: ["#FF0080", "#00FFFF", "#8000FF", "#FF8000"],
        particles: 100,
        pattern: "geometric",
        effects: ["neon-glow", "scan-lines"]
      },
      ethereal: {
        colors: ["#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8"],
        particles: 60,
        pattern: "organic",
        effects: ["soft-glow", "floating"]
      },
      corporate: {
        colors: ["#1E293B", "#334155", "#475569", "#64748B"],
        particles: 30,
        pattern: "minimal",
        effects: ["subtle-grid", "professional"]
      },
      nature: {
        colors: ["#10B981", "#059669", "#047857", "#065F46"],
        particles: 80,
        pattern: "organic",
        effects: ["wind-effect", "growth"]
      },
      space: {
        colors: ["#1E1B4B", "#312E81", "#3730A3", "#4338CA"],
        particles: 150,
        pattern: "stellar",
        effects: ["star-field", "nebula"]
      },
      ocean: {
        colors: ["#0891B2", "#0E7490", "#155E75", "#164E63"],
        particles: 70,
        pattern: "flowing",
        effects: ["wave-motion", "depth"]
      }
    }

    const config = sceneConfig[scene]

    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        {/* Scene background */}
        <div className="absolute inset-0 overflow-hidden">
          <MeshGradient
            colors={config.colors}
            intensity={intensity}
            animated={interactive}
          />
          
          <AmbientParticles
            count={config.particles}
            speed="medium"
            color={config.colors[0]}
            opacity={intensity === "subtle" ? 0.3 : intensity === "intense" ? 0.8 : 0.5}
          />

          {/* Scene-specific effects */}
          {scene === "cyberpunk" && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse" />
          )}
          
          {scene === "space" && (
            <div className="absolute inset-0">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
AmbientScene.displayName = "AmbientScene"

// Dynamic Theme Adapter
export interface DynamicThemeAdapterProps extends React.HTMLAttributes<HTMLDivElement> {
  adaptTo: "performance" | "mood" | "activity" | "focus" | "energy"
  autoAdjust?: boolean
  children: React.ReactNode
}

export const DynamicThemeAdapter = React.forwardRef<HTMLDivElement, DynamicThemeAdapterProps>(
  ({ className, adaptTo, autoAdjust = true, children, ...props }, ref) => {
    const [currentTheme, setCurrentTheme] = React.useState(adaptTo)

    // Auto-adjust based on time and usage patterns
    React.useEffect(() => {
      if (!autoAdjust) return

      const hour = new Date().getHours()
      
      if (hour >= 6 && hour < 12) {
        setCurrentTheme("energy")
      } else if (hour >= 12 && hour < 17) {
        setCurrentTheme("performance")
      } else if (hour >= 17 && hour < 21) {
        setCurrentTheme("activity")
      } else {
        setCurrentTheme("focus")
      }
    }, [autoAdjust])

    const themeConfig = {
      performance: {
        context: "operations" as const,
        intensity: "medium" as const,
        weather: "clear" as const
      },
      mood: {
        context: "ai" as const,
        intensity: "intense" as const,
        weather: "cloudy" as const
      },
      activity: {
        context: "dashboard" as const,
        intensity: "medium" as const,
        weather: "sunny" as const
      },
      focus: {
        context: "settings" as const,
        intensity: "subtle" as const,
        weather: "clear" as const
      },
      energy: {
        context: "analytics" as const,
        intensity: "intense" as const,
        weather: "stormy" as const
      }
    }

    const config = themeConfig[currentTheme]

    return (
      <ContextualBackground
        className={className}
        ref={ref}
        context={config.context}
        intensity={config.intensity}
        weather={config.weather}
        animated={true}
        {...props}
      >
        {children}
      </ContextualBackground>
    )
  }
)
DynamicThemeAdapter.displayName = "DynamicThemeAdapter"

// Weather-Responsive Background
export interface WeatherResponsiveBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  location?: string
  fallbackWeather?: "sunny" | "cloudy" | "rainy" | "stormy" | "clear"
  children: React.ReactNode
}

export const WeatherResponsiveBackground = React.forwardRef<HTMLDivElement, WeatherResponsiveBackgroundProps>(
  ({ className, location, fallbackWeather = "clear", children, ...props }, ref) => {
    const [weather, setWeather] = React.useState(fallbackWeather)
    const [timeOfDay, setTimeOfDay] = React.useState<"morning" | "afternoon" | "evening" | "night">("evening")

    // Mock weather API integration (replace with real API)
    React.useEffect(() => {
      // Simulate weather detection
      const hour = new Date().getHours()
      
      if (hour >= 6 && hour < 12) setTimeOfDay("morning")
      else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon")
      else if (hour >= 17 && hour < 21) setTimeOfDay("evening")
      else setTimeOfDay("night")

      // In production, integrate with weather API
      // const fetchWeather = async () => {
      //   try {
      //     const response = await fetch(`/api/weather?location=${location}`)
      //     const data = await response.json()
      //     setWeather(data.weather)
      //   } catch {
      //     setWeather(fallbackWeather)
      //   }
      // }
      // fetchWeather()
    }, [location, fallbackWeather])

    return (
      <ContextualBackground
        className={className}
        ref={ref}
        context="dashboard"
        timeOfDay={timeOfDay}
        weather={weather}
        intensity="medium"
        animated={true}
        {...props}
      >
        {children}
      </ContextualBackground>
    )
  }
)
WeatherResponsiveBackground.displayName = "WeatherResponsiveBackground"