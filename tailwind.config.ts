import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E6FD9',
          dark: '#0F172A',
          sky: '#38BDF8',
          light: '#EBF4FF',
          soft: '#F0F7FF',
          yellow: '#FACC15',
        },
      },
    },
  },
  plugins: [],
};
export default config;