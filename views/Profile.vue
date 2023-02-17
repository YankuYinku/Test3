<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import SettingsWrapper from '@/components/base/SettingsWrapper'
import SettingsItem from '@/components/base/SettingsItem'
import { useI18n } from 'vue-i18n'
import { authentication, dispatchNavigationData } from '@apetito/portal-sdk-common'

const { t } = useI18n()

const name = ref(
  `${authentication.authClient.account?.idTokenClaims?.given_name} ${authentication.authClient.account?.idTokenClaims?.family_name}`.trim()
)
const email = ref(authentication.authClient.account?.username)

authentication.onAccountChanged((newAccount: any) => {
  name.value =
    `${newAccount?.idTokenClaims?.given_name} ${newAccount?.idTokenClaims?.family_name}`.trim()
  email.value = newAccount?.username
})

onBeforeMount(() => {
  dispatchNavigationData('@apetito/user-account-details')
})
</script>

<template>
  <section class="max-w-4xl">
    <settings-wrapper
      :caption="t('tabs.profile.caption')"
      :description="t('tabs.profile.description')"
    >
      <settings-item :caption="t('tabs.profile.name')">
        <span class="notranslate">{{ name }}</span>
        <!--template #actions>
          <SettingsEditButton @click="authentication.editProfile()"></SettingsEditButton>
        </!--template-->
      </settings-item>
      <settings-item :caption="t('tabs.profile.email')">
        {{ email }}
      </settings-item>
      <settings-item :caption="t('tabs.profile.userRole')">
        {{ t('tabs.profile.userRoles.user') }}
      </settings-item>
    </settings-wrapper>
  </section>
</template>
