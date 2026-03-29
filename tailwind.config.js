/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand surfaces
        'surface-lowest': '#100b1d',
        'surface-dim': '#151022',
        background: '#151022',
        surface: '#151022',
        'surface-low': '#1e192b',
        'surface-container-low': '#1e192b',
        'surface-container': '#221d2f',
        'surface-container-high': '#2c273a',
        'surface-container-highest': '#373245',
        'surface-variant': '#373245',
        'surface-bright': '#3c364a',
        // Primary - Lavender Signal
        primary: '#cebdff',
        'primary-fixed': '#e8ddff',
        'primary-fixed-dim': '#cebdff',
        'primary-container': '#6d28ff',
        'on-primary': '#380095',
        'on-primary-fixed': '#20005e',
        'on-primary-fixed-variant': '#5000cf',
        'on-primary-container': '#e3d7ff',
        'inverse-primary': '#6a22fc',
        // Secondary - Soft Peach / Fire Orange
        secondary: '#ffb598',
        'secondary-fixed': '#ffdbce',
        'secondary-fixed-dim': '#ffb598',
        'secondary-container': '#f46216',
        'on-secondary': '#591d00',
        'on-secondary-fixed': '#370e00',
        'on-secondary-fixed-variant': '#7e2c00',
        'on-secondary-container': '#4e1800',
        // Tertiary - Crunch Gold
        tertiary: '#f9bd42',
        'tertiary-fixed': '#ffdea7',
        'tertiary-fixed-dim': '#f9bd42',
        'tertiary-container': '#805b00',
        'on-tertiary': '#412d00',
        'on-tertiary-fixed': '#271900',
        'on-tertiary-fixed-variant': '#5e4200',
        'on-tertiary-container': '#ffd895',
        // Text on dark surfaces
        'on-surface': '#e8def8',
        'on-surface-variant': '#cbc3da',
        'on-background': '#e8def8',
        // Outline
        outline: '#948da3',
        'outline-variant': '#494457',
        // Inverse
        'inverse-surface': '#e8def8',
        'inverse-on-surface': '#332d41',
        // Error
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
        // Semantic
        'surface-tint': '#cebdff',
        // Baja cyan
        'baja-cyan': '#12D7F2',
        'baja-cyan-dim': 'rgba(18, 215, 242, 0.2)',
        // Misc
        'baja-fire': '#FF6A1F',
        'success-green': '#4ADE80',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      boxShadow: {
        'neon-primary': '0 0 20px rgba(109, 40, 255, 0.3)',
        'neon-secondary': '0 0 25px rgba(244, 98, 22, 0.4)',
        'neon-tertiary': '0 0 20px rgba(249, 189, 66, 0.3)',
        'baja-glow': '0 0 15px rgba(18, 215, 242, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(109, 40, 255, 0.15)',
        'card-glow': '0 4px 12px -2px rgba(18, 215, 242, 0.3)',
      },
    },
  },
  plugins: [],
};
