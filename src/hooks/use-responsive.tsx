import { useState, useEffect } from 'react';

// Breakpoint definitions
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  currentBreakpoint: Breakpoint;
  isBreakpoint: (bp: Breakpoint) => boolean;
  isAboveBreakpoint: (bp: Breakpoint) => boolean;
  isBelowBreakpoint: (bp: Breakpoint) => boolean;
}

export function useResponsive(): UseResponsiveReturn {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;

  // Device type detection
  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg && width < breakpoints.xl;
  const isLargeDesktop = width >= breakpoints.xl;

  // Orientation detection
  const orientation: 'portrait' | 'landscape' = height > width ? 'portrait' : 'landscape';

  // Current breakpoint detection
  const getCurrentBreakpoint = (): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const currentBreakpoint = getCurrentBreakpoint();

  // Utility functions
  const isBreakpoint = (bp: Breakpoint): boolean => currentBreakpoint === bp;
  const isAboveBreakpoint = (bp: Breakpoint): boolean => width >= breakpoints[bp];
  const isBelowBreakpoint = (bp: Breakpoint): boolean => width < breakpoints[bp];

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    width,
    height,
    orientation,
    currentBreakpoint,
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
  };
}

// Hook for checking if device is mobile (combines screen size and user agent)
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    };

    checkTouchDevice();
  }, []);

  return isMobile || isTouchDevice;
}

// Hook for PWA installation
export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
  };
}

// Hook for device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasCamera: false,
    hasGeolocation: false,
    hasAccelerometer: false,
    hasGyroscope: false,
    hasNotifications: false,
    hasBluetooth: false,
    hasNFC: false,
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      const newCapabilities = {
        hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        hasGeolocation: !!navigator.geolocation,
        hasAccelerometer: 'DeviceMotionEvent' in window,
        hasGyroscope: 'DeviceOrientationEvent' in window,
        hasNotifications: 'Notification' in window,
        hasBluetooth: 'bluetooth' in navigator,
        hasNFC: 'nfc' in navigator,
        isOnline: navigator.onLine,
      };

      setCapabilities(newCapabilities);
    };

    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    checkCapabilities();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return capabilities;
}