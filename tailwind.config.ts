
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Axanar theme colors
				axanar: {
					'blue': '#1A1F2C',
					'teal': '#0EA5E9',
					'silver': '#F1F0FB',
					'accent': '#8B5CF6',
					'dark': '#111827',
					'light': '#F8FAFC'
				},
				// LCARS-PADD Color System (TOS-Inspired)
				lcars: {
					'yellow': 'hsl(48, 100%, 67%)',
					'blue': 'hsl(207, 90%, 45%)',
					'light-blue': 'hsl(195, 100%, 61%)',
					'dark-blue': 'hsl(211, 100%, 44%)',
					'red': 'hsl(4, 90%, 58%)',
					'orange': 'hsl(36, 100%, 50%)',
					'gray': 'hsl(210, 11%, 71%)',
					'light-gray': 'hsl(210, 15%, 87%)',
					'dark-gray': 'hsl(200, 18%, 54%)',
					'tan': 'hsl(30, 100%, 80%)',
				},
				// Nebula theme colors
				nebula: {
					'purple': 'hsl(280, 100%, 70%)',
					'cyan': 'hsl(190, 100%, 60%)',
					'pink': 'hsl(330, 100%, 70%)',
					'blue': 'hsl(220, 100%, 60%)',
					'dark': 'hsl(260, 50%, 10%)',
				},
				// Status color system
				status: {
					'pending': 'hsl(36, 100%, 50%)',
					'processing': 'hsl(207, 90%, 70%)',
					'shipped': 'hsl(195, 100%, 61%)',
					'delivered': 'hsl(120, 60%, 60%)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			gridTemplateColumns: {
				'20': 'repeat(20, minmax(0, 1fr))',
			},
			gridTemplateRows: {
				'12': 'repeat(12, minmax(0, 1fr))',
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
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.7'
					}
				},
				'slide-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-left': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'sparkle': {
					'0%, 100%': {
						opacity: '0',
						transform: 'scale(0) rotate(0deg)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1) rotate(180deg)'
					}
				},
				'scroll': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'slide-in-up': 'slide-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
				'sparkle': 'sparkle 1s ease-in-out infinite',
			},
			fontFamily: {
				// ============= AXANAR STAR TREK TYPOGRAPHY =============
				'sans': ['Eurostile', 'system-ui', 'sans-serif'], // Content font
				'heading': ['Bebas Neue', 'Orbitron', 'system-ui', 'sans-serif'], // Bold headings
				'display': ['Bebas Neue', 'Orbitron', 'system-ui', 'sans-serif'], // Display text
				'admin': ['Inter', 'system-ui', 'sans-serif'], // Admin interface
				'mono': ['Orbitron', 'Monaco', 'monospace'], // Code/tech text
				'klingon': ['pIqaD', 'Orbitron', 'monospace'], // Klingon theme
				
				// Trek-specific utilities
				'trek-heading': ['Bebas Neue', 'Orbitron', 'system-ui', 'sans-serif'],
				'trek-content': ['Eurostile', 'system-ui', 'sans-serif'],
				'trek-admin': ['Inter', 'system-ui', 'sans-serif'],
				'trek-tech': ['Orbitron', 'Monaco', 'monospace'],
				
				// Legacy fonts (preserved for compatibility)
				'custom': ['CustomFont', 'Eurostile', 'sans-serif'],
				'startrek': ['StarTrek', 'Orbitron', 'sans-serif'],
				'startrek-film': ['StarTrekFilm', 'Orbitron', 'sans-serif'],
				'startrek-pi': ['StarTrekPi', 'sans-serif'],
				'starfleet': ['StarfleetBoldExtended', 'Orbitron', 'sans-serif'],
				'venetian': ['Venetian301', 'serif'],
				'square': ['Square721Condensed', 'sans-serif'],
			},
			fontSize: {
				// ============= AXANAR FLUID TEXT SCALE =============
				// Using clamp() for responsive scaling
				'xs': ['clamp(10px, 1.5vw + 0.2rem, 12px)', { lineHeight: '1.4', letterSpacing: '0.02em' }],
				'sm': ['clamp(12px, 2vw + 0.3rem, 14px)', { lineHeight: '1.5', letterSpacing: '0.01em' }],
				'base': ['clamp(16px, 2.5vw + 0.5rem, 18px)', { lineHeight: '1.6', letterSpacing: '0.01em' }],
				'lg': ['clamp(18px, 3vw + 0.6rem, 22px)', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
				'xl': ['clamp(20px, 3.5vw + 0.7rem, 26px)', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
				'2xl': ['clamp(24px, 4vw + 0.8rem, 32px)', { lineHeight: '1.35', letterSpacing: '-0.015em' }],
				'3xl': ['clamp(28px, 4.5vw + 1rem, 40px)', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
				'4xl': ['clamp(32px, 5vw + 1rem, 48px)', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
				'5xl': ['clamp(40px, 6vw + 1.5rem, 64px)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
			},
			spacing: {
				// ============= LCARS-INSPIRED SPACING SCALE =============
				// Precise spacing for Star Trek interfaces
				'0': '0px',
				'0.5': '0.125rem', /* 2px */
				'1': '0.25rem',    /* 4px */
				'1.5': '0.375rem', /* 6px */
				'2': '0.5rem',     /* 8px */
				'2.5': '0.625rem', /* 10px */
				'3': '0.75rem',    /* 12px */
				'3.5': '0.875rem', /* 14px */
				'4': '1rem',       /* 16px */
				'5': '1.25rem',    /* 20px */
				'6': '1.5rem',     /* 24px */
				'7': '1.75rem',    /* 28px */
				'8': '2rem',       /* 32px */
				'9': '2.25rem',    /* 36px */
				'10': '2.5rem',    /* 40px */
				'11': '2.75rem',   /* 44px */
				'12': '3rem',      /* 48px */
				'14': '3.5rem',    /* 56px */
				'16': '4rem',      /* 64px */
				'18': '4.5rem',    /* 72px */
				'20': '5rem',      /* 80px */
				'24': '6rem',      /* 96px */
				'28': '7rem',      /* 112px */
				'32': '8rem',      /* 128px */
				'36': '9rem',      /* 144px */
				'40': '10rem',     /* 160px */
				'44': '11rem',     /* 176px */
				'48': '12rem',     /* 192px */
				'52': '13rem',     /* 208px */
				'56': '14rem',     /* 224px */
				'60': '15rem',     /* 240px */
				'64': '16rem',     /* 256px */
				'72': '18rem',     /* 288px */
				'80': '20rem',     /* 320px */
				'96': '24rem',     /* 384px */
			},
			backgroundImage: {
				'space': "url('/lovable-uploads/284dc990-6904-4420-a006-2aafd617b57f.png')",
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-cosmic': 'radial-gradient(ellipse at 50% 50%, var(--tw-gradient-stops))',
				'gradient-nebula': 'linear-gradient(135deg, var(--tw-gradient-stops))',
			},
			backdropBlur: {
				xs: '2px',
			},
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
