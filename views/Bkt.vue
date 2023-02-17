<script lang="ts" setup>
import BktDialog from '@/components/base/bkt/BktDialog.vue'
import BktErrorBox from '@/components/base/bkt/BktErrorBox.vue'
import { useFeatureFlags } from '@/composables/featureFlag'
import usePlausibility from '@/composables/use-plausibility-check'
import { BktMonthSelection, BktRecord, MealParticipantInfo } from '@/models/bkt/bkt.model'
import useBktStore from '@/stores/modules/bkt-store'
import {
  VcButtonPrimary,
  VcCheckbox,
  VcHeartSpinner,
  VcNumberInput,
  VcSelect,
} from '@apetito/components-ui-vue3'
import {
  CustomerChangedActionPayload,
  dispatchNavigationData,
  FeatureResponse,
  useEventBus,
} from '@apetito/portal-sdk-common'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import {
  faCheckCircle,
  faExclamationTriangle,
  faLock,
  faLockOpen,
} from '@fortawesome/pro-light-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ApolloClients } from '@vue/apollo-composable'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import {
  computed,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  Ref,
  ref,
  watch,
} from 'vue'
import { FeatureToggleComponent as feature } from 'vue-feature-toggle'
import { useI18n } from 'vue-i18n'

const apiClients = inject<{
  [key: string]: ApolloClient<NormalizedCacheObject>
}>(ApolloClients, {})

const featureName = 'apetito.meinapetito.portal.bkt'
const { key, rules } = useFeatureFlags(feature, [featureName])

const store = useBktStore()

const { t } = useI18n()

const largeTable = computed(() => store.mealParticipantInfoCount > 9)

const styles = computed(() => ({
  headlines: largeTable.value ? 'text-xs' : 'text-lg',
  sublines: largeTable.value ? 'text-xs' : 'text-md',
  padding: largeTable.value ? 'p-1' : 'p-2',
  gap: largeTable.value ? 'gap-1' : 'gap-2',
}))

/** Handle customer selection */
const { getEventBusPayload, subscribeEventBusAction } = useEventBus<CustomerChangedActionPayload>(
  '@apetito/user-account',
  getCurrentInstance()
)

let unsubscribe: () => boolean

onBeforeMount(() => {
  // get current and future customer numbers (admin only)
  getEventBusPayload().then(userData => handleUserData(userData))
  unsubscribe = subscribeEventBusAction(action => handleUserData(action?.payload))
  dispatchNavigationData('@apetito/user-account-details')
})

onBeforeUnmount(() => {
  unsubscribe && unsubscribe()
})

const handleUserData = (userData: CustomerChangedActionPayload | undefined): void => {
  const userCustomerNumbers = userData?.customerNumbers.map(customer => customer.customerNumber)

  store.setCustomerNumber(
    userCustomerNumbers?.length === 1 ? userCustomerNumbers?.at(0) ?? null : null
  )
}

function scrollToTop() {
  document.querySelector('.root-wrapper-inner')?.scrollTo({
    top: 0,
  })
}

const plausibilityModeOn = ref(false)

/** Handle customer selection end*/

watch(rules, (newValues: FeatureResponse[]) => {
  const bktEnabled = newValues.find(feature => feature.feature === featureName && feature.value)
  if (bktEnabled && store.customerNumber) {
    store.getMonthsForCustomer(apiClients.default)
  }
})

watch(
  () => store.customerNumber,
  newValue => {
    if (newValue) {
      scrollToTop()
      store.getMonthsForCustomer(apiClients.default)
      plausibilityModeOn.value = false
    }
  }
)

const infoPanelShown = computed(() => !!infoMessage.value)

const monthClosedDialogOpen = ref(false)
const monthClosedChecked = ref(false)

const dayClosedDialogOpen = ref(false)
const dayToClose: Ref<BktRecord | null> = ref(null)

const toleranceDialogOpen = ref(false)
const skipNextWatcher = ref(false)
const submitMonthDialogOpen = ref(false)
const { totalNoOfParticipants: totalNumberToSubmit } = storeToRefs(store)

