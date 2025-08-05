import * as React from "react"
import { cn } from "@/lib/utils"

// Mesh Gradient Background Component
export interface MeshGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  colors?: string[]
  animated?: boolean
  intensity?: "subtle" | "medium" | "intense"
  pattern?: "organic" | "geometric" | "flowing"
}

export const MeshGradient = React.forwardRef<HTMLDivElement, MeshGradientProps>(
  ({ className, colors = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"], animated = true, intensity = "medium", pattern = "organic", ...props }, ref) => {
    const intensityOpacity = {
      subtle: "0.1",
      medium: "0.15", 
      intense: "0.25"
    }[intensity]

    const animationClass = animated ? "animate-mesh-flow" : ""
    
    return (
      <div 
        className={cn("absolute inset-0 overflow-hidden", className)} 
        ref={ref} 
        {...props}
      >
        <div 
          className={cn("w-full h-full", animationClass)}
          style={{
            background: `
              radial-gradient(circle at 20% 20%, ${colors[0]}${intensityOpacity} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${colors[1]}${intensityOpacity} 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, ${colors[2]}${intensityOpacity} 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, ${colors[3]}${intensityOpacity} 0%, transparent 50%),
              radial-gradient(circle at 10% 90%, ${colors[0]}${intensityOpacity} 0%, transparent 50%)
            `,
            filter: "blur(60px)",
          }}
        />
      </div>
    )
  }
)
MeshGradient.displayName = "MeshGradient"

// Holographic Card Component
export interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: "subtle" | "medium" | "intense"
  animated?: boolean
}

