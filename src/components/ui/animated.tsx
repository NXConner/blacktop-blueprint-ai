import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Animation variants
const animatedVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      animation: {
        none: "",
        "fade-in": "animate-fade-in",
        "slide-up": "animate-slide-up",
        "slide-down": "animate-slide-down",
        "slide-left": "animate-slide-left",
        "slide-right": "animate-slide-right",
        "scale-in": "animate-scale-in",
        "bounce-in": "animate-bounce-in",
        float: "animate-float",
        glow: "animate-glow",
        "glow-pulse": "animate-glow-pulse",
        pulse: "animate-pulse",
        spin: "animate-spin",
        gradient: "animate-gradient",
      },
      delay: {
        none: "",
        "75": "delay-75",
        "100": "delay-100",
        "150": "delay-150",
        "200": "delay-200",
        "300": "delay-300",
        "500": "delay-500",
        "700": "delay-700",
        "1000": "delay-1000",
      },
      hover: {
        none: "",
        lift: "hover-lift",
        grow: "hover-grow",
        glow: "hover-glow",
        rotate: "hover-rotate",
      },
    },
    defaultVariants: {
      animation: "none",
      delay: "none",
      hover: "none",
    },
  }
)

// Animated Container Component
export interface AnimatedContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedVariants> {
  asChild?: boolean
  trigger?: "mount" | "hover" | "click" | "visible"
}

const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ className, animation, delay, hover, asChild = false, trigger = "mount", children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(trigger === "mount")
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Combine refs
    React.useImperativeHandle(ref, () => containerRef.current!, [])

    // Intersection Observer for visibility trigger
    React.useEffect(() => {
      if (trigger !== "visible" || !containerRef.current) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }, [trigger])

    const handleInteraction = React.useCallback(() => {
      if (trigger === "hover" || trigger === "click") {
        setIsVisible(true)
      }
    }, [trigger])

    const Comp = asChild ? Slot : "div"
    
    return (
      <Comp
        className={cn(
          animatedVariants({ 
            animation: isVisible ? animation : "none", 
            delay, 
            hover, 
            className 
          })
        )}
        ref={containerRef}
        onMouseEnter={trigger === "hover" ? handleInteraction : undefined}
        onClick={trigger === "click" ? handleInteraction : undefined}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
AnimatedContainer.displayName = "AnimatedContainer"

// Floating Element Component
export interface FloatingElementProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: "slow" | "normal" | "fast"
  intensity?: "subtle" | "normal" | "strong"
  asChild?: boolean
}

const FloatingElement = React.forwardRef<HTMLDivElement, FloatingElementProps>(
  ({ className, duration = "normal", intensity = "normal", asChild = false, ...props }, ref) => {
    const durationClass = {
      slow: "animate-float-slow",
      normal: "animate-float",
      fast: "duration-4000",
    }[duration]

    const intensityStyle = {
      subtle: { "--float-distance": "5px" },
      normal: { "--float-distance": "10px" },
      strong: { "--float-distance": "15px" },
    }[intensity] as React.CSSProperties

    const Comp = asChild ? Slot : "div"
    
    return (
      <Comp
        className={cn(durationClass, className)}
        style={intensityStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
FloatingElement.displayName = "FloatingElement"

// Pulsing Indicator Component
export interface PulsingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "primary" | "accent" | "success" | "warning" | "destructive" | "info"
  size?: "sm" | "default" | "lg"
  speed?: "slow" | "normal" | "fast"
  variant?: "dot" | "ring" | "filled"
}

const PulsingIndicator = React.forwardRef<HTMLDivElement, PulsingIndicatorProps>(
  ({ className, color = "primary", size = "default", speed = "normal", variant = "dot", ...props }, ref) => {
    const colorClass = {
      primary: "bg-primary",
      accent: "bg-accent",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      info: "bg-info",
    }[color]

    const sizeClass = {
      sm: "w-2 h-2",
      default: "w-3 h-3",
      lg: "w-4 h-4",
    }[size]

    const speedClass = {
      slow: "animate-pulse-slow",
      normal: "animate-pulse",
      fast: "animate-pulse duration-1000",
    }[speed]

    const variantClass = {
      dot: "rounded-full",
      ring: "rounded-full border-2 bg-transparent",
      filled: "rounded-full",
    }[variant]

    return (
      <div
        className={cn(
          colorClass,
          sizeClass,
          speedClass,
          variantClass,
          variant === "ring" && `border-${color}`,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
PulsingIndicator.displayName = "PulsingIndicator"

// Staggered Animation Container
export interface StaggeredContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerDelay?: number
  children: React.ReactNode
}

const StaggeredContainer = React.forwardRef<HTMLDivElement, StaggeredContainerProps>(
  ({ className, staggerDelay = 100, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)

    return (
      <div className={cn(className)} ref={ref} {...props}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className="animate-scale-in"
            style={{ animationDelay: `${index * staggerDelay}ms` }}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }
)
StaggeredContainer.displayName = "StaggeredContainer"

// Reveal on Scroll Component
export interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "up" | "down" | "left" | "right" | "scale"
  threshold?: number
  once?: boolean
  asChild?: boolean
}

const RevealOnScroll = React.forwardRef<HTMLDivElement, RevealOnScrollProps>(
  ({ className, direction = "up", threshold = 0.1, once = true, asChild = false, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const elementRef = React.useRef<HTMLDivElement>(null)

    // Combine refs
    React.useImperativeHandle(ref, () => elementRef.current!, [])

    React.useEffect(() => {
      if (!elementRef.current) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            setIsVisible(false)
          }
        },
        { threshold }
      )

      observer.observe(elementRef.current)
      return () => observer.disconnect()
    }, [threshold, once])

    const animationClass = {
      up: "animate-slide-up",
      down: "animate-slide-down", 
      left: "animate-slide-left",
      right: "animate-slide-right",
      scale: "animate-scale-in",
    }[direction]

    const Comp = asChild ? Slot : "div"
    
    return (
      <Comp
        className={cn(
          "transition-all duration-500",
          isVisible ? animationClass : "opacity-0 translate-y-4",
          className
        )}
        ref={elementRef}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
RevealOnScroll.displayName = "RevealOnScroll"

export { 
  AnimatedContainer, 
  FloatingElement, 
  PulsingIndicator, 
  StaggeredContainer,
  RevealOnScroll,
  animatedVariants 
}