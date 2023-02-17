module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.apps-faq',
      exclude: [/:root.*/],
    },
  },
}
