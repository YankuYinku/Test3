import { faqGroups } from '@/graphql/faqGroups'
import { FaqGroup } from '@/stores/models/FaqGroup'
import state, { IAppState } from '@/stores/state'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { defineStore } from 'pinia'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { toFaqViewModel } from './mappings'
import { FaqGroupDto } from './models/FaqGroupDto'
import { FaqTopic } from './models/FaqTopic'

export const useStore = defineStore('faq', {
  state,
  actions: {
    async getGroups(
      client: ApolloClient<NormalizedCacheObject>,
      route: RouteLocationNormalizedLoaded,
      queryVariables?: { sortiments: string[]; orderSystems: string[] }
    ): Promise<FaqGroup[]> {
      if (!client) {
        return Promise.resolve([])
      }
      this.loading = true

      return client
        .query({
          query: faqGroups,
          variables: queryVariables,
        })
        .then(result => {
          this.loading = false
          return result.data.faqs.items as FaqGroupDto[]
        })

        .then(groups => {
          // map from API to view model
          this.groups = groups.map(toFaqViewModel)
          // set the active group from url slug.
          const activeGroupByUrlParam: string = route.params?.group as string
          if (activeGroupByUrlParam) {
            this.groups.forEach(group => {
              if (group.slug === activeGroupByUrlParam) {
                this.activeGroup = group
              }
            })
          }

          return this.groups || []
        })
        .catch(() => {
          // TODO: Use notification to show loading error
          this.groups = []
          this.loading = false
          return []
        })
    },
  },
  getters: {
    getFaqList(state: IAppState) {
      return (!state.activeTopic ? state.activeGroup?.topics ?? [] : [state.activeTopic]).map(
        topic => ({
          id: topic.id,
          items: topic.questions,
          group: topic,
        })
      )
    },

    getTopicBySlug(state: IAppState) {
      return (slug: string): FaqTopic | undefined => {
        return state.activeGroup?.topics.find(topic => {
          return topic.slug === slug
        })
      }
    },

    getGroupBySlug(state: IAppState) {
      return (slug: string): FaqGroup | undefined => {
        return state.groups.find(group => {
          return group.slug === slug
        })
      }
    },

    groupsWithFirstThreeTopics(state: IAppState) {
      return state.groups
        .map(group => ({
          ...group,
          faqs:
            group.topics && group.topics[0]
              ? group.topics[0].questions.filter((_, index) => index < 3)
              : [],
        }))
        .map(group => ({
          id: group.id,
          group: group,
          items: group.faqs,
        }))
    },
  },
})
