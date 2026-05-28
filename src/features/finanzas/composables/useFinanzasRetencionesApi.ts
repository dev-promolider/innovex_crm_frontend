import { reactive, ref, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type { DebtPaginationMeta, PaginatedPayload, RetencionComision } from '../types'
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

export function useFinanzasRetencionesApi() {
  const { authHeaders } = useAuthenticatedSession()
  const retenciones = ref<RetencionComision[]>([])
  const isLoading = shallowRef(false)
  const isSubmitting = shallowRef(false)
  const errorMessage = shallowRef('')
  const pagination = reactive(defaultPagination())

  const applyPagination = (payload: PaginatedPayload<RetencionComision>) => {
    pagination.current_page = payload.current_page
    pagination.last_page = payload.last_page
    pagination.per_page = payload.per_page
    pagination.total = payload.total
  }

  const fetchRetenciones = async (page = 1, estado = 'todos', membresiaId?: number | null) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await apiClient.get<SuccessResponse<PaginatedPayload<RetencionComision>>>(
        '/workspace/admin/finanzas/retenciones',
        {
          headers: authHeaders(),
          params: {
            page,
            estado: estado !== 'todos' ? estado : undefined,
            membresia_id: membresiaId || undefined,
          },
        },
      )

      retenciones.value = response.data.data.data
      applyPagination(response.data.data)
    } catch (error) {
      errorMessage.value = normalizeFinanceError(error, 'No fue posible cargar retenciones.')
    } finally {
      isLoading.value = false
    }
  }

  const aplicarRetencion = async (payload: {
    membresia_id: number
    porcentaje: number
    justificacion: string
    monto_fijo?: number | null
  }) => submit(() => apiClient.post('/workspace/admin/finanzas/retenciones', payload, { headers: authHeaders() }))

  const liberarRetencion = async (retencionId: number, motivo: string) =>
    submit(() => apiClient.post(`/workspace/admin/finanzas/retenciones/${retencionId}/liberar`, { motivo }, { headers: authHeaders() }))

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
    retenciones,
    isLoading,
    isSubmitting,
    errorMessage,
    pagination,
    fetchRetenciones,
    aplicarRetencion,
    liberarRetencion,
  }
}
