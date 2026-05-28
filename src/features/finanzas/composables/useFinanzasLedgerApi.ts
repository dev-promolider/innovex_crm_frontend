import { shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { normalizeFinanceError } from './useFinanceApiError'

interface SuccessResponse<T> {
  status: string
  message?: string
  data: T
}

export function useFinanzasLedgerApi() {
  const { authHeaders } = useAuthenticatedSession()
  const isSubmitting = shallowRef(false)
  const errorMessage = shallowRef('')

  const reversarTransaccion = async (transaccionId: number, motivo: string) => {
    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const response = await apiClient.post<SuccessResponse<{ reversa_id: number }>>(
        `/workspace/admin/finanzas/ledger/transacciones/${transaccionId}/reversar`,
        { motivo },
        { headers: authHeaders() },
      )

      return response.data.data
    } catch (error) {
      errorMessage.value = normalizeFinanceError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    errorMessage,
    reversarTransaccion,
  }
}
