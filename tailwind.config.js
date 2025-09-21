/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./mobile.html", 
    "./mobile-index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom color palette
        'app-bg': '#1a1a1a',
        'app-bg-2': '#2d2d2d', 
        'app-panel': '#252525',
        'app-border': '#404040',
        'app-text': '#ffffff',
        'app-muted': '#888888',
        'app-accent': '#007acc',
        'app-accent-2': '#005a99',
        'app-success': '#00ff88',
        'app-warn': '#ffcc00',
        'app-error': '#ff4444',
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}