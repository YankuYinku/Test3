module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.apps-user-account',
      exclude: [/:root.*/],
    },
  },
}
