import * as React from "react"
import { cn } from "@/lib/utils"

// Haptic Feedback Hook
export function useHapticFeedback() {
  const triggerHaptic = React.useCallback((pattern: "light" | "medium" | "heavy" | "selection" | "impact" = "light") => {
    if (!navigator.vibrate) return

    const patterns = {
      light: [10],
      medium: [20], 
      heavy: [30],
      selection: [5, 5, 5],
      impact: [10, 20, 10]
    }

    navigator.vibrate(patterns[pattern])
  }, [])

  return { triggerHaptic }
}

// Magnetic Button Component
export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  magneticStrength?: number
  hapticFeedback?: boolean
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ className, children, magneticStrength = 0.3, hapticFeedback = true, ...props }, ref) => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = React.useState(false)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const { triggerHaptic } = useHapticFeedback()

    React.useImperativeHandle(ref, () => buttonRef.current!, [])

    const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
      if (!buttonRef.current) return

      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = (e.clientX - centerX) * magneticStrength
      const deltaY = (e.clientY - centerY) * magneticStrength

      setPosition({ x: deltaX, y: deltaY })
    }, [magneticStrength])

    const handleMouseEnter = React.useCallback(() => {
      setIsHovering(true)
      if (hapticFeedback) triggerHaptic("light")
    }, [hapticFeedback, triggerHaptic])

    const handleMouseLeave = React.useCallback(() => {
      setIsHovering(false)
      setPosition({ x: 0, y: 0 })
    }, [])

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) triggerHaptic("selection")
      props.onClick?.(e)
    }, [hapticFeedback, triggerHaptic, props])

    return (
      <button
        ref={buttonRef}
        className={cn(
          "glass-card px-6 py-3 font-medium transition-all duration-300 ease-out relative",
          "hover:glow-primary active:scale-95",
          className
        )}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${isHovering ? 1.05 : 1})`,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
MagneticButton.displayName = "MagneticButton"

// Tilt Card Component
export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  maxTilt?: number
  perspective?: number
  speed?: number
  glareEffect?: boolean
}

export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
  ({ className, children, maxTilt = 15, perspective = 1000, speed = 300, glareEffect = true, ...props }, ref) => {
    const [tilt, setTilt] = React.useState({ x: 0, y: 0 })
    const [glarePosition, setGlarePosition] = React.useState({ x: 50, y: 50 })
    const cardRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => cardRef.current!, [])

    const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * maxTilt
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt

      setTilt({ x: -rotateX, y: rotateY })

      if (glareEffect) {
        const glareX = ((e.clientX - rect.left) / rect.width) * 100
        const glareY = ((e.clientY - rect.top) / rect.height) * 100
        setGlarePosition({ x: glareX, y: glareY })
      }
    }, [maxTilt, glareEffect])

    const handleMouseLeave = React.useCallback(() => {
      setTilt({ x: 0, y: 0 })
      setGlarePosition({ x: 50, y: 50 })
    }, [])

    return (
      <div
        ref={cardRef}
        className={cn("relative group", className)}
        style={{
          perspective: `${perspective}px`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div
          className="w-full h-full transition-transform ease-out relative"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transitionDuration: `${speed}ms`,
          }}
        >
          {children}
          
          {/* Glare Effect */}
          {glareEffect && (
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.8) 0%, transparent 50%)`,
                borderRadius: "inherit",
              }}
            />
          )}
        </div>
      </div>
    )
  }
)
TiltCard.displayName = "TiltCard"

// Morphing Icon Component
export interface MorphingIconProps extends React.HTMLAttributes<HTMLDivElement> {
  fromIcon: React.ReactNode
  toIcon: React.ReactNode
  trigger?: "hover" | "click" | "focus"
  duration?: number
}

export const MorphingIcon = React.forwardRef<HTMLDivElement, MorphingIconProps>(
  ({ className, fromIcon, toIcon, trigger = "hover", duration = 300, ...props }, ref) => {
    const [isMorphed, setIsMorphed] = React.useState(false)

    const handleTrigger = React.useCallback(() => {
      if (trigger === "click") {
        setIsMorphed(prev => !prev)
      } else {
        setIsMorphed(true)
      }
    }, [trigger])

    const handleReset = React.useCallback(() => {
      if (trigger !== "click") {
        setIsMorphed(false)
      }
    }, [trigger])

    return (
      <div
        ref={ref}
        className={cn("relative inline-block cursor-pointer", className)}
        onMouseEnter={trigger === "hover" ? handleTrigger : undefined}
        onMouseLeave={trigger === "hover" ? handleReset : undefined}
        onClick={trigger === "click" ? handleTrigger : undefined}
        onFocus={trigger === "focus" ? handleTrigger : undefined}
        onBlur={trigger === "focus" ? handleReset : undefined}
        {...props}
      >
        <div
          className="transition-all ease-in-out"
          style={{
            transform: `scale(${isMorphed ? 0 : 1}) rotate(${isMorphed ? 180 : 0}deg)`,
            opacity: isMorphed ? 0 : 1,
            transitionDuration: `${duration / 2}ms`,
          }}
        >
          {fromIcon}
        </div>
        <div
          className="absolute inset-0 transition-all ease-in-out"
          style={{
            transform: `scale(${isMorphed ? 1 : 0}) rotate(${isMorphed ? 0 : -180}deg)`,
            opacity: isMorphed ? 1 : 0,
            transitionDuration: `${duration / 2}ms`,
            transitionDelay: `${duration / 2}ms`,
          }}
        >
          {toIcon}
        </div>
      </div>
    )
  }
)
MorphingIcon.displayName = "MorphingIcon"

