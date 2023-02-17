import { BktRecord } from '@/models/bkt/bkt.model'
import { ref, Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export type PlausibilityError = {
  name: string
  day: BktRecord
  title: string
}

const usePlausibility = (days: () => Ref<BktRecord>[], activated: Ref<boolean>) => {
  const errors = ref<PlausibilityError[]>([])

  const { t } = useI18n()

  function addError(error: PlausibilityError): void {
    errors.value = [
      error,
      ...errors.value.filter(
        entry => entry.day.bktRecordDayId !== error.day.bktRecordDayId || entry.name !== error.name
      ),
    ]
  }

  function removeError(errorToRemove: PlausibilityError): void {
    errors.value = errors.value.filter(error => {
      if (error.day.bktRecordDayId !== errorToRemove.day.bktRecordDayId) {
        return true
      }
      return error.name !== errorToRemove.name
    })
  }

  function dayHasError(day: BktRecord): boolean {
    return !!errors.value.find(error => error.day.bktRecordDayId === day.bktRecordDayId)
  }

  // plausability function to check whether a day is set to being "open", but has no participant numbers set.
  const openDayHasOnlyEmptyEntries = (day: BktRecord) => {
    const error = {
      name: 'no active zero day',
      day,
      title: t('tabs.bkt.missingDayEntries', { day: day.day }),
    }
    if (!day.isClosed) {
      const sumOfDay = day.mealInfos
        .map(mealInfo =>
          mealInfo.mealParticipantInfos.map(participantInfo => participantInfo.numberOfParticipants)
        )
        .flat(2)
        .reduce((prev, curr) => prev + curr, 0)
      if (sumOfDay === 0) {
        return addError(error)
      }
      return removeError(error)
    }
    return removeError(error)
  }

  // functions that are being run when activated
  const plausibilityFunctions = [openDayHasOnlyEmptyEntries]

  watch(
    () => {
      // just reference activated to trigger on activated and on days ref changes.
      const tmp = activated.value
      return days()
    },
    daysValue => {
      if (activated.value) {
        daysValue.forEach(day => {
          plausibilityFunctions.forEach(func => func(day.value))
        })
      } else {
        errors.value = []
      }
    },
    { deep: true, immediate: true }
  )

  return { errors, dayHasError }
}

export default usePlausibility
