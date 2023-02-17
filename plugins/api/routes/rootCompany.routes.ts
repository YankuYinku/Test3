import { IRootCompanyApiRoutes, IRootCompanyResult } from '../models/IRootCompanyApi.model'
import { createRoutes } from '@apetito/sdk'
import { AxiosResponse } from 'axios'
import qs from 'qs'

import env from '@/utils/env'

export default (bearerToken: string) => {
  return createRoutes(env.VUE_APP_ROOT_COMPANY_API_BASE_URL, bearerToken, axiosInstance => {
    return {
      getCompanyData(customerNumber: number): Promise<AxiosResponse<IRootCompanyResult>> {
        return axiosInstance.get('/root/company', {
          params: {
            customerNumber: customerNumber,
          },
          paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'repeat' })
          },
        })
      },
    }
  }) as IRootCompanyApiRoutes
}
