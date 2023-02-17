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
      boxShadow: {
        account: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 -4px 10px -5px rgba(0, 0, 0, 0.2)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [apetitoTailwind],
}