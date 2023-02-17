<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineProps, toRefs, withDefaults } from 'vue'

import { DEFAULT_ICON_PREFIX } from '@/components/base/customIcon/consts'

interface Props {
  icon: string
  prefix?: string
}

const props = withDefaults(defineProps<Props>(), {
  prefix: DEFAULT_ICON_PREFIX,
})
const { icon, prefix } = toRefs(props)
</script>

<template>
  <font-awesome-icon v-bind="$props" :icon="[prefix, icon]"></font-awesome-icon>
</template>
