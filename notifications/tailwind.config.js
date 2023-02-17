// eslint-disable-next-line @typescript-eslint/no-var-requires
const apetitoTailwind = require('@apetito/components-ui-vue3/dist/apetito-components-ui-tailwind.plugin.js')

module.exports = {
  purge: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@apetito/components-ui-vue3/**/*.js',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        3.75: '0.9375rem',
      },
      borderWidth: {
        12: '12px',
      },
      colors: {
        'notification-info': {
          light: '#eff7fa',
          dark: '#2184a8',
        },
        'notification-success': {
          light: '#f0faef',
          dark: '#58b03b',
        },
        'notification-warn': {
          light: '#fdfbf5',
          dark: '#f7a600',
        },
        'notification-error': {
          light: '#fdf5f5',
          dark: '#b2182b',
        },
      },
      padding: {
        7.5: '1.875rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [apetitoTailwind],
}
