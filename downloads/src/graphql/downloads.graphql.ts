import gql from 'graphql-tag'

export const GET_DOWNLOADS = gql`
  query downloadsQuery(
    $pageSize: Int!
    $page: Int!
    $sortiments: [String!]
    $orderSystems: [String!]
    $search: String
    $categories: [String!]
    $customerNumbers: [String!]
    $languageCode: String!
  ) {
    downloads(
      request: {
        pageSize: $pageSize
        page: $page
        sortiments: $sortiments
        search: $search
        categories: $categories
        orderSystems: $orderSystems
        customerNumbers: $customerNumbers
        languageCode: $languageCode
      }
    ) {
      categoriesSummarization {
        categoryName
        categoryDescription
        amount
      }
      pageSize
      overallItems
      overallPages
      items {
        id
        title
        description
        type
        file {
          url
          displayName
          type
          typeDescription
          size
          sizeValue
        }
        filePreview {
          url
          height
          width
        }
        categories {
          id
          name
          description
        }
        areas
        sortiments {
          code
          description
        }
        keywords
        orderSystems
        customerNumbers
        materialNumber
      }
    }
  }
`
