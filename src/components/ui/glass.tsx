import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Glass Card Variants
const glassCardVariants = cva(
  "glass-card transition-all duration-300 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "glass-card",
        elevated: "glass-elevated",
        intense: "glass-intense",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        none: "",
        soft: "hover:glow-soft",
        primary: "hover:glow-primary",
        accent: "hover:glow-accent",
        lift: "hover:shadow-elevated hover:-translate-y-1",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "soft",
      rounded: "default",
    },
  }
)

// Glass Button Variants
const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium font-mono transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "glass-card hover:glow-primary hover:scale-105",
        primary: "glass-card bg-gradient-primary text-primary-foreground hover:glow-primary hover:scale-105",
        accent: "glass-card border border-accent text-accent hover:glow-accent hover:scale-105",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground hover:scale-105",
        floating: "glass-elevated shadow-elevated hover:shadow-intense hover:scale-105 hover:-translate-y-1 animate-float",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-12 text-lg",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Glass Card Component
export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean
  animated?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, hover, rounded, asChild = false, animated = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        className={cn(
          glassCardVariants({ variant, padding, hover, rounded, className }),
          animated && "animate-scale-in"
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

// Glass Button Component
export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
  withRipple?: boolean
  withGlow?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, withRipple = true, withGlow = true, onClick, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const [ripples, setRipples] = React.useState<Array<{id: number, x: number, y: number}>>([])

    // Combine refs
    React.useImperativeHandle(ref, () => buttonRef.current!, [])

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!withRipple || !buttonRef.current) return

      const button = buttonRef.current
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const newRipple = {
        id: Date.now(),
        x,
        y,
      }

      setRipples(prev => [...prev, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event)
      
      // Add press animation
      if (buttonRef.current) {
        buttonRef.current.style.transform = 'scale(0.98)'
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.transform = ''
          }
        }, 100)
      }

      onClick?.(event)
    }

    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={buttonRef}
        onClick={handleClick}
        {...props}
      >
        {props.children}
        
        {/* Ripple Effects */}
        {withRipple && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '100px',
              height: '100px',
              animationDuration: '600ms',
              animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ))}
        
        {/* Glow Effect */}
        {withGlow && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out opacity-0 hover:opacity-100" />
        )}
      </Comp>
    )
  }
)
GlassButton.displayName = "GlassButton"

// Glass Container for wrapping content
export interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "primary" | "accent" | "soft" | "none"
  blur?: "sm" | "default" | "lg"
  animated?: boolean
}

const GlassContainer = React.forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ className, glow = "none", blur = "default", animated = false, ...props }, ref) => {
    const glowClass = {
      primary: "glow-primary",
      accent: "glow-accent", 
      soft: "glow-soft",
      none: "",
    }[glow]

    const blurClass = {
      sm: "backdrop-blur-sm",
      default: "backdrop-blur-md",
      lg: "backdrop-blur-lg",
    }[blur]

    return (
      <div
        className={cn(
          "glass-card",
          blurClass,
          glowClass,
          animated && "animate-fade-in",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassContainer.displayName = "GlassContainer"

export { GlassCard, GlassButton, GlassContainer, glassCardVariants, glassButtonVariants }