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

  const getThemeIcon = (themeId: string) => {
    const iconMap: Record<string, string> = {
      'tactical': '🪖',
      'operations': '🎮',
      'stealth': '🥷',
      'dark-ops': '🔴',
      'cybernetic-orange': '🤖',
      'aurora': '🌌',
      'sunset-vibes': '🌅',
      'ocean-depths': '🌊',
      'forest-canopy': '🌲',
      'cosmic-purple': '🪐',
      'default': '🛣️',
    };
    return iconMap[themeId] || '🎨';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="glass-card hover:glow-primary transition-all duration-300"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="glass-elevated w-80 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Theme Settings
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Quick Dark/Light Toggle */}
        <DropdownMenuItem 
          onClick={toggleDarkMode}
          className="flex items-center gap-2"
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
          <Card className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getThemeIcon(currentTheme.id)}</span>
              <div>
                <p className="font-medium text-sm">{currentTheme.name}</p>
                <p className="text-xs text-muted-foreground">{currentTheme.description}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs">
                {currentTheme.category}
              </Badge>
              <Badge variant={currentTheme.isDark ? "default" : "outline"} className="text-xs">
                {currentTheme.isDark ? "Dark" : "Light"}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Industry Themes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <span>🏭</span>
            Industry Themes
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-64">
            {industryThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  "flex items-center gap-2",
                  currentTheme.id === theme.id && "bg-primary/20"
                )}
              >
                <span>{getThemeIcon(theme.id)}</span>
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

        {/* Custom Themes */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <span>✨</span>
            Custom Themes
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-64">
            {customThemes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={cn(
                  "flex items-center gap-2",
                  currentTheme.id === theme.id && "bg-primary/20"
                )}
              >
                <span>{getThemeIcon(theme.id)}</span>
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
              "flex items-center gap-2",
              currentTheme.id === theme.id && "bg-primary/20"
            )}
          >
            <span>{getThemeIcon(theme.id)}</span>
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
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <WallpaperIcon className="h-4 w-4" />
            Wallpapers
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="glass-elevated w-56">
            <DropdownMenuItem
              onClick={() => setWallpaper(null)}
              className={cn(
                "flex items-center gap-2",
                !currentWallpaper && "bg-primary/20"
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
                  "flex items-center gap-2",
                  currentWallpaper?.name === wallpaper.name && "bg-primary/20"
                )}
              >
                <div className="h-4 w-4 rounded border bg-gradient-to-br from-primary/20 to-accent/20" />
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