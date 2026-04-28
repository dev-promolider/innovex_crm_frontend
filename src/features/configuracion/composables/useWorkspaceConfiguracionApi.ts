import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
    UpdateWorkspaceProfilePayload,
    WorkspaceLogoPreview,
    WorkspaceProfile,
} from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

interface WorkspaceConfiguracionApiOptions {
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

export function useWorkspaceConfiguracionApi(options: WorkspaceConfiguracionApiOptions = {}) {
    const { authHeaders, platformHeaders } = useAuthenticatedSession()
    const isSuperadminScope = typeof options.empresaId === 'number'
    const basePath = isSuperadminScope
        ? `/superadmin/empresas/${options.empresaId}/configuracion`
        : '/workspace/admin/empresa'
    const requestHeaders = () => (isSuperadminScope ? platformHeaders() : authHeaders())

    const profile = shallowRef<WorkspaceProfile | null>(null)
    const logoPreview = shallowRef<WorkspaceLogoPreview | null>(null)
    const isLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const isUploadingLogo = shallowRef(false)
    const isConfirmingLogo = shallowRef(false)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const fetchProfile = async () => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<WorkspaceProfile>>(
                `${basePath}/perfil`,
                {
                    headers: requestHeaders(),
                },
            )

            profile.value = response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const updateProfile = async (payload: UpdateWorkspaceProfilePayload) => {
        isSaving.value = true
        clearMessages()

        try {
            const response = await apiClient.put<SuccessResponse<WorkspaceProfile>>(
                `${basePath}/perfil`,
                payload,
                {
                    headers: requestHeaders(),
                },
            )

            profile.value = response.data.data
            successMessage.value = response.data.message ?? 'Configuracion actualizada correctamente.'

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    const uploadLogoPreview = async (file: File) => {
        isUploadingLogo.value = true
        clearMessages()

        try {
            const formData = new FormData()
            formData.append('logo', file)

            const response = await apiClient.post<SuccessResponse<WorkspaceLogoPreview>>(
                `${basePath}/logo/preview`,
                formData,
                {
                    headers: {
                        ...requestHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                },
            )

            logoPreview.value = response.data.data
            successMessage.value = response.data.message ?? 'Vista previa del logo generada.'

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isUploadingLogo.value = false
        }
    }

    const confirmLogo = async () => {
        if (!logoPreview.value?.preview_token) {
            return null
        }

        isConfirmingLogo.value = true
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<WorkspaceProfile>>(
                `${basePath}/logo/confirmar`,
                { preview_token: logoPreview.value.preview_token },
                {
                    headers: requestHeaders(),
                },
            )

            profile.value = response.data.data
            logoPreview.value = null
            successMessage.value = response.data.message ?? 'Logo guardado correctamente.'

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isConfirmingLogo.value = false
        }
    }

    const clearLogoPreview = () => {
        logoPreview.value = null
    }

    return {
        profile: readonly(profile),
        logoPreview: readonly(logoPreview),
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        isUploadingLogo: readonly(isUploadingLogo),
        isConfirmingLogo: readonly(isConfirmingLogo),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        clearMessages,
        clearLogoPreview,
        fetchProfile,
        updateProfile,
        uploadLogoPreview,
        confirmLogo,
    }
}