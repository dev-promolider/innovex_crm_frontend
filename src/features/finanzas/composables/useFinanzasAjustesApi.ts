import { reactive, ref, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type { AjusteFinanciero, DebtPaginationMeta, PaginatedPayload } from '../types'
import { normalizeFinanceError } from './useFinanceApiError'

interface SuccessResponse<T> {
  status: string
  message?: string
  data: T
}

const defaultPagination = (): DebtPaginationMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})

export function useFinanzasAjustesApi() {
  const { authHeaders } = useAuthenticatedSession()
  const ajustes = ref<AjusteFinanciero[]>([])
  const isLoading = shallowRef(false)
  const isSubmitting = shallowRef(false)
  const errorMessage = shallowRef('')
  const pagination = reactive(defaultPagination())

  const applyPagination = (payload: PaginatedPayload<AjusteFinanciero>) => {
    pagination.current_page = payload.current_page
    pagination.last_page = payload.last_page
    pagination.per_page = payload.per_page
    pagination.total = payload.total
  }

  const fetchAjustes = async (page = 1, estado = 'todos') => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await apiClient.get<SuccessResponse<PaginatedPayload<AjusteFinanciero>>>(
        '/workspace/admin/finanzas/ajustes',
        {
          headers: authHeaders(),
          params: {
            page,
            estado: estado !== 'todos' ? estado : undefined,
          },
        },
      )

      ajustes.value = response.data.data.data
      applyPagination(response.data.data)
    } catch (error) {
      errorMessage.value = normalizeFinanceError(error, 'No fue posible cargar ajustes financieros.')
    } finally {
      isLoading.value = false
    }
  }

  const solicitarAjuste = async (payload: {
    membresia_id: number
    tipo: 'credito' | 'debito'
    monto: number
    descripcion: string
  }) => submit(() => apiClient.post('/workspace/admin/finanzas/ajustes', payload, { headers: authHeaders() }))

  const aprobarAjuste = async (ajusteId: number) =>
    submit(() => apiClient.post(`/workspace/admin/finanzas/ajustes/${ajusteId}/aprobar`, {}, { headers: authHeaders() }))

  const rechazarAjuste = async (ajusteId: number, motivo: string) =>
    submit(() => apiClient.post(`/workspace/admin/finanzas/ajustes/${ajusteId}/rechazar`, { motivo }, { headers: authHeaders() }))

  const submit = async (request: () => Promise<unknown>) => {
    isSubmitting.value = true
    errorMessage.value = ''

    try {
      await request()
    } catch (error) {
      errorMessage.value = normalizeFinanceError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    ajustes,
    isLoading,
    isSubmitting,
    errorMessage,
    pagination,
    fetchAjustes,
    solicitarAjuste,
    aprobarAjuste,
    rechazarAjuste,
  }
}
