export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  glass: string;
  glassBorder: string;
  primary: string;
  primaryForeground: string;
  primaryGlow: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  accentGlow: string;
  success: string;
  warning: string;
  destructive: string;
  info: string;
  muted: string;
  mutedForeground: string;
  popover: string;
  popoverForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeGradients {
  glass: string;
  primary: string;
  accent: string;
  hero: string;
  background: string;
}

export interface ThemeShadows {
  glass: string;
  elevated: string;
  glowPrimary: string;
  glowAccent: string;
}

export interface Wallpaper {
  name: string;
  url: string;
  preview: string;
  type: 'gradient' | 'image' | 'pattern';
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'industry' | 'custom' | 'default';
  colors: ThemeColors;
  gradients: ThemeGradients;
  shadows: ThemeShadows;
  wallpapers: Wallpaper[];
  isDark: boolean;
}

export interface ThemeContextType {
  currentTheme: Theme;
  currentWallpaper: Wallpaper | null;
  availableThemes: Theme[];
  setTheme: (themeId: string) => void;
  setWallpaper: (wallpaper: Wallpaper | null) => void;
  toggleDarkMode: () => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}