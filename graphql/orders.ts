import gql from 'graphql-tag'

export const getOrdersQuery = gql`
  query getOrders(
    $customerNumbers: [Int!]
    $supplier: String
    $orderDateFrom: DateTime!
    $orderDateTo: DateTime!
    $status: String
    $searchTerm: String
    $page: Int!
    $pageSize: Int! = 20
  ) {
    orders(
      request: {
        customerNumbers: $customerNumbers
        supplier: $supplier
        orderDateFrom: $orderDateFrom
        orderDateTo: $orderDateTo
        status: $status
        searchTerm: $searchTerm
        page: $page
        pageSize: $pageSize
      }
    ) {
      orders {
        id
        supplier
        orderDate
        deliveryDate
        customerNumber
        orderPositionCount
        status
        totalAmount
      }
      supplierSummarizations {
        supplier
        amount
      }
      overallPages
      overallResults
      overallItemsInAllCategories
    }
  }
`

export const getApetitoOrderDetails = gql`
  query getApetitoOrderDetails($orderId: String!, $customerNumbers: [Int!]!) {
    apetitoOrderDetails(request: { orderId: $orderId, customerNumbers: $customerNumbers }) {
      header {
        id
        customerNumber
        orderDate
        deliveryDate
        approval
        exported
        status
        deliveryToCustomerNumber
        deliveryMaterialToCustomerNumber
        comment
        externalComment
        email
        totalAmount
        orderPositionCount
      }
      positions {
        id
        orderId
        articleId
        title
        amount
        quantity
        consumptionDay
        sizeIndex
        menuPlanComponentOrderId
        comment
        plannedQuantity
        stockQuantity
        showPriceInConfirmation
        tableGuestId
        consumptionDate
      }
    }
  }
`

export const getHawawOrderDetails = gql`
  query getHawaOrderDetails($orderId: String!, $customerNumbers: [Int!]!) {
    hawaOrderDetails(request: { orderId: $orderId, customerNumbers: $customerNumbers }) {
      id
      orderNumber
      email
      customer {
        id
        isValid
      }
      supplier {
        id
        apetitoCreditorId
        apetitoCreditorNr
        name
        street
        city
        zip
        vatId
      }
      description
      orderDate
      deliveryDate
      isSelfpayer
      totals {
        totalQuantity
        totalNetPrice
        totalGrossPrice
        totalVat
        totalVat7Price
        totalVat19Price
        includedVat19
        includedVat7
      }
      status {
        orderId
        errorMessage
        isAcceptedByDistributor
        acceptedDistributor
        isSendToSupplier
        sendToSupplier
      }
      orderPositions {
        articleId
        articleNumber
        category
        supplierId
        orderingUnitId
        positionNr
        description
        quantity
        priceNet
        vat
        priceGross
        vat
        vatPercent
        positionNetPrice
        positionGrossPrice
        positionVat
        comment
        basicSalesUnit
        basicQuantity
        available
        errorCode
      }
      failedOrderPositions {
        articleId
        articleNumber
        category
        supplierId
        orderingUnitId
        positionNr
        description
        quantity
        priceNet
        vat
        priceGross
        vat
        vatPercent
        positionNetPrice
        positionGrossPrice
        positionVat
        comment
        basicSalesUnit
        basicQuantity
        available
        errorCode
      }
      errorCode
      hasOrderPositionsWithErrorCodes
    }
  }
`

export const articleAvailability = gql`
  query articleAvailability($articles: [ArticleWithQuantityDtoInput!]!) {
    checkArticlesAvailability(articles: $articles) {
      available {
        articleNumber
        allowedQuantity
      }
      notAvailable {
        articleNumber
        allowedQuantity
      }
    }
  }
`

export const hawaArticleAvailability = gql`
  query hawaArticleAvailability($articles: [String!]!, $suppliers: [String!]!) {
    checkHawaArticlesAvailability(request: { articleIds: $articles, suppliers: $suppliers }) {
      available
      notAvailable
    }
  }
`

export const addItemsToBasket = gql`
  mutation addItemsToBasket($addItemModels: [AddItemToBasketRequestModelInput!]!) {
    addItemsToBasket(requests: $addItemModels) {
      succeededArticles
      failedArticles
    }
  }
`

export const addHawaArticleToBasket = gql`
  mutation addHawaItemsToBasket($articleNumber: Int!, $quantity: Int!, $supplierId: Int!) {
    addItemToBasketHawa(
      hawaRequest: { articleNumber: $articleNumber, quantity: $quantity, supplierId: $supplierId }
    ) {
      succeededArticles
      failedArticles
    }
  }
`
export const addHawaArticlesToBasket = gql`
  mutation addHawaArticlesToBasket($articles: [AddItemToBasketHawaRequestModelInput!]!) {
    addItemsToBasketHawa(requests: $articles) {
      succeededArticles
      succeededArticles
    }
  }
`
