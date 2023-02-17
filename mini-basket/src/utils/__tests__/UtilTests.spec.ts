/* eslint-disable @typescript-eslint/no-var-requires */
import { useCurrencyFormat } from '@/utils/currency'
import i18n from '@/i18n'
import env from '@/utils/env'

jest.mock('@/i18n', () => ({
  global: {
    locale: {
      value: 'de-DE',
    },
  },
}))

describe('Test currency functions', () => {
  const testCurrencyTransform = (testMap: Record<string, string>, currency?: string) => {
    for (const rawValue in testMap) {
      if (Object.prototype.hasOwnProperty.call(testMap, rawValue)) {
        const expectedValue = testMap[rawValue]

        expect(useCurrencyFormat(+rawValue, currency)).toEqual(expectedValue)
      }
    }
  }

  test('Returns currency formatted in EUR', () => {
    const testMap: Record<string, string> = {
      '12.55': '12,55 €',
      '99.00': '99,00 €',
      '1.5': '1,50 €',
    }

    testCurrencyTransform(testMap)
  })

  test('Returns currency formatted in USD', () => {
    i18n.global.locale.value = 'en-US'

    const testMap: Record<string, string> = {
      '12.55': '$12.55',
      '99.00': '$99.00',
      '1.5': '$1.50',
    }

    testCurrencyTransform(testMap, 'USD')
  })
})

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
