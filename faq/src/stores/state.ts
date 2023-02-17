import { FaqTopic } from '@/stores/models/FaqTopic'
import { FaqGroup } from '@/stores/models/FaqGroup'

export type IAppState = {
  groups: FaqGroup[]
  activeGroup: FaqGroup | null
  activeTopic: FaqTopic | null
  loading: boolean
}

export default (): IAppState => {
  return {
    groups: [],
    activeGroup: null,
    activeTopic: null,
    loading: false,
  }
}
