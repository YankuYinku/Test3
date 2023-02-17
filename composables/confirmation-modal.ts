import { Ref, ref, watch } from 'vue'

type ConfirmationResult = 'ok' | 'cancel'

type UseConfirmationModalReturnType = {
  onClose: (reason: ConfirmationResult) => void
  confirm: (
    title1: string,
    message: string,
    title2?: string,
    objective?: string
  ) => Promise<boolean>
  isOpen: Ref<boolean>
  modalTitle1: Ref<string>
  modalTitle2: Ref<string>
  modalMessage: Ref<string>
  objectiveText: Ref<string>
}

export const useConfirmationModal = (): UseConfirmationModalReturnType => {
  const isOpen = ref(false)

  const modalTitle1 = ref('')
  const modalTitle2 = ref('')
  const modalMessage = ref('')
  const objectiveText = ref('')

  const result: Ref<ConfirmationResult | null> = ref(null)

  const confirm = (title1: string, message: string, title2?: string, objective?: string) => {
    modalTitle1.value = title1
    modalMessage.value = message
    // optional params
    modalTitle2.value = title2 ?? ''
    objectiveText.value = objective ?? ''

    isOpen.value = true

    return new Promise<boolean>((resolve, reject) => {
      const unwatch = watch(result, value => {
        isOpen.value = false
        unwatch()
        result.value = null

        if (value === 'ok') {
          resolve(true)
        } else {
          reject(false)
        }
      })
    })
  }

  const onClose = (reason: ConfirmationResult) => {
    result.value = reason
  }

  return { onClose, confirm, isOpen, modalTitle1, modalTitle2, modalMessage, objectiveText }
}
