<script lang="ts" setup>
import { useStore } from '@/stores'
import { useI18n } from 'vue-i18n'
import {
  authentication,
  appInsights,
  ICurrentUserData,
  getEventBusInstance,
} from '@apetito/portal-sdk-common'
import { computed, ref, Ref } from 'vue'
import { UserAccountModelInterface } from '@/interfaces/user-acount'

const { t } = useI18n()
const store = useStore()

const getUserDataEventBusInstance = getEventBusInstance<ICurrentUserData>('@apetito/sspa-user-data')
const { payload } = getUserDataEventBusInstance.getLastEvent() || {}

const userAccount: Ref<UserAccountModelInterface | undefined> = ref()
try {
  userAccount.value = authentication.getAccount()
} catch (error: unknown) {
  appInsights.trackEvent({
    name: 'Login_FaqHeaderGroup_GetAccount',
    properties: {
      customerNumbers: payload?.customers,
      error: error,
    },
  })
}
const userName = computed(() => {
  const user = userAccount.value
  if (user?.idTokenClaims.given_name && user?.idTokenClaims.family_name) {
    return `${user?.idTokenClaims.given_name} ${user?.idTokenClaims.family_name}`
  }

  return user?.username
})
</script>

<template>
  <section class="sticky-header z-10 bg-faq-shadow-blue">
    <h2 class="pb-6 text-3xl font-bold">
      {{ t('Faq.Overview.Header.Salutation') }} {{ userName }},<br />
      {{ t('Faq.Overview.Header.HowCanWeHelp') }}
    </h2>
    <div class="flex flex-wrap content-center gap-4">
      <router-link
        @click="store.activeGroup = group"
        v-for="group in store.groups"
        :key="group.id"
        :to="{ name: 'faq', hash: group.slug }"
      >
        <div
          :class="[
            'cursor-pointer whitespace-nowrap rounded-full bg-white py-2 px-4 font-bold shadow hover:bg-main hover:text-white',
            store.activeGroup === group ? 'bg-main text-white hover:cursor-default' : '',
          ]"
        >
          {{ group.title }}
        </div>
      </router-link>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sticky-header {
  top: var(--header-height);
  @apply sticky py-6 px-14;
  @media screen and (min-height: 1024px) {
    @apply p-14;
  }
}
</style>
