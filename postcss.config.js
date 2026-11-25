/**
 * FILE: postcss.config.js
 * PURPOSE:
 *   PostCSS configuration pipeline used by Next.js during build and development
 *   to compile Tailwind CSS directives and apply vendor prefixes via Autoprefixer.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
