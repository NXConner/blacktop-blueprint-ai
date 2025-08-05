import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Typography Scale Variants
const typographyVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      variant: {
        default: "text-foreground",
        holographic: "text-holographic",
        glow: "text-glow-primary",
        accent: "text-glow-accent",
        gradient: "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
        neon: "text-primary drop-shadow-[0_0_10px_currentColor]",
        matrix: "text-success font-mono tracking-wider",
        ethereal: "text-primary/80 backdrop-blur-sm",
      },
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl",
        "5xl": "text-5xl",
        "6xl": "text-6xl",
        "7xl": "text-7xl",
        "8xl": "text-8xl",
        "9xl": "text-9xl",
      },
      weight: {
        thin: "font-thin",
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
        extrabold: "font-extrabold",
        black: "font-black",
        dynamic: "font-variable",
      },
      animation: {
        none: "",
        typing: "animate-typing",
        glow: "animate-glow",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        reveal: "animate-text-reveal",
        glitch: "animate-glitch",
        shimmer: "animate-text-shimmer",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "base",
      weight: "normal",
      animation: "none",
    },
  }
)

// Enhanced Typography Component
export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"
  responsive?: boolean
  stagger?: boolean
  children: React.ReactNode
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, size, weight, animation, as = "p", responsive = false, stagger = false, children, ...props }, ref) => {
    const Component = as

    const responsiveClasses = responsive ? {
      h1: "text-2xl md:text-4xl lg:text-6xl",
      h2: "text-xl md:text-3xl lg:text-5xl",
      h3: "text-lg md:text-2xl lg:text-4xl",
      h4: "text-base md:text-xl lg:text-3xl",
      h5: "text-sm md:text-lg lg:text-2xl",
      h6: "text-xs md:text-base lg:text-xl",
    }[as] : ""

    return (
      <Component
        className={cn(
          typographyVariants({ variant, size: responsive ? undefined : size, weight, animation }),
          responsive && responsiveClasses,
          stagger && "animate-stagger",
          className
        )}
        ref={ref as any}
        {...props}
      >
        {stagger ? (
          <StaggeredText>{children}</StaggeredText>
        ) : (
          children
        )}
      </Component>
    )
  }
)
Typography.displayName = "Typography"

// Staggered Text Animation
interface StaggeredTextProps {
  children: React.ReactNode
  delay?: number
}

const StaggeredText: React.FC<StaggeredTextProps> = ({ children, delay = 50 }) => {
  if (typeof children !== "string") {
    return <>{children}</>
  }

  const chars = children.split("")
  
  return (
    <>
      {chars.map((char, index) => (
        <span
          key={index}
          className="inline-block animate-scale-in"
          style={{
            animationDelay: `${index * delay}ms`,
            animationFillMode: "both",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  )
}

// Holographic Heading Component
export interface HolographicHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  intensity?: "subtle" | "medium" | "intense"
  animated?: boolean
  children: React.ReactNode
}

export const HolographicHeading = React.forwardRef<HTMLHeadingElement, HolographicHeadingProps>(
  ({ className, level = 1, intensity = "medium", animated = true, children, ...props }, ref) => {
    const Component = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    
    const intensityClasses = {
      subtle: "text-holographic opacity-80",
      medium: "text-holographic",
      intense: "text-holographic drop-shadow-[0_0_20px_currentColor]",
    }[intensity]

    const sizeClasses = {
      1: "text-4xl md:text-6xl lg:text-8xl",
      2: "text-3xl md:text-5xl lg:text-7xl",
      3: "text-2xl md:text-4xl lg:text-6xl",
      4: "text-xl md:text-3xl lg:text-5xl",
      5: "text-lg md:text-2xl lg:text-4xl",
      6: "text-base md:text-xl lg:text-3xl",
    }[level]

    return (
      <Component
        className={cn(
          "font-bold leading-tight tracking-tight",
          sizeClasses,
          intensityClasses,
          animated && "animate-gradient-shift",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
HolographicHeading.displayName = "HolographicHeading"

// Typewriter Effect Component
export interface TypewriterProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  speed?: number
  delay?: number
  showCursor?: boolean
  onComplete?: () => void
}

export const Typewriter = React.forwardRef<HTMLSpanElement, TypewriterProps>(
  ({ className, text, speed = 50, delay = 0, showCursor = true, onComplete, ...props }, ref) => {
    const [displayText, setDisplayText] = React.useState("")
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isComplete, setIsComplete] = React.useState(false)

    React.useEffect(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex])
          setCurrentIndex(prev => prev + 1)
        }, currentIndex === 0 ? delay : speed)

        return () => clearTimeout(timer)
      } else if (!isComplete) {
        setIsComplete(true)
        onComplete?.()
      }
    }, [currentIndex, text, speed, delay, isComplete, onComplete])

    return (
      <span className={cn("font-mono", className)} ref={ref} {...props}>
        {displayText}
        {showCursor && (
          <span className={cn("animate-pulse", isComplete ? "opacity-0" : "opacity-100")}>
            |
          </span>
        )}
      </span>
    )
  }
)
Typewriter.displayName = "Typewriter"

// Glitch Text Effect Component
export interface GlitchTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  intensity?: "subtle" | "medium" | "intense"
  color?: string
}

