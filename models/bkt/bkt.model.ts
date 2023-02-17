export type MealParticipantInfo = {
  id: number
  name: string
  numberOfParticipants: number
  bktRecordId: number
}

export type MealInfo = {
  id: number
  name: string
  mealParticipantInfos: MealParticipantInfo[]
}

export type BktRecord = {
  bktRecordDayId: number
  day: string
  isClosed: boolean
  isVoucher: boolean
  mealInfos: MealInfo[]
}

export type BktMonth = {
  isMonthly: boolean
  /* isSubmitted is not provided by the api call to read
   a month but from the one to retrieve all available month for a customer */
  isSubmitted: boolean
  dateOfSubmission: string
  isLate: boolean
  isToleranceActive: boolean
  toleranceRelative: number
  days: BktRecord[]
}

export type BktMonthSelection = {
  id: string
  month: string
  isSubmitted: boolean
  dateOfSubmission: string
}

export type CloseMonthDayRequestInput = {
  dayId: number
  bktRecords: number[]
}

export type CloseMonthRequestInput = {
  days: CloseMonthDayRequestInput[]
}

export type MaterialAmountDeviation = {
  materialNumber: number
  setPointAmount: number
  actualAmount: number
}

export type toleranceDeviationQueryResult = {
  toleranceDeviationQuery: {
    materialAmountDeviations: MaterialAmountDeviation[]
    toleranceRelative: number
    isPlausible: boolean
  }
}
