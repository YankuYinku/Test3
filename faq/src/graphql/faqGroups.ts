import gql from 'graphql-tag'

export const faqGroups = gql`
  query getFaqs($sortiments: [String!], $orderSystems: [String!], $languageCode: String) {
    faqs(
      request: { sortiments: $sortiments, orderSystems: $orderSystems, languageCode: $languageCode }
    ) {
      items {
        id
        slug
        title
        shortTitle
        introText
        faqs {
          id
          slug
          title
          questions
        }
      }
    }
  }
`
