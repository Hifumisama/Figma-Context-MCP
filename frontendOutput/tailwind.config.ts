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
        primary: '#03045E', // Bleu foncé du design
        secondary: '#474306', // Brun/jaune foncé
        accent: '#F7F197', // Jaune clair
        background: '#FBF8CC', // Jaune très clair
        yellow: {
          light: '#FBF8CC',
          medium: '#F5EE84',
          dark: '#F7F197'
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
