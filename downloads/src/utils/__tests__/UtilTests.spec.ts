/* eslint-disable @typescript-eslint/no-var-requires */
import i18n from '@/i18n'
import env from '@/utils/env'

jest.mock('@/i18n', () => ({
  global: {
    locale: {
      value: 'de-DE',
    },
  },
}))

describe('Test env handler', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Check env variables', () => {
    console.log = jest.fn()
    process.env.VUE_APP_I18N_LOCALE = 'de-DE'

    expect(env.VUE_APP_I18N_LOCALE).toEqual('de-DE')
    expect(env.VUE_APP_NON_EXISTING_VAR).toEqual(undefined)
  })
})
