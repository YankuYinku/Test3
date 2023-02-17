import { DocumentNode } from 'graphql'
import { ApolloError, ApolloQueryResult } from '@apollo/client'
import { useDownloadQuery } from '@/composables/query'
import { computed, ComputedRef, reactive, Ref, UnwrapNestedRefs } from 'vue'
import { ISortiment } from '@apetito/portal-sdk-common'
import { CategoriesSummarizationModel } from '@/models/category/categoriesSummarization.model'
import { IDownloadDetailModel } from '@/models/download.model'
import { QueryParams } from '@/types'

export const useApolloStorePromise = <T>(
  store: { query: DocumentNode; queryParams: QueryParams },
  onResultCallback?: (data: ApolloQueryResult<T>) => void
) => {
  const { onResult, onError, loading, stop } = useDownloadQuery<T>(store.query, store.queryParams)

  return {
    onResult,
    onError,
    loading,
    stop,
    promise: new Promise<ApolloQueryResult<T>>((resolve, reject) => {
      onResult(result => {
        onResultCallback && onResultCallback(result)
        if (result) {
          return resolve(result)
        }
      })
      onError(error => {
        return reject(error)
      })
    }),
  }
}

export type DownloadModel = {
  pageSize: number
  overallItems: number
  overallPages: number
  categoriesSummarization: CategoriesSummarizationModel[]
  items: IDownloadDetailModel[]
  queryParams: QueryParams
}

const defaultDownloadModel: DownloadModel = {
  pageSize: 0,
  overallItems: 0,
  overallPages: 0,
  categoriesSummarization: [],
  items: [],
  queryParams: {
    pageSize: 20,
    page: 1,
    sortiments: [],
    orderSystems: [],
    customerNumbers: [],
    search: '',
  },
}

export type DownloadModelType<T> = {
  onError: (fn: (param: ApolloError) => void) => { off: () => void }
  build: (
    data: ApolloQueryResult<T>,
    dataMapper: (data: ApolloQueryResult<T>) => IDownloadDetailModel[]
  ) => void
  resetQueryParams: () => void
  stop: () => void
  setQueryParams: (
    sortiments: ISortiment[],
    orderSystems: string[],
    customerNumbers: number[]
  ) => void
  promise: Promise<ApolloQueryResult<T>>
  isSortimentEmpty: ComputedRef<boolean>
  loading: Ref<boolean>
  download: UnwrapNestedRefs<DownloadModel>
  onResult: (fn: (param: ApolloQueryResult<T>) => void) => { off: () => void }
}

export const useDownloadModel = <T>(
  query: DocumentNode,
  languageCode: string,
  onResultCallback?: (data: ApolloQueryResult<T>) => void,
  sortiments?: ISortiment[],
  orderSystems?: string[],
  customerNumbers?: number[]
): DownloadModelType<T> => {
  const download = reactive<DownloadModel>({} as DownloadModel)
  Object.assign(download, JSON.parse(JSON.stringify(defaultDownloadModel)))
  download.queryParams.languageCode = languageCode

  const setQueryParams = (
    sortiments: ISortiment[],
    orderSystems: string[],
    customerNumbers: number[]
  ) => {
    download.queryParams.sortiments = sortiments.map(sortiment => sortiment.code) || []
    download.queryParams.orderSystems = orderSystems || []
    download.queryParams.customerNumbers =
      customerNumbers.map(customerNumber => customerNumber.toString()) || []
  }

  const resetQueryParams = () => {
    Object.assign(download.queryParams, {
      ...JSON.parse(JSON.stringify(defaultDownloadModel.queryParams)),
    })
  }

  const build = (
    data: ApolloQueryResult<T>,
    mapItems: (data: ApolloQueryResult<T>) => IDownloadDetailModel[]
  ) => {
    download.items = mapItems(data)
  }

  setQueryParams(sortiments || [], orderSystems || [], customerNumbers || [])

  const isSortimentEmpty = computed(() => download.queryParams.sortiments.length === 0)

  const { onResult, onError, stop, loading, promise } = useApolloStorePromise<T>(
    {
      queryParams: download.queryParams,
      query,
    },
    onResultCallback
  )

  return {
    build,
    resetQueryParams,
    download,
    isSortimentEmpty,
    onResult,
    onError,
    promise,
    stop,
    setQueryParams,
    loading,
  }
}
