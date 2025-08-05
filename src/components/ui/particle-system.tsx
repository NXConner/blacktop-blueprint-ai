import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'glow' | 'spark' | 'drift' | 'pulse';
}

interface ParticleSystemProps {
  enabled?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  interactive?: boolean;
  className?: string;
}

export function ParticleSystem({ 
  enabled = true, 
  intensity = 'medium',
  interactive = true,
  className = ''
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  
  const { currentTheme } = useTheme();

  // Particle configuration based on intensity
  const config = {
    low: { maxParticles: 20, spawnRate: 0.3, speed: 0.5 },
    medium: { maxParticles: 50, spawnRate: 0.6, speed: 1 },
    high: { maxParticles: 100, spawnRate: 1, speed: 1.5 }
  }[intensity];

  // Extract theme colors for particles
  const getThemeColors = () => {
    const colors = [];
    
    // Primary color variations
    colors.push(`hsl(${currentTheme.colors.primary} / 0.3)`);
    colors.push(`hsl(${currentTheme.colors.primary} / 0.2)`);
    colors.push(`hsl(${currentTheme.colors.primary} / 0.1)`);
    
    // Accent color variations
    colors.push(`hsl(${currentTheme.colors.accent} / 0.3)`);
    colors.push(`hsl(${currentTheme.colors.accent} / 0.2)`);
    colors.push(`hsl(${currentTheme.colors.accent} / 0.1)`);
    
    // Subtle variations
    colors.push(`hsl(${currentTheme.colors.foreground} / 0.1)`);
    colors.push(`hsl(${currentTheme.colors.foreground} / 0.05)`);
    
    return colors;
  };

  // Create a new particle
  const createParticle = (x?: number, y?: number, type?: Particle['type']): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');

    const colors = getThemeColors();
    const particleType = type || (['glow', 'spark', 'drift', 'pulse'] as const)[Math.floor(Math.random() * 4)];
    
    return {
      id: Math.random(),
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * config.speed * 2,
      vy: (Math.random() - 0.5) * config.speed * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 300 + 100,
      type: particleType
    };
  };

  // Update particle physics
  const updateParticle = (particle: Particle, deltaTime: number): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return particle;

    let newParticle = { ...particle };
    
    // Update position
    newParticle.x += newParticle.vx * deltaTime;
    newParticle.y += newParticle.vy * deltaTime;
    
    // Update life
    newParticle.life += deltaTime;
    
    // Type-specific behaviors
    switch (particle.type) {
      case 'glow':
        // Gentle floating motion
        newParticle.vy -= 0.01 * deltaTime;
        newParticle.opacity = Math.sin(newParticle.life * 0.01) * 0.3 + 0.2;
        break;
        
      case 'spark':
        // Quick, sparky movement
        newParticle.vx *= 0.995;
        newParticle.vy *= 0.995;
        newParticle.opacity = Math.max(0, 1 - newParticle.life / newParticle.maxLife);
        break;
        
      case 'drift':
        // Slow drifting motion
        newParticle.vx += (Math.random() - 0.5) * 0.001 * deltaTime;
        newParticle.vy += (Math.random() - 0.5) * 0.001 * deltaTime;
        newParticle.vx *= 0.999;
        newParticle.vy *= 0.999;
        break;
        
      case 'pulse':
        // Pulsing size and opacity
        const pulse = Math.sin(newParticle.life * 0.02);
        newParticle.size = particle.size * (1 + pulse * 0.3);
        newParticle.opacity = Math.abs(pulse) * 0.4 + 0.1;
        break;
    }
    
    // Wrap around screen edges
    if (newParticle.x < 0) newParticle.x = canvas.width;
    if (newParticle.x > canvas.width) newParticle.x = 0;
    if (newParticle.y < 0) newParticle.y = canvas.height;
    if (newParticle.y > canvas.height) newParticle.y = 0;
    
    return newParticle;
  };

  // Render a single particle
  const renderParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    
    // Set particle color and opacity
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    
    // Create glow effect
    ctx.shadowBlur = particle.size * 2;
    ctx.shadowColor = particle.color;
    
    // Draw particle based on type
    switch (particle.type) {
      case 'glow':
        // Soft circular glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(
          particle.x - particle.size * 2,
          particle.y - particle.size * 2,
          particle.size * 4,
          particle.size * 4
        );
        break;
        
      case 'spark':
        // Sharp diamond shape
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.life * 0.01);
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        break;
        
      case 'drift':
        // Simple circle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'pulse':
        // Pulsing circle with extra glow
        ctx.shadowBlur = particle.size * 4;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  };

  // Main animation loop
  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !enabled) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update particles
    particlesRef.current = particlesRef.current
      .map(particle => updateParticle(particle, 16)) // Assume ~60fps
      .filter(particle => particle.life < particle.maxLife);
    
    // Spawn new particles
    if (Math.random() < config.spawnRate * 0.1) {
      if (particlesRef.current.length < config.maxParticles) {
        particlesRef.current.push(createParticle());
      }
    }
    
    // Render particles
    particlesRef.current.forEach(particle => {
      renderParticle(ctx, particle);
    });
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse interactions
  const handleMouseMove = (event: MouseEvent) => {
    if (!interactive || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    mouseRef.current = { x, y };
    
    // Spawn particles near mouse on movement
    if (Math.random() < 0.3 && particlesRef.current.length < config.maxParticles) {
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;
      particlesRef.current.push(createParticle(x + offsetX, y + offsetY, 'spark'));
    }
  };

  const handleMouseClick = (event: MouseEvent) => {
    if (!interactive || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create burst of particles on click
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const distance = Math.random() * 30 + 10;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      
      if (particlesRef.current.length < config.maxParticles) {
        particlesRef.current.push(createParticle(particleX, particleY, 'glow'));
      }
    }
  };

  // Resize canvas to match container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  // Handle visibility change
  const handleVisibilityChange = () => {
    setIsVisible(!document.hidden);
  };

  // Setup and cleanup
  useEffect(() => {
    if (!enabled) return;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, intensity, currentTheme.id]);

  // Pause animation when not visible
  useEffect(() => {
    if (!isVisible && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    } else if (isVisible && enabled) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isVisible, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        mixBlendMode: 'screen',
        opacity: 0.8
      }}
    />
  );
}

// Pre-built particle configurations
export const ParticlePresets = {
  Minimal: { intensity: 'low' as const, interactive: false },
  Standard: { intensity: 'medium' as const, interactive: true },
  Immersive: { intensity: 'high' as const, interactive: true },
  Ambient: { intensity: 'low' as const, interactive: false },
} as const;

export default ParticleSystem;