import React, { createContext, useContext, useEffect, useState } from 'react';
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
    }

    // Save to localStorage
    localStorage.setItem('theme-id', theme.id);
  }, [currentTheme, currentWallpaper]);

  const applyWallpaper = (wallpaper: Wallpaper) => {
    const root = document.documentElement;
    
    switch (wallpaper.type) {
      case 'gradient':
        root.style.setProperty('--wallpaper-background', getWallpaperGradient(wallpaper.url));
        break;
      case 'pattern':
        root.style.setProperty('--wallpaper-background', 
          `${currentTheme.gradients.background}, url('/wallpapers/${wallpaper.url}.svg')`);
        break;
      case 'image':
        root.style.setProperty('--wallpaper-background', 
          `${currentTheme.gradients.background}, url('/wallpapers/${wallpaper.url}.jpg')`);
        break;
    }
  };

  const getWallpaperGradient = (wallpaperUrl: string): string => {
    const gradients: Record<string, string> = {
      'pure-black': 'linear-gradient(0deg, hsl(0 0% 2%), hsl(0 0% 4%))',
      'void': 'radial-gradient(circle at 50% 50%, hsl(0 0% 6%) 0%, hsl(0 0% 2%) 100%)',
      'red-alert': 'linear-gradient(135deg, hsl(0 80% 8%), hsl(0 60% 15%), hsl(0 80% 8%))',
      'sunset-gradient': 'linear-gradient(135deg, hsl(15 100% 70%), hsl(35 100% 60%), hsl(320 60% 70%))',
      'northern-lights': 'linear-gradient(135deg, hsl(220 30% 8%), hsl(160 100% 25%), hsl(280 100% 25%), hsl(220 30% 8%))',
    };
    return gradients[wallpaperUrl] || currentTheme.gradients.background;
  };

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
    } else {
      localStorage.removeItem('theme-wallpaper');
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
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}