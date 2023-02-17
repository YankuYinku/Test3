import i18n from '@/i18n'

export function useCurrencyFormat(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat(i18n.global.locale.value, { style: 'currency', currency }).format(
    amount
  )
}