export const HolographicCard = React.forwardRef<HTMLDivElement, HolographicCardProps>(
  ({ className, children, intensity = "medium", animated = true, ...props }, ref) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
    const cardRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => cardRef.current!, [])

    const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setMousePosition({ x, y })
    }, [])

    const intensityValues = {
      subtle: { opacity: 0.3, scale: 0.5 },
      medium: { opacity: 0.5, scale: 0.7 },
      intense: { opacity: 0.8, scale: 1.0 }
    }[intensity]

    return (
      <div
        ref={cardRef}
        className={cn(
          "glass-card relative overflow-hidden group",
          animated && "transition-all duration-300",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition({ x: 50, y: 50 })}
        {...props}
      >
        {/* Holographic Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                rgba(59, 130, 246, ${intensityValues.opacity}) 0%, 
                rgba(139, 92, 246, ${intensityValues.opacity * 0.7}) 25%,
                rgba(16, 185, 129, ${intensityValues.opacity * 0.5}) 50%,
                transparent 70%
              )
            `,
            transform: `scale(${intensityValues.scale})`,
            filter: "blur(20px)",
          }}
        />
        
        {/* Shimmer Effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 70%
            )`,
            transform: `translateX(-100%) translateY(-100%)`,
            animation: animated ? "shimmer-holographic 2s ease-in-out infinite" : "none",
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
HolographicCard.displayName = "HolographicCard"

// Ambient Particle Field
export interface AmbientParticlesProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  speed?: "slow" | "medium" | "fast"
  size?: "small" | "medium" | "large"
  color?: string
  opacity?: number
}

export const AmbientParticles = React.forwardRef<HTMLDivElement, AmbientParticlesProps>(
  ({ className, count = 50, speed = "medium", size = "small", color = "#3B82F6", opacity = 0.6, ...props }, ref) => {
    const particles = React.useMemo(() => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 10,
        duration: Math.random() * 20 + 10,
      }))
    }, [count])

    const speedValues = {
      slow: 30,
      medium: 20,
      fast: 10
    }[speed]

    const sizeValues = {
      small: 2,
      medium: 4,
      large: 6
    }[size]

    return (
      <div 
        className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} 
        ref={ref} 
        {...props}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size * sizeValues}px`,
              height: `${particle.size * sizeValues}px`,
              backgroundColor: color,
              opacity: opacity,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              filter: "blur(0.5px)",
              boxShadow: `0 0 ${particle.size * 2}px ${color}`,
            }}
          />
        ))}
      </div>
    )
  }
)
AmbientParticles.displayName = "AmbientParticles"

// Crystalline Pattern Background
export interface CrystallinePatternProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "hexagonal" | "triangular" | "organic"
  density?: "low" | "medium" | "high"
  animated?: boolean
}

export const CrystallinePattern = React.forwardRef<HTMLDivElement, CrystallinePatternProps>(
  ({ className, variant = "hexagonal", density = "medium", animated = true, ...props }, ref) => {
    const patternSize = {
      low: 80,
      medium: 60,
      high: 40
    }[density]

    const svgPattern = {
      hexagonal: (
        <polygon 
          points="30,10 50,20 50,40 30,50 10,40 10,20" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          opacity="0.1"
        />
      ),
      triangular: (
        <polygon 
          points="30,10 50,50 10,50" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          opacity="0.1"
        />
      ),
      organic: (
        <circle 
          cx="30" 
          cy="30" 
          r="15" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          opacity="0.1"
        />
      )
    }[variant]

    return (
      <div 
        className={cn("absolute inset-0 pointer-events-none", className)} 
        ref={ref} 
        {...props}
      >
        <svg 
          className={cn("w-full h-full text-primary", animated && "animate-pulse-slow")}
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
              <svg width="${patternSize}" height="${patternSize}" xmlns="http://www.w3.org/2000/svg">
                ${svgPattern}
              </svg>
            `)}")`,
            backgroundRepeat: "repeat",
            opacity: 0.05,
          }}
        />
      </div>
    )
  }
)
CrystallinePattern.displayName = "CrystallinePattern"

// Liquid Metal Effect
export interface LiquidMetalProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: "subtle" | "medium" | "intense"
}

export const LiquidMetal = React.forwardRef<HTMLDivElement, LiquidMetalProps>(
  ({ className, children, intensity = "medium", ...props }, ref) => {
    const intensityValues = {
      subtle: { blur: "8px", opacity: 0.1 },
      medium: { blur: "12px", opacity: 0.2 },
      intense: { blur: "16px", opacity: 0.3 }
    }[intensity]

    return (
      <div 
        className={cn("relative overflow-hidden", className)} 
        ref={ref} 
        {...props}
      >
        {/* Liquid Metal Background */}
        <div 
          className="absolute inset-0 animate-liquid-flow"
          style={{
            background: `
              linear-gradient(45deg, 
                transparent 0%, 
                rgba(148, 163, 184, ${intensityValues.opacity}) 25%, 
                rgba(203, 213, 225, ${intensityValues.opacity * 1.5}) 50%, 
                rgba(148, 163, 184, ${intensityValues.opacity}) 75%, 
                transparent 100%
              )
            `,
            filter: `blur(${intensityValues.blur})`,
            transform: "translateX(-100%)",
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
LiquidMetal.displayName = "LiquidMetal"

// Energy Pulse Effect
export interface EnergyPulseProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string
  speed?: "slow" | "medium" | "fast"
  intensity?: "subtle" | "medium" | "intense"
  pattern?: "circle" | "wave" | "spiral"
}

export const EnergyPulse = React.forwardRef<HTMLDivElement, EnergyPulseProps>(
  ({ className, color = "#3B82F6", speed = "medium", intensity = "medium", pattern = "circle", ...props }, ref) => {
    const speedValues = {
      slow: "3s",
      medium: "2s", 
      fast: "1s"
    }[speed]

    const intensityValues = {
      subtle: 0.3,
      medium: 0.5,
      intense: 0.8
    }[intensity]

    return (
      <div 
        className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} 
        ref={ref} 
        {...props}
      >
        <div 
          className="absolute inset-0 animate-energy-pulse"
          style={{
            background: pattern === "circle" 
              ? `radial-gradient(circle, ${color}${Math.round(intensityValues * 255).toString(16)} 0%, transparent 70%)`
              : pattern === "wave"
              ? `linear-gradient(90deg, transparent 0%, ${color}${Math.round(intensityValues * 255).toString(16)} 50%, transparent 100%)`
              : `conic-gradient(from 0deg, ${color}${Math.round(intensityValues * 255).toString(16)} 0%, transparent 50%, ${color}${Math.round(intensityValues * 255).toString(16)} 100%)`,
            animationDuration: speedValues,
            filter: "blur(10px)",
          }}
        />
      </div>
    )
  }
)
EnergyPulse.displayName = "EnergyPulse"

// Neural Network Visualization
export interface NeuralNetworkProps extends React.HTMLAttributes<HTMLDivElement> {
  nodes?: number
  connections?: number
  animated?: boolean
  color?: string
}

export const NeuralNetwork = React.forwardRef<HTMLDivElement, NeuralNetworkProps>(
  ({ className, nodes = 20, connections = 15, animated = true, color = "#3B82F6", ...props }, ref) => {
    const [networkData, setNetworkData] = React.useState<{
      nodes: Array<{ id: number; x: number; y: number; size: number }>
      connections: Array<{ from: number; to: number; opacity: number }>
    }>({ nodes: [], connections: [] })

    React.useEffect(() => {
      const nodeData = Array.from({ length: nodes }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
      }))

      const connectionData = Array.from({ length: connections }, (_, i) => ({
        from: Math.floor(Math.random() * nodes),
        to: Math.floor(Math.random() * nodes),
        opacity: Math.random() * 0.5 + 0.1,
      })).filter(conn => conn.from !== conn.to)

      setNetworkData({ nodes: nodeData, connections: connectionData })
    }, [nodes, connections])

    return (
      <div 
        className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} 
        ref={ref} 
        {...props}
      >
        <svg className="w-full h-full">
          {/* Connections */}
          {networkData.connections.map((connection, index) => {
            const fromNode = networkData.nodes[connection.from]
            const toNode = networkData.nodes[connection.to]
            if (!fromNode || !toNode) return null

            return (
              <line
                key={index}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={color}
                strokeWidth="0.5"
                opacity={connection.opacity}
                className={animated ? "animate-pulse" : ""}
              />
            )
          })}
          
          {/* Nodes */}
          {networkData.nodes.map((node) => (
            <circle
              key={node.id}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r={node.size}
              fill={color}
              opacity="0.6"
              className={animated ? "animate-pulse" : ""}
            />
          ))}
        </svg>
      </div>
    )
  }
)
NeuralNetwork.displayName = "NeuralNetwork"