
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
				sans: ['Poppins', 'system-ui', 'sans-serif'],
				display: ['Playfair Display', 'serif'],
			},
			fontSize: {
				// Semantic typography scale with clear hierarchy
				'tiny': ['0.6875rem', { lineHeight: '0.875rem' }], // 11px - floating labels when active
				'micro': ['0.75rem', { lineHeight: '1rem' }],      // 12px - timestamps, badges, footnotes
				'caption': ['0.875rem', { lineHeight: '1.25rem' }], // 14px - secondary text, metadata, helper text
				'body': ['1rem', { lineHeight: '1.5rem' }],         // 16px - main content, form inputs, descriptions
				'subheading': ['1.125rem', { lineHeight: '1.75rem' }], // 18px - section introductions, callouts
				'heading': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px - component titles, card headers
				'title': ['1.5rem', { lineHeight: '2rem' }],        // 24px - page headers, main titles
				'display': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - hero titles, major headings
			},
			maxWidth: {
				'wider': '1076px', // 20% increase from max-w-4xl (896px)
			},
			colors: {
				// Legacy Zapier colors (keep for compatibility)
				earth: '#3A3A3A',
				'zapier-orange': '#FF4A00',
				cream: '#F5F5DC',
				'almost-white': '#FAFAFA',
				
				// Enhanced color system with CSS variables
				background: {
					DEFAULT: 'rgb(var(--background) / <alpha-value>)',
					secondary: 'rgb(var(--background-secondary) / <alpha-value>)',
					tertiary: 'rgb(var(--background-tertiary) / <alpha-value>)',
				},
				foreground: {
					DEFAULT: 'rgb(var(--foreground) / <alpha-value>)',
					secondary: 'rgb(var(--foreground-secondary) / <alpha-value>)',
					tertiary: 'rgb(var(--foreground-tertiary) / <alpha-value>)',
				},
				surface: {
					DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
					secondary: 'rgb(var(--surface-secondary) / <alpha-value>)',
					tertiary: 'rgb(var(--surface-tertiary) / <alpha-value>)',
					hover: 'rgb(var(--surface-hover) / <alpha-value>)',
					active: 'rgb(var(--surface-active) / <alpha-value>)',
				},
				border: {
					DEFAULT: 'rgb(var(--border) / <alpha-value>)',
					secondary: 'rgb(var(--border-secondary) / <alpha-value>)',
				},
				input: {
					DEFAULT: 'rgb(var(--input) / <alpha-value>)',
					border: 'rgb(var(--input-border) / <alpha-value>)',
					focus: 'rgb(var(--input-focus) / <alpha-value>)',
				},
				ring: 'rgb(var(--ring) / <alpha-value>)',
				primary: {
					DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
					foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
					50: 'rgb(var(--primary-50) / <alpha-value>)',
					100: 'rgb(var(--primary-100) / <alpha-value>)',
					200: 'rgb(var(--primary-200) / <alpha-value>)',
					300: 'rgb(var(--primary-300) / <alpha-value>)',
					400: 'rgb(var(--primary-400) / <alpha-value>)',
					500: 'rgb(var(--primary-500) / <alpha-value>)',
					600: 'rgb(var(--primary-600) / <alpha-value>)',
					700: 'rgb(var(--primary-700) / <alpha-value>)',
					800: 'rgb(var(--primary-800) / <alpha-value>)',
					900: 'rgb(var(--primary-900) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
					foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
					hover: 'rgb(var(--secondary-hover) / <alpha-value>)',
					active: 'rgb(var(--secondary-active) / <alpha-value>)',
				},
				muted: {
					DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
					foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
					hover: 'rgb(var(--muted-hover) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
					foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
					hover: 'rgb(var(--accent-hover) / <alpha-value>)',
				},
				popover: {
					DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
					foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
					border: 'rgb(var(--popover-border) / <alpha-value>)',
				},
				card: {
					DEFAULT: 'rgb(var(--card) / <alpha-value>)',
					foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
					hover: 'rgb(var(--card-hover) / <alpha-value>)',
					border: 'rgb(var(--card-border) / <alpha-value>)',
				},
				success: {
					DEFAULT: 'rgb(var(--success) / <alpha-value>)',
					foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
					50: 'rgb(var(--success-50) / <alpha-value>)',
				},
				warning: {
					DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
					foreground: 'rgb(var(--warning-foreground) / <alpha-value>)',
					50: 'rgb(var(--warning-50) / <alpha-value>)',
				},
				destructive: {
					DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
					foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
					50: 'rgb(var(--destructive-50) / <alpha-value>)',
				},
				info: {
					DEFAULT: 'rgb(var(--info) / <alpha-value>)',
					foreground: 'rgb(var(--info-foreground) / <alpha-value>)',
					50: 'rgb(var(--info-50) / <alpha-value>)',
				},
				sidebar: {
					DEFAULT: 'rgb(var(--sidebar-background) / <alpha-value>)',
					foreground: 'rgb(var(--sidebar-foreground) / <alpha-value>)',
					primary: 'rgb(var(--sidebar-primary) / <alpha-value>)',
					'primary-foreground': 'rgb(var(--sidebar-primary-foreground) / <alpha-value>)',
					accent: 'rgb(var(--sidebar-accent) / <alpha-value>)',
					'accent-foreground': 'rgb(var(--sidebar-accent-foreground) / <alpha-value>)',
					border: 'rgb(var(--sidebar-border) / <alpha-value>)',
					ring: 'rgb(var(--sidebar-ring) / <alpha-value>)',
				},
				// Interactive states
				hover: 'rgb(var(--hover) / <alpha-value>)',
				active: 'rgb(var(--active) / <alpha-value>)',
				focus: 'rgb(var(--focus) / <alpha-value>)',
			},
			zIndex: {
				'tooltip': '100',
				'dropdown': '200',
				'modal': '1000',
				'notification': '9999',
			},
			borderRadius: {
				lg: '8px',
				md: '6px',
				sm: '4px'
			},
			transitionDuration: {
				'fast': 'var(--transition-fast)',
				'normal': 'var(--transition-normal)',
				'slow': 'var(--transition-slow)',
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'DEFAULT': 'var(--shadow)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
			},
			keyframes: {
				// Existing accordion animations
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
				// Enhanced theme transition animations
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(4px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-4px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(10px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'theme-switch': {
					'0%': {
						transform: 'rotate(0deg) scale(1)',
					},
					'50%': {
						transform: 'rotate(180deg) scale(0.9)',
					},
					'100%': {
						transform: 'rotate(360deg) scale(1)',
					}
				},
				'pulse-soft': {
					'0%, 100%': {
						opacity: '1',
					},
					'50%': {
						opacity: '0.7',
					}
				}
			},
			animation: {
				// Existing animations
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Enhanced animations
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'theme-switch': 'theme-switch 0.5s ease-in-out',
				'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
