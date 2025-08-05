import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass"
import { StatusBadge } from "@/components/ui/status"
import { ArrowLeft, MoreVertical } from "lucide-react"

// Page Header Variants
const pageHeaderVariants = cva(
  "flex flex-col gap-4 mb-8",
  {
    variants: {
      variant: {
        default: "",
        compact: "mb-6",
        minimal: "mb-4",
      },
      alignment: {
        left: "",
        center: "text-center items-center",
        right: "text-right items-end",
      },
    },
    defaultVariants: {
      variant: "default",
      alignment: "left",
    },
  }
)

// Page Header Component
export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
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
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    className, 
    variant, 
    alignment, 
    title, 
    subtitle, 
    badge, 
    status, 
    actions, 
    backButton,
    breadcrumbs,
    ...props 
  }, ref) => {
    return (
      <div className={cn(pageHeaderVariants({ variant, alignment, className }))} ref={ref} {...props}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {crumb.href || crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Main Header Content */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {/* Back Button */}
            {backButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={backButton.onClick}
                className="shrink-0 mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}

            {/* Title and Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-bold text-glow-primary">{title}</h1>
                {badge && (
                  <Badge variant={badge.variant}>{badge.text}</Badge>
                )}
                {status && (
                  <StatusBadge status={status.type} variant="glass">
                    {status.text}
                  </StatusBadge>
                )}
              </div>
              {subtitle && (
                <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

// Metric Card Variants
const metricCardVariants = cva(
  "glass-card p-6 transition-all duration-300",
  {
    variants: {
      hover: {
        none: "",
        lift: "hover:shadow-elevated hover:-translate-y-1",
        glow: "hover:glow-primary",
        scale: "hover:scale-105",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      hover: "glow",
      size: "default",
    },
  }
)

// Metric Card Component
export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
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
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    hover, 
    size, 
    title, 
    value, 
    subtitle, 
    icon, 
    trend, 
    status, 
    loading = false,
    ...props 
  }, ref) => {
    const trendColor = trend ? {
      up: "text-success",
      down: "text-destructive", 
      neutral: "text-muted-foreground",
    }[trend.direction] : ""

    return (
      <div className={cn(metricCardVariants({ hover, size, className }))} ref={ref} {...props}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {status && (
            <StatusBadge status={status} size="sm" />
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          {loading ? (
            <div className="h-8 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold">{value}</p>
          )}
        </div>

        {/* Trend */}
        {trend && (
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            <span className="font-medium">
              {trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "→"}
              {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)
MetricCard.displayName = "MetricCard"

// Section Container Component
export interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  headerActions?: React.ReactNode
  contentClassName?: string
}

const SectionContainer = React.forwardRef<HTMLDivElement, SectionContainerProps>(
  ({ className, title, subtitle, headerActions, contentClassName, children, ...props }, ref) => {
    return (
      <section className={cn("space-y-6", className)} ref={ref} {...props}>
        {(title || subtitle || headerActions) && (
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-glow-accent">{title}</h2>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        )}
        <div className={cn(contentClassName)}>
          {children}
        </div>
      </section>
    )
  }
)
SectionContainer.displayName = "SectionContainer"

// Grid Container Variants
const gridContainerVariants = cva(
  "grid gap-6",
  {
    variants: {
      columns: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        auto: "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]",
      },
      gap: {
        none: "gap-0",
        sm: "gap-3",
        default: "gap-6",
        lg: "gap-8",
        xl: "gap-12",
      },
    },
    defaultVariants: {
      columns: "auto",
      gap: "default",
    },
  }
)

// Grid Container Component
export interface GridContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridContainerVariants> {}

const GridContainer = React.forwardRef<HTMLDivElement, GridContainerProps>(
  ({ className, columns, gap, ...props }, ref) => {
    return (
      <div
        className={cn(gridContainerVariants({ columns, gap, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GridContainer.displayName = "GridContainer"

// Content Container for consistent max-width and padding
export interface ContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "default" | "lg"
}

const ContentContainer = React.forwardRef<HTMLDivElement, ContentContainerProps>(
  ({ className, maxWidth = "full", padding = "default", ...props }, ref) => {
    const maxWidthClass = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full",
    }[maxWidth]

    const paddingClass = {
      none: "",
      sm: "px-4 py-4",
      default: "px-6 py-6",
      lg: "px-8 py-8",
    }[padding]

    return (
      <div
        className={cn("mx-auto", maxWidthClass, paddingClass, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
ContentContainer.displayName = "ContentContainer"

// Sidebar Layout Component
export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode
  sidebarWidth?: "sm" | "default" | "lg"
  sidebarPosition?: "left" | "right"
  children: React.ReactNode
}

const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ className, sidebar, sidebarWidth = "default", sidebarPosition = "left", children, ...props }, ref) => {
    const widthClass = {
      sm: "w-64",
      default: "w-80",
      lg: "w-96",
    }[sidebarWidth]

    return (
      <div className={cn("flex gap-6", className)} ref={ref} {...props}>
        {sidebarPosition === "left" && (
          <aside className={cn("shrink-0", widthClass)}>
            {sidebar}
          </aside>
        )}
        <main className="flex-1 min-w-0">
          {children}
        </main>
        {sidebarPosition === "right" && (
          <aside className={cn("shrink-0", widthClass)}>
            {sidebar}
          </aside>
        )}
      </div>
    )
  }
)
SidebarLayout.displayName = "SidebarLayout"

export {
  PageHeader,
  MetricCard,
  SectionContainer,
  GridContainer,
  ContentContainer,
  SidebarLayout,
  pageHeaderVariants,
  metricCardVariants,
  gridContainerVariants,
}