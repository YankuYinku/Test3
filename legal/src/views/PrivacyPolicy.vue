<script lang="ts" setup>
import { inject, onBeforeMount, onMounted, provide, ref } from 'vue'
import { defineSliceZoneComponents, SliceLike, SliceZone } from '@prismicio/vue'
import * as prismic from '@prismicio/client'
import env from '../utils/env'
import PrivacyPolicyBlockHeader from '@/components/privacy-policy/PrivacyPolicyBlockHeader.vue'
import PrivacyPolicyHeader from '@/components/privacy-policy/PrivacyPolicyHeader.vue'
import { dispatchNavigationData } from '@apetito/portal-sdk-common'
import { UserLanguageInjectionKey } from '@/models/user/_injectionKeys'

const repositoryName = env.VUE_APP_PRISMIC_REPOSITORY ?? 'meinapetito'
const endpoint = prismic.getEndpoint(repositoryName)
const client = prismic.createClient(endpoint)

const slices = ref<SliceLike[]>([])
const policyTitle = ref([])
const policyText = ref([])

const privacyPolicyType = 'privacy_policy'
const languageCode = inject(UserLanguageInjectionKey, ref('de-DE'))

onMounted(async () => {
  const queryResult = await client.getByType(privacyPolicyType, { lang: languageCode.value })
  if (queryResult.results_size !== 0) {
    slices.value = queryResult.results[0].data.body as SliceLike[]
    policyTitle.value = queryResult.results[0].data.privacy_policy_title
    policyText.value = queryResult.results[0].data.privacy_policy_header_text
  } else {
    slices.value = []
  }
})

onBeforeMount(() => {
  dispatchNavigationData('@apetito/legal')
})

const components = defineSliceZoneComponents({
  faq_section: PrivacyPolicyBlockHeader,
})
</script>

<template>
  <section>
    <PrivacyPolicyHeader :title="policyTitle" :text="policyText" />
    <SliceZone :slices="slices" :components="components" />
  </section>
</template>