const { errors, dayHasError } = usePlausibility(() => store.daysOfMonth, plausibilityModeOn)

const selectedMonth = ref(store.monthsSelectModel[0])

const infoMessage = computed(() => {
  if (!store.isCustomerNumberSelected) {
    return t('tabs.bkt.pleaseSelectCustomerNumber')
  }

  if (store.loadingAvailableMonthsError) {
    return t('tabs.bkt.loadinAvailableMonthsError')
  }

  if (!store.month) {
    return t('tabs.bkt.monthsAreLoading')
  }

  if (store.monthSubmittedByExcel) {
    return null
  }

  if (store.isMonthSubmitted) {
    return t('tabs.bkt.monthClosed', {
      date: dayjs(store.month?.dateOfSubmission).locale('de').format('DD.MM.YYYY'),
    })
  }

  if (store.isMonthLate) {
    return t('tabs.bkt.isLate')
  }

  return null
})

const infoPanelBackgroundColor = computed(() => {
  if (store.isMonthLate) {
    return 'bg-dusty-pink'
  }

  if (store.isMonthSubmitted || !store.month) {
    return 'bg-primary-light'
  }

  return 'bg-background'
})

function closeDay(day: BktRecord | null) {
  if (!day) {
    return
  }

  store
    .updateDayStatus(apiClients.default, day, true)
    .then(() => {
      store.closeDayAndRemoveParticipants(day, true)
    })
    .catch(() => {
      // set closed-switch back to the value before
      store.changeClosingStatusOfDay(day.bktRecordDayId, false)
    })
    .finally(() => {
      dayToClose.value = null
    })
}

function onCloseDay(day: Ref<BktRecord>, closed: unknown): void {
  day.value = { ...day.value, isClosed: closed as boolean }

  // close
  if (closed) {
    const sumParticipantsOfDay = day.value.mealInfos
      .map(info => info.mealParticipantInfos.map(partInfo => partInfo.numberOfParticipants))
      .flat(2)
      .reduce((prev, curr) => prev + curr, 0)

    // if user entered values for this day, open close day confirmation dialog
    if (sumParticipantsOfDay > 0) {
      dayClosedDialogOpen.value = true
      dayToClose.value = day.value
      return
    } else {
      closeDay(day.value)
    }

    // open
  } else {
    store
      .updateDayStatus(apiClients.default, day.value, false)
      .then(() => {
        // set the close month checkbox back to false
        setCloseMonthWithoutSaving()
        nextTick(() => {
          skipNextWatcher.value = false
        })

        store.closeDayAndRemoveParticipants(day.value, false)
      })
      .catch(() => {
        // set closed-switch back to the value before
        day.value = { ...day.value, isClosed: !closed }
      })
  }
}

function onCloseDayDialogClosed(confirmed: boolean) {
  dayClosedDialogOpen.value = false

  if (!confirmed) {
    // set back closing status without saving
    store.changeClosingStatusOfDay(dayToClose.value?.bktRecordDayId, false)
    dayToClose.value = null
  } else {
    // close the day on BE
    closeDay(dayToClose.value)
  }
}

// toggles the "close month" switch back to false and prevents saving it to the BE.
function setCloseMonthWithoutSaving(): void {
  skipNextWatcher.value = true
  monthClosedChecked.value = false
}

function setCloseStatusOfWholeMonth(closed: boolean): void {
  if (closed) {
    store
      .closeMonth(apiClients.default)
      .then(() => store.changeClosingStatusOfMonth(closed))
      .catch(() => {
        setCloseMonthWithoutSaving()
      })
  } else {
    store
      .openMonth(apiClients.default)
      .then(() => store.changeClosingStatusOfMonth(closed))
      .catch(() => {
        store.changeClosingStatusOfMonth(true)
      })
  }
}

