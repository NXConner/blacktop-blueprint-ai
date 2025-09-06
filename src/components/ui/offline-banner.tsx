import React from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineBanner({ className }: { className?: string }) {
  const [offline, setOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className={cn('fixed bottom-4 left-1/2 -translate-x-1/2 z-50', className)}>
      <div className="glass-elevated border border-warning/30 rounded-lg px-4 py-2 flex items-center gap-2 animate-slide-up">
        <WifiOff className="h-4 w-4 text-warning" />
        <span className="text-sm">You are offline. Some features may be unavailable.</span>
      </div>
    </div>
  );
}

export default OfflineBanner;

