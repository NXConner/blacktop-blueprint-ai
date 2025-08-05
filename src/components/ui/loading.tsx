import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-lg text-muted-foreground">Loading system...</p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
        </div>
      </div>
    </div>
  );
}

export function ComponentLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="glass-card p-8 rounded-xl border border-glass-border">
      <Loading text={text} className="justify-center" />
    </div>
  );
}