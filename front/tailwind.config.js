/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4fe',
          100: '#dde6fc',
          200: '#c3d4fa',
          300: '#9ab9f6',
          400: '#6a93f0',
          500: '#4570ea',
          600: '#3152de',
          700: '#2942cb',
          800: '#2738a5',
          900: '#253384',
          DEFAULT: '#CB3CFF'
        },
        figma: {
          background: '#081028',
          card: '#0B1739',
          cardLight: '#0B1739',
          button: '#CB3CFF',
          text: '#FFFFFF',
          textMuted: '#AEB9E1',
          components: '#D9E1FA'
        }
      },
      fontFamily: {
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}