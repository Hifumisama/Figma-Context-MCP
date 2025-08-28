import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        'dark-blue': '#03045E',
        'dark-brown': '#474306',
        'yellow': '#F5EE84',
        'light-yellow': '#FBF8CC',
        'too-light-yellow': '#F7F197',
      },
    },
  },
  plugins: [],
} satisfies Config;
