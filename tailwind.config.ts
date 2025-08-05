import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
			},
			screens: {
				'xs': '475px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					glow: 'hsl(var(--accent-glow))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				info: 'hsl(var(--info))',
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				glass: {
					DEFAULT: 'hsl(var(--glass))',
					border: 'hsl(var(--glass-border))'
				}
			},
			backgroundImage: {
				'gradient-glass': 'var(--gradient-glass)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			boxShadow: {
				'glass': 'var(--shadow-glass)',
				'elevated': 'var(--shadow-elevated)',
				'intense': 'var(--shadow-intense)',
				'glow-primary': 'var(--glow-primary)',
				'glow-accent': 'var(--glow-accent)',
				'glow-soft': 'var(--glow-soft)',
				'glow-intense': 'var(--glow-intense)',
				'neon-primary': '0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary)), 0 0 15px hsl(var(--primary))',
				'neon-accent': '0 0 5px hsl(var(--accent)), 0 0 10px hsl(var(--accent)), 0 0 15px hsl(var(--accent))',
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
				'back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			},
			transitionDuration: {
				'250': '250ms',
				'350': '350ms',
				'400': '400ms',
				'450': '450ms',
				'600': '600ms',
				'800': '800ms',
				'1200': '1200ms',
				'1500': '1500ms',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			scale: {
				'102': '1.02',
				'103': '1.03',
				'115': '1.15',
			},
			blur: {
				'xs': '2px',
				'4xl': '72px',
				'5xl': '96px',
			},
			backdropBlur: {
				'xs': '2px',
				'4xl': '72px',
				'5xl': '96px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-left': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-right': {
					'0%': { transform: 'translateX(-20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.9)', opacity: '0' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)', opacity: '1' },
					'70%': { transform: 'scale(0.95)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
						opacity: '1'
					},
					'50%': { 
						boxShadow: '0 0 60px hsl(var(--primary) / 0.8)',
						opacity: '0.8'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'float-slow': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-15px)' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'gradient': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'ripple': {
					'0%': { 
						transform: 'scale(0)', 
						opacity: '1' 
					},
					'100%': { 
						transform: 'scale(4)', 
						opacity: '0' 
					}
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
				},
				'wobble': {
					'0%': { transform: 'translateX(0%)' },
					'15%': { transform: 'translateX(-25px) rotate(-5deg)' },
					'30%': { transform: 'translateX(20px) rotate(3deg)' },
					'45%': { transform: 'translateX(-15px) rotate(-3deg)' },
					'60%': { transform: 'translateX(10px) rotate(2deg)' },
					'75%': { transform: 'translateX(-5px) rotate(-1deg)' },
					'100%': { transform: 'translateX(0%)' }
				},
				'pulse-ring': {
					'0%': {
						transform: 'scale(0.33)',
						opacity: '1',
					},
					'80%, 100%': {
						transform: 'scale(2.4)',
						opacity: '0',
					},
				},
				'breathe': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.5s ease-in',
				'slide-up': 'slide-up 0.5s ease-out',
				'slide-down': 'slide-down 0.5s ease-out',
				'slide-left': 'slide-left 0.5s ease-out',
				'slide-right': 'slide-right 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'scale-out': 'scale-out 0.3s ease-in',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'float-slow': 'float-slow 8s ease-in-out infinite',
				'shimmer': 'shimmer 2s ease-in-out infinite',
				'gradient': 'gradient 8s ease infinite',
				'ripple': 'ripple 0.6s linear',
				'shake': 'shake 0.5s ease-in-out',
				'wobble': 'wobble 1s ease-in-out',
				'pulse-ring': 'pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
				'breathe': 'breathe 4s ease-in-out infinite',
			}
		}
	},
	plugins: [
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require("tailwindcss-animate")
	],
} satisfies Config;
