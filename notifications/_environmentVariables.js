// Every entry in environmentVariables will be replaced by the value of an equaly named env var at runtime

const environmentVariables = {
  VUE_APP_I18N_LOCALE: '$VUE_APP_I18N_LOCALE',
  VUE_APP_ENVIRONMENT: '$VUE_APP_ENVIRONMENT',
}

export default environmentVariables
