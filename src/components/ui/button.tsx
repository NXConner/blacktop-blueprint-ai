import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-mono transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-105 transition-all duration-300 btn-enhanced ripple",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 transition-all duration-300 ripple",
        outline:
          "border border-glass-border bg-gradient-glass backdrop-blur-lg hover:border-primary/50 hover:shadow-glass text-foreground hover:scale-102 transition-all duration-300 ripple",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 transition-all duration-300 ripple",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground hover:scale-105 transition-all duration-300 ripple",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 transition-all duration-300",
        command: "bg-gradient-glass backdrop-blur-lg border border-accent/30 text-accent hover:border-accent hover:shadow-glow-accent hover:scale-105 transition-all duration-300 btn-enhanced ripple",
        glow: "bg-gradient-primary text-primary-foreground shadow-glow-primary hover:shadow-glow-intense hover:scale-110 transition-all duration-300 animate-glow-pulse btn-enhanced ripple",
        neon: "bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground hover:shadow-glow-accent hover:scale-105 transition-all duration-300 animate-glow btn-enhanced ripple",
        floating: "bg-gradient-glass backdrop-blur-lg border border-primary/30 text-foreground shadow-elevated hover:shadow-intense hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-float ripple",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  withRipple?: boolean
  withSoundEffect?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, withRipple = true, withSoundEffect = false, onClick, ...props }, ref) => {
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

    const playClickSound = () => {
      if (!withSoundEffect) return
      
      // Create a subtle click sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (error) {
        // Silently fail if Web Audio API is not supported
      }
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event)
      playClickSound()
      
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
        className={cn(buttonVariants({ variant, size, className }))}
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
        
        {/* Shimmer Effect for Enhanced Buttons */}
        {(variant === "glow" || variant === "neon" || variant === "floating") && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
