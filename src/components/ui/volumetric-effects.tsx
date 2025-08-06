import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"

// Volumetric Light Component
export interface VolumetricLightProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "subtle" | "medium" | "intense" | "extreme"
  color?: string
  animated?: boolean
  direction?: "top" | "bottom" | "left" | "right" | "center"
  beamWidth?: number
  blur?: number
}

export const VolumetricLight = React.forwardRef<HTMLDivElement, VolumetricLightProps>(
  ({ 
    className, 
    intensity = "medium", 
    color, 
    animated = true,
    direction = "center",
    beamWidth = 100,
    blur = 20,
    ...props 
  }, ref) => {
    const { currentTheme } = useTheme()
    const lightColor = color || `hsl(${currentTheme.colors.primary})`

    const intensityValues = {
      subtle: { opacity: 0.2, scale: 0.8, layers: 3 },
      medium: { opacity: 0.4, scale: 1.0, layers: 5 },
      intense: { opacity: 0.6, scale: 1.2, layers: 7 },
      extreme: { opacity: 0.8, scale: 1.5, layers: 10 }
    }[intensity]

    const directionStyles = {
      top: {
        background: `linear-gradient(180deg, ${lightColor} 0%, transparent 70%)`,
        transform: 'translateY(-50%)',
        top: 0
      },
      bottom: {
        background: `linear-gradient(0deg, ${lightColor} 0%, transparent 70%)`,
        transform: 'translateY(50%)',
        bottom: 0
      },
      left: {
        background: `linear-gradient(90deg, ${lightColor} 0%, transparent 70%)`,
        transform: 'translateX(-50%)',
        left: 0
      },
      right: {
        background: `linear-gradient(270deg, ${lightColor} 0%, transparent 70%)`,
        transform: 'translateX(50%)',
        right: 0
      },
      center: {
        background: `radial-gradient(ellipse ${beamWidth}% 100%, ${lightColor} 0%, transparent 70%)`,
        transform: 'translate(-50%, -50%)',
        top: '50%',
        left: '50%'
      }
    }[direction]

    return (
      <div 
        className={cn("absolute pointer-events-none overflow-hidden", className)} 
        ref={ref} 
        {...props}
      >
        {/* Multiple light layers for volumetric effect */}
        {Array.from({ length: intensityValues.layers }, (_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-full h-full",
              animated && "animate-pulse-ring"
            )}
            style={{
              ...directionStyles,
              opacity: intensityValues.opacity / (i + 1),
              filter: `blur(${blur + i * 5}px)`,
              transform: `${directionStyles.transform} scale(${intensityValues.scale + i * 0.1})`,
              animationDelay: animated ? `${i * 0.2}s` : undefined,
              animationDuration: animated ? `${3 + i * 0.5}s` : undefined,
            }}
          />
        ))}
      </div>
    )
  }
)
VolumetricLight.displayName = "VolumetricLight"

// Enhanced Glow System
export interface EnhancedGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: "subtle" | "medium" | "intense" | "extreme"
  color?: string
  animated?: boolean
  pulsing?: boolean
  layers?: number
  spread?: number
}

export const EnhancedGlow = React.forwardRef<HTMLDivElement, EnhancedGlowProps>(
  ({ 
    className, 
    children, 
    intensity = "medium",
    color,
    animated = true,
    pulsing = false,
    layers = 5,
    spread = 20,
    ...props 
  }, ref) => {
    const { currentTheme } = useTheme()
    const glowColor = color || `hsl(${currentTheme.colors.primary})`

    const intensityValues = {
      subtle: { baseOpacity: 0.3, maxSpread: spread * 0.5 },
      medium: { baseOpacity: 0.5, maxSpread: spread },
      intense: { baseOpacity: 0.7, maxSpread: spread * 1.5 },
      extreme: { baseOpacity: 0.9, maxSpread: spread * 2 }
    }[intensity]

    return (
      <div 
        className={cn("relative", className)} 
        ref={ref} 
        {...props}
      >
        {/* Multiple glow layers */}
        {Array.from({ length: layers }, (_, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 pointer-events-none",
              animated && "transition-all duration-300",
              pulsing && "animate-glow-pulse"
            )}
            style={{
              boxShadow: `0 0 ${intensityValues.maxSpread + i * 10}px ${intensityValues.maxSpread + i * 5}px ${glowColor}`,
              opacity: intensityValues.baseOpacity / (i + 1),
              borderRadius: 'inherit',
              animationDelay: pulsing ? `${i * 0.1}s` : undefined,
            }}
          />
        ))}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
EnhancedGlow.displayName = "EnhancedGlow"

// Holographic Shimmer Effect
export interface HolographicShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  intensity?: "subtle" | "medium" | "intense"
  speed?: "slow" | "medium" | "fast"
  colors?: string[]
}

