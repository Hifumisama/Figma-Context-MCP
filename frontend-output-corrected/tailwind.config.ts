import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colors from Figma design system
        primary: {
          DEFAULT: '#FBF8CC', // style_fill primary
          dark: '#F5EE84',     // style_fill primary darker
        },
        secondary: {
          DEFAULT: '#03045E',  // style_fill secondary
          dark: '#474306',     // style_stroke secondary darker
        },
        accent: '#F7F197',     // style_fill accent
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'hero': '100px',
        'section-title': '100px',
        'subtitle': '28px',
        'body': '24px',
        'small': '18px',
        'tiny': '15px',
      },
      lineHeight: {
        'hero': '1.16',
        'subtitle': '1.5',
        'body': '1.83',
        'small': '1.78',
      },
    },
  },
  plugins: [],
}

export default config
