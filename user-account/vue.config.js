// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  configureWebpack: {
    externals: ['@apetito/portal-sdk-common', 'single-spa'],

    devServer: {
      https: true,
    },

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
