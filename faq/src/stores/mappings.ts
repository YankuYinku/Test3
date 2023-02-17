import { CustomTypeModelSlice, Slice } from '@prismicio/types'
import { FaqDto } from './models/FaqDto'
import { FaqGroup } from './models/FaqGroup'
import { FaqGroupDto } from './models/FaqGroupDto'
import { FaqTopic } from './models/FaqTopic'

// adds an id to every question slice of any topic in a faq group
export function toFaqViewModel(doc: FaqGroupDto): FaqGroup {
  return {
    id: doc.id,
    introText: doc.introText,
    shortTitle: doc.shortTitle,
    slug: doc.slug,
    title: doc.title,
    topics: doc.faqs.map((faqDto: FaqDto) => {
      const slice: Slice[] = JSON.parse(faqDto.questions)
      return {
        id: faqDto.id,
        slug: faqDto.slug,
        title: faqDto.title,
        // create id on every question - needed for VCList to work properly.
        questions: slice.map((question, index: number) => ({
          ...question,
          id: index,
        })),
      }
    }),
  }
}
