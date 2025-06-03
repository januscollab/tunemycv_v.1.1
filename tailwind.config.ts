
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
			maxWidth: {
				'wider': '1076px', // 20% increase from max-w-4xl (896px)
			},
			colors: {
				// Zapier color palette
				earth: '#3A3A3A',
				'zapier-orange': '#FF4A00',
				cream: '#F5F5DC',
				'almost-white': '#FAFAFA',
				
				border: '#E5E5E5',
				input: '#F5F5F5',
				ring: '#FF4A00',
				background: '#FAFAFA',
				foreground: '#3A3A3A',
				primary: {
					DEFAULT: '#FF4A00',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#F5F5DC',
					foreground: '#3A3A3A'
				},
				destructive: {
					DEFAULT: '#DC2626',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#F5F5F5',
					foreground: '#6B7280'
				},
				accent: {
					DEFAULT: '#F5F5DC',
					foreground: '#3A3A3A'
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#3A3A3A'
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#3A3A3A'
				},
				sidebar: {
					DEFAULT: '#FAFAFA',
					foreground: '#3A3A3A',
					primary: '#FF4A00',
					'primary-foreground': '#FFFFFF',
					accent: '#F5F5F5',
					'accent-foreground': '#3A3A3A',
					border: '#E5E5E5',
					ring: '#FF4A00'
				}
			},
			borderRadius: {
				lg: '8px',
				md: '6px',
				sm: '4px'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
