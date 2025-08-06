import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Monitor, 
  Accessibility, 
  Zap, 
  Bell, 
  Shield, 
  User, 
  Globe,
  Eye,
  Sliders,
  Wand2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Vibrate,
  Gamepad2,
  Keyboard,
  Mouse,
  Smartphone,
  Laptop,
  Desktop,
  Tablet
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ResponsiveContainer from '@/components/ui/responsive-container';

interface SettingsState {
  // Visual Settings
  animations: boolean;
  particleEffects: boolean;
  glowEffects: boolean;
  reducedMotion: boolean;
  blurIntensity: number;
  glowIntensity: number;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  
  // Performance
  optimizedRendering: boolean;
  hardwareAcceleration: boolean;
  backgroundEffects: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Notifications
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  // Personalization
  username: string;
  bio: string;
  preferredLanguage: string;
  timezone: string;
  dateFormat: string;
  
  // Advanced
  debugMode: boolean;
  experimentalFeatures: boolean;
  telemetry: boolean;
  autoSave: boolean;
  backupFrequency: string;
}

export default function Settings() {
  const { currentTheme, availableThemes, setTheme, currentWallpaper, setWallpaper } = useTheme();
  
  const [settings, setSettings] = useState<SettingsState>({
    // Visual Settings
    animations: true,
    particleEffects: true,
    glowEffects: true,
    reducedMotion: false,
    blurIntensity: 20,
    glowIntensity: 40,
    
    // Accessibility
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    
    // Performance
    optimizedRendering: true,
    hardwareAcceleration: true,
    backgroundEffects: true,
    autoRefresh: false,
    refreshInterval: 30,
    
    // Notifications
    soundEnabled: true,
    vibrationEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    pushNotifications: true,
    
    // Personalization
    username: '',
    bio: '',
    preferredLanguage: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    
    // Advanced
    debugMode: false,
    experimentalFeatures: false,
    telemetry: true,
    autoSave: true,
    backupFrequency: 'daily',
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Update settings and mark as changed
  const updateSetting = (key: keyof SettingsState, value: SettingsState[keyof SettingsState]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
      setHasChanges(false);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings({
      animations: true,
      particleEffects: true,
      glowEffects: true,
      reducedMotion: false,
      blurIntensity: 20,
      glowIntensity: 40,
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      optimizedRendering: true,
      hardwareAcceleration: true,
      backgroundEffects: true,
      autoRefresh: false,
      refreshInterval: 30,
      soundEnabled: true,
      vibrationEnabled: true,
      desktopNotifications: true,
      emailNotifications: false,
      pushNotifications: true,
      username: '',
      bio: '',
      preferredLanguage: 'en',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      debugMode: false,
      experimentalFeatures: false,
      telemetry: true,
      autoSave: true,
      backupFrequency: 'daily',
    });
    setHasChanges(true);
    toast.success('Settings reset to defaults');
  };

  // Export settings
  const exportSettings = () => {
    const settingsData = {
      theme: currentTheme.id,
      wallpaper: currentWallpaper,
      settings: settings,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'isac-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully!');
  };

  // Import settings
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.theme && availableThemes.find(t => t.id === importedData.theme)) {
          setTheme(importedData.theme);
        }
        
        if (importedData.wallpaper) {
          setWallpaper(importedData.wallpaper);
        }
        
        if (importedData.settings) {
          setSettings(prev => ({ ...prev, ...importedData.settings }));
          setHasChanges(true);
        }
        
        toast.success('Settings imported successfully!');
      } catch (error) {
        toast.error('Failed to import settings - invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-safe animate-fade-in">
      <ResponsiveContainer size="xl" className="py-6">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="glass-card p-3 rounded-xl animate-glow">
              <SettingsIcon className="h-8 w-8 text-primary animate-float" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-glow-primary">Settings</h1>
              <p className="text-muted-foreground">Customize your ISAC OS experience</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <Button 
              onClick={saveSettings} 
              disabled={!hasChanges}
              className="glass-card hover:glow-primary transition-all duration-300"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button 
              onClick={resetSettings} 
              variant="outline"
              className="glass-card hover:glow-accent transition-all duration-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button 
              onClick={exportSettings} 
              variant="outline"
              className="glass-card hover:glow-primary transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button 
                variant="outline"
                className="glass-card hover:glow-accent transition-all duration-300"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="glass-elevated p-1 h-auto animate-slide-up delay-100">
            <TabsTrigger value="appearance" className="flex items-center gap-2 px-4 py-3">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2 px-4 py-3">
              <Accessibility className="h-4 w-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 px-4 py-3">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 px-4 py-3">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2 px-4 py-3">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 px-4 py-3">
              <Sliders className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Theme Selection */}
              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 animate-glow" />
                    Theme Selection
                  </CardTitle>
                  <CardDescription>Choose your preferred visual theme from all available options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Theme Display */}
                  <div className="glass-card p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Palette className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{currentTheme.name}</p>
                        <p className="text-xs text-muted-foreground">{currentTheme.description}</p>
                      </div>
                      <div className="flex gap-1 ml-auto">
                        <Badge variant="secondary" className="text-xs">
                          {currentTheme.category}
                        </Badge>
                        <Badge variant={currentTheme.isDark ? "default" : "outline"} className="text-xs">
                          {currentTheme.isDark ? "Dark" : "Light"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Theme Categories */}
                  <div className="space-y-4">
                    {/* Industry Themes */}
                    {availableThemes.filter(t => t.category === 'industry').length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Industry Themes</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableThemes.filter(t => t.category === 'industry').map((theme) => (
                            <Button
                              key={theme.id}
                              variant={currentTheme.id === theme.id ? "default" : "outline"}
                              className={`glass-card p-3 h-auto flex flex-col gap-1 transition-all duration-300 ${
                                currentTheme.id === theme.id ? 'glow-primary' : 'hover:glow-soft'
                              }`}
                              onClick={() => setTheme(theme.id)}
                            >
                              <div className="text-sm font-medium">{theme.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{theme.description}</div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Themes */}
                    {availableThemes.filter(t => t.category === 'custom').length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Custom Themes</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableThemes.filter(t => t.category === 'custom').map((theme) => (
                            <Button
                              key={theme.id}
                              variant={currentTheme.id === theme.id ? "default" : "outline"}
                              className={`glass-card p-3 h-auto flex flex-col gap-1 transition-all duration-300 ${
                                currentTheme.id === theme.id ? 'glow-primary' : 'hover:glow-soft'
                              }`}
                              onClick={() => setTheme(theme.id)}
                            >
                              <div className="text-sm font-medium">{theme.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{theme.description}</div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Default Themes */}
                    {availableThemes.filter(t => t.category === 'default').length > 0 && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Default Themes</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableThemes.filter(t => t.category === 'default').map((theme) => (
                            <Button
                              key={theme.id}
                              variant={currentTheme.id === theme.id ? "default" : "outline"}
                              className={`glass-card p-3 h-auto flex flex-col gap-1 transition-all duration-300 ${
                                currentTheme.id === theme.id ? 'glow-primary' : 'hover:glow-soft'
                              }`}
                              onClick={() => setTheme(theme.id)}
                            >
                              <div className="text-sm font-medium">{theme.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{theme.description}</div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Visual Effects */}
              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 animate-glow" />
                    Visual Effects
                  </CardTitle>
                  <CardDescription>Customize visual effects and animations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">Animations</Label>
                    <Switch 
                      id="animations"
                      checked={settings.animations}
                      onCheckedChange={(checked) => updateSetting('animations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="particle-effects">Particle Effects</Label>
                    <Switch 
                      id="particle-effects"
                      checked={settings.particleEffects}
                      onCheckedChange={(checked) => updateSetting('particleEffects', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="glow-effects">Glow Effects</Label>
                    <Switch 
                      id="glow-effects"
                      checked={settings.glowEffects}
                      onCheckedChange={(checked) => updateSetting('glowEffects', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Blur Intensity: {settings.blurIntensity}px</Label>
                    <Slider
                      value={[settings.blurIntensity]}
                      onValueChange={([value]) => updateSetting('blurIntensity', value)}
                      max={40}
                      min={5}
                      step={1}
                      className="glass-card p-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Glow Intensity: {settings.glowIntensity}px</Label>
                    <Slider
                      value={[settings.glowIntensity]}
                      onValueChange={([value]) => updateSetting('glowIntensity', value)}
                      max={80}
                      min={10}
                      step={1}
                      className="glass-card p-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Wallpaper Selection */}
            <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 animate-glow" />
                  Wallpaper Selection
                </CardTitle>
                <CardDescription>Choose a wallpaper for the current theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant={!currentWallpaper ? "default" : "outline"}
                    className={`glass-card aspect-video flex flex-col gap-2 transition-all duration-300 ${
                      !currentWallpaper ? 'glow-primary' : 'hover:glow-soft'
                    }`}
                    onClick={() => setWallpaper(null)}
                  >
                    <Monitor className="h-6 w-6" />
                    <span className="text-xs">Default</span>
                  </Button>
                  
                  {currentTheme.wallpapers.map((wallpaper) => (
                    <Button
                      key={wallpaper.name}
                      variant={currentWallpaper?.name === wallpaper.name ? "default" : "outline"}
                      className={`glass-card aspect-video flex flex-col gap-2 transition-all duration-300 relative overflow-hidden ${
                        currentWallpaper?.name === wallpaper.name ? 'glow-primary' : 'hover:glow-soft'
                      }`}
                      onClick={() => setWallpaper(wallpaper)}
                    >
                      {wallpaper.type === 'gradient' ? (
                        <div 
                          className="h-6 w-6 rounded" 
                          style={{ 
                            background: wallpaper.url === 'pure-black' ? 'linear-gradient(0deg, hsl(0 0% 2%), hsl(0 0% 4%))' :
                                      wallpaper.url === 'void' ? 'radial-gradient(circle at 50% 50%, hsl(0 0% 6%) 0%, hsl(0 0% 2%) 100%)' :
                                      wallpaper.url === 'red-alert' ? 'linear-gradient(135deg, hsl(0 80% 8%), hsl(0 60% 15%), hsl(0 80% 8%))' :
                                      wallpaper.url === 'sunset-gradient' ? 'linear-gradient(135deg, hsl(15 100% 70%), hsl(35 100% 60%), hsl(320 60% 70%))' :
                                      wallpaper.url === 'northern-lights' ? 'linear-gradient(135deg, hsl(220 30% 8%), hsl(160 100% 25%), hsl(280 100% 25%), hsl(220 30% 8%))' :
                                      'var(--gradient-primary)'
                          }} 
                        />
                      ) : (
                        <div 
                          className="h-6 w-6 rounded bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url('/wallpapers/${wallpaper.url}.svg')`,
                            backgroundColor: 'var(--muted)'
                          }} 
                        />
                      )}
                      <span className="text-xs">{wallpaper.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 animate-glow" />
                    Visual Accessibility
                  </CardTitle>
                  <CardDescription>Settings for visual impairments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <Switch 
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-text">Large Text</Label>
                    <Switch 
                      id="large-text"
                      checked={settings.largeText}
                      onCheckedChange={(checked) => updateSetting('largeText', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <Switch 
                      id="reduced-motion"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5 animate-glow" />
                    Navigation & Input
                  </CardTitle>
                  <CardDescription>Keyboard and navigation assistance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen-reader">Screen Reader Support</Label>
                    <Switch 
                      id="screen-reader"
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboard-nav">Enhanced Keyboard Navigation</Label>
                    <Switch 
                      id="keyboard-nav"
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="focus-indicators">Focus Indicators</Label>
                    <Switch 
                      id="focus-indicators"
                      checked={settings.focusIndicators}
                      onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 animate-glow" />
                    Rendering & Graphics
                  </CardTitle>
                  <CardDescription>Optimize visual performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="optimized-rendering">Optimized Rendering</Label>
                    <Switch 
                      id="optimized-rendering"
                      checked={settings.optimizedRendering}
                      onCheckedChange={(checked) => updateSetting('optimizedRendering', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hardware-acceleration">Hardware Acceleration</Label>
                    <Switch 
                      id="hardware-acceleration"
                      checked={settings.hardwareAcceleration}
                      onCheckedChange={(checked) => updateSetting('hardwareAcceleration', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="background-effects">Background Effects</Label>
                    <Switch 
                      id="background-effects"
                      checked={settings.backgroundEffects}
                      onCheckedChange={(checked) => updateSetting('backgroundEffects', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 animate-glow" />
                    Data & Updates
                  </CardTitle>
                  <CardDescription>Manage data refresh and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-refresh">Auto Refresh</Label>
                    <Switch 
                      id="auto-refresh"
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                    />
                  </div>
                  
                  {settings.autoRefresh && (
                    <div className="space-y-2">
                      <Label>Refresh Interval: {settings.refreshInterval}s</Label>
                      <Slider
                        value={[settings.refreshInterval]}
                        onValueChange={([value]) => updateSetting('refreshInterval', value)}
                        max={300}
                        min={10}
                        step={10}
                        className="glass-card p-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 animate-glow" />
                    Audio & Haptics
                  </CardTitle>
                  <CardDescription>Sound and vibration settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled">Sound Effects</Label>
                    <Switch 
                      id="sound-enabled"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vibration-enabled">Vibration</Label>
                    <Switch 
                      id="vibration-enabled"
                      checked={settings.vibrationEnabled}
                      onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 animate-glow" />
                    Notification Types
                  </CardTitle>
                  <CardDescription>Choose which notifications to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                    <Switch 
                      id="desktop-notifications"
                      checked={settings.desktopNotifications}
                      onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch 
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch 
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 animate-glow" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={settings.username}
                      onChange={(e) => updateSetting('username', e.target.value)}
                      placeholder="e.g., operator@contractor.com"
                      className="glass-card"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={settings.bio}
                      onChange={(e) => updateSetting('bio', e.target.value)}
                      placeholder="e.g., Senior Paving Operator with 15 years experience specializing in highway resurfacing and commercial projects"
                      className="glass-card"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 animate-glow" />
                    Localization
                  </CardTitle>
                  <CardDescription>Language and regional settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Language</Label>
                    <Select 
                      value={settings.preferredLanguage} 
                      onValueChange={(value) => updateSetting('preferredLanguage', value)}
                    >
                      <SelectTrigger className="glass-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-elevated">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={settings.timezone} 
                      onValueChange={(value) => updateSetting('timezone', value)}
                    >
                      <SelectTrigger className="glass-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-elevated">
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select 
                      value={settings.dateFormat} 
                      onValueChange={(value) => updateSetting('dateFormat', value)}
                    >
                      <SelectTrigger className="glass-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-elevated">
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 animate-glow" />
                    System Settings
                  </CardTitle>
                  <CardDescription>Advanced system configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debug-mode">Debug Mode</Label>
                    <Switch 
                      id="debug-mode"
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="experimental-features">Experimental Features</Label>
                    <Switch 
                      id="experimental-features"
                      checked={settings.experimentalFeatures}
                      onCheckedChange={(checked) => updateSetting('experimentalFeatures', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telemetry">Usage Analytics</Label>
                    <Switch 
                      id="telemetry"
                      checked={settings.telemetry}
                      onCheckedChange={(checked) => updateSetting('telemetry', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card hover:glow-primary transition-all duration-300 animate-scale-in delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 animate-glow" />
                    Data & Backup
                  </CardTitle>
                  <CardDescription>Data management and backup settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <Switch 
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Backup Frequency</Label>
                    <Select 
                      value={settings.backupFrequency} 
                      onValueChange={(value) => updateSetting('backupFrequency', value)}
                    >
                      <SelectTrigger className="glass-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-elevated">
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Changes indicator */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 animate-bounce-in">
            <Card className="glass-elevated p-4 glow-accent">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-accent rounded-full animate-glow" />
                <span className="text-sm font-medium">You have unsaved changes</span>
                <Button 
                  size="sm" 
                  onClick={saveSettings}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Now
                </Button>
              </div>
            </Card>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}