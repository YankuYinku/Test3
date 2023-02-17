import { gql } from '@apollo/client'

export const bktQuery = gql`
  query getBtk($customerNumber: Int!, $accountingMonth: String!) {
    monthlyRecords(
      monthlyRecordsRequest: { customerNumber: $customerNumber, accountingMonth: $accountingMonth }
    ) {
      isMonthly
      isSubmitted
      dateOfSubmission
      isLate
      isToleranceActive
      toleranceRelative

      days {
        bktRecordDayId
        day
        isClosed
        isVoucher
        mealInfos {
          id
          name
          mealParticipantInfos {
            id
            name
            numberOfParticipants
            bktRecordId
          }
        }
      }
    }
  }
`

export const bktSummarizationQuery = gql`
  query getSummarization($customerNumber: Int!, $accountingMonth: String!) {
    monthlyRecordsSummarization(
      monthlyRecordsRequest: { customerNumber: $customerNumber, accountingMonth: $accountingMonth }
    ) {
      amount
    }
  }
`

export const getMonthsForCustomerQuery = gql`
  query getMonthForCustomer($customerNumber: Long!) {
    months(request: { contractAccountId: $customerNumber }) {
      id
      month
      isSubmitted
      dateOfSubmission
    }
  }
`

export const updateMealParticipantInfo = gql`
  mutation updateMealInfo($id: Long!, $numberOfParticipants: Int!) {
    updateBktRecord(bktRecordRequest: { id: $id, numberOfParticipants: $numberOfParticipants }) {
      id
      numberOfParticipants
    }
  }
`

export const closeMonth = gql`
  mutation closeMonth($days: [CloseMonthDayRequestInput!]!) {
    closeMonth(request: { days: $days })
  }
`

export const openMonth = gql`
  mutation openMonth($days: [OpenMonthDayRequestInput!]!) {
    openMonth(request: { days: $days })
  }
`

export const updateDayStatus = gql`
  mutation updateBktRecordDayStatus($dayId: Long!, $isClosed: Boolean!) {
    updateBktRecordDayStatus(btBktRecordDayRequest: { id: $dayId, isClosed: $isClosed }) {
      id
      isClosed
    }
  }
`

export const submitMonth = gql`
  mutation submitMonth($id: Int!, $month: DateTime!, $isConfirmed: Boolean!) {
    submitMonth(request: { id: $id, month: $month, isConfirmed: $isConfirmed })
  }
`

export const toleranceDeviation = gql`
  query ($customerNumber: Int!, $accountingMonth: String!) {
    toleranceDeviationQuery(
      monthlyRecordsRequest: { customerNumber: $customerNumber, accountingMonth: $accountingMonth }
    ) {
      materialAmountDeviations {
        materialNumber
        setPointAmount
        actualAmount
      }
      toleranceRelative
      isPlausible
    }
  }
`
