
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
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			},
			fontFamily: {
				'sans': ['Space Grotesk', 'system-ui', 'sans-serif'],
				'mono': ['Space Mono', 'ui-monospace', 'monospace'],
				'display': ['Michroma', 'system-ui', 'sans-serif'],
				'heading': ['Oxanium', 'system-ui', 'sans-serif'],
				// Legacy fonts
				'custom': ['CustomFont', 'Space Grotesk', 'sans-serif'],
				'startrek': ['StarTrek', 'Orbitron', 'sans-serif'],
				'startrek-film': ['StarTrekFilm', 'Orbitron', 'sans-serif'],
				'startrek-pi': ['StarTrekPi', 'sans-serif'],
				'starfleet': ['StarfleetBoldExtended', 'Orbitron', 'sans-serif'],
				'venetian': ['Venetian301', 'serif'],
				'square': ['Square721Condensed', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.64rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
				'sm': ['0.8rem', { lineHeight: '1.5', letterSpacing: '0.005em' }],
				'base': ['1rem', { lineHeight: '1.6' }],
				'lg': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
				'xl': ['1.563rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
				'2xl': ['1.953rem', { lineHeight: '1.35', letterSpacing: '-0.015em' }],
				'3xl': ['2.441rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
				'4xl': ['3.052rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
				'5xl': ['3.815rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
			},
			spacing: {
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
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
