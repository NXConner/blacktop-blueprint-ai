import React, { useState } from 'react';
import { Moon, Sun, Palette, Monitor, Wallpaper as WallpaperIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const { 
    currentTheme, 
    currentWallpaper, 
    availableThemes, 
    setTheme, 
    setWallpaper, 
    toggleDarkMode 
  } = useTheme();

  const industryThemes = availableThemes.filter(theme => theme.category === 'industry');
  const customThemes = availableThemes.filter(theme => theme.category === 'custom');
  const defaultThemes = availableThemes.filter(theme => theme.category === 'default');

  // Organize custom themes by subcategory
  const neonThemes = customThemes.filter(theme => theme.id.includes('neon'));
  const lightThemes = customThemes.filter(theme => !theme.isDark && !theme.id.includes('neon'));
  const natureThemes = customThemes.filter(theme => 
    theme.isDark && 
    !theme.id.includes('neon') && 
    (theme.id.includes('aurora') || theme.id.includes('ocean') || theme.id.includes('forest') || theme.id.includes('cosmic'))
  );

  const getThemeIcon = (themeId: string) => {
    const iconMap: Record<string, string> = {
      // Industry themes
      'tactical': '🪖',
      'operations': '🎮',
      'stealth': '🥷',
      'dark-ops': '🔴',
      'cybernetic-orange': '🤖',
      
      // Neon themes
      'neon-pink': '💖',
      'neon-blue': '💙',
      'neon-green': '💚',
      
      // Light themes
      'arctic-light': '🧊',
      'sunset-vibes': '🌅',
      'minimal-light': '🤍',
      
      // Nature/Space themes
      'aurora': '🌌',
      'ocean-depths': '🌊',
      'forest-canopy': '🌲',
      'cosmic-purple': '🪐',
      
      // Default
      'default': '🛣️',
    };
    return iconMap[themeId] || '🎨';
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: Record<string, string> = {
      'industry': '🏭',
      'neon': '⚡',
      'light': '☀️',
      'nature': '🌿',
      'default': '🛣️',
    };
    return categoryIcons[category] || '🎨';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="glass-card hover:glow-primary transition-all duration-300 animate-float"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="glass-elevated w-80 max-h-96 overflow-y-auto animate-slide-up"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4 animate-glow" />
          Theme Settings
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Quick Dark/Light Toggle */}
        <DropdownMenuItem 
          onClick={toggleDarkMode}
          className="flex items-center gap-2 hover:glow-primary transition-all duration-300"
        >
          {currentTheme.isDark ? (
            <>
              <Sun className="h-4 w-4" />
              Switch to Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Switch to Dark Mode
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Current Theme Info */}
        <div className="p-2">
          <Card className="glass-card p-3 animate-scale-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg animate-float">{getThemeIcon(currentTheme.id)}</span>
              <div>
                <p className="font-medium text-sm text-glow-primary">{currentTheme.name}</p>
                <p className="text-xs text-muted-foreground">{currentTheme.description}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs animate-scale-in delay-100">
                {currentTheme.category}
              </Badge>
              <Badge variant={currentTheme.isDark ? "default" : "outline"} className="text-xs animate-scale-in delay-200">
                {currentTheme.isDark ? "Dark" : "Light"}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Industry Themes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 hover:glow-primary transition-all duration-300">
            <span>{getCategoryIcon('industry')}</span>
            Industry Themes
            <Badge variant="outline" className="ml-auto text-xs">{industryThemes.length}</Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-64 animate-slide-up">
            {industryThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  currentTheme.id === theme.id && "bg-primary/20 glow-primary"
                )}
              >
                <span className="animate-float">{getThemeIcon(theme.id)}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{theme.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {theme.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Neon Themes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 hover:glow-accent transition-all duration-300">
            <span>{getCategoryIcon('neon')}</span>
            Neon Themes
            <Badge variant="outline" className="ml-auto text-xs">{neonThemes.length}</Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-64 animate-slide-up">
            {neonThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  currentTheme.id === theme.id && "bg-primary/20 glow-accent"
                )}
              >
                <span className="animate-glow">{getThemeIcon(theme.id)}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-glow-accent">{theme.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {theme.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Light Themes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 hover:glow-primary transition-all duration-300">
            <span>{getCategoryIcon('light')}</span>
            Light Themes
            <Badge variant="outline" className="ml-auto text-xs">{lightThemes.length}</Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-64 animate-slide-up">
            {lightThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  currentTheme.id === theme.id && "bg-primary/20 glow-primary"
                )}
              >
                <span className="animate-float">{getThemeIcon(theme.id)}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{theme.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {theme.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Nature & Space Themes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 hover:glow-primary transition-all duration-300">
            <span>{getCategoryIcon('nature')}</span>
            Nature & Space
            <Badge variant="outline" className="ml-auto text-xs">{natureThemes.length}</Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-64 animate-slide-up">
            {natureThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  currentTheme.id === theme.id && "bg-primary/20 glow-primary"
                )}
              >
                <span className="animate-float">{getThemeIcon(theme.id)}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{theme.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {theme.description}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Default Themes */}
        {defaultThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              currentTheme.id === theme.id && "bg-primary/20 glow-primary"
            )}
          >
            <span className="animate-float">{getThemeIcon(theme.id)}</span>
            <div className="flex-1">
              <p className="font-medium text-sm">{theme.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {theme.description}
              </p>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Wallpaper Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 hover:glow-accent transition-all duration-300">
            <WallpaperIcon className="h-4 w-4 animate-glow" />
            Wallpapers
            <Badge variant="outline" className="ml-auto text-xs">{currentTheme.wallpapers.length + 1}</Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-56 animate-slide-up">
            <DropdownMenuItem
              onClick={() => setWallpaper(null)}
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                !currentWallpaper && "bg-primary/20 glow-primary"
              )}
            >
              <Monitor className="h-4 w-4" />
              Default Theme Background
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {currentTheme.wallpapers.map((wallpaper) => (
              <DropdownMenuItem
                key={wallpaper.name}
                onClick={() => setWallpaper(wallpaper)}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  currentWallpaper?.name === wallpaper.name && "bg-primary/20 glow-accent"
                )}
              >
                <div className="h-4 w-4 rounded border bg-gradient-to-br from-primary/20 to-accent/20 animate-gradient" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{wallpaper.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {wallpaper.type}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}