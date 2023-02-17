import { Ref, ref } from 'vue'
import { initFeatureFlags } from '@apetito/portal-sdk-common'
import { FeatureResponse } from '@apetito/portal-sdk-common'

export const useFeatureFlags = (
  feature: { visibility: (name: string, value: boolean) => void },
  featureNames: string[]
) => {
  const key: Ref<number> = ref(0)
  const rules: Ref<FeatureResponse[]> = ref([])

  initFeatureFlags(featureNames).then((result: FeatureResponse[]) => {
    result.forEach(rule => {
      feature.visibility(rule.feature, rule.value)
    })
    rules.value = result
    key.value = Math.random() * 9999
  })

  return { key, rules }
}
