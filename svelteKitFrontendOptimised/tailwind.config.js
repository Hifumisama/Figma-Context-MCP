/** @type {import('tailwindcss').Config} */
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'light-yellow': '#FBF8CC',
        'dark-blue': '#03045E',
        'yellow-brand': '#F5EE84',
        'dark-brown': '#474306',
        'too-light-yellow': '#F7F197',
        'black': '#000000'
      },
      fontFamily: {
        'poppins': ['Poppins', ...fontFamily.sans]
      },
      fontSize: {
        'hero-title': '100px',
        'hero-subtitle': '28px',
        'heading': '24px',
        'body': '24px',
        'body-small': '18px',
        'body-tiny': '15px',
        'button': '20px',
        'name': '24px'
      },
      lineHeight: {
        'hero-tight': '1.16em',
        'relaxed-custom': '1.5em',
        'loose-custom': '1.83em',
        'extra-loose': '2.93em'
      },
      borderRadius: {
        'button': '6px'
      }
    }
  },
  plugins: []
};
