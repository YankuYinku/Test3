import { AxiosError, AxiosResponse } from 'axios'
import { BasketSummary } from '@/models/basketSummary'
import env from '@/utils/env'
import { BasketDetails } from '@/models/basketDetails'
import { createRoutes } from '@apetito/sdk'
import { getHiddenBearerToken } from '@/composables/bearerToken'

const baseUrl = env.VUE_APP_BASKET_BASE_URL
const basketInitUrl = env.VUE_APP_BASKET_INITIALIZATION_URL

export interface BasketRoute {
  getBasketSummary(): Promise<AxiosResponse<BasketSummary>>

  getBasketDetails(): Promise<AxiosResponse<BasketDetails>>

  initShoppingSession(): Promise<AxiosResponse<void>>
}

export default () => {
  return createRoutes(env.VUE_APP_BASKET_BASE_URL, '', axiosInstance => {
    axiosInstance.interceptors.request.use(
      function (config) {
        const { token } = getHiddenBearerToken()

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }

        return config
      },
      function (error: AxiosError) {
        return Promise.reject(error)
      }
    )

    return {
      getBasketSummary() {
        return axiosInstance.get(`${baseUrl}/summary`)
      },

      getBasketDetails() {
        return axiosInstance.get(`${baseUrl}`)
      },

      initShoppingSession() {
        return axiosInstance.post(`${basketInitUrl}`)
      },
    }
  }) as BasketRoute
}
