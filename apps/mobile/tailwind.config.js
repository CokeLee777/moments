const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: '#060b16',
        navy: '#0b1120',
        primary: '#3b82f6',
        indigo: '#6366f1',
        surface: '#f8fafc',
        muted: '#94a3b8',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
};
