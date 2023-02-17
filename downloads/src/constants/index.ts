import i18n from '@/i18n'

export const TYPING_DELAY = 500
export const BASE_STRING_LENGTH_BEFORE_PROCESSING = 2
export const DEFAULT_DEBOUNCE_TIME = 4000
export const DEFAULT_CATEGORY = {
  DOWNLOADS: {
    categoryCode: '',
    categoryName: i18n.global.t('category.all.downloads'),
    categoryDescription: '',
    amount: 0,
  },
}
