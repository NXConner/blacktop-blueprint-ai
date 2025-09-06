import React from 'react';
import { WifiOff } from 'lucide-react';
import ResponsiveContainer from '@/components/ui/responsive-container';

export default function Offline() {
  return (
    <div className="min-h-screen overflow-x-safe animate-fade-in">
      <ResponsiveContainer size="md" className="py-10">
        <div className="glass-elevated p-8 rounded-xl text-center">
          <div className="mx-auto h-14 w-14 rounded-full flex items-center justify-center bg-warning/20 mb-4">
            <WifiOff className="h-7 w-7 text-warning" />
          </div>
          <h1 className="text-2xl font-bold mb-2">You are offline</h1>
          <p className="text-muted-foreground mb-6">Some content may be unavailable. We'll reconnect automatically when your network is back.</p>
          <div className="text-sm text-muted-foreground">Tip: Install the app to use more features without a connection.</div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}

