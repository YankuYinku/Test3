<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineEmits, ref, defineProps, withDefaults, onMounted, toRefs } from 'vue'
import { INavigationItem } from '@/components/navigation/types'
import { navigateTo } from '@/utils/navigation'

const slotWrapper = ref(null)
const emit = defineEmits<{
  (e: 'click', ev: PointerEvent): void
}>()

const props = withDefaults(
  defineProps<{
    item: INavigationItem
    hideText?: boolean
  }>(),
  {
    hideText: false,
  }
)
const { item } = toRefs(props)
const onClick = async (e: PointerEvent) => {
  emit('click', e)

  if (item.value.onClick) {
    item.value.onClick()
  } else if (item.value.external) {
    window.open(item.value.href, '_blank')
  } else {
    item.value.href && navigateTo(item.value.href)
  }
}

const externalHref = ref('')
const externalLoaded = ref(false)

onMounted(() => {
  if (item.value.promise) {
    item.value.promise
      .then(url => {
        externalHref.value = url
      })
      .finally(() => (externalLoaded.value = true))
  }
})
</script>

<template>
  <li
    v-if="item.promise"
    v-bind="$attrs"
    :class="[
      'menu-item-wrapper group relative flex h-9.5 items-center rounded-md text-sm font-medium',
    ]"
  >
    <a
      target="_blank"
      :class="[
        'menu-item menu-link absolute flex w-69.75 items-center overflow-hidden rounded-3xl text-lg text-muted hover:bg-apetitoGray-light',
        hideText && 'text-hidden hover:shadow-md',
        !externalLoaded && 'disabled',
      ]"
      :href="externalHref"
    >
      <div
        :class="[
          'mr-4 flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-3xl text-xl',
        ]"
      >
        <svg
          v-if="!externalLoaded"
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="spinner"
          class="w-6 animate-spin"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"
          ></path>
        </svg>
        <Component v-else-if="item.customIcon" :is="item.customIcon"></Component>
        <font-awesome-icon
          v-else-if="item.icon && !item.imageIcon"
          :icon="item.icon"
        ></font-awesome-icon>
        <img v-else-if="item.icon" class="overflow-hidden rounded-3xl" :src="item.icon" />
      </div>
      <span
        ref="slotWrapper"
        :class="['flex-1 flex-shrink-0 overflow-hidden overflow-ellipsis whitespace-nowrap']"
      >
        <slot></slot>
      </span>
    </a>
  </li>

  <li
    v-else
    v-bind="$attrs"
    class=""
    :class="[
      item.active && 'router-link-active text-primary',
      'menu-item-wrapper group relative flex h-9.5 items-center rounded-md text-sm font-medium',
    ]"
  >
    <a
      :class="[
        'menu-link menu-item absolute flex w-69.75 items-center overflow-hidden rounded-3xl text-lg text-muted',
        !item.active && 'group-hover:bg-apetitoGray-light',
        item.active && 'group-hover:bg-primary-200',
        hideText && 'text-hidden group-hover:shadow-md',
      ]"
      :href="item.href"
      :target="item.external ? '_blank' : '_self'"
      @click.stop.prevent="onClick"
    >
      <div
        :class="[
          item.active && 'bg-primary-200',
          'mr-4 flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-3xl text-xl',
        ]"
      >
        <Component v-if="item.customIcon" :is="item.customIcon" :class="[item.active && 'text-primary']"></Component>
        <font-awesome-icon
          v-else-if="item.icon && !item.imageIcon"
          :class="[item.active && 'text-primary']"
          :icon="item.icon"
        ></font-awesome-icon>
        <img v-else-if="item.icon" class="overflow-hidden rounded-3xl" :src="item.icon" />
      </div>
      <span
        ref="slotWrapper"
        :class="[
          'z-50 flex-1 flex-shrink-0 overflow-hidden overflow-ellipsis whitespace-nowrap',
          item.active && 'text-primary',
        ]"
      >
        <slot></slot>
      </span>
    </a>
  </li>
</template>

<style scoped lang="scss">
.router-link-active {
  @apply text-primary;
}

.menu-link {
  &.text-hidden {
    @apply w-9.5;
  }

  &:active:focus {
    @apply outline-none shadow-none;
  }
}

.menu-item {
  @apply focus:outline-none focus:ring-2 focus:ring-primary;

  &.text-hidden {
    @apply w-9.5;
  }

  &.text-hidden {
    &:hover {
      @apply w-72 overflow-visible;
    }
  }

  &:active:focus {
    @apply outline-none shadow-none;
  }
}

.disabled {
  @apply pointer-events-none cursor-default;
}

@media screen and (max-height: 700px) {
  .menu-item-wrapper {
    @apply h-8;
  }
}
</style>
