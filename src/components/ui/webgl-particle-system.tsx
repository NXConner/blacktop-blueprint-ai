import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface WebGLParticle {
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;
  maxLife: number;
  size: number;
  color: [number, number, number, number];
  type: 'fire' | 'electric' | 'plasma' | 'glow' | 'spark';
}

interface WebGLParticleSystemProps {
  enabled?: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
  interactive?: boolean;
  effectType?: 'fire' | 'electric' | 'plasma' | 'mixed';
  className?: string;
}

export function WebGLParticleSystem({ 
  enabled = true, 
  intensity = 'medium',
  interactive = true,
  effectType = 'mixed',
  className = ''
}: WebGLParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<WebGLParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, pressed: false });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { currentTheme } = useTheme();

  // Particle configuration based on intensity
  const config = {
    low: { maxParticles: 1000, spawnRate: 2, speed: 1 },
    medium: { maxParticles: 3000, spawnRate: 5, speed: 1.5 },
    high: { maxParticles: 5000, spawnRate: 8, speed: 2 },
    extreme: { maxParticles: 10000, spawnRate: 15, speed: 3 }
  }[intensity];

  // Vertex shader
  const vertexShaderSource = `
    attribute vec3 a_position;
    attribute float a_size;
    attribute vec4 a_color;
    attribute float a_life;
    
    uniform mat4 u_matrix;
    uniform float u_time;
    
    varying vec4 v_color;
    varying float v_life;
    
    void main() {
      gl_Position = u_matrix * vec4(a_position, 1.0);
      gl_PointSize = a_size * (1.0 + sin(u_time * 0.01 + a_position.x * 0.1) * 0.3);
      v_color = a_color;
      v_life = a_life;
    }
  `;

  // Fragment shader with multiple effects
  const fragmentShaderSource = `
    precision mediump float;
    
    uniform float u_time;
    uniform int u_effectType;
    
    varying vec4 v_color;
    varying float v_life;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    vec4 fireEffect(vec2 coord) {
      float dist = distance(coord, vec2(0.5));
      float fire = 1.0 - dist * 2.0;
      fire *= sin(u_time * 0.01 + coord.x * 10.0) * 0.5 + 0.5;
      vec3 fireColor = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 1.0, 0.0), fire);
      return vec4(fireColor, fire * v_color.a);
    }
    
    vec4 electricEffect(vec2 coord) {
      float dist = distance(coord, vec2(0.5));
      float bolt = step(0.9, random(coord + u_time * 0.001));
      vec3 electricColor = vec3(0.0, 0.8, 1.0) * bolt;
      return vec4(electricColor, bolt * v_color.a);
    }
    
    vec4 plasmaEffect(vec2 coord) {
      float dist = distance(coord, vec2(0.5));
      float plasma = sin(dist * 20.0 - u_time * 0.02) * 0.5 + 0.5;
      vec3 plasmaColor = mix(vec3(1.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), plasma);
      return vec4(plasmaColor, plasma * v_color.a * (1.0 - dist));
    }
    
    void main() {
      vec2 coord = gl_PointCoord;
      float dist = distance(coord, vec2(0.5));
      
      if (dist > 0.5) discard;
      
      vec4 finalColor = v_color;
      
      if (u_effectType == 0) { // Fire
        finalColor = fireEffect(coord);
      } else if (u_effectType == 1) { // Electric
        finalColor = electricEffect(coord);
      } else if (u_effectType == 2) { // Plasma
        finalColor = plasmaEffect(coord);
      } else { // Glow
        float alpha = 1.0 - dist * 2.0;
        finalColor = vec4(v_color.rgb, alpha * v_color.a);
      }
      
      // Apply life fade
      finalColor.a *= v_life;
      
      gl_FragColor = finalColor;
    }
  `;

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported, falling back to canvas');
      return false;
    }

    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return false;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    programRef.current = program;

    // Set up WebGL state
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);

    setIsInitialized(true);
    return true;
  }, []);

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  // Extract theme colors for particles
  const getThemeColors = () => {
    return {
      primary: hexToRgb(hslToHex(currentTheme.colors.primary)),
      accent: hexToRgb(hslToHex(currentTheme.colors.accent)),
      glow: hexToRgb(hslToHex(currentTheme.colors.primaryGlow))
    };
  };

  const hslToHex = (hsl: string): string => {
    // Simplified conversion - in production, use proper color library
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
    return `#${Math.round(h / 360 * 255).toString(16).padStart(2, '0')}${Math.round(s / 100 * 255).toString(16).padStart(2, '0')}${Math.round(l / 100 * 255).toString(16).padStart(2, '0')}`;
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ] : [1, 1, 1];
  };

  // Create particle
  const createParticle = (x?: number, y?: number, type?: WebGLParticle['type']): WebGLParticle => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');

    const colors = getThemeColors();
    const particleType = type || (['fire', 'electric', 'plasma', 'glow', 'spark'] as const)[Math.floor(Math.random() * 5)];
    
    let color: [number, number, number] = colors.primary;
    switch (particleType) {
      case 'fire': color = [1, 0.3, 0]; break;
      case 'electric': color = [0, 0.8, 1]; break;
      case 'plasma': color = [1, 0, 1]; break;
      case 'glow': color = colors.primary; break;
      case 'spark': color = colors.accent; break;
    }

    return {
      position: [
        x ?? (Math.random() - 0.5) * 2,
        y ?? (Math.random() - 0.5) * 2,
        Math.random() * 0.1
      ],
      velocity: [
        (Math.random() - 0.5) * config.speed * 0.01,
        (Math.random() - 0.5) * config.speed * 0.01,
        Math.random() * 0.001
      ],
      life: 1.0,
      maxLife: Math.random() * 5 + 2,
      size: Math.random() * 20 + 5,
      color: [...color, Math.random() * 0.8 + 0.2],
      type: particleType
    };
  };

  // Render loop
  const render = useCallback((timestamp: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !canvas || !enabled || !isInitialized) return;

    // Clear canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update particles
    particlesRef.current = particlesRef.current
      .map(particle => ({
        ...particle,
        position: [
          particle.position[0] + particle.velocity[0],
          particle.position[1] + particle.velocity[1],
          particle.position[2] + particle.velocity[2]
        ] as [number, number, number],
        life: particle.life - 0.016 / particle.maxLife
      }))
      .filter(particle => particle.life > 0);

    // Spawn new particles
    if (Math.random() < config.spawnRate * 0.1) {
      if (particlesRef.current.length < config.maxParticles) {
        particlesRef.current.push(createParticle());
      }
    }

    // Render particles (simplified - in production, use vertex buffers)
    gl.useProgram(program);
    
    // Set uniforms
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const effectTypeLocation = gl.getUniformLocation(program, 'u_effectType');
    
    gl.uniform1f(timeLocation, timestamp);
    
    const effectTypeMap = { fire: 0, electric: 1, plasma: 2, mixed: 3 };
    gl.uniform1i(effectTypeLocation, effectTypeMap[effectType] || 3);

    animationRef.current = requestAnimationFrame(render);
  }, [enabled, isInitialized, config, effectType]);

  // Handle mouse interactions
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!interactive || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    
    mouseRef.current = { ...mouseRef.current, x, y };
    
    // Spawn particles near mouse
    if (Math.random() < 0.5 && particlesRef.current.length < config.maxParticles) {
      const offsetX = (Math.random() - 0.5) * 0.2;
      const offsetY = (Math.random() - 0.5) * 0.2;
      particlesRef.current.push(createParticle(x + offsetX, y + offsetY, 'electric'));
    }
  }, [interactive, config]);

  // Resize canvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  // Setup and cleanup
  useEffect(() => {
    if (!enabled) return;

    resizeCanvas();
    const initialized = initWebGL();
    
    if (initialized) {
      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('mousemove', handleMouseMove);
      animationRef.current = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, render, handleMouseMove]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        mixBlendMode: 'screen',
        opacity: 0.9
      }}
    />
  );
}

// Presets for different effects
export const WebGLParticlePresets = {
  Fire: { intensity: 'high' as const, effectType: 'fire' as const },
  Electric: { intensity: 'medium' as const, effectType: 'electric' as const },
  Plasma: { intensity: 'extreme' as const, effectType: 'plasma' as const },
  Mixed: { intensity: 'high' as const, effectType: 'mixed' as const },
  Ambient: { intensity: 'low' as const, effectType: 'mixed' as const }
} as const;

export default WebGLParticleSystem;