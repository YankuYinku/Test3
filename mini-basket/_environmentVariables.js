// Every entry in environmentVariables will be replaced by the value of an equally named env var at runtime

const environmentVariables = {
  VUE_APP_I18N_LOCALE: '$VUE_APP_I18N_LOCALE',
  VUE_APP_BASKET_BASE_URL: '$VUE_APP_BASKET_BASE_URL',
  VUE_APP_BASKET_INITIALIZATION_URL: '$VUE_APP_BASKET_INITIALIZATION_URL',
}

export default environmentVariables
