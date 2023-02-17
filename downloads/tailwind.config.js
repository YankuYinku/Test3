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
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [apetitoTailwind, require('@tailwindcss/line-clamp')],
}
