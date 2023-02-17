module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.apps-contact-form',
      exclude: [/(:root.*|body|html|\.apps-contact-form)/],
    },
  },
}
