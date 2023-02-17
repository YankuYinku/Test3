<script lang="ts" setup>
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { computed, defineProps, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { SubMenuEntryModel } from '@/types/submenuEntry'
import { SnapToScreen as vSnapToScreen } from '@apetito/components-ui-vue3'

const props = defineProps<{
  contextMenuEntries: SubMenuEntryModel[]
  disabled?: boolean
}>()

const menuEntriesToShow = computed(() =>
  props.contextMenuEntries.filter((popupValue: SubMenuEntryModel) => popupValue.display)
)
const trigger = ref()
</script>

<template>
  <Menu
    as="div"
    class="relative inline-block text-left"
    :class="{ 'pointer-events-none cursor-text opacity-0': disabled }"
    @click.prevent.stop
  >
    <div ref="trigger">
      <MenuButton
        class="group flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
      >
        <font-awesome-icon
          :icon="['fal', 'ellipsis-h']"
          class="icon text-gray-200 group-hover:text-primary"
          size="2x"
        />
      </MenuButton>
    </div>

    <MenuItems
      v-snap-to-screen="trigger"
      class="z-25 absolute right-0 isolate w-48 rounded-md bg-white p-5 shadow-3xl"
    >
      <MenuItem
        v-for="{ icon, title, onClick } in menuEntriesToShow"
        as="div"
        class="group flex cursor-pointer items-center pb-4 text-gray-800 last:pb-0 hover:text-primary"
        :key="title"
        @click="onClick"
      >
        <div class="flex items-center">
          <font-awesome-icon
            class="icon w-6 text-gray-200 group-hover:text-primary"
            size="sm"
            :icon="['fal', `${icon}`]"
          />
          <div class="pl-2 text-sm">{{ title }}</div>
        </div>
      </MenuItem>
    </MenuItems>
  </Menu>
</template>

<style scoped lang="scss">
.z-25 {
  z-index: 25;
}
</style>
