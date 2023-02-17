<script lang="ts" setup>
import {
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import SettingsWrapper from '@/components/base/SettingsWrapper'
import SettingsItem from '@/components/base/SettingsItem'
import { PrismicRichText } from '@prismicio/vue'
import { VcHeartSpinner, VcPrismicRichTextWrapper } from '@apetito/components-ui-vue3'
import { useI18n } from 'vue-i18n'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import { PrismicClientKey } from '../injectionkeys/index'
import { IRootCompanyKey } from '@/plugins/api/models/IRootCompanyApi.model'
import {
  Action,
  CustomerChangedActionPayload,
  dispatchNavigationData,
  useEventBus,
} from '@apetito/portal-sdk-common'

const rootCompanyApi = inject(IRootCompanyKey)!

const client = inject(PrismicClientKey)!

const { t } = useI18n()

const { loading, getEventBusPayload, subscribeEventBusAction } =
  useEventBus<CustomerChangedActionPayload>('@apetito/user-account', getCurrentInstance())

const editContactInfo = ref()
const companyData = ref()

const getCompanyData = (customerNumbers: number[]) => {
  if (customerNumbers.length === 0) {
    return
  }
  rootCompanyApi.then(api => {
    api
      .getCompanyData(customerNumbers[0])
      .then(({ data }) => {
        companyData.value = data
      })
      .catch(error => {
        // TODO add notifications
        console.error(error)
      })
  })
}

getEventBusPayload().then(payload => {
  getCompanyData(payload.customerNumbers.map(customer => customer.customerNumber))
})

const onCustomerChanged = (event: Action<CustomerChangedActionPayload> | undefined) => {
  nextTick(() => {
    event?.payload.customerNumbers
    getCompanyData(event?.payload.customerNumbers.map(customer => customer.customerNumber) ?? [])
  })
}

const unsubscribe = subscribeEventBusAction(onCustomerChanged)

onBeforeMount(() => {
  dispatchNavigationData('@apetito/user-account-details')
})

onMounted(async () => {
  const queryResult = await client.getByType('user_account_company')
  if (queryResult.results.length > 0 && queryResult.results[0]?.data) {
    editContactInfo.value = queryResult.results[0]?.data
  }
})

onBeforeUnmount(() => {
  unsubscribe()
})
</script>

<template>
  <section class="relative max-w-4xl">
    <div>
      <settings-wrapper
        :caption="t('tabs.company.customerData.caption')"
        :description="t('tabs.company.customerData.description')"
      >
        <settings-item :caption="t('tabs.company.customerData.customerNumber')">
          {{ companyData?.company.customerNumber }}
        </settings-item>
        <settings-item :caption="t('tabs.company.customerData.company')">
          {{ companyData?.company.name }}
        </settings-item>
        <settings-item :caption="t('tabs.company.customerData.deliveryAddress')">
          <p>{{ companyData?.deliveryAddress.address }}</p>
          <p>{{ companyData?.deliveryAddress.zipCode }} {{ companyData?.deliveryAddress.city }}</p>
          <p>{{ companyData?.deliveryAddress.federalRegion }}</p>
        </settings-item>
      </settings-wrapper>

      <settings-wrapper
        :caption="t('tabs.company.customerData.mainContact.caption')"
        :description="t('tabs.company.customerData.mainContact.description')"
      >
        <settings-item :caption="t('tabs.company.customerData.mainContact.salutation')">
          {{ companyData?.mainContactPerson.salutation }}
        </settings-item>
        <settings-item :caption="t('tabs.company.customerData.mainContact.firstName')">
          {{ companyData?.mainContactPerson.firstName }}
        </settings-item>
        <settings-item :caption="t('tabs.company.customerData.mainContact.lastName')">
          {{ companyData?.mainContactPerson.lastName }}
        </settings-item>
        <settings-item :caption="t('tabs.company.customerData.mainContact.email')">
          {{ companyData?.mainContactPerson.emailAddress }}
        </settings-item>
      </settings-wrapper>

      <div class="mt-2 rounded-md bg-blue-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <InformationCircleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div class="ml-3 flex-1 md:flex md:justify-between">
            <p class="text-sm text-blue-700">
              <VcPrismicRichTextWrapper>
                <prismic-rich-text
                  v-if="editContactInfo?.edit_contact"
                  :field="editContactInfo?.edit_contact"
                ></prismic-rich-text>
              </VcPrismicRichTextWrapper>
            </p>
          </div>
        </div>
      </div>
    </div>
    <VcHeartSpinner
      v-show="!companyData || loading"
      class="absolute z-auto bg-background"
    ></VcHeartSpinner>
  </section>
</template>
