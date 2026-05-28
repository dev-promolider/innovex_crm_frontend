import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
    WorkspaceNetworkConfiguration,
    WorkspaceNetworkConfigurationPayload,
} from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

interface WorkspaceNetworkApiOptions {
    empresaId?: number
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

export function useWorkspaceNetworkApi(options: WorkspaceNetworkApiOptions = {}) {
    const { authHeaders, platformHeaders } = useAuthenticatedSession()
    const isSuperadminScope = typeof options.empresaId === 'number'
    const basePath = isSuperadminScope
        ? `/superadmin/empresas/${options.empresaId}/configuracion/rangos`
        : '/workspace/admin/rangos'
    const requestHeaders = () => (isSuperadminScope ? platformHeaders() : authHeaders())

    const networkConfiguration = shallowRef<WorkspaceNetworkConfiguration | null>(null)
    const isLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const fetchNetworkConfiguration = async () => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<WorkspaceNetworkConfiguration>>(basePath, {
                headers: requestHeaders(),
            })

            networkConfiguration.value = response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const saveNetworkConfiguration = async (payload: WorkspaceNetworkConfigurationPayload) => {
        isSaving.value = true
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<WorkspaceNetworkConfiguration>>(
                basePath,
                payload,
                {
                    headers: requestHeaders(),
                },
            )

            networkConfiguration.value = response.data.data
            successMessage.value = response.data.message ?? 'Configuracion de red actualizada.'

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    return {
        networkConfiguration: readonly(networkConfiguration),
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        clearMessages,
        fetchNetworkConfiguration,
        saveNetworkConfiguration,
    }
}
