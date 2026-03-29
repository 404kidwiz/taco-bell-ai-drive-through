/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'night-plum': '#151022',
        'electric-grape': '#6D28FF',
        'lavender-signal': '#CEBDFF',
        'fire-orange': '#FF6A1F',
        'crunch-gold': '#FFC247',
        'baja-cyan': '#12D7F2',
        'surface-low': '#1E192B',
        'surface-mid': '#221D2F',
        'surface-high': '#2C273A',
        'surface-highest': '#373245',
        'readable-body': '#CBC3DA',
        'outline': '#948DA3',
        // Legacy tokens mapped to new palette
        'void': '#151022',
        'void-light': '#1E192B',
        'void-elevated': '#221D2F',
        'orange': '#FF6A1F',
        'yellow': '#FFC247',
        'purple': '#6D28FF',
        'purple-light': '#CEBDFF',
        'green': '#12D7F2',
        'red': '#EF4444',
        'warning': '#FFC247',
        'muted': '#948DA3',
        'dim': '#948DA3',
        'white': '#FFFFFF',
        'border': 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.15)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pill': '9999px',
        'card': '20px',
      },
      boxShadow: {
        'glow-grape': '0 0 30px rgba(109,40,255,0.3)',
        'glow-orange': '0 0 30px rgba(255,106,31,0.35)',
        'glow-cyan': '0 0 30px rgba(18,215,242,0.3)',
        'glow-gold': '0 0 30px rgba(255,194,71,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(109,40,255,0.15)',
      },
    },
  },
  plugins: [],
};
