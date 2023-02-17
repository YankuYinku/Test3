module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.apps-mini-basket',
      exclude: [/:root.*/],
    },
  },
}