function onCloseMonthConfirmationDialogClosed(confirmed: boolean): void {
  monthClosedDialogOpen.value = false

  if (confirmed) {
    setCloseStatusOfWholeMonth(true)
  } else {
    setCloseMonthWithoutSaving()
  }
}

function onSubmitMonthDialogClosed(confirmed: boolean): void {
  submitMonthDialogOpen.value = false
  if (confirmed) {
    store.submitMonth(apiClients.default)
  }
}

function openSubmitDialog(): void {
  store.getTotalNumberOfParticipants(apiClients.default).then(() => {
    submitMonthDialogOpen.value = true
  })
}

function onCloseToleranceDialog(confirmed: boolean): void {
  toleranceDialogOpen.value = false
  if (confirmed) {
    openSubmitDialog()
  }
}

function onSubmitMonth(): void {
  plausibilityModeOn.value = true

  nextTick(() => {
    if (!errors.value?.length) {
      // check tolerance
      store
        .checkTolerance(apiClients.default)
        .then(toleranceInRange => {
          if (!toleranceInRange) {
            toleranceDialogOpen.value = true
            return false
          }

          return true
        })
        .then(freeToSubmit => {
          if (freeToSubmit) {
            openSubmitDialog()
          }
        })
    }
  })
}

function onInputChanged(mealParticipantInfo: MealParticipantInfo): void {
  store.updateBktRecord(apiClients.default, mealParticipantInfo)
}

function onMonthSelection(model: { original: BktMonthSelection }) {
  scrollToTop()
  store.accountingMonth = model.original
}

function onDownload(): void {
  store.downloadAsPDF()
}

// reload table when customer or date changes
watch(
  () => [store.customerNumber, store.accountingMonth],
  ([currCust], [prevCust]) => {
    // reset selected month in case customer number changes
    if (prevCust !== currCust) {
      selectedMonth.value = null
    }

    // load bkt table in case both, customerNumber and month are set
    if (store.customerNumber && store.accountingMonth) {
      plausibilityModeOn.value = false

      store.loadBktMonth(apiClients.default).then(() => {
        selectedMonth.value = selectedMonth.value || store.monthsSelectModel[0]
      })
    }
  }
)

// open dialog when checkbox is activated to ask for confirmation
// set all days to "open" when deactivating the checkbox
watch(monthClosedChecked, (isChecked, wasChecked) => {
  if (skipNextWatcher.value) {
    skipNextWatcher.value = false
    return
  }
  if (isChecked) {
    monthClosedDialogOpen.value = true
  } else if (!isChecked && wasChecked) {
    setCloseStatusOfWholeMonth(false)
  }
})
</script>

