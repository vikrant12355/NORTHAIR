/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF8',
        surface: {
          DEFAULT: '#FAFAF8',
          card: '#FFFFFF',
          low: '#F0F5EE',
          track: '#F3F5F3',
          high: '#E5E9E3',
        },
        primary: {
          DEFAULT: '#055237',
          container: '#286b4e',
          fixed: '#adf1cc',
          subtle: '#EAF3ED',
        },
        secondary: {
          DEFAULT: '#58605c',
          container: '#dce5df',
        },
        border: {
          DEFAULT: '#E9EDE9',
          subtle: '#E9EDE9',
          strong: '#D6DCD7',
        },
        text: {
          primary: '#202521',
          secondary: '#737B75',
          muted: '#9DA6A0',
        },
        severity: {
          good: '#26966B',
          satisfactory: '#8EBB56',
          moderate: '#E5B94F',
          poor: '#E58B38',
          veryPoor: '#D85D43',
          severe: '#BA1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Inter', 'monospace'],
      },
    },
  },
  plugins: [],
};

