import dayjs from 'dayjs'
import deLocale from 'dayjs/locale/de'
import atLocale from 'dayjs/locale/de-at'
import nlLocale from 'dayjs/locale/nl'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)
interface IDateConfig {
  [locale: string]: { localeName: string; localeConfig: ILocale }
}
const dateConfig: IDateConfig = {
  'de-DE': {
    localeName: 'de',
    localeConfig: deLocale,
  },
  'de-AT': {
    localeName: 'de-at',
    localeConfig: atLocale,
  },
  'nl-NL': {
    localeName: 'nl',
    localeConfig: nlLocale,
  },
}
export default function useDateTimeFormatter(dateFormat: string, locale: string) {
  function formatToLocaleDate(date: string) {
    if (date) {
      const config = dateConfig[locale] ?? dateConfig['de-DE']
      dayjs.locale(config.localeConfig, undefined, true)

      return dayjs(date, dateFormat, config.localeName).format('L')
    }
    return ''
  }
  return { formatToLocaleDate }
}
