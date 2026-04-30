import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
    WorkspacePaymentPolicy,
    WorkspacePaymentPolicyHistoryEntry,
    WorkspacePaymentPolicyPayload,
} from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

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

export function useWorkspacePaymentPoliciesApi() {
    const { authHeaders } = useAuthenticatedSession()

    const policy = shallowRef<WorkspacePaymentPolicy | null>(null)
    const history = shallowRef<WorkspacePaymentPolicyHistoryEntry[]>([])
    const isLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const isLoadingHistory = shallowRef(false)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const fetchPolicy = async () => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<WorkspacePaymentPolicy | null>>(
                '/workspace/admin/finanzas/politicas-pago',
                { headers: authHeaders() },
            )

            policy.value = response.data.data
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const fetchHistory = async () => {
        isLoadingHistory.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<WorkspacePaymentPolicyHistoryEntry[]>>(
                '/workspace/admin/finanzas/politicas-pago/historial',
                { headers: authHeaders() },
            )

            history.value = response.data.data ?? []
            return history.value
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoadingHistory.value = false
        }
    }

    const updatePolicy = async (payload: WorkspacePaymentPolicyPayload) => {
        isSaving.value = true
        clearMessages()

        try {
            const response = await apiClient.put<SuccessResponse<WorkspacePaymentPolicy>>(
                '/workspace/admin/finanzas/politicas-pago',
                payload,
                { headers: authHeaders() },
            )

            policy.value = response.data.data
            successMessage.value = response.data.message ?? 'Politica de pagos actualizada.'
            await fetchHistory()

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    return {
        policy: readonly(policy),
        history: readonly(history),
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        isLoadingHistory: readonly(isLoadingHistory),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        clearMessages,
        fetchPolicy,
        fetchHistory,
        updatePolicy,
    }
}