import { useStore } from '@/stores'
import { Observable } from 'windowed-observable'
import {
  Action,
  CustomerChangedActionPayload,
  setAppInsightsUser,
} from '@apetito/portal-sdk-common'

export const useCustomerChanged = (
  store?: ReturnType<typeof useStore>
): { publishChanges: () => void } => {
  if (!store) {
    store = useStore()
  }
  // create inter-app communication channel
  const eventBus = new Observable<Action<CustomerChangedActionPayload>>('@apetito/user-account')

  // send current state to other apps.
  function publishChanges(): void {
    const action: Action<CustomerChangedActionPayload> = {
      type: 'CustomerChanged',
      payload: {
        customerNumbers: store?.activeCustomerNumbers || [],
        sortiments: store?.sortiments || [],
        orderSystems: store?.orderSystems || [],
        effectiveOrderSystems: store?.effectiveOrderSystems || [],
        permissions: store?.permissions || [],
        languageCodes: store?.languageCodes || [],
        administratedCustomerNumbers: store?.userData.all.administratedCustomerNumbers || [],
        userEmail: store?.userData.userEmail || '',
        suppliers: store?.suppliers || [],
      },
    }
    eventBus.publish(action)
    if (
      store?.activeCustomerNumbers?.length &&
      store?.activeCustomerNumbers[0].orderSystem &&
      store?.activeCustomerNumbers[0].customerNumber
    ) {
      setAppInsightsUser({
        orderSystem: store?.activeCustomerNumbers[0].orderSystem,
        customerNumber: store?.activeCustomerNumbers[0].customerNumber,
      })
    }
  }

  return { publishChanges }
}
