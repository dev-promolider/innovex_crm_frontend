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

const extractValidationErrors = (error: unknown): Record<string, string[]> => {
    if (!axios.isAxiosError(error) || error.response?.status !== 422) {
        return {}
    }

    const responseData: unknown = error.response.data
    if (typeof responseData !== 'object' || responseData === null) {
        return {}
    }

    const collectedErrors: Record<string, string[]> = {}
    const addError = (field: string, message: string) => {
        const key = field || '_general'
        collectedErrors[key] = [...(collectedErrors[key] ?? []), message]
    }

    const visitError = (value: unknown, field: string) => {
        if (typeof value === 'string') {
            addError(field, value)
            return
        }

        if (Array.isArray(value)) {
            const messages = value.filter((message): message is string => typeof message === 'string')
            if (messages.length === value.length && messages.length > 0) {
                messages.forEach((message) => addError(field, message))
                return
            }

            value.forEach((item, index) => visitError(item, field ? `${field}.${index}` : String(index)))
            return
        }

        if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([key, item]) =>
                visitError(item, field ? `${field}.${key}` : key))
        }
    }

    if ('errors' in responseData) {
        visitError(responseData.errors, '')
    }

    if (Object.keys(collectedErrors).length === 0
        && 'message' in responseData
        && typeof responseData.message === 'string') {
        addError('_general', responseData.message)
    }

    return collectedErrors
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
    const validationErrors = shallowRef<Record<string, string[]>>({})

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
        validationErrors.value = {}
    }

    const fetchNetworkConfiguration = async () => {
        isLoading.value = true
        errorMessage.value = ''
        validationErrors.value = {}

        try {
            const response = await apiClient.get<SuccessResponse<WorkspaceNetworkConfiguration>>(basePath, {
                headers: requestHeaders(),
            })

            networkConfiguration.value = response.data.data
        } catch (error) {
            errorMessage.value = 'No fue posible cargar la configuración de rangos.'
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
            validationErrors.value = extractValidationErrors(error)
            errorMessage.value = axios.isAxiosError(error) && error.response?.status === 422
                ? ''
                : axios.isAxiosError(error) && error.response?.status === 500
                    ? 'No pudimos guardar. Inténtalo de nuevo'
                    : 'No fue posible guardar la configuración de rangos. Inténtalo de nuevo.'
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
        validationErrors: readonly(validationErrors),
        clearMessages,
        fetchNetworkConfiguration,
        saveNetworkConfiguration,
    }
}