export const GlitchText = React.forwardRef<HTMLSpanElement, GlitchTextProps>(
  ({ className, children, intensity = "medium", color = "#FF0080", ...props }, ref) => {
    const [isGlitching, setIsGlitching] = React.useState(false)

    React.useEffect(() => {
      const glitchInterval = setInterval(() => {
        setIsGlitching(true)
        setTimeout(() => setIsGlitching(false), 200)
      }, intensity === "intense" ? 1000 : intensity === "medium" ? 2000 : 4000)

      return () => clearInterval(glitchInterval)
    }, [intensity])

    return (
      <span
        className={cn(
          "relative inline-block",
          isGlitching && "animate-glitch",
          className
        )}
        ref={ref}
        style={{
          "--glitch-color": color,
        } as React.CSSProperties}
        {...props}
      >
        {children}
        {isGlitching && (
          <>
            <span
              className="absolute top-0 left-0 animate-glitch-1"
              style={{ color }}
              aria-hidden="true"
            >
              {children}
            </span>
            <span
              className="absolute top-0 left-0 animate-glitch-2"
              style={{ color: "#00FFFF" }}
              aria-hidden="true"
            >
              {children}
            </span>
          </>
        )}
      </span>
    )
  }
)
GlitchText.displayName = "GlitchText"

// Matrix Rain Text Effect
export interface MatrixTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  density?: "low" | "medium" | "high"
  speed?: "slow" | "medium" | "fast"
}

export const MatrixText = React.forwardRef<HTMLDivElement, MatrixTextProps>(
  ({ className, text, density = "medium", speed = "medium", ...props }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    React.useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const characters = text.split("")
      const fontSize = 14
      const columns = Math.floor(canvas.width / fontSize)
      const drops: number[] = Array(columns).fill(1)

      const densityMap = { low: 0.005, medium: 0.01, high: 0.02 }
      const speedMap = { slow: 50, medium: 35, fast: 20 }

      const draw = () => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "#00FF00"
        ctx.font = `${fontSize}px monospace`

        for (let i = 0; i < drops.length; i++) {
          const char = characters[Math.floor(Math.random() * characters.length)]
          ctx.fillText(char, i * fontSize, drops[i] * fontSize)

          if (drops[i] * fontSize > canvas.height && Math.random() > 1 - densityMap[density]) {
            drops[i] = 0
          }
          drops[i]++
        }
      }

      const interval = setInterval(draw, speedMap[speed])
      return () => clearInterval(interval)
    }, [text, density, speed])

    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: "transparent" }}
        />
        <div className="relative z-10 p-4 text-center">
          <Typography variant="matrix" size="xl" weight="bold">
            {text}
          </Typography>
        </div>
      </div>
    )
  }
)
MatrixText.displayName = "MatrixText"

// Variable Font Weight Animation
export interface VariableFontProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  minWeight?: number
  maxWeight?: number
  duration?: number
  trigger?: "hover" | "auto" | "click"
}

export const VariableFont = React.forwardRef<HTMLSpanElement, VariableFontProps>(
  ({ className, children, minWeight = 100, maxWeight = 900, duration = 2, trigger = "hover", ...props }, ref) => {
    const [weight, setWeight] = React.useState(minWeight)
    const [isAnimating, setIsAnimating] = React.useState(false)

    const animate = React.useCallback(() => {
      if (isAnimating) return
      
      setIsAnimating(true)
      const steps = 60
      const stepDuration = (duration * 1000) / steps
      const weightStep = (maxWeight - minWeight) / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        const easeProgress = 0.5 * (1 + Math.sin(Math.PI * progress - Math.PI / 2))
        setWeight(minWeight + weightStep * steps * easeProgress)

        if (currentStep >= steps) {
          clearInterval(interval)
          setIsAnimating(false)
          setWeight(minWeight)
        }
      }, stepDuration)
    }, [minWeight, maxWeight, duration, isAnimating])

    React.useEffect(() => {
      if (trigger === "auto") {
        const autoInterval = setInterval(animate, (duration + 1) * 1000)
        return () => clearInterval(autoInterval)
      }
    }, [trigger, animate, duration])

    return (
      <span
        className={cn("transition-all", className)}
        ref={ref}
        style={{
          fontVariationSettings: `"wght" ${weight}`,
          fontWeight: weight,
        }}
        onMouseEnter={trigger === "hover" ? animate : undefined}
        onClick={trigger === "click" ? animate : undefined}
        {...props}
      >
        {children}
      </span>
    )
  }
)
VariableFont.displayName = "VariableFont"

// Text Reveal Animation
export interface TextRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: "up" | "down" | "left" | "right"
  stagger?: boolean
  delay?: number
}

export const TextReveal = React.forwardRef<HTMLDivElement, TextRevealProps>(
  ({ className, children, direction = "up", stagger = true, delay = 100, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const elementRef = React.useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => elementRef.current!, [])

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        },
        { threshold: 0.1 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [])

    const transformClass = {
      up: "translate-y-full",
      down: "-translate-y-full",
      left: "translate-x-full",
      right: "-translate-x-full",
    }[direction]

    if (typeof children === "string" && stagger) {
      const words = children.split(" ")
      return (
        <div className={cn("overflow-hidden", className)} ref={elementRef} {...props}>
          {words.map((word, index) => (
            <span
              key={index}
              className={cn(
                "inline-block transition-transform duration-700 ease-out",
                isVisible ? "translate-y-0" : transformClass
              )}
              style={{
                transitionDelay: isVisible ? `${index * delay}ms` : "0ms",
              }}
            >
              {word}&nbsp;
            </span>
          ))}
        </div>
      )
    }

    return (
      <div className={cn("overflow-hidden", className)} ref={elementRef} {...props}>
        <div
          className={cn(
            "transition-transform duration-700 ease-out",
            isVisible ? "translate-y-0" : transformClass
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
TextReveal.displayName = "TextReveal"