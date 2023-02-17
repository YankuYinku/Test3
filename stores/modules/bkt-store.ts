import useDateTimeFormatter from '@/composables/dateTimeFormatter'
import {
  bktQuery,
  bktSummarizationQuery,
  closeMonth,
  getMonthsForCustomerQuery,
  openMonth,
  submitMonth,
  toleranceDeviation,
  updateDayStatus,
  updateMealParticipantInfo,
} from '@/graphql/bkt'
import i18n from '@/i18n'
import {
  BktMonth,
  BktMonthSelection,
  BktRecord,
  MealParticipantInfo,
  toleranceDeviationQueryResult,
} from '@/models/bkt/bkt.model'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { Ref, ref } from 'vue'

import { useMessage } from '@apetito/portal-sdk-common'

const { dispatchSuccessMessage, dispatchErrorMessage } = useMessage()

const t = i18n.global.t

type BktStoreState = {
  month: BktMonth | null
  loading: boolean
  recordUpdateInProgress: boolean
  customerNumber: number | null
  accountingMonth: BktMonthSelection | null
  availableMonth: BktMonthSelection[]
  loadingAvailableMonthsError: boolean
  submitMonthError: boolean
  monthSubmittedByExcel: boolean
  totalNoOfParticipants: number
  updateRequests: Set<number>
  toleranceDeviationRelative: number | null
}

const bktState: () => BktStoreState = () => ({
  month: null,
  loading: false,
  recordUpdateInProgress: false,
  customerNumber: null,
  accountingMonth: null,
  availableMonth: [],
  loadingAvailableMonthsError: false,
  submitMonthError: false,
  monthSubmittedByExcel: false,
  totalNoOfParticipants: 0,
  updateRequests: new Set(),
  toleranceDeviationRelative: null,
})

const dayToNumberOfParticipants = (day: Ref<BktRecord>) =>
  day.value.mealInfos
    .map(infos => infos.mealParticipantInfos.map(partInfo => partInfo.numberOfParticipants))
    .flat(1)

// util function to create an array with the sum of all indices of the source arrays ( [1,2] + [3,4]= [4,6] )
const sumTwoArrays = (arr1: number[], arr2: number[]) => {
  return arr2.map((element, index) => (arr1[index] || 0) + element)
}

const useBktStore = defineStore('bktStore', {
  state: bktState,
  actions: {
    async loadBktMonth(client: ApolloClient<NormalizedCacheObject>) {
      // Exception: June and July 2022 cannot be submitted with this form as they have been submitted via excel file by the customer
      this.monthSubmittedByExcel = false
      const date = dayjs(this.accountingMonth?.month)
      const isJuneOrJuly = [5, 6].includes(date.month())
      const is2022 = date.year() === 2022
      const monthNeedsExcelSubmission = isJuneOrJuly && is2022
      if (monthNeedsExcelSubmission) {
        this.monthSubmittedByExcel = true
        return
      }

      // prepare submission

      const queryParams = {
        customerNumber: this.customerNumber,
        accountingMonth: this.accountingMonth?.month,
      }

      this.submitMonthError = false

      if (this.customerNumber && this.accountingMonth) {
        this.loading = true

        return client
          .query({ query: bktQuery, variables: queryParams })
          .then(data => {
            if (data.errors) {
              throw data.errors
            }

            this.loading = false

            // grab isSubmitted information from getMonth call to save it on month in store.
            const isSubmitted = this.accountingMonth?.isSubmitted
            const dateOfSubmission = this.accountingMonth?.dateOfSubmission

            // filter out days that are null for now (seems to be true for entries which have isVoucher=true)
            this.month = {
              ...data.data.monthlyRecords,
              isSubmitted,
              dateOfSubmission,
              days: data.data.monthlyRecords.days.filter((day: BktRecord) => day.day !== null),
            }
          })
          .catch(error => {
            this.loading = false
            throw error
          })
      }

      return Promise.reject()
    },

    async getMonthsForCustomer(client: ApolloClient<NormalizedCacheObject>) {
      const queryParams = {
        customerNumber: this.customerNumber,
      }

      this.loading = true
      this.loadingAvailableMonthsError = false

      return client
        .query({ query: getMonthsForCustomerQuery, variables: queryParams })
        .then(data => {
          this.loading = false

          if (data.errors) {
            throw data.errors
          }

          this.availableMonth = data.data.months
          this.accountingMonth = this.availableMonth[0]
        })
        .catch(() => {
          this.loading = false
          this.loadingAvailableMonthsError = true
          this.reset()
        })
    },

    async updateBktRecord(
      client: ApolloClient<NormalizedCacheObject>,
      record: MealParticipantInfo
    ) {
      const params = {
        id: record.bktRecordId,
        numberOfParticipants: record.numberOfParticipants,
      }

      this.recordUpdateInProgress = true

      this.updateRequests.add(record.bktRecordId)

      return client
        .mutate({ mutation: updateMealParticipantInfo, variables: params })
        .then(data => {
          if (data.errors) {
            throw data.errors
          }

          const updatedBktRecord: Pick<MealParticipantInfo, 'id' | 'numberOfParticipants'> =
            data.data.updateBktRecord
          if (params.numberOfParticipants !== updatedBktRecord.numberOfParticipants) {
            // update the data
            this.allMealParticipantInfos?.forEach(info => {
              const currentInfo = info
              if (info.bktRecordId === updatedBktRecord.id) {
                currentInfo.numberOfParticipants = updatedBktRecord.numberOfParticipants
              }
            })
          }
        })
        .catch(error => {
          throw error
        })
        .finally(() => {
          this.recordUpdateInProgress = false
          this.updateRequests.delete(record.bktRecordId)
        })
    },

    checkTolerance(client: ApolloClient<NormalizedCacheObject>) {
      this.loading = true

      const queryParams = {
        customerNumber: this.customerNumber,
        accountingMonth: this.accountingMonth?.month,
      }

      // reset tolerance value
      this.toleranceDeviationRelative = null

      return client
        .query<toleranceDeviationQueryResult>({ query: toleranceDeviation, variables: queryParams })
        .then(result => {
          this.loading = false

          if (result.errors?.length) {
            this._showToleranceErrorNotification()
            // if tolerance could not be checked, still open the submit dialog
            return true
          }

          if (!result.data.toleranceDeviationQuery.isPlausible) {
            this.toleranceDeviationRelative = result.data.toleranceDeviationQuery.toleranceRelative
          }
          return result.data.toleranceDeviationQuery.isPlausible
        })
        .catch(() => {
          this.loading = false
          this._showToleranceErrorNotification()
          // if tolerance could not be checked, still open the submit dialog
          return true
        })
    },

    async getTotalNumberOfParticipants(client: ApolloClient<NormalizedCacheObject>) {
      const queryParams = {
        customerNumber: this.customerNumber,
        accountingMonth: this.accountingMonth?.month,
      }

      this.loading = true

      return client
        .query({ query: bktSummarizationQuery, variables: queryParams })
        .then(data => {
          if (data.errors) {
            throw data.errors
          }

          this.totalNoOfParticipants = data.data.monthlyRecordsSummarization.amount
        })
        .catch(() => {
          this.reset()
        })
        .finally(() => {
          this.loading = false
        })
    },

    setCustomerNumber(customerNumber: number | null) {
      this.customerNumber = customerNumber
      this.reset()
    },

    reset() {
      this.accountingMonth = null
      this.availableMonth = []
      this.month = null
      this.submitMonthError = false
    },

    async closeMonth(client: ApolloClient<NormalizedCacheObject>) {
      const params = {
        days: this.daysOfMonth.map(day => ({
          dayId: day.value.bktRecordDayId,
          bktRecords: day.value.mealInfos
            .map(mealInfo => mealInfo.mealParticipantInfos.map(partInfo => partInfo.bktRecordId))
            .flat(2),
        })),
      }

      return this.internalCloseMonth(client, params)
        .then(() => {
          dispatchSuccessMessage({
            title: t('tabs.bkt.notifications.monthCloseSuccessTitle'),
            text: t('tabs.bkt.notifications.monthCloseSuccessText'),
          })
        })
        .catch(() => {
          dispatchErrorMessage({
            title: t('tabs.bkt.notifications.monthCloseErrorTitle'),
            text: t('tabs.bkt.notifications.monthCloseErrorText'),
          })
        })
    },

    // private internal function which is reused
    async internalCloseMonth(client: ApolloClient<NormalizedCacheObject>, params: any) {
      this.loading = true
      return client
        .mutate({ mutation: closeMonth, variables: params })
        .then(data => {
          if (data.errors) {
            throw data.errors
          }
          return data
        })
        .catch(error => {
          throw error
        })
        .finally(() => {
          this.loading = false
        })
    },

    async openMonth(client: ApolloClient<NormalizedCacheObject>) {
      const params = {
        days: this.daysOfMonth.map(day => ({
          dayId: day.value.bktRecordDayId,
        })),
      }

      this.loading = true

      return client
        .mutate({ mutation: openMonth, variables: params })
        .then(data => {
          if (data.errors) {
            throw data.errors
          }

          return data
        })
        .catch(error => {
          throw error
        })
        .finally(() => {
          this.loading = false
        })
    },

    async submitMonth(client: ApolloClient<NormalizedCacheObject>) {
      const params = {
        id: this.accountingMonth?.id,
        month: this.accountingMonth?.month,
        isConfirmed: false,
      }

      this.submitMonthError = false

      if (params.id && params.month) {
        this.loading = true

        return client
          .mutate({ mutation: submitMonth, variables: params })
          .then(data => {
            if (data.errors) {
              this.submitMonthError = true

              throw new Error('Could not submit month')
            }

            if (this.month) {
              const dateOfSubmission = dayjs().toISOString()

              this.month.isSubmitted = true
              this.month.dateOfSubmission = dateOfSubmission

              if (this.accountingMonth) {
                this.accountingMonth.isSubmitted = true
                this.accountingMonth.dateOfSubmission = dateOfSubmission
              }
            }

            dispatchSuccessMessage({
              text: t('tabs.bkt.notifications.submitMonthSuccessText'),
              title: t('tabs.bkt.notifications.submitMonthSuccessTitle'),
            })

            return data
          })
          .catch(() => {
            this.submitMonthError = true
            dispatchErrorMessage({
              title: t('tabs.bkt.notifications.submitMonthErrorTitle'),
              text: t('tabs.bkt.notifications.submitMonthErrorText'),
            })
          })
          .finally(() => {
            this.loading = false
          })
      }

      return Promise.reject(new Error('No month selected'))
    },

    async downloadAsPDF() {
      const filename = dayjs(this.accountingMonth?.month).format('YYYY-MM_YYYY_MM_DD_HH:mm:ss')
      // TODO: Replace url and discuss filename
      fetch('http://www.4inloop.de/test/REST.pdf')
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${filename}.pdf`
          document.body.appendChild(a) // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click()
          a.remove()
        })
    },

    changeClosingStatusOfMonth(closed: boolean): void {
      this.daysOfMonth.forEach(day => this.closeDayAndRemoveParticipants(day.value, closed))
    },

    changeClosingStatusOfDay(recordId: number | undefined, closed: boolean): void {
      if (recordId) {
        this.daysOfMonth.forEach(day => {
          if (day.value.bktRecordDayId === recordId) {
            day.value.isClosed = closed
          }
        })
      }
    },

    closeDayAndRemoveParticipants(day: BktRecord | null, closed: boolean): void {
      if (!day) {
        return
      }

      const dayToClose = day
      dayToClose.isClosed = closed

      if (closed) {
        dayToClose.mealInfos.forEach(mealInfo => {
          mealInfo.mealParticipantInfos.forEach(mealParticipantInfo => {
            const mealPartInfo = mealParticipantInfo
            mealPartInfo.numberOfParticipants = 0
          })
        })
      }
    },

    async updateDayStatus(
      client: ApolloClient<NormalizedCacheObject>,
      day: BktRecord | null,
      closed: boolean
    ) {
      if (!day) {
        return
      }
      if (closed) {
        const params = {
          days: [
            {
              dayId: day.bktRecordDayId,
              bktRecords: day.mealInfos
                .map(mealInfo =>
                  mealInfo.mealParticipantInfos.map(partInfo => partInfo.bktRecordId)
                )
                .flat(2),
            },
          ],
        }
        return this.internalCloseMonth(client, params)
      }

      // open day case
      const params = {
        dayId: day.bktRecordDayId,

        isClosed: closed,
      }

      return client
        .mutate({ mutation: updateDayStatus, variables: params })
        .then(data => {
          if (data.errors) {
            throw data.errors
          }

          return data
        })
        .catch(error => {
          throw error
        })
    },

    _showToleranceErrorNotification(): void {
      dispatchErrorMessage({
        title: t('tabs.bkt.notifications.checkToleranceErrorTitle'),
        text: t('tabs.bkt.notifications.checkToleranceErrorText'),
      })
    },
  },
  getters: {
    mealTimes(): string[] {
      return [
        ...new Set(
          this.month?.days
            .filter(Boolean)
            .map(day => day.mealInfos.map(mealInfo => mealInfo.name))
            .flat(2)
        ),
      ]
    },

    isCustomerNumberSelected(): boolean {
      return !!this.customerNumber
    },

    participantsByMealtime(): string[][] | undefined {
      return this.month?.days
        .map(day =>
          day.mealInfos.map(infos => {
            return infos.mealParticipantInfos.map(partInfo => partInfo.name)
          })
        )
        .at(0)
    },

    allMealParticipantInfos(): MealParticipantInfo[] | undefined {
      return this.month?.days
        .map(day =>
          day.mealInfos.map(infos => {
            return infos.mealParticipantInfos
          })
        )
        .flat(2)
    },

    mealParticipantInfoCount(): number {
      return (
        this.month?.days[0].mealInfos.map(mealInfo => mealInfo.mealParticipantInfos).flat(2)
          .length ?? 0
      )
    },

    isMonthSubmitted(): boolean | undefined {
      return this.month?.isSubmitted
    },
    isMonthLate(): boolean | undefined {
      return this.month?.isLate
    },
    daysOfMonth(): Ref<BktRecord>[] {
      if (this.month) {
        return this.month?.days.map((day: BktRecord) => {
          return ref({
            ...day,
            day: useDateTimeFormatter('YYYY-MM-DDTHH:mm:ssZ', 'de-DE').formatToLocaleDate(day.day),
          })
        })
      }
      return []
    },

    // multi dimensional array of all columns in all meal type column for all days
    numberOfParticipantsAllDays(): number[][][] {
      return this.daysOfMonth.map(day =>
        day.value.mealInfos.map(mealInfo =>
          mealInfo.mealParticipantInfos.map(partInfo => partInfo.numberOfParticipants)
        )
      )
    },

    // total sum of each participant column
    numberOfParticipantsColumnSum(): number[][] {
      if (!this.numberOfParticipantsAllDays?.length) {
        return [[0]]
      }
      return this.numberOfParticipantsAllDays.reduce((prev, curr) =>
        prev.map((_, index: number) => sumTwoArrays(prev[index], curr[index]))
      )
    },

    // sum of all meal participants per day (row)
    rowSummaries(): number[] {
      return this.daysOfMonth.map(dayToNumberOfParticipants).map(dayValues => {
        return dayValues.reduce((prev: number, curr: number) => {
          return prev + curr
        }, 0)
      })
    },

    // total sum of each meal column (participants combined)
    totalNumberOfParticipantsByMealType(): number[] {
      return this.numberOfParticipantsColumnSum.map(pack =>
        pack.reduce((prev: number, curr: number) => prev + curr, 0)
      )
    },

    totalSum(): number {
      return this.rowSummaries.reduce((prev, curr) => prev + curr, 0)
    },

    monthsSelectModel(state) {
      return state.availableMonth?.map(month => {
        const date = dayjs(month.month).locale(i18n.global.locale.value)
        return {
          text: date.format('MMMM YYYY'),
          value: month.id,
          original: month,
        }
      })
    },

    areRecordsUpdating(): boolean {
      return this.updateRequests.size !== 0
    },
  },
})

export default useBktStore
