import { ref } from 'vue'
import i18n from '@/i18n'

export const parseJwt = (token: string) => {
  const base64Url = token.split('.')[1]
  if (base64Url) {
    const base64 = decodeURIComponent(
      atob(base64Url)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(base64)
  }
  return {}
}

export const getHiddenBearerToken = () => {
  const hiddenTokenInput = document.querySelector(
    'input[id$="hiddenBearerToken"]'
  ) as HTMLInputElement
  const token = hiddenTokenInput?.value
  const awaitingToken = ref(!token)

  const updateBearerToken = () => {
    const { token } = getHiddenBearerToken()

    awaitingToken.value = !token
    i18n.global.locale.value = parseJwt(token)
  }

  if (hiddenTokenInput && !hiddenTokenInput.hasAttribute('listener-mounted')) {
    hiddenTokenInput.addEventListener('input', updateBearerToken)
    hiddenTokenInput.setAttribute('listener-mounted', 'updateBearerToken')
  }

  return { awaitingToken, token }
}
