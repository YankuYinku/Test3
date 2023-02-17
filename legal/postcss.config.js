module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.apps-legal',
      exclude: [/:root.*/],
    },
  },
}
