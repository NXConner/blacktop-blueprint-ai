import * as React from 'react';
import { Loader2, Download, Upload, RefreshCw } from 'lucide-react';
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '@/lib/utils';

// Loading Variants
const loadingVariants = cva(
  "flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "",
        glass: "glass-card p-6 rounded-xl",
        minimal: "",
        page: "min-h-[60vh]",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Enhanced Loading Props
interface LoadingProps extends VariantProps<typeof loadingVariants> {
  text?: string;
  className?: string;
  progress?: number;
  showProgress?: boolean;
  icon?: "spinner" | "download" | "upload" | "refresh";
}

export function Loading({ 
  variant, 
  size = 'md', 
  text, 
  className, 
  progress, 
  showProgress = false,
  icon = "spinner"
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const IconComponent = {
    spinner: Loader2,
    download: Download,
    upload: Upload,
    refresh: RefreshCw,
  }[icon];

  return (
    <div className={cn(loadingVariants({ variant, className }))}>
      <div className="text-center space-y-4">
        <IconComponent className={cn('animate-spin text-primary', sizeClasses[size!])} />
        
        {text && (
          <p className={cn("text-muted-foreground", textSizeClasses[size!])}>
            {text}
          </p>
        )}
        
        {showProgress && progress !== undefined && (
          <div className="w-48 mx-auto">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
        </div>
      </div>
    </div>
  );
}

// Enhanced Page Loading
export function PageLoading({ 
  text = "Loading system...",
  subtitle = "Please wait while we prepare your dashboard"
}: { 
  text?: string;
  subtitle?: string;
}) {
  return (
    <Loading 
      variant="page" 
      size="xl" 
      text={text}
      className="flex-col"
    >
      <div className="text-center space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <p className="text-xl text-muted-foreground">{text}</p>
          <p className="text-sm text-muted-foreground/80">{subtitle}</p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-75" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-150" />
        </div>
      </div>
    </Loading>
  );
}

// Component Loading with Glass Effect
export function ComponentLoading({ 
  text = "Loading...",
  size = "md",
  showSkeleton = false
}: { 
  text?: string;
  size?: "sm" | "md" | "lg";
  showSkeleton?: boolean;
}) {
  if (showSkeleton) {
    return <SkeletonLoader rows={3} />
  }

  return (
    <Loading 
      variant="glass" 
      size={size} 
      text={text}
    />
  );
}

// Skeleton Loader Component
interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
  variant?: "default" | "card" | "text" | "circle";
}

export function SkeletonLoader({ 
  rows = 3, 
  className, 
  variant = "default" 
}: SkeletonLoaderProps) {
  if (variant === "card") {
    return (
      <div className={cn("glass-card p-6 space-y-4", className)}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div className={cn("w-12 h-12 bg-muted rounded-full animate-pulse", className)} />
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i}
            className="h-3 bg-muted rounded animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div 
            className="h-3 bg-muted rounded animate-pulse"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// Progress Ring Component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  className,
  showLabel = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
      )}
    </div>
  );
}

// Loading Button Component
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({ 
  loading = false, 
  loadingText = "Loading...", 
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "glass-card px-6 py-3 font-medium transition-all duration-300",
        "hover:glow-primary disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </div>
      ) : children}
    </button>
  );
}