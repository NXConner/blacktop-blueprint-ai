import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Clock, Wifi, WifiOff } from "lucide-react"

// Status Badge Variants
const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
  {
    variants: {
      status: {
        success: "bg-success/20 text-success border border-success/30 hover:glow-soft",
        warning: "bg-warning/20 text-warning border border-warning/30 hover:glow-soft",
        error: "bg-destructive/20 text-destructive border border-destructive/30 hover:glow-soft",
        info: "bg-info/20 text-info border border-info/30 hover:glow-soft",
        pending: "bg-muted/20 text-muted-foreground border border-muted/30 hover:glow-soft",
        active: "bg-primary/20 text-primary border border-primary/30 hover:glow-primary",
        inactive: "bg-muted/20 text-muted-foreground border border-muted/30",
      },
      variant: {
        default: "",
        glass: "glass-card backdrop-blur-md",
        solid: "border-none shadow-sm",
        outline: "bg-transparent",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
      animated: {
        none: "",
        pulse: "animate-pulse",
        glow: "animate-glow",
        bounce: "animate-bounce",
      },
    },
    defaultVariants: {
      status: "info",
      variant: "default",
      size: "default",
      animated: "none",
    },
  }
)

// Status Icons
const statusIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: AlertCircle,
  pending: Clock,
  active: CheckCircle,
  inactive: XCircle,
}

// Status Badge Component
export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean
  iconPosition?: "left" | "right"
  children: React.ReactNode
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, variant, size, animated, showIcon = true, iconPosition = "left", children, ...props }, ref) => {
    const Icon = status ? statusIcons[status] : null

    return (
      <div
        className={cn(statusBadgeVariants({ status, variant, size, animated, className }))}
        ref={ref}
        {...props}
      >
        {showIcon && Icon && iconPosition === "left" && <Icon className="w-3 h-3" />}
        {children}
        {showIcon && Icon && iconPosition === "right" && <Icon className="w-3 h-3" />}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

// Live Indicator Component
export interface LiveIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  online?: boolean
  size?: "sm" | "default" | "lg"
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const LiveIndicator = React.forwardRef<HTMLDivElement, LiveIndicatorProps>(
  ({ className, online = true, size = "default", showLabel = false, label, animated = true, ...props }, ref) => {
    const sizeClass = {
      sm: "w-2 h-2",
      default: "w-3 h-3",
      lg: "w-4 h-4",
    }[size]

    const textSizeClass = {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    }[size]

    return (
      <div className={cn("flex items-center gap-2", className)} ref={ref} {...props}>
        <div className="relative flex items-center">
          <div
            className={cn(
              "rounded-full border-2 border-background",
              sizeClass,
              online ? "bg-success" : "bg-muted",
              animated && online && "animate-pulse"
            )}
          />
          {online && animated && (
            <div
              className={cn(
                "absolute rounded-full bg-success opacity-75 animate-ping",
                sizeClass
              )}
            />
          )}
        </div>
        {showLabel && (
          <span className={cn("font-medium", textSizeClass, online ? "text-success" : "text-muted-foreground")}>
            {label || (online ? "Online" : "Offline")}
          </span>
        )}
      </div>
    )
  }
)
LiveIndicator.displayName = "LiveIndicator"

// Health Indicator Component
export interface HealthIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  health: "excellent" | "good" | "fair" | "poor" | "critical"
  showPercentage?: boolean
  percentage?: number
  size?: "sm" | "default" | "lg"
  variant?: "bar" | "circle" | "badge"
}

const HealthIndicator = React.forwardRef<HTMLDivElement, HealthIndicatorProps>(
  ({ className, health, showPercentage = false, percentage, size = "default", variant = "badge", ...props }, ref) => {
    const healthConfig = {
      excellent: { color: "success", bgColor: "bg-success", percentage: percentage || 95 },
      good: { color: "success", bgColor: "bg-success", percentage: percentage || 85 },
      fair: { color: "warning", bgColor: "bg-warning", percentage: percentage || 70 },
      poor: { color: "warning", bgColor: "bg-warning", percentage: percentage || 45 },
      critical: { color: "destructive", bgColor: "bg-destructive", percentage: percentage || 25 },
    }

    const config = healthConfig[health]
    const healthPercentage = config.percentage

    if (variant === "bar") {
      return (
        <div className={cn("flex items-center gap-3", className)} ref={ref} {...props}>
          <div className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", config.bgColor)}
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
          {showPercentage && (
            <span className="text-sm font-medium min-w-[3ch]">{healthPercentage}%</span>
          )}
        </div>
      )
    }

    if (variant === "circle") {
      const circumference = 2 * Math.PI * 16
      const strokeDasharray = `${(healthPercentage / 100) * circumference} ${circumference}`

      return (
        <div className={cn("relative inline-flex items-center justify-center", className)} ref={ref} {...props}>
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-muted stroke-2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeDasharray={strokeDasharray}
              className={cn("stroke-2 transition-all duration-500", `stroke-${config.color}`)}
            />
          </svg>
          {showPercentage && (
            <span className="absolute text-xs font-medium">{healthPercentage}%</span>
          )}
        </div>
      )
    }

    return (
      <StatusBadge status={config.color as "success" | "warning" | "error"} size={size} className={className} ref={ref} {...props}>
        {health.charAt(0).toUpperCase() + health.slice(1)}
        {showPercentage && ` (${healthPercentage}%)`}
      </StatusBadge>
    )
  }
)
HealthIndicator.displayName = "HealthIndicator"

// Connection Status Component
export interface ConnectionStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  connected?: boolean
  strength?: "weak" | "fair" | "good" | "excellent"
  showLabel?: boolean
  size?: "sm" | "default" | "lg"
}

