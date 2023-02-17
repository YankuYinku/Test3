<script setup lang="ts">
import { UserAccountModelInterface } from '@/models/user-account-model.interface'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { computed, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { getApplicationStaticAssetPath } from '@apetito/portal-sdk-common'
import env from '@/utils/env'
import { navigateToUrl } from 'single-spa'

const props = defineProps<{
  account: UserAccountModelInterface
}>()
const emit = defineEmits(['signOut', 'changePassword', 'editProfile'])
const { t } = useI18n()

const avatarUrl: string = getApplicationStaticAssetPath(
  'img/shield.gif',
  'user-account',
  env.NODE_ENV.value
)

const username = computed(() => {
  const name = props.account?.idTokenClaims?.given_name
  const surname = props.account.idTokenClaims?.family_name
  return `${name} ${surname}`.trim()
})

const emailIsUsername = computed(() => {
  const [email] =
    props.account.idTokenClaims?.emails && props.account.idTokenClaims?.emails.length >= 0
      ? props.account.idTokenClaims?.emails
      : []
  return props.account.username === email
})

const openMyCompany = (close: any) => {
  navigateToUrl('/user-account-details#/my-profile')
  close()
}
</script>
<template>
  <Popover class="relative" v-slot="{ open, close }">
    <PopoverButton
      class="focus:outline-none icon-lg flex place-content-center place-items-center gap-6 rounded-full bg-white p-2 px-2.5 text-left text-xl text-gray-700 antialiased shadow hover:text-primary"
      :class="open && 'text-primary'"
    >
      <font-awesome-icon :icon="['fal', 'user']"></font-awesome-icon>
    </PopoverButton>
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform translate-y-3 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-50"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-3 opacity-0"
    >
      <PopoverPanel class="settings-panel absolute right-0 z-10 mt-6 min-w-min text-sm">
        <div class="flex flex-col bg-white p-5 text-gray-900 shadow-account">
          <!-- User data -->
          <div class="section flex gap-4 pb-4 leading-6">
            <div class="avatar">
              <img :src="avatarUrl" />
            </div>
            <div>
              <h2 class="notranslate mb-0.5 whitespace-nowrap text-lg font-bold leading-5">
                {{ username }}
              </h2>
              <div class="text-sm font-light text-gray-200">
                {{
                  account.idTokenClaims?.emails && account.idTokenClaims?.emails.length >= 0
                    ? account.idTokenClaims?.emails[0]
                    : '-'
                }}
              </div>
              <div v-if="!emailIsUsername" class="text-sm font-light text-gray-200">
                {{ account.username ?? '-' }}
              </div>
            </div>
          </div>
          <!-- Profile links -->
          <div class="section flex flex-col py-4 text-sm leading-6">
            <h3 class="pb-2 text-xs text-gray-200">
              {{ t('UserAccountSettings.Profile.YourProfile') }}
            </h3>
            <div class="menu-item">
              <a class="cursor-pointer" @click.prevent="emit('editProfile')">
                <font-awesome-icon
                  class="box-content pr-3"
                  :icon="['fal', 'address-card']"
                ></font-awesome-icon>
                {{ t('UserAccountSettings.Profile.YourData') }}
              </a>
            </div>
            <div class="menu-item">
              <a class="cursor-pointer" @click.prevent="emit('changePassword')">
                <font-awesome-icon
                  class="box-content pr-3"
                  :icon="['fal', 'key']"
                ></font-awesome-icon>
                {{ t('UserAccountSettings.ChangePassword') }}
              </a>
            </div>
          </div>
          <!-- Company links -->
          <div class="section flex flex-col py-4 text-sm leading-6">
            <h3 class="pb-2 text-xs text-gray-200">
              {{ t('UserAccountSettings.Company.YourCompany') }}
            </h3>
            <div class="menu-item">
              <a
                class="cursor-pointer"
                href="/user-account-details#/my-profile"
                @click.prevent="openMyCompany(close)"
              >
                <font-awesome-icon
                  class="box-content pr-3"
                  :icon="['fal', 'user-chart']"
                ></font-awesome-icon>
                {{ t('UserAccountSettings.Company.CustomerData') }}
              </a>
            </div>
          </div>
          <!-- Logout-->
          <div class="section flex flex-col pt-4 text-sm leading-6">
            <div class="menu-item">
              <a class="cursor-pointer" @click.prevent="emit('signOut')">
                <font-awesome-icon class="box-content pr-3" :icon="['fal', 'sign-out']" />
                {{ t('UserAccountSettings.Logout') }}
              </a>
            </div>
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<style lang="scss" scoped>
.section {
  &:not(:first-child) {
    border-top: 1px solid #e6e6e6;
  }
}

.avatar {
  height: 58px;
  width: 58px;
}

.settings-panel {
  min-width: 370px;
}

.menu-item {
  transform: translateX(-3%);
  padding-left: 3%;
  width: 103%;
}

.menu-item:hover {
  @apply bg-apetitoGray-light;
}

.tooltip {
  position: relative;
  cursor: default;
}

.tooltip:before {
  content: attr(data-text);
  display: none;
  position: absolute;

  font-size: 0.75rem;

  top: 50%;
  transform: translateY(-50%);
  word-wrap: none;

  left: 100%;
  margin-left: 10px;

  white-space: nowrap;
  padding: 2px 10px;
  border-radius: 5px;
  background: rgb(105, 105, 105);
  color: #fff;
}

.tooltip:hover:before,
.tooltip:hover:after {
  display: block;
}
</style>
