// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  filenameHashing: false,

  // Do we really need this? Seems to be '/' (the default) in all cases
  // publicPath: process.env.VUE_APP_PUBLIC_PATH,

  devServer: {
    https: true,
  },

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

  configureWebpack: {
    externals: ['@apetito/portal-sdk-common', 'single-spa'],

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets/img',
            to: 'img',
          },
        ],
      }),
    ],
  },
}