const ConnectionStatus = React.forwardRef<HTMLDivElement, ConnectionStatusProps>(
  ({ className, connected = true, strength = "good", showLabel = false, size = "default", ...props }, ref) => {
    const IconComponent = connected ? Wifi : WifiOff
    
    const strengthConfig = {
      weak: { bars: 1, color: "text-destructive" },
      fair: { bars: 2, color: "text-warning" },
      good: { bars: 3, color: "text-success" },
      excellent: { bars: 4, color: "text-success" },
    }

    const config = strengthConfig[strength]
    const iconSize = {
      sm: "w-4 h-4",
      default: "w-5 h-5",
      lg: "w-6 h-6",
    }[size]

    return (
      <div className={cn("flex items-center gap-2", className)} ref={ref} {...props}>
        <IconComponent 
          className={cn(
            iconSize,
            connected ? config.color : "text-muted-foreground"
          )} 
        />
        {showLabel && (
          <span className="text-sm font-medium">
            {connected ? `${strength.charAt(0).toUpperCase() + strength.slice(1)} Signal` : "Disconnected"}
          </span>
        )}
      </div>
    )
  }
)
ConnectionStatus.displayName = "ConnectionStatus"

// System Status Grid Component
export interface SystemStatusGridProps extends React.HTMLAttributes<HTMLDivElement> {
  systems: Array<{
    name: string
    status: "online" | "offline" | "warning" | "error"
    health?: number
    lastUpdate?: string
  }>
  columns?: 2 | 3 | 4
}

const SystemStatusGrid = React.forwardRef<HTMLDivElement, SystemStatusGridProps>(
  ({ className, systems, columns = 3, ...props }, ref) => {
    const gridClass = {
      2: "grid-cols-2",
      3: "grid-cols-3", 
      4: "grid-cols-4",
    }[columns]

    return (
      <div className={cn("grid gap-4", gridClass, className)} ref={ref} {...props}>
        {systems.map((system, index) => (
          <div key={index} className="glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
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
          </div>
        ))}
      </div>
    )
  }
)
SystemStatusGrid.displayName = "SystemStatusGrid"

export {
  StatusBadge,
  LiveIndicator,
  HealthIndicator,
  ConnectionStatus,
  SystemStatusGrid,
  statusBadgeVariants,
}