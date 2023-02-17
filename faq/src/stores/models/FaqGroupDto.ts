import { FaqDto } from "./FaqDto"

export type FaqGroupDto =  {
    id: string
    slug: string
    title: string
    shortTitle: string
    introText: string
    faqs: [FaqDto]
  }