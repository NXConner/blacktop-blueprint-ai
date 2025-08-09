import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Theme, ThemeContextType, Wallpaper } from '@/types/theme';
import { themes } from '@/lib/themes';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedThemeId = localStorage.getItem('theme-id');
    return themes.find(theme => theme.id === savedThemeId) || themes.find(theme => theme.id === 'default')!;
  });

  const [currentWallpaper, setCurrentWallpaper] = useState<Wallpaper | null>(() => {
    const savedWallpaper = localStorage.getItem('theme-wallpaper');
    return savedWallpaper ? JSON.parse(savedWallpaper) : null;
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const stored = localStorage.getItem('reduced-motion');
    if (stored !== null) return stored === 'true';
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(media.matches);
    if (!localStorage.getItem('reduced-motion')) {
      media.addEventListener?.('change', onChange);
    }
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('motion-reduce', reducedMotion);
    localStorage.setItem('reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  const applyWallpaper = useCallback((wallpaper: Wallpaper) => {
    const root = document.documentElement;
    
    switch (wallpaper.type) {
      case 'gradient':
        const gradientValue = getWallpaperGradient(wallpaper.url);
        root.style.setProperty('--wallpaper-background', gradientValue);
        console.log(`Applied gradient wallpaper "${wallpaper.name}":`, gradientValue);
        break;
      case 'pattern':
        const patternValue = `url('/wallpapers/${wallpaper.url}.svg'), ${currentTheme.gradients.background}`;
        root.style.setProperty('--wallpaper-background', patternValue);
        console.log(`Applied pattern wallpaper "${wallpaper.name}":`, patternValue);
        break;
      case 'image':
        // Try SVG first, fallback to JPG, then to gradient
        const imageValue = `url('/wallpapers/${wallpaper.url}.svg'), url('/wallpapers/${wallpaper.url}.jpg'), ${currentTheme.gradients.background}`;
        root.style.setProperty('--wallpaper-background', imageValue);
        console.log(`Applied image wallpaper "${wallpaper.name}":`, imageValue);
        break;
    }
  }, [currentTheme.gradients.background]);

  const getWallpaperGradient = (wallpaperUrl: string): string => {
    const gradients: Record<string, string> = {
      'pure-black': 'linear-gradient(0deg, hsl(0 0% 2%), hsl(0 0% 4%))',
      'void': 'radial-gradient(circle at 50% 50%, hsl(0 0% 6%) 0%, hsl(0 0% 2%) 100%)',
      'red-alert': 'linear-gradient(135deg, hsl(0 80% 8%), hsl(0 60% 15%), hsl(0 80% 8%))',
      'sunset-gradient': 'linear-gradient(135deg, hsl(15 100% 70%), hsl(35 100% 60%), hsl(320 60% 70%))',
      'northern-lights': 'linear-gradient(135deg, hsl(220 30% 8%), hsl(160 100% 25%), hsl(280 100% 25%), hsl(220 30% 8%))',
      'neon-pulse': 'linear-gradient(45deg, hsl(300 100% 20%), hsl(200 100% 25%), hsl(300 100% 20%))',
      'cyber-grid': 'linear-gradient(90deg, hsl(120 100% 5%), hsl(180 100% 8%), hsl(120 100% 5%))',
      'deep-space': 'radial-gradient(ellipse at center, hsl(240 100% 5%) 0%, hsl(0 0% 1%) 100%)',
      'arctic-wind': 'linear-gradient(135deg, hsl(210 50% 98%), hsl(180 100% 90%), hsl(210 100% 85%))',
      'golden-hour': 'linear-gradient(135deg, hsl(35 100% 80%), hsl(15 100% 70%), hsl(320 60% 75%))',
      'warm-waves': 'linear-gradient(45deg, hsl(35 100% 75%), hsl(15 100% 65%), hsl(35 100% 85%))',
      'cosmic-dance': 'radial-gradient(circle at 30% 70%, hsl(160 100% 50%) 0%, hsl(280 100% 70%) 50%, hsl(220 30% 8%) 100%)',
    };
    return gradients[wallpaperUrl] || currentTheme.gradients.background;
  };

  // Apply theme colors to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply gradient variables
    Object.entries(theme.gradients).forEach(([key, value]) => {
      const cssVar = `--gradient-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply shadow variables
    Object.entries(theme.shadows).forEach(([key, value]) => {
      const cssVar = `--shadow-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      if (key.startsWith('glow')) {
        const glowVar = `--glow-${key.replace('glow', '').toLowerCase()}`;
        root.style.setProperty(glowVar, value);
      } else {
        root.style.setProperty(cssVar, value);
      }
    });

    // Apply dark mode class
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply wallpaper if selected
    if (currentWallpaper) {
      applyWallpaper(currentWallpaper);
    } else {
      // Use theme's default background gradient
      root.style.setProperty('--wallpaper-background', theme.gradients.background);
      console.log(`Using theme default background:`, theme.gradients.background);
    }

    // Save to localStorage
    localStorage.setItem('theme-id', theme.id);
  }, [currentTheme, currentWallpaper, applyWallpaper]);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      // Reset wallpaper when changing themes
      setCurrentWallpaper(null);
      localStorage.removeItem('theme-wallpaper');
    }
  };

  const setWallpaper = (wallpaper: Wallpaper | null) => {
    setCurrentWallpaper(wallpaper);
    if (wallpaper) {
      localStorage.setItem('theme-wallpaper', JSON.stringify(wallpaper));
      console.log('Wallpaper saved:', wallpaper);
    } else {
      localStorage.removeItem('theme-wallpaper');
      console.log('Wallpaper cleared');
    }
  };

  const toggleDarkMode = () => {
    // Find the light/dark variant of current theme or fallback to default
    const oppositeMode = !currentTheme.isDark;
    const alternativeTheme = themes.find(t => 
      t.id !== currentTheme.id && t.isDark === oppositeMode
    ) || themes.find(t => t.id === 'default')!;
    
    setCurrentTheme(alternativeTheme);
  };

  const value: ThemeContextType = {
    currentTheme,
    currentWallpaper,
    availableThemes: themes,
    setTheme,
    setWallpaper,
    toggleDarkMode,
    reducedMotion,
    setReducedMotion,
  } as ThemeContextType;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}