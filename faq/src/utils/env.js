import environmentVariables from '../../_environmentVariables'

const getEnvironmentVariableHandler = {
  get: function (target, prop) {
    let value = target[prop]

    if (`${value}`.startsWith('$VUE_APP_')) {
      const envValue = process.env[prop]

      value = undefined

      if (typeof envValue !== 'undefined') {
        return envValue
      }
    }

    if (typeof value === 'undefined') {
      console.log(`Configuration: Value for "${prop}" is not defined`)
    }

    return value
  },
}

const env = new Proxy({ ...process.env, ...environmentVariables }, getEnvironmentVariableHandler)
export default env
