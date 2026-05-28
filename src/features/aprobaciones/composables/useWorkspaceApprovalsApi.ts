import axios from 'axios'
import { reactive, readonly, ref, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
  ApprovalDetail,
  ApprovalListItem,
  ApprovalPaginationMeta,
  ApprovalQueueFilter,
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
    filtro?: ApprovalQueueFilter
  }
}

const defaultPagination = (): ApprovalPaginationMeta => ({
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

export function useWorkspaceApprovalsApi() {
  const { authHeaders } = useAuthenticatedSession()

  const approvals = ref<ApprovalListItem[]>([])
  const approvalDetail = shallowRef<ApprovalDetail | null>(null)
  const activeFilter = shallowRef<ApprovalQueueFilter>('pendientes')
  const isLoading = shallowRef(false)
  const isDetailLoading = shallowRef(false)
  const mutatingApprovalId = shallowRef<number | null>(null)
  const errorMessage = shallowRef('')
  const successMessage = shallowRef('')
  const pagination = reactive<ApprovalPaginationMeta>(defaultPagination())

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const applyPagination = (payload: PaginationPayload<ApprovalListItem>) => {
    pagination.current_page = payload.current_page
    pagination.last_page = payload.last_page
    pagination.per_page = payload.per_page
    pagination.total = payload.total
  }

  const fetchApprovals = async (page = 1, filter: ApprovalQueueFilter = activeFilter.value) => {
    isLoading.value = true
    errorMessage.value = ''
    activeFilter.value = filter

    try {
      const response = await apiClient.get<SuccessResponse<PaginationPayload<ApprovalListItem>>>(
        '/workspace/admin/aprobaciones',
        {
          headers: authHeaders(),
          params: {
            page,
            filtro: filter,
          },
        },
      )

      approvals.value = response.data.data.data ?? []
      applyPagination(response.data.data)
      activeFilter.value = response.data.meta?.filtro ?? filter
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const fetchApprovalDetail = async (approvalId: number) => {
    isDetailLoading.value = true
    errorMessage.value = ''

    try {
      const response = await apiClient.get<SuccessResponse<ApprovalDetail>>(
        `/workspace/admin/aprobaciones/${approvalId}`,
        {
          headers: authHeaders(),
        },
      )

      approvalDetail.value = response.data.data
      return response.data.data
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      approvalDetail.value = null
      throw error
    } finally {
      isDetailLoading.value = false
    }
  }

  const refresh = async (approvalId?: number | null) => {
    await fetchApprovals(pagination.current_page, activeFilter.value)
    if (approvalId != null) {
      await fetchApprovalDetail(approvalId)
    }
  }

  const approve = async (approvalId: number) => {
    mutatingApprovalId.value = approvalId
    clearMessages()

    try {
      const response = await apiClient.post<SuccessResponse<null>>(
        `/workspace/admin/aprobaciones/${approvalId}/aprobar`,
        {},
        { headers: authHeaders() },
      )

      successMessage.value = response.data.message ?? 'Solicitud aprobada correctamente.'
      await refresh(approvalId)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      mutatingApprovalId.value = null
    }
  }

  const reject = async (approvalId: number, motivo: string) => {
    mutatingApprovalId.value = approvalId
    clearMessages()

    try {
      const response = await apiClient.post<SuccessResponse<null>>(
        `/workspace/admin/aprobaciones/${approvalId}/rechazar`,
        { motivo },
        { headers: authHeaders() },
      )

      successMessage.value = response.data.message ?? 'Solicitud rechazada correctamente.'
      await refresh(approvalId)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      mutatingApprovalId.value = null
    }
  }

  const suspend = async (approvalId: number, motivo: string) => {
    mutatingApprovalId.value = approvalId
    clearMessages()

    try {
      const response = await apiClient.post<SuccessResponse<null>>(
        `/workspace/admin/aprobaciones/${approvalId}/suspender`,
        { motivo },
        { headers: authHeaders() },
      )

      successMessage.value = response.data.message ?? 'Distribuidor suspendido correctamente.'
      await refresh(approvalId)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      mutatingApprovalId.value = null
    }
  }

  const reactivate = async (approvalId: number) => {
    mutatingApprovalId.value = approvalId
    clearMessages()

    try {
      const response = await apiClient.post<SuccessResponse<null>>(
        `/workspace/admin/aprobaciones/${approvalId}/reactivar`,
        {},
        { headers: authHeaders() },
      )

      successMessage.value = response.data.message ?? 'Distribuidor reactivado correctamente.'
      await refresh(approvalId)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      mutatingApprovalId.value = null
    }
  }

  return {
    approvals: readonly(approvals),
    approvalDetail: readonly(approvalDetail),
    activeFilter: readonly(activeFilter),
    isLoading: readonly(isLoading),
    isDetailLoading: readonly(isDetailLoading),
    mutatingApprovalId: readonly(mutatingApprovalId),
    errorMessage: readonly(errorMessage),
    successMessage: readonly(successMessage),
    pagination: readonly(pagination),
    clearMessages,
    fetchApprovals,
    fetchApprovalDetail,
    approve,
    reject,
    suspend,
    reactivate,
  }
}