export const HolographicShimmer = React.forwardRef<HTMLDivElement, HolographicShimmerProps>(
  ({ 
    className, 
    children, 
    intensity = "medium",
    speed = "medium",
    colors = ['#ff00ff', '#00ffff', '#ffff00'],
    ...props 
  }, ref) => {
    const speedValues = {
      slow: '4s',
      medium: '2s',
      fast: '1s'
    }[speed]

    const intensityValues = {
      subtle: { opacity: 0.3, size: '200%' },
      medium: { opacity: 0.5, size: '300%' },
      intense: { opacity: 0.7, size: '400%' }
    }[intensity]

    return (
      <div 
        className={cn("relative overflow-hidden", className)} 
        ref={ref} 
        {...props}
      >
        {/* Holographic layers */}
        {colors.map((color, i) => (
          <div
            key={i}
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(
                ${45 + i * 30}deg,
                transparent 0%, 
                ${color}${Math.round(intensityValues.opacity * 255).toString(16)} 40%, 
                transparent 60%
              )`,
              backgroundSize: intensityValues.size,
              animation: `shimmer-holographic ${speedValues} linear infinite`,
              animationDelay: `${i * 0.2}s`,
              filter: `blur(${i + 1}px)`,
            }}
          />
        ))}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
HolographicShimmer.displayName = "HolographicShimmer"

// Aurora Light Effect
export interface AuroraLightProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "subtle" | "medium" | "intense"
  colors?: string[]
  animated?: boolean
  waves?: number
}

export const AuroraLight = React.forwardRef<HTMLDivElement, AuroraLightProps>(
  ({ 
    className, 
    intensity = "medium",
    colors = ['#00ff88', '#0088ff', '#8800ff', '#ff0088'],
    animated = true,
    waves = 3,
    ...props 
  }, ref) => {
    const intensityValues = {
      subtle: { opacity: 0.2, blur: 15 },
      medium: { opacity: 0.4, blur: 20 },
      intense: { opacity: 0.6, blur: 25 }
    }[intensity]

    return (
      <div 
        className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} 
        ref={ref} 
        {...props}
      >
        {/* Aurora waves */}
        {Array.from({ length: waves }, (_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-full h-full",
              animated && "animate-float"
            )}
            style={{
              background: `linear-gradient(
                ${90 + i * 30}deg,
                transparent 0%,
                ${colors[i % colors.length]} 30%,
                ${colors[(i + 1) % colors.length]} 70%,
                transparent 100%
              )`,
              opacity: intensityValues.opacity,
              filter: `blur(${intensityValues.blur}px)`,
              transform: `translateY(${i * 20 - 40}%) scale(1.${i + 2})`,
              animationDelay: animated ? `${i * 0.5}s` : undefined,
              animationDuration: animated ? `${8 + i * 2}s` : undefined,
            }}
          />
        ))}
      </div>
    )
  }
)
AuroraLight.displayName = "AuroraLight"

// Plasma Field Effect
export interface PlasmaFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "subtle" | "medium" | "intense"
  speed?: "slow" | "medium" | "fast"
  color1?: string
  color2?: string
  animated?: boolean
}

export const PlasmaField = React.forwardRef<HTMLDivElement, PlasmaFieldProps>(
  ({ 
    className, 
    intensity = "medium",
    speed = "medium",
    color1 = '#ff00ff',
    color2 = '#00ffff',
    animated = true,
    ...props 
  }, ref) => {
    const { currentTheme } = useTheme()
    
    const speedValues = {
      slow: '8s',
      medium: '5s',
      fast: '3s'
    }[speed]

    const intensityValues = {
      subtle: { opacity: 0.3, scale: 1.2 },
      medium: { opacity: 0.5, scale: 1.5 },
      intense: { opacity: 0.7, scale: 2.0 }
    }[intensity]

    return (
      <div 
        className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} 
        ref={ref} 
        {...props}
      >
        {/* Plasma layers */}
        <div
          className={cn(
            "absolute inset-0",
            animated && "animate-gradient"
          )}
          style={{
            background: `
              radial-gradient(circle at 20% 50%, ${color1} 0%, transparent 40%),
              radial-gradient(circle at 80% 50%, ${color2} 0%, transparent 40%),
              radial-gradient(circle at 50% 20%, ${color1} 0%, transparent 40%),
              radial-gradient(circle at 50% 80%, ${color2} 0%, transparent 40%)
            `,
            opacity: intensityValues.opacity,
            filter: `blur(20px)`,
            transform: `scale(${intensityValues.scale})`,
            animationDuration: animated ? speedValues : undefined,
          }}
        />
        
        <div
          className={cn(
            "absolute inset-0",
            animated && "animate-gradient"
          )}
          style={{
            background: `
              conic-gradient(from 0deg at 50% 50%, 
                ${color1} 0deg, 
                transparent 60deg, 
                ${color2} 120deg, 
                transparent 180deg, 
                ${color1} 240deg, 
                transparent 300deg)
            `,
            opacity: intensityValues.opacity * 0.7,
            filter: `blur(15px)`,
            animationDuration: animated ? speedValues : undefined,
            animationDirection: 'reverse',
          }}
        />
      </div>
    )
  }
)
PlasmaField.displayName = "PlasmaField"

export { 
  VolumetricLight, 
  EnhancedGlow, 
  HolographicShimmer, 
  AuroraLight, 
  PlasmaField 
}