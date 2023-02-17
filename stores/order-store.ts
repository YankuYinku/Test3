import { useDateTimeFormatter } from '@/composables/useDateTime'
import {
  addHawaArticlesToBasket,
  addItemsToBasket,
  articleAvailability,
  getApetitoOrderDetails,
  getHawawOrderDetails,
  getOrdersQuery,
  hawaArticleAvailability,
} from '@/graphql/orders'
import i18n from '@/i18n'
import { GetOrderResult } from '@/models/get-order-result'
import { mockOrderResult } from '@/models/mockedOrders'
import {
  AddItemsToBasketHawaResultDto,
  AddItemsToBasketResultDto,
  AddItemToBasketHawaRequestModelInput,
  AddItemToBasketRequestModel,
  ApetitoOrderDetailsResponse,
  ApetitoOrderPosition,
  ArticleAvailability,
  ArticleWithQuantityDtoInput,
  AvailabilityCheckResultDto,
  HawaAvailabilityCheckResultDto,
  HawaOrderDetailsResponse,
  HawaOrderPosition,
  OrderDateRange,
} from '@/models/order'
import state from '@/stores/orders-state'
import { ApolloClient, ApolloQueryResult, NormalizedCacheObject } from '@apollo/client/core'
import { useDebounceFn } from '@vueuse/shared'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { IUserData } from 'portal-sdk-common'
import { useMessage } from '@apetito/portal-sdk-common'

const { dispatchSuccessMessage, dispatchErrorMessage } = useMessage()

const t = i18n.global.t

export const useStore = defineStore('orders-store', {
  state,
  actions: {
    async loadOrders(client: ApolloClient<NormalizedCacheObject>) {
      const variables = {
        ...this.currentFilters,
        page: this.currentPage,
        customerNumbers: this.selectedCustomerNumbers.map(cusNum => cusNum.customerNumber) ?? [],
      }

      this.loading = true

      return client
        .query<GetOrderResult>({ query: getOrdersQuery, variables })
        .then(result => {
          this.loading = false

          if (result.errors?.length) {
            this._showErrorLoadOrders()
            throw new Error('Could not load order history.')
          }

          return result
        })
        .then(this._mapOrderResult)
        .catch(error => {
          this.loading = false

          this._showErrorLoadOrders()
          throw error
        })
    },

    async getHawaArticleAvailability(
      client: ApolloClient<NormalizedCacheObject>,
      articles: string[]
    ) {
      this.articleAvailability = []
      this.articleAvailabilityChecked = false

      this.articleAvailabilityLoading = true

      const queryDetails = {
        query: hawaArticleAvailability,
        variables: { articles: articles, suppliers: this.supplierIds },
      }

      return client
        .query<HawaAvailabilityCheckResultDto>(queryDetails)
        .then(result => {
          this.articleAvailabilityLoading = false

          if (result.errors?.length) {
            this._showErrorArticleAvailability()
            throw new Error('Could not check article availability.')
          }

          const availables =
            result.data?.checkHawaArticlesAvailability?.available.map(
              article =>
                ({
                  articleId: article,
                  available: true,
                } as ArticleAvailability)
            ) ?? []
          const notAvailables =
            result.data?.checkHawaArticlesAvailability?.notAvailable?.map(
              article =>
                ({
                  articleId: article,
                  available: false,
                } as ArticleAvailability)
            ) ?? []

          this.articleAvailability = [...availables, ...notAvailables]

          this.articleAvailabilityChecked = true
        })
        .catch(error => {
          this.articleAvailabilityLoading = false
          this._showErrorArticleAvailability()
          throw error
        })
    },

    /**
     * At the time of writing the availability API only returns correct values for articles it knows.
     * If something else is send to the API, which is not part of the article DB, it will be returned
     * with the given amount. (kind of "failing gracefully" without even mentioning)
     */
    async getArticleAvailability(
      client: ApolloClient<NormalizedCacheObject>,
      articles: ArticleWithQuantityDtoInput[]
    ) {
      this.articleAvailability = []
      this.articleAvailabilityChecked = false

      this.articleAvailabilityLoading = true

      const queryDetails = {
        query: articleAvailability,
        variables: { articles: articles, suppliers: this.supplierIds },
      }

      return client
        .query<AvailabilityCheckResultDto>(queryDetails)
        .then(result => {
          this.articleAvailabilityLoading = false

          if (result.errors?.length) {
            this._showErrorArticleAvailability()
            throw new Error('Could not check article availability.')
          }

          const availables =
            result.data?.checkArticlesAvailability?.available.map(
              article =>
                ({
                  amount: article.allowedQuantity,
                  articleId: article.articleNumber,
                  available: true,
                } as ArticleAvailability)
            ) ?? []
          const notAvailables =
            result.data?.checkArticlesAvailability?.notAvailable?.map(
              article =>
                ({
                  amount: article.allowedQuantity,
                  articleId: article.articleNumber,
                  available: false,
                } as ArticleAvailability)
            ) ?? []

          this.articleAvailability = [...availables, ...notAvailables]

          this.articleAvailabilityChecked = true
        })
        .catch(error => {
          this._showErrorArticleAvailability()
          throw error
        })
    },

    async loadApetitoOrderDetails(
      client: ApolloClient<NormalizedCacheObject>,
      orderId: string,
      customerNumbers: number[]
    ) {
      this.detailsLoading = true

      const variables = {
        orderId,
        customerNumbers,
      }

      return client
        .query<ApetitoOrderDetailsResponse>({
          query: getApetitoOrderDetails,
          variables,
        })
        .then(response => {
          this.detailsLoading = false

          if (response.errors?.length) {
            this._showErrorApetitoDetailsLoad()
            throw new Error('Could not load order details.')
          }

          this.apetitoOrderDetails = response.data.apetitoOrderDetails
          return response.data.apetitoOrderDetails
        })
        .then(orderDetails => {
          const allArticles = orderDetails.positions.map(
            position =>
              ({
                quantity: position.quantity,
                articleNumber: position.articleId,
              } as ArticleWithQuantityDtoInput)
          )
          return this.getArticleAvailability(client, allArticles)
            .then(() => orderDetails)
            .catch(() => orderDetails)
        })
        .catch(error => {
          this._showErrorApetitoDetailsLoad()
          this.detailsLoading = false
          throw error
        })
    },

    async loadHawaOrderDetails(
      client: ApolloClient<NormalizedCacheObject>,
      orderId: string,
      customerNumbers: number[]
    ) {
      this.detailsLoading = true

      const variables = {
        orderId,
        customerNumbers,
      }

      return client
        .query<HawaOrderDetailsResponse>({ query: getHawawOrderDetails, variables })
        .then(response => {
          this.detailsLoading = false

          if (response.errors?.length) {
            this._showErrorHawaDetailsLoad()
            throw new Error('Could not load order details.')
          }

          this.hawaOrderDetails = response.data.hawaOrderDetails

          return response.data.hawaOrderDetails
        })
        .then(hawaDetails => {
          const allArticles = hawaDetails.orderPositions.map(position => position.articleNumber)

          return this.getHawaArticleAvailability(client, allArticles)
            .then(() => hawaDetails)
            .catch(() => hawaDetails)
        })
        .catch(error => {
          this._showErrorHawaDetailsLoad()
          return error
        })
        .finally(() => {
          this.detailsLoading = false
        })
    },

    async addItemsToBasket(client: ApolloClient<NormalizedCacheObject>) {
      const articles: AddItemToBasketRequestModel[] = this.articleAvailability.map(
        article =>
          ({
            articleId: article.articleId,
            quantity: article.amount,
          } as AddItemToBasketRequestModel)
      )

      this.addArticlesToBasketLoading = true

      return client
        .mutate<AddItemsToBasketResultDto>({
          mutation: addItemsToBasket,
          variables: { addItemModels: articles },
        })
        .then(result => {
          this.addArticlesToBasketLoading = false
          if (result.errors?.length) {
            this._showAddToBasketError()
            throw Error('Could not add items to basket')
          }

          this._showAddToBasketSuccess()

          this.refreshBasket()
          return result.data
        })
        .catch(() => {
          this.addArticlesToBasketLoading = false
          this._showAddToBasketError()
          throw Error('Could not add items to basket')
        })
    },

    addHawaArticlesToBasket(client: ApolloClient<NormalizedCacheObject>) {
      const articles = this.hawaArticlesToReorder.map(
        (article: HawaOrderPosition) =>
          ({
            articleNumber: article.articleNumber,
            quantity: article.quantity,
            supplierId: article.supplierId,
          } as AddItemToBasketHawaRequestModelInput)
      )

      this.addArticlesToBasketLoading = true

      return client
        .mutate<AddItemsToBasketHawaResultDto>({
          mutation: addHawaArticlesToBasket,
          variables: { articles },
        })
        .then(result => {
          this.addArticlesToBasketLoading = false

          if (result.errors?.length) {
            throw new Error('Could not add articles to basket.')
          }

          if (result.data?.addItemsToBasketHawa.failedArticles?.length) {
            this._showAddHawaToBasketSomeError(
              result.data.addItemsToBasketHawa.failedArticles.length
            )
          }

          if (result.data?.addItemsToBasketHawa.succeededArticles?.length) {
            this._showAddHawaToBasketSuccess(
              result.data.addItemsToBasketHawa.succeededArticles?.length
            )
            this.refreshBasket()
          }
        })
        .catch(() => {
          this.addArticlesToBasketLoading = false

          this._showAddHawaToBasketGeneralError()
        })
    },

    refreshBasket() {
      useDebounceFn(() => {
        window.dispatchEvent(new Event('mini-basket:refresh'))
      }, 500)()
    },

    returnMockData() {
      return this._mapOrderResult({
        data: mockOrderResult,
      } as ApolloQueryResult<GetOrderResult>)
    },

    setOrderTypeFilter(value: string | null) {
      this._resetPage()
      this.currentFilters.supplier = value ?? undefined
    },

    setOrderDateRangeFilter(value: OrderDateRange | null) {
      this._resetPage()
      let dateFrom = ''
      let dateTo = ''
      const now = dayjs()
      switch (value) {
        case 'last 30 days':
          dateFrom = now.subtract(30, 'days').toISOString()
          dateTo = now.toISOString()
          break

        case 'last 3 month':
          dateFrom = now
            .set('day', 1)
            .set('month', now.subtract(3, 'month').get('month'))
            .toISOString()
          dateTo = now.set('day', now.daysInMonth()).toISOString()
          break

        case 'last 6 months':
          dateFrom = now
            .set('day', 1)
            .set('month', now.subtract(6, 'month').get('month'))
            .toISOString()
          dateTo = now.set('day', now.daysInMonth()).toISOString()
          break

        case 'this year': {
          dateFrom = now.startOf('year').toISOString()
          dateTo = now.endOf('year').toISOString()
          break
        }

        case 'last year': {
          const lastYear = now.get('year') - 1
          dateFrom = now.set('year', lastYear).startOf('year').toISOString()
          dateTo = now.set('year', lastYear).endOf('year').toISOString()
          break
        }

        default:
          dateFrom = now.subtract(30, 'days').toISOString()
          dateTo = now.toISOString()
      }
      this.currentFilters.orderDateFrom = dateFrom
      this.currentFilters.orderDateTo = dateTo
    },

    setOrderStatusFilter(value: boolean | null) {
      this._resetPage()
      this.currentFilters.status = value ?? undefined
    },

    setSelectedCustomer(customerData: IUserData[]): void {
      this._resetPage()
      this.selectedCustomerNumbers = customerData
    },

    _mapOrderResult(result: ApolloQueryResult<GetOrderResult>) {
      const orderResult = result.data.orders
      this.totalItems = orderResult.overallResults
      this.totalPages = orderResult.overallPages
      this.suppliers = orderResult.supplierSummarizations
      this.totalItemsInAllCategories = orderResult.overallItemsInAllCategories

      // reduce date to day month year for grouping
      const dateFormatFromBE = 'YYYY-MM-DDTHH:mm:ssZ'
      const { toLocaleDate } = useDateTimeFormatter(dateFormatFromBE)
      const allDates = orderResult.orders.map(order =>
        toLocaleDate(order.orderDate, dateFormatFromBE)
      )

      // put all date groups into set to remove duplicates
      this.orderGroups = [...new Set(allDates)].map((date, index) => ({
        id: index,
        group: {
          title: date,
        },
        items: [
          ...orderResult.orders.filter(order => {
            const formatted = toLocaleDate(order.orderDate, dateFormatFromBE)
            return formatted === date
          }),
        ],
      }))
    },

    _showErrorApetitoDetailsLoad(): void {
      dispatchErrorMessage({
        title: t('tabs.orders.notifications.error.title'),
        text: t('tabs.orders.notifications.error.loadOrderDetailsText'),
        duration: -1,
      })
    },

    _showErrorArticleAvailability(): void {
      dispatchErrorMessage({
        title: t('tabs.orders.notifications.error.title'),
        text: t('tabs.orders.notifications.error.loadArticleAvailabilityText'),
        duration: -1,
      })
    },

    _showErrorHawaDetailsLoad(): void {
      dispatchErrorMessage({
        title: t('tabs.orders.notifications.error.title'),
        text: t('tabs.orders.notifications.error.loadOrderDetailsText'),
        duration: -1,
      })
    },

    _showErrorLoadOrders(): void {
      dispatchErrorMessage({
        title: t('tabs.orders.notifications.error.title'),
        text: t('tabs.orders.notifications.error.loadOrdersText'),
        duration: -1,
      })
    },

    _showAddToBasketError(): void {
      dispatchErrorMessage({
        title: t('tabs.orders.notifications.error.title'),
        text: t('tabs.orders.notifications.error.addToBasketErrorText'),
        duration: -1,
      })
    },

    _showAddToBasketSuccess(): void {
      dispatchSuccessMessage({
        title: t('tabs.orders.notifications.success.title'),
        text: t('tabs.orders.notifications.success.addToBasketText'),
      })
    },

    _showAddHawaToBasketGeneralError(): void {
      dispatchErrorMessage({
        title: t('tabs.orders.notifications.error.title'),
        text: t('tabs.orders.notifications.error.addHawaToBasketGeneralError'),
      })
    },

    _showAddHawaToBasketSomeError(amount: number): void {
      dispatchErrorMessage({
        title: t('tabs.orders.notifications.error.title'),
        text: t('tabs.orders.notifications.error.addHawaToBasketSomeFailed', {
          failedCount: amount,
        }),
      })
    },

    _showAddHawaToBasketSuccess(amount: number): void {
      dispatchSuccessMessage({
        title: t('tabs.orders.notifications.success.title'),
        text: t('tabs.orders.notifications.success.addHawaToBasketSuccess', { amount: amount }),
      })
    },

    _resetPage() {
      this.currentPage = 1
    },
  },
  getters: {
    isArticleAvailable: state => {
      return (articleId: string) =>
        state.articleAvailability.find(
          (article: ArticleAvailability) => articleId === article.articleId
        ) ?? null
    },

    getUnavailableApetitoArticles(state): ApetitoOrderPosition[] {
      return (
        state.apetitoOrderDetails?.positions.filter(position => {
          const canBeChecked = this.isArticleAvailable(position.articleId)
          if (canBeChecked === null) {
            return true
          }
          return !canBeChecked.available
        }) ?? []
      )
    },

    getUnavailableHawaArticles(state): HawaOrderPosition[] {
      return (
        state.hawaOrderDetails?.orderPositions.filter(position => {
          const canBeChecked = this.isArticleAvailable(position.articleNumber.toString())
          if (canBeChecked === null) {
            return true
          }
          return !canBeChecked.available
        }) ?? []
      )
    },

    someArticlesNotAvailable(state): boolean {
      return !!state.articleAvailability.find(available => !available.available)
    },

    supplierIds(state): string[] {
      return state.selectedCustomerNumbers
        .map(customerData => customerData.suppliers.map(supplier => supplier.id.toString()))
        .flat(2)
    },

    hawaArticlesToReorder(state): HawaOrderPosition[] {
      return (
        state.hawaOrderDetails?.orderPositions.filter(
          orderPosition =>
            !!this.articleAvailability.some(
              articleAvailability =>
                articleAvailability.available &&
                articleAvailability.articleId === orderPosition.articleNumber
            )
        ) ?? []
      )
    },
  },
})
