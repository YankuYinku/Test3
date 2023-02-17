<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import { AccountStatus } from '@/models/user-account.interface'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  status: AccountStatus
}>()

const { t } = useI18n()

const colors = new Map<AccountStatus, string>()
colors.set('Active', '#60ae37')
colors.set('Invited', '#f7b01b')

const color = computed(() => {
  return colors.get(props.status)
})

const accountStatus = computed(() => {
  return t(`tabs.accounts.status.${props.status}`)
})
</script>
<template>
  <div class="flex items-center gap-2">
    <div class="status-dot h-4 w-4 rounded-full"></div>
    <div class="status-name">{{ accountStatus }}</div>
  </div>
</template>

<style lang="scss" scoped>
.status-name {
  color: v-bind(color);
}

.status-dot {
  background-color: v-bind(color);
}
</style>
