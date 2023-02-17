module.exports = {
  configureWebpack: {
    externals: ['@apetito/portal-sdk-common', 'single-spa'],
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  },
  filenameHashing: false,

  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8082, // CHANGE YOUR PORT HERE!
    https: true,
    hotOnly: false,
  },

  // Do we really need this? Seems to be '/' (the default) in all cases
  // publicPath: process.env.VUE_APP_PUBLIC_PATH,

  pluginOptions: {
    i18n: {
      locale: 'de-DE',
      fallbackLocale: 'de-DE',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true,
    },
  },
}
