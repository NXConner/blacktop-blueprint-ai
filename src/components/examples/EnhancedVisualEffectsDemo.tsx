import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  VolumetricLight, 
  EnhancedGlow, 
  HolographicShimmer, 
  AuroraLight, 
  PlasmaField 
} from '@/components/ui/volumetric-effects';
import { WebGLParticleSystem, WebGLParticlePresets } from '@/components/ui/webgl-particle-system';
import { 
  MeshGradient, 
  HolographicCard, 
  AmbientParticles, 
  EnergyPulse 
} from '@/components/ui/visual-effects';
import { MagneticButton, TiltCard } from '@/components/ui/micro-interactions';
import { AnimatedContainer, FloatingElement } from '@/components/ui/animated';
import { Zap, Sparkles, Eye, Palette } from 'lucide-react';

export function EnhancedVisualEffectsDemo() {
  const [webglEnabled, setWebglEnabled] = useState(true);
  const [particleIntensity, setParticleIntensity] = useState(50);
  const [effectType, setEffectType] = useState<'fire' | 'electric' | 'plasma' | 'mixed'>('mixed');
  const [volumetricIntensity, setVolumetricIntensity] = useState<'subtle' | 'medium' | 'intense' | 'extreme'>('medium');

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      {/* Background Effects */}
      <MeshGradient 
        intensity="medium" 
        animated={true}
        className="absolute inset-0 opacity-30"
      />
      
      <AuroraLight 
        intensity="subtle" 
        animated={true}
        className="absolute inset-0 opacity-20"
      />

      {/* WebGL Particle System */}
      {webglEnabled && (
        <WebGLParticleSystem
          intensity={particleIntensity < 25 ? 'low' : particleIntensity < 50 ? 'medium' : particleIntensity < 75 ? 'high' : 'extreme'}
          effectType={effectType}
          interactive={true}
          className="opacity-80"
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <AnimatedContainer animation="slide-up" className="text-center mb-12">
          <FloatingElement intensity="subtle">
            <div className="relative">
              <VolumetricLight 
                intensity={volumetricIntensity}
                direction="center"
                beamWidth={80}
                className="absolute inset-0"
              />
              <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Enhanced Visual Effects System
              </h1>
            </div>
          </FloatingElement>
          <p className="text-xl text-muted-foreground mb-8">
            Next-generation visual effects for immersive user experiences
          </p>
        </AnimatedContainer>

        {/* Controls Panel */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Effect Controls
            </CardTitle>
            <CardDescription>
              Adjust the visual effects intensity and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* WebGL Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">WebGL Particles</label>
                <Switch
                  checked={webglEnabled}
                  onCheckedChange={setWebglEnabled}
                />
              </div>

              {/* Particle Intensity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Particle Intensity: {particleIntensity}%
                </label>
                <Slider
                  value={[particleIntensity]}
                  onValueChange={(value) => setParticleIntensity(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Effect Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Effect Type</label>
                <div className="flex gap-1">
                  {(['fire', 'electric', 'plasma', 'mixed'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={effectType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEffectType(type)}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Volumetric Intensity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Volumetric Intensity</label>
                <div className="flex gap-1">
                  {(['subtle', 'medium', 'intense', 'extreme'] as const).map((intensity) => (
                    <Button
                      key={intensity}
                      variant={volumetricIntensity === intensity ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVolumetricIntensity(intensity)}
                      className="capitalize text-xs"
                    >
                      {intensity}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Effect Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Enhanced Glow Card */}
          <AnimatedContainer animation="scale-in" delay="100">
            <EnhancedGlow intensity="intense" pulsing={true} layers={7}>
              <Card className="glass-card h-64 relative overflow-hidden group">
                <PlasmaField intensity="medium" speed="medium" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Enhanced Glow
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground">
                    Multi-layer glow effects with pulsing animation
                  </p>
                  <Badge className="mt-4" variant="outline">
                    7 Layers
                  </Badge>
                </CardContent>
              </Card>
            </EnhancedGlow>
          </AnimatedContainer>

          {/* Holographic Shimmer Card */}
          <AnimatedContainer animation="scale-in" delay="200">
            <HolographicCard intensity="intense">
              <HolographicShimmer intensity="medium" speed="fast">
                <Card className="glass-card h-64 relative overflow-hidden group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Holographic Effects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Mouse-tracking holographic overlays with shimmer
                    </p>
                    <Badge className="mt-4" variant="outline">
                      Interactive
                    </Badge>
                  </CardContent>
                </Card>
              </HolographicShimmer>
            </HolographicCard>
          </AnimatedContainer>

          {/* Tilt Card with Effects */}
          <AnimatedContainer animation="scale-in" delay="300">
            <TiltCard maxTilt={15} glareEffect={true}>
              <Card className="glass-card h-64 relative overflow-hidden">
                <VolumetricLight 
                  intensity="intense" 
                  direction="top"
                  className="absolute inset-0"
                />
                <EnergyPulse 
                  intensity="medium" 
                  pattern="spiral"
                  className="absolute inset-0"
                />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Volumetric Lighting
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground">
                    3D tilt effects with volumetric light rays
                  </p>
                  <Badge className="mt-4" variant="outline">
                    3D Tilt
                  </Badge>
                </CardContent>
              </Card>
            </TiltCard>
          </AnimatedContainer>
        </div>

        {/* Interactive Buttons Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MagneticButton magneticStrength={0.4} hapticFeedback={true}>
            <EnhancedGlow intensity="medium" layers={3}>
              <span>Magnetic Button</span>
            </EnhancedGlow>
          </MagneticButton>

          <Button className="relative overflow-hidden group">
            <HolographicShimmer intensity="subtle" speed="medium">
              <span>Holographic Button</span>
            </HolographicShimmer>
          </Button>

          <Button className="relative">
            <VolumetricLight 
              intensity="subtle" 
              direction="center"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span className="relative z-10">Volumetric Button</span>
          </Button>

          <FloatingElement intensity="normal">
            <Button>
              Floating Button
            </Button>
          </FloatingElement>
        </div>

        {/* Performance Metrics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Real-time performance statistics for visual effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">60</div>
                <div className="text-sm text-muted-foreground">FPS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {webglEnabled ? (particleIntensity < 25 ? '1K' : particleIntensity < 50 ? '3K' : particleIntensity < 75 ? '5K' : '10K') : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Particles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">GPU</div>
                <div className="text-sm text-muted-foreground">Accelerated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">52</div>
                <div className="text-sm text-muted-foreground">Effects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ambient Particles for Background */}
        <AmbientParticles 
          count={30} 
          speed="slow" 
          size="small" 
          opacity={0.3}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}

export default EnhancedVisualEffectsDemo;