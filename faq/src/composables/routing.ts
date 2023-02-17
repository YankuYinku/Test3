import { useStore } from '@/stores'
import { watch } from 'vue'
import { RouteParams, useRoute } from 'vue-router'

export function useRouting(): void {
  const store = useStore()
  const route = useRoute()

  function setActiveTopic(topic: string | undefined) {
    if (!topic) {
      store.activeTopic = null
    } else {
      const activeTopic = store.getTopicBySlug(topic)
      store.activeTopic = activeTopic ?? null
    }
  }

  function setActiveGroup(group: string | undefined) {
    if (!group) {
      store.activeGroup = null
    } else {
      const activeGroup = store.getGroupBySlug(group)
      store.activeGroup = activeGroup ?? null
    }
  }

  function checkRouteParams(params: RouteParams): void {
    if (params.group) {
      setActiveGroup(params.group as string)
    } else {
      store.activeGroup = null
    }

    if (params.topic) {
      setActiveTopic(params.topic as string)
    } else {
      store.activeTopic = null
    }
  }

  // set groups and topics when user navigates
  watch(
    () => route.params,
    (to: RouteParams) => {
      checkRouteParams(to)
    }
  )

  // set group and topic when faq data is loaded
  watch(
    () => store.groups,
    () => {
      checkRouteParams(route.params)
    }
  )
}