<template>
  <feature :name="featureName" :key="key">
    <section class="relative">
      <BktDialog
        :is-open="dayClosedDialogOpen"
        :title="t('tabs.bkt.dialogs.closeDay.title')"
        :text="t('tabs.bkt.dialogs.closeDay.text')"
        :confirm-button-text="t('tabs.bkt.dialogs.closeDay.ok')"
        :cancel-button-text="t('tabs.bkt.dialogs.closeDay.cancel')"
        @close="onCloseDayDialogClosed"
      >
      </BktDialog>
      <BktDialog
        :is-open="monthClosedDialogOpen"
        :title="t('tabs.bkt.dialogs.closeMonth.title')"
        :text="t('tabs.bkt.dialogs.closeMonth.text')"
        :confirm-button-text="t('tabs.bkt.dialogs.closeMonth.ok')"
        :cancel-button-text="t('tabs.bkt.dialogs.closeMonth.cancel')"
        @close="onCloseMonthConfirmationDialogClosed"
      >
        <template #text>
          <p>
            {{ t('tabs.bkt.dialogs.closeMonth.textStart') }}
            <span class="text-red-500">{{ t('tabs.bkt.dialogs.closeMonth.textHighlighted') }}</span>
            {{ t('tabs.bkt.dialogs.closeMonth.textEnd') }}
          </p>
          <p class="mt-4">{{ t('tabs.bkt.dialogs.closeMonth.question') }}</p></template
        >
      </BktDialog>

      <BktDialog
        :is-open="submitMonthDialogOpen"
        :title="t('tabs.bkt.dialogs.submitMonth.title')"
        :text="t('tabs.bkt.dialogs.submitMonth.text')"
        :confirm-button-text="t('tabs.bkt.dialogs.submitMonth.ok')"
        :cancel-button-text="t('tabs.bkt.dialogs.submitMonth.cancel')"
        @close="onSubmitMonthDialogClosed"
      >
        <template #text>
          <p>
            {{ t('tabs.bkt.dialogs.submitMonth.textStart') }}
            <span class="text-lg text-black">
              {{ totalNumberToSubmit }} {{ t('tabs.bkt.dialogs.submitMonth.textTableGuest') }}
            </span>
            {{ t('tabs.bkt.dialogs.submitMonth.textEnd', { selectedMonth: selectedMonth.text }) }}
          </p>
        </template>
      </BktDialog>

      <BktDialog
        :is-open="toleranceDialogOpen"
        :title="t('tabs.bkt.dialogs.tolerance.title')"
        :confirm-button-text="t('tabs.bkt.dialogs.tolerance.ok')"
        :cancel-button-text="t('tabs.bkt.dialogs.tolerance.cancel')"
        @close="onCloseToleranceDialog"
      >
        <template #text>
          <i18n keypath="tabs.bkt.dialogs.tolerance.toleranceDeviation" tag="p">
            <template v-slot:deviation>
              <span class="text-lg text-red-500">{{ store.toleranceDeviationRelative }}%</span>
            </template>
          </i18n>
        </template>
      </BktDialog>

      <div class="min-height flex flex-col">
        <header class="sticky-header sticky z-30 -mx-4 mt-3 bg-background px-4">
          <!-- Headline for monthly or daily submission -->
          <h2 v-if="store.month" class="text-2xl">
            {{
              store.month?.isMonthly
                ? t('tabs.bkt.monthlySubmissionTitle')
                : t('tabs.bkt.dailySubmissionTitle')
            }}
          </h2>

          <!-- Month selector -->
          <div class="flex flex-row items-center gap-4 pb-5">
            <VcSelect
              v-if="store.isCustomerNumberSelected && store.availableMonth?.length"
              v-model="selectedMonth"
              return-object
              class="month-select w-1/3"
              :items="store.monthsSelectModel"
              :label="t('tabs.bkt.monthSelectorLabel')"
              @update:modelValue="onMonthSelection"
            >
              <template #item:append="{ item }">
                <font-awesome-icon
                  v-if="item.original.isSubmitted"
                  class="text-lg text-main opacity-70"
                  :icon="faCheckCircle"
                />
              </template>
            </VcSelect>

            <div
              v-if="infoPanelShown"
              class="flex max-w-3xl items-center gap-4 rounded-xl border-gray-200 p-2 px-4"
              :class="infoPanelBackgroundColor"
            >
              <font-awesome-icon class="text-2xl opacity-70" :icon="faExclamationTriangle" />
              <div class="flex items-center text-sm">
                {{ infoMessage }}
              </div>
            </div>
          </div>
        </header>

        <div v-if="!store.monthSubmittedByExcel">
          <!-- Table -->
          <div v-if="store.isCustomerNumberSelected" class="relative">
            <!-- table for loaded content -->
            <table v-if="store.month" class="bkt-table w-full">
              <!-- Table Header -->
              <thead class="sticky-table-header">
                <tr>
                  <th class="w-48 p-2 text-left" rowspan="2">
                    <div class="flex items-start gap-0" :class="styles.padding">
                      <!-- Close month trigger -->
                      <VcCheckbox
                        v-model="monthClosedChecked"
                        switch
                        :value="true"
                        :false-value="false"
                        :disabled="store.isMonthSubmitted"
                      ></VcCheckbox>
                      <span
                        class="cursor-pointer text-sm font-normal"
                        :class="{ 'text-main': monthClosedChecked }"
                        @click="() => (monthClosedChecked = !monthClosedChecked)"
                      >
                        {{ t('tabs.bkt.closeMonthSwitchLabel') }}
                      </span>
                    </div>
                  </th>
                  <!-- Meal type -->
                  <template v-for="mealType in store.mealTimes" :key="mealType">
                    <th :class="styles.headlines">
                      {{ mealType }}
                    </th>
                  </template>
                  <!-- Row sum -->
                  <th rowspan="2" class="text-center text-lg font-bold text-main">
                    {{ t('tabs.bkt.sum') }}
                  </th>
                </tr>
                <tr>
                  <!-- Meal participants -->
                  <template
                    v-for="(participants, index) in store.participantsByMealtime"
                    :key="index"
                  >
                    <th
                      :class="
                        store.participantsByMealtime &&
                        index === store.participantsByMealtime?.length - 1 &&
                        'no-right-border'
                      "
                    >
                      <div class="flex" :class="styles.gap">
                        <template v-for="participant in participants" :key="participant">
                          <div
                            class="text-center"
                            :class="[participants.length > 1 ? 'w-1/2' : 'w-full', styles.sublines]"
                          >
                            {{ participant }}
                          </div>
                        </template>
                      </div>
                    </th>
                  </template>
                </tr>
              </thead>

              <!-- Table body -->
              <tbody>
                <template v-for="(day, dayIndex) in store.daysOfMonth" :key="day.bktRecordDayId">
                  <tr :class="{ 'bg-red-50': dayHasError(day.value) }">
                    <!-- Day start -->
                    <td>
                      <div class="p-1">
                        <div class="font-bold text-main">
                          {{ day.value.day }}
                          <font-awesome-icon
                            v-if="day.value.isClosed"
                            class="text-md ml-2 font-bold"
                            :icon="faLock"
                          />
                          <font-awesome-icon
                            v-else
                            class="text-md ml-2 font-bold"
                            :icon="faLockOpen"
                          />
                        </div>
                        <div class="flex items-center">
                          <VcCheckbox
                            class="-translate-x-4 scale-75 transform"
                            switch
                            :label="t('tabs.bkt.closeDaySwitchLabel')"
                            :value="true"
                            :false-value="false"
                            :model-value="day.value.isClosed"
                            :disabled="store.isMonthSubmitted"
                            @update:model-value="(value:unknown)=>onCloseDay(day, value)"
                          ></VcCheckbox>
                        </div>
                      </div>
                    </td>
                    <!-- Meal types-->
                    <template v-for="part in day.value.mealInfos" :key="part">
                      <td :class="{ 'opacity-50': day.value.isClosed }">
                        <!-- {{bkt entry}} -->
                        <div class="flex gap-2">
                          <template
                            v-for="mealInfo in part.mealParticipantInfos"
                            :key="mealInfo.id"
                          >
                            <div
                              class="flex justify-center"
                              :class="part.mealParticipantInfos.length > 1 ? 'w-1/2' : 'w-full'"
                            >
                              <VcNumberInput
                                v-model="mealInfo.numberOfParticipants"
                                :disabled="
                                  day.value.isClosed ||
                                  store.isMonthSubmitted ||
                                  store.updateRequests.has(mealInfo.bktRecordId)
                                "
                                :data-id="mealInfo.bktRecordId"
                                :min="0"
                                :use-system-chrome="false"
                                @blur="onInputChanged(mealInfo)"
                              ></VcNumberInput>
                            </div>
                          </template>
                        </div>
                      </td>
                    </template>
                    <!-- Row total-->
                    <td class="w-32 text-center text-lg font-bold text-main">
                      {{ store.rowSummaries?.at(dayIndex) }}
                    </td>
                  </tr>
                </template>
                <tr>
                  <td rowspan="2" class="bottom-line text-center text-lg font-bold text-main">
                    {{ t('tabs.bkt.sum') }}
                  </td>
                  <!-- Sum of columns -->
                  <template
                    v-for="(section, sectionIndex) in store.numberOfParticipantsColumnSum"
                    :key="sectionIndex"
                  >
                    <td>
                      <div class="flex gap-2">
                        <template v-for="(count, index) in section" :key="index">
                          <div
                            class="w-1/2 text-center"
                            :class="{ 'w-full': section?.length === 1 }"
                          >
                            {{ count }}
                          </div>
                        </template>
                      </div>
                    </td>
                  </template>
                  <td rowspan="2" class="bottom-line text-center text-2xl font-bold text-main">
                    {{ store.totalSum }}
                  </td>
                </tr>
                <tr>
                  <!-- Sum of columns inside a meal type -->
                  <template
                    v-for="(section, sectionIndex) in store.totalNumberOfParticipantsByMealType"
                    :key="sectionIndex"
                  >
                    <td
                      class="bottom-line text-center text-lg font-bold text-main"
                      :class="
                        sectionIndex === store.totalNumberOfParticipantsByMealType.length - 1 &&
                        'no-right-border'
                      "
                    >
                      {{ section }}
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- table footer-->
          <div v-if="store.month" class="mt-8 flex items-start justify-end gap-8">
            <BktErrorBox :errors="errors"></BktErrorBox>

            <!-- Submit error message-->
            <div v-if="store.submitMonthError" class="flex gap-2 text-red-500">
              <font-awesome-icon class="text-2xl" size="2xl" :icon="faExclamationTriangle" />
              <span>{{ t('tabs.bkt.submitError') }}</span>
            </div>

            <!-- Action button -->
            <div class="flex gap-4">
              <VcButtonPrimary class="hidden" @click="onDownload">
                {{ t('tabs.bkt.exportPdfButtonLabel') }}
              </VcButtonPrimary>
              <VcButtonPrimary
                v-if="!store.isMonthSubmitted"
                :disabled="store.loading || store.submitMonthError || store.areRecordsUpdating"
                :class="{
                  'pointer-events-none opacity-50':
                    store.loading || store.submitMonthError || store.areRecordsUpdating,
                }"
                @click="onSubmitMonth"
              >
                <span v-if="store.updateRequests.size">
                  {{ t('tabs.bkt.submitButtonProcessingLabel') }}
                </span>
                <span v-else>
                  {{ t('tabs.bkt.submitMonthButtonLabel') }}
                </span>
              </VcButtonPrimary>
              <div v-else class="gap flex items-center">
                <font-awesome-icon class="text-lg text-main opacity-70" :icon="faCheckCircle" />
                <div class="p-2 text-sm text-primary">{{ t('tabs.bkt.monthSubmitted') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- June and July cannot be submitted with the form, this is the information to the customer -->
        <div v-else class="rounded-xl bg-primary-light p-4 text-sm">
          {{ t('tabs.bkt.juneAndJuly2022') }}
        </div>
      </div>
      <VcHeartSpinner
        v-show="store.loading"
        class="loading-spinner fixed h-screen bg-background bg-opacity-50"
      ></VcHeartSpinner>
    </section>
  </feature>
</template>

<style lang="scss" scoped>
.month-select {
  transform: translateY(-2px);
}

.sticky-header {
  position: sticky;
  top: 8.125rem;
}

.bkt-table {
  border-collapse: separate;
  border-spacing: 0;

  thead {
    z-index: 10;
  }

  .sticky-table-header {
    position: sticky;
    top: 13.6rem;
  }
}

th,
td {
  border-color: rgb(230, 230, 230);
  border-style: solid;
  border-top-width: 1px;
  border-left-width: 1px;
  padding: 2px;
}

th:last-child,
td:last-child {
  border-right-width: 1px;
}

.bottom-line {
  border-bottom-width: 1px;
}

th {
  @apply bg-background;
}

.no-right-border {
  border-right-width: 0 !important;
}

.loading-spinner {
  z-index: 30 !important;
  left: 10%;
}
</style>