// Floating Action Button with Micro-interactions
export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label?: string
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  hapticFeedback?: boolean
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, icon, label, position = "bottom-right", hapticFeedback = true, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])
    const { triggerHaptic } = useHapticFeedback()

    const positionClasses = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "top-right": "top-6 right-6", 
      "top-left": "top-6 left-6"
    }[position]

    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback) triggerHaptic("impact")

      // Create ripple effect
      const rect = e.currentTarget.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const newRipple = { id: Date.now(), x, y }
      setRipples(prev => [...prev, newRipple])

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)

      props.onClick?.(e)
    }, [hapticFeedback, triggerHaptic, props])

    return (
      <div className={cn("fixed z-50", positionClasses)}>
        <button
          ref={ref}
          className={cn(
            "w-14 h-14 rounded-full glass-card shadow-elevated",
            "flex items-center justify-center relative overflow-hidden",
            "hover:scale-110 hover:glow-primary active:scale-95",
            "transition-all duration-300 group",
            className
          )}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onClick={handleClick}
          {...props}
        >
          {/* Icon */}
          <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>

          {/* Ripple Effects */}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: '100px',
                height: '100px',
                animationDuration: '600ms',
              }}
            />
          ))}

          {/* Background Pulse */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Label */}
        {label && (
          <div
            className={cn(
              "absolute whitespace-nowrap glass-card px-3 py-2 text-sm font-medium",
              "transition-all duration-300 pointer-events-none",
              position.includes("right") ? "right-full mr-3 top-1/2 -translate-y-1/2" : "left-full ml-3 top-1/2 -translate-y-1/2",
              isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
            )}
          >
            {label}
          </div>
        )}
      </div>
    )
  }
)
FloatingActionButton.displayName = "FloatingActionButton"

// Progressive Disclosure Component
export interface ProgressiveDisclosureProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode
  content: React.ReactNode
  direction?: "down" | "up" | "left" | "right"
  delay?: number
}

export const ProgressiveDisclosure = React.forwardRef<HTMLDivElement, ProgressiveDisclosureProps>(
  ({ className, trigger, content, direction = "down", delay = 200, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [shouldRender, setShouldRender] = React.useState(false)
    const timeoutRef = React.useRef<NodeJS.Timeout>()

    const handleExpand = React.useCallback(() => {
      clearTimeout(timeoutRef.current)
      setShouldRender(true)
      timeoutRef.current = setTimeout(() => setIsExpanded(true), 10)
    }, [])

    const handleCollapse = React.useCallback(() => {
      clearTimeout(timeoutRef.current)
      setIsExpanded(false)
      timeoutRef.current = setTimeout(() => setShouldRender(false), delay)
    }, [delay])

    const transformClasses = {
      down: isExpanded ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.95)",
      up: isExpanded ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
      left: isExpanded ? "translateX(0) scale(1)" : "translateX(10px) scale(0.95)",
      right: isExpanded ? "translateX(0) scale(1)" : "translateX(-10px) scale(0.95)"
    }[direction]

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        onMouseEnter={handleExpand}
        onMouseLeave={handleCollapse}
        {...props}
      >
        {trigger}
        
        {shouldRender && (
          <div
            className="absolute z-50 transition-all duration-200 ease-out"
            style={{
              transform: transformClasses,
              opacity: isExpanded ? 1 : 0,
            }}
          >
            {content}
          </div>
        )}
      </div>
    )
  }
)
ProgressiveDisclosure.displayName = "ProgressiveDisclosure"

// Smart Tooltip with Micro-interactions
export interface SmartTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  delay?: number
  interactive?: boolean
}

export const SmartTooltip = React.forwardRef<HTMLDivElement, SmartTooltipProps>(
  ({ children, content, side = "top", delay = 300, interactive = false }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [position, setPosition] = React.useState({ x: 0, y: 0 })
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const timeoutRef = React.useRef<NodeJS.Timeout>()

    const showTooltip = React.useCallback(() => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
    }, [delay])

    const hideTooltip = React.useCallback(() => {
      clearTimeout(timeoutRef.current)
      setIsVisible(false)
    }, [])

    React.useEffect(() => {
      if (isVisible && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const scrollX = window.pageXOffset
        const scrollY = window.pageYOffset

        let x = rect.left + scrollX + rect.width / 2
        let y = rect.top + scrollY

        switch (side) {
          case "top":
            y -= 10
            break
          case "bottom":
            y += rect.height + 10
            break
          case "left":
            x = rect.left + scrollX - 10
            y += rect.height / 2
            break
          case "right":
            x = rect.right + scrollX + 10
            y += rect.height / 2
            break
        }

        setPosition({ x, y })
      }
    }, [isVisible, side])

    return (
      <>
        <div
          ref={triggerRef}
          onMouseEnter={showTooltip}
          onMouseLeave={interactive ? undefined : hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
        >
          {children}
        </div>

        {isVisible && (
          <div
            className="fixed z-50 glass-card px-3 py-2 text-sm font-medium animate-scale-in"
            style={{
              left: position.x,
              top: position.y,
              transform: side === "top" || side === "bottom" ? "translateX(-50%)" : "translateY(-50%)",
            }}
            onMouseEnter={interactive ? showTooltip : undefined}
            onMouseLeave={interactive ? hideTooltip : undefined}
          >
            {content}
          </div>
        )}
      </>
    )
  }
)
SmartTooltip.displayName = "SmartTooltip"