/**
 * FILE: tailwind.config.ts
 * PURPOSE:
 *   Tailwind CSS theme and content scanner configuration.
 *   Defines the official Jalurtumbuh Jobs brand color tokens (brand-blue, brand-dark,
 *   brand-sky, brand-light, brand-yellow) and scans all files inside `app/` and `components/`.
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E6FD9',
          dark: '#0B1F3A',
          sky: '#38BDF8',
          light: '#EBF4FF',
          yellow: '#FACC15',
        },
      },
    },
  },
  plugins: [],
};
export default config;
