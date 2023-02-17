import { useDateTimeFormatter } from '@/composables/useDateTime'
import dayjs from 'dayjs'
import { DirectiveBinding } from 'vue'

export const dateTime = (element: HTMLElement, binding: DirectiveBinding<string>) => {
  const dateToFormat = element?.innerText
  const format = binding.value ?? 'YYYY-MM-DDTHH:mm:ssZ'
  const validDate = dayjs(dateToFormat).isValid()
  if (dateToFormat && dateToFormat.length && validDate) {
    const { toLocaleDate } = useDateTimeFormatter('de-DE')
    const formatted = toLocaleDate(dateToFormat, format)
    if (formatted !== 'Invalid Date') {
      element.innerText = formatted
    }
  } else {
    console.warn('DateTime directive got invalid date to format.')
  }
}
