import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  provide,
  ref,
  Ref,
  watch,
} from 'vue'
import { DownloadModelType, useDownloadModel } from '@/composables/store'
import { ApolloClient } from '@apollo/client/core'
import { ApolloQueryResult, NormalizedCacheObject } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { IDownloadDetailModel } from '@/models/download.model'
import {
  useEventBus,
  CustomerChangedActionPayload,
  Action,
  ISortiment,
} from '@apetito/portal-sdk-common'
import { ApolloClients, provideApolloClient } from '@vue/apollo-composable'
import { CategoriesSummarizationModel } from '@/models/category/categoriesSummarization.model'
import { IDownloadsQueryResult } from '@/types'
import { useMapCategories } from '@/composables/Categories'
import { CLIENTS } from '@/constants/graphql'
import {
  DownloadModelInjectionKey,
  DownloadModelInjectionKeyType,
} from '@/models/download/_injectionKeys'
import { useCommonFilters } from '@/composables/download/filters'
import { useI18n } from 'vue-i18n'

export const useDownloads = <TApolloQueryResultType>(
  apolloClient: ApolloClient<NormalizedCacheObject>,
  query: DocumentNode,
  languageCode: string,
  defaultCategory: CategoriesSummarizationModel,
  dataMapper: (rawData: ApolloQueryResult<TApolloQueryResultType>) => IDownloadDetailModel[],
  onResultCallback: (rawData: ApolloQueryResult<TApolloQueryResultType>) => unknown
) => {
  const eventBusResult = useEventBus<CustomerChangedActionPayload>(
    '@apetito/user-account',
    getCurrentInstance()
  )

  const { getEventBusPayload: loadQueryParams, subscribeEventBusAction } = eventBusResult
  const loadingSortiments = eventBusResult.loading
  const loadingDownloads = ref(true)
  const downloadModel: Ref<DownloadModelType<TApolloQueryResultType>> = ref() as Ref<
    DownloadModelType<TApolloQueryResultType>
  >
  const loading = ref(true)

  const watchStopHandle = watch(
    [loadingSortiments, loadingDownloads, downloadModel],
    ([loadingSortiments, loadingDownloads, downloadModel]) => {
      loading.value = (loadingSortiments ||
        loadingDownloads ||
        downloadModel?.loading ||
        false) as boolean
    },
    { deep: true }
  )

  const showPagination = computed(() => {
    return downloadModel.value.download?.overallPages > 0
  })

  const unbindQueryRef = ref()

  const unbindQuery = () => {
    if (typeof unbindQueryRef.value === 'function') {
      unbindQueryRef.value()
    }
    downloadModel.value.stop()
  }

  const onCustomerChanged = (event: Action<CustomerChangedActionPayload> | undefined) => {
    nextTick(() => {
      downloadModel.value.download.queryParams.page = 1
      downloadModel.value.setQueryParams(
        event?.payload?.sortiments || [],
        event?.payload?.effectiveOrderSystems || [],
        event?.payload?.customerNumbers.map(customer => customer.customerNumber) || []
      )
    })
  }

  const beforeUnmountHook = () => {
    unbindQuery()
    watchStopHandle()
  }

  const loadDownloadsModel = (
    sortiments: ISortiment[],
    orderSystems: string[],
    customerNumbers: number[]
  ) => {
    if (apolloClient) {
      provideApolloClient(apolloClient)
    }
    downloadModel.value = useDownloadModel<TApolloQueryResultType>(
      query,
      languageCode,
      undefined,
      sortiments,
      orderSystems,
      customerNumbers
    ) as DownloadModelType<TApolloQueryResultType>

    downloadModel.value.promise.then(data => {
      downloadModel.value.build(data, dataMapper)
      loadingDownloads.value = false
      subscribeEventBusAction(onCustomerChanged)
    })

    unbindQueryRef.value = downloadModel.value.onResult(rawData => {
      downloadModel.value.build(rawData, dataMapper)
      onResultCallback && onResultCallback(rawData)
    })
  }

  onBeforeUnmount(() => {
    beforeUnmountHook()
  })

  return {
    downloadModel,
    loadingSortiments,
    loadingDownloads,
    loading,
    loadQueryParams,
    loadDownloadsModel,
    showPagination,
  }
}

export const useDownloadView = (
  query: DocumentNode,
  defaultCategory: CategoriesSummarizationModel,
  languageCode: string,
  dataMapperFn: (rawData: ApolloQueryResult<IDownloadsQueryResult>) => IDownloadDetailModel[]
) => {
  const { t } = useI18n()
  const apolloClients = inject<{ [key: string]: ApolloClient<NormalizedCacheObject> }>(
    ApolloClients,
    {}
  )
  const filters = ref<Record<string, unknown> | null>(null)

  const onResultCallback = (response: ApolloQueryResult<IDownloadsQueryResult>) => {
    downloadModel.value.download.overallPages = response.data.downloads.overallPages
    downloadModel.value.download.overallItems = response.data.downloads.overallItems

    const mapCategories = useMapCategories(
      defaultCategory,
      downloadModel.value.download.overallItems
    )

    mapCategories(response.data.downloads.categoriesSummarization).then(categories => {
      downloadModel.value.download.categoriesSummarization = categories
    })

    nextTick(() => {
      document.querySelector('.root-wrapper-inner')?.scrollTo({
        top: 0,
      })
      buildFilters(defaultCategory)
    })
  }

  const downloads = useDownloads(
    apolloClients[CLIENTS.DEFAULT],
    query,
    languageCode,
    defaultCategory,
    dataMapperFn,
    onResultCallback
  )
  const { downloadModel, loadQueryParams, loadDownloadsModel, showPagination } = downloads
  const loading = downloads.loading
  const loadingDownloads = downloads.loadingDownloads
  const loadingSortiments = downloads.loadingSortiments

  provide(DownloadModelInjectionKey, downloadModel as DownloadModelInjectionKeyType)

  const { onFilterChange, buildFilters } = useCommonFilters<IDownloadsQueryResult>(
    downloadModel,
    filters
  )

  onBeforeMount(() => {
    loadQueryParams().then(payload => {
      loadDownloadsModel(
        payload.sortiments,
        payload.effectiveOrderSystems,
        payload.customerNumbers.map(customer => customer.customerNumber)
      )
    })
  })

  const emptyDownloadsMessage = computed(() => {
    const sortimentIsEmpyt = downloadModel.value.isSortimentEmpty.value

    if (downloadModel.value.download.items.length === 0 && !sortimentIsEmpyt) {
      console.log(downloadModel.value.download.items)
      return t('downloadList.nothingFound')
    }

    return sortimentIsEmpyt && t('downloadList.emptySortiments')
  })

  return {
    loading,
    loadingSortiments,
    loadingDownloads,
    filters,
    onFilterChange,
    downloadModel,
    emptyDownloadsMessage,
    showPagination,
  }
}
