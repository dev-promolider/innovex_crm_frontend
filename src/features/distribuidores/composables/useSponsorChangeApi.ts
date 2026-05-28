import axios from 'axios'
import { reactive, ref, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
  SponsorChangeFilter,
  SponsorChangePaginationMeta,
  SponsorChangeRequest,
} from '../types'

interface PaginationPayload<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface SuccessResponse<T> {
  status: string
  message?: string
  data: T
  meta?: {
    filtro?: SponsorChangeFilter
  }
}

const defaultPagination = (): SponsorChangePaginationMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})

const normalizeErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage
    }

    const validationErrors = error.response?.data?.errors
    if (validationErrors && typeof validationErrors === 'object') {
      const firstGroup = Object.values(validationErrors)[0]
      if (Array.isArray(firstGroup) && typeof firstGroup[0] === 'string') {
        return firstGroup[0]
      }
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'No fue posible completar la operacion.'
}

export function useSponsorChangeApi() {
  const { authHeaders } = useAuthenticatedSession()

  const requests = ref<SponsorChangeRequest[]>([])
  const activeFilter = shallowRef<SponsorChangeFilter>('pendientes')
  const isLoading = shallowRef(false)
  const mutatingRequestId = shallowRef<number | null>(null)
  const errorMessage = shallowRef('')
  const successMessage = shallowRef('')
  const pagination = reactive<SponsorChangePaginationMeta>(defaultPagination())

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const applyPagination = (payload: PaginationPayload<SponsorChangeRequest>) => {
    pagination.current_page = payload.current_page
    pagination.last_page = payload.last_page
    pagination.per_page = payload.per_page
    pagination.total = payload.total
    requests.value = payload.data
  }

  const fetchRequests = async (page = 1, filtro: SponsorChangeFilter = activeFilter.value) => {
    isLoading.value = true
    clearMessages()

    try {
      const { data } = await apiClient.get<SuccessResponse<PaginationPayload<SponsorChangeRequest>>>(
        '/workspace/admin/red/cambios-patrocinador',
        {
          headers: authHeaders(),
          params: { page, filtro },
        },
      )

      activeFilter.value = data.meta?.filtro ?? filtro
      applyPagination(data.data)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      requests.value = []
      Object.assign(pagination, defaultPagination())
    } finally {
      isLoading.value = false
    }
  }

  const approveRequest = async (requestId: number) => {
    mutatingRequestId.value = requestId
    clearMessages()

    try {
      const { data } = await apiClient.post<SuccessResponse<unknown>>(
        `/workspace/admin/red/cambios-patrocinador/${requestId}/aprobar`,
        {},
        { headers: authHeaders() },
      )

      successMessage.value = data.message ?? 'Solicitud aprobada correctamente.'
      await fetchRequests(pagination.current_page, activeFilter.value)
      return true
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      return false
    } finally {
      mutatingRequestId.value = null
    }
  }

  const rejectRequest = async (requestId: number, motivo: string) => {
    mutatingRequestId.value = requestId
    clearMessages()

    try {
      const { data } = await apiClient.post<SuccessResponse<unknown>>(
        `/workspace/admin/red/cambios-patrocinador/${requestId}/rechazar`,
        { motivo },
        { headers: authHeaders() },
      )

      successMessage.value = data.message ?? 'Solicitud rechazada.'
      await fetchRequests(pagination.current_page, activeFilter.value)
      return true
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      return false
    } finally {
      mutatingRequestId.value = null
    }
  }

  return {
    requests,
    activeFilter,
    isLoading,
    mutatingRequestId,
    errorMessage,
    successMessage,
    pagination,
    clearMessages,
    fetchRequests,
    approveRequest,
    rejectRequest,
  }
}
