import { CustomTypeModelSlice, Slice } from '@prismicio/types'

export interface FaqTopic {
  id: string
  title: string
  slug: string
  questions: (Slice & { id: number })[]
}
