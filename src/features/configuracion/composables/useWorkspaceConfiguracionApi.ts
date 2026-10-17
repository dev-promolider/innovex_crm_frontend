import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { setWorkspaceLogo } from '@/composables/useAuthenticatedSession'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import { resolveMediaUrl } from '../../../utils/media'
import type { UsuarioListItem } from '@/features/usuarios/types'
import type {
    WorkspaceFounderConfiguration,
    WorkspaceFounderRegistrationPayload,
    WorkspaceFounderRegistrationResult,
    WorkspaceFounderUserCandidate,
    UpdateWorkspaceProfilePayload,
    WorkspaceLogoPreview,
    WorkspaceProfile,
} from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

interface PaginationPayload<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface WorkspaceConfiguracionApiOptions {
    empresaId?: number
}

const normalizeLogoVariants = <T extends { thumbnail?: string | null; lobby_card?: string | null; original?: string | null } | null | undefined>(
    variants: T,
) => {
    if (!variants) {
        return variants ?? null
    }

    return {
        ...variants,
        thumbnail: resolveMediaUrl(variants.thumbnail) ?? null,
        lobby_card: resolveMediaUrl(variants.lobby_card) ?? null,
        original: resolveMediaUrl(variants.original) ?? null,
    }
}

const normalizeWorkspaceProfile = (nextProfile: WorkspaceProfile): WorkspaceProfile => ({
    ...nextProfile,
    logo_url: resolveMediaUrl(nextProfile.logo_url),
    logo_variantes: normalizeLogoVariants(nextProfile.logo_variantes),
})

const normalizeWorkspaceLogoPreview = (preview: WorkspaceLogoPreview): WorkspaceLogoPreview => ({
    ...preview,
    logo_url: resolveMediaUrl(preview.logo_url),
    logo_variantes: normalizeLogoVariants(preview.logo_variantes),
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

export function useWorkspaceConfiguracionApi(options: WorkspaceConfiguracionApiOptions = {}) {
    const { authHeaders, empresaId, platformHeaders } = useAuthenticatedSession()
    const isSuperadminScope = typeof options.empresaId === 'number'
    const basePath = isSuperadminScope
        ? `/superadmin/empresas/${options.empresaId}/configuracion`
        : '/workspace/admin/empresa'
    const requestHeaders = () => (isSuperadminScope ? platformHeaders() : authHeaders())
    const fallbackEmpresaId = () => {
        const sessionEmpresaId = Number(empresaId.value)
        return options.empresaId
            ?? (Number.isInteger(sessionEmpresaId) && sessionEmpresaId > 0 ? sessionEmpresaId : 0)
    }

    const profile = shallowRef<WorkspaceProfile | null>(null)
    const logoPreview = shallowRef<WorkspaceLogoPreview | null>(null)
    const founderConfig = shallowRef<WorkspaceFounderConfiguration | null>(null)
    const founderUserCandidates = shallowRef<WorkspaceFounderUserCandidate[]>([])
    const founderRegistrationResult = shallowRef<WorkspaceFounderRegistrationResult | null>(null)
    const founderErrorMessage = shallowRef('')
    const isLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const isUploadingLogo = shallowRef(false)
    const isConfirmingLogo = shallowRef(false)
    const isFounderLoading = shallowRef(false)
    const isFounderSaving = shallowRef(false)
    const isFounderUsersLoading = shallowRef(false)
    const isFounderAccessResetting = shallowRef(false)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')

    const normalizeFounderConfiguration = (
        configuration: Partial<WorkspaceFounderConfiguration> | null | undefined,
    ): WorkspaceFounderConfiguration => {
        const fundador = configuration?.fundador ?? null
        const rangosDisponibles = Array.isArray(configuration?.rangos_disponibles)
            ? configuration.rangos_disponibles
            : []

        return {
            ...configuration,
            empresa_id: configuration?.empresa_id ?? fallbackEmpresaId(),
            estado_empresa: configuration?.estado_empresa ?? 'configuracion',
            requiere_fundador_para_activar: configuration?.requiere_fundador_para_activar ?? true,
            puede_registrar: configuration?.puede_registrar ?? (!fundador && rangosDisponibles.length > 0),
            fundador,
            rangos_disponibles: rangosDisponibles,
        }
    }

    const getFounderErrorMessage = (error: unknown): string => {
        const message = getApiErrorMessage(error, {
            forbiddenMessage: 'Solo el Superadministrador puede gestionar el fundador',
        })
        const errorCode = axios.isAxiosError(error)
            ? error.response?.status ?? error.code
            : undefined

        return errorCode ? `${message} (${errorCode})` : message
    }

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

            profile.value = normalizeWorkspaceProfile(response.data.data)
            if (!isSuperadminScope) {
                setWorkspaceLogo(profile.value.logo_url ?? profile.value.logo_variantes?.lobby_card ?? null)
            }
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const fetchFounderConfig = async () => {
        isFounderLoading.value = true
        founderErrorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<Partial<WorkspaceFounderConfiguration>>>(
                `${basePath}/fundador`,
                {
                    headers: requestHeaders(),
                },
            )

            founderConfig.value = normalizeFounderConfiguration(response.data.data)
            return founderConfig.value
        } catch (error) {
            founderConfig.value = null
            founderErrorMessage.value = getFounderErrorMessage(error)
            throw error
        } finally {
            isFounderLoading.value = false
        }
    }

    const searchFounderUsers = async (search = '') => {
        isFounderUsersLoading.value = true
        founderErrorMessage.value = ''

        try {
            const response = isSuperadminScope
                ? await apiClient.get<SuccessResponse<PaginationPayload<UsuarioListItem>>>(
                    '/superadmin/usuarios',
                    {
                        headers: platformHeaders(),
                        params: {
                            search: search.trim(),
                            per_page: 10,
                        },
                    },
                )
                : await apiClient.get<SuccessResponse<PaginationPayload<WorkspaceFounderUserCandidate>>>(
                    `${basePath}/fundador/usuarios`,
                    {
                        headers: requestHeaders(),
                        params: {
                            search: search.trim(),
                            per_page: 10,
                        },
                    },
                )

            founderUserCandidates.value = response.data.data.data.map((usuario) => ({
                id: usuario.id,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                numero_documento: usuario.numero_documento,
                estado_global: usuario.estado_global,
                membresias_activas_count: usuario.membresias_activas_count,
            }))

            return founderUserCandidates.value
        } catch (error) {
            founderUserCandidates.value = []
            founderErrorMessage.value = getFounderErrorMessage(error)
            throw error
        } finally {
            isFounderUsersLoading.value = false
        }
    }

    const registerFounder = async (payload: WorkspaceFounderRegistrationPayload) => {
        isFounderSaving.value = true
        clearMessages()
        founderErrorMessage.value = ''
        founderRegistrationResult.value = null

        try {
            const response = await apiClient.post<SuccessResponse<WorkspaceFounderRegistrationResult>>(
                `${basePath}/fundador`,
                payload,
                {
                    headers: requestHeaders(),
                },
            )

            founderRegistrationResult.value = response.data.data
            successMessage.value = response.data.message ?? 'Patrocinador fundador registrado correctamente.'
            return response.data.data
        } catch (error) {
            founderErrorMessage.value = getFounderErrorMessage(error)
            throw error
        } finally {
            isFounderSaving.value = false
        }
    }

    const resetFounderAccess = async (usuarioId: number) => {
        isFounderAccessResetting.value = true

        try {
            const response = await apiClient.post<SuccessResponse<{ password_temporal: string }>>(
                `/superadmin/usuarios/${usuarioId}/restablecer-acceso`,
                {},
                {
                    headers: platformHeaders(),
                },
            )

            return response.data.data
        } finally {
            isFounderAccessResetting.value = false
        }
    }

    const clearFounderTemporaryCredentials = () => {
        if (founderRegistrationResult.value) {
            founderRegistrationResult.value = {
                ...founderRegistrationResult.value,
                credenciales_entrega: null,
            }
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

            profile.value = normalizeWorkspaceProfile(response.data.data)
            if (!isSuperadminScope) {
                setWorkspaceLogo(profile.value.logo_url ?? profile.value.logo_variantes?.lobby_card ?? null)
            }
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

            logoPreview.value = normalizeWorkspaceLogoPreview(response.data.data)
            successMessage.value = response.data.message ?? 'Vista previa del logo generada.'

            return logoPreview.value
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

            profile.value = normalizeWorkspaceProfile(response.data.data)
            logoPreview.value = null
            if (!isSuperadminScope) {
                setWorkspaceLogo(profile.value.logo_url ?? profile.value.logo_variantes?.lobby_card ?? null)
            }
            successMessage.value = response.data.message ?? 'Logo guardado correctamente.'

            return profile.value
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
        founderConfig: readonly(founderConfig),
        founderUserCandidates: readonly(founderUserCandidates),
        founderRegistrationResult: readonly(founderRegistrationResult),
        founderErrorMessage: readonly(founderErrorMessage),
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        isUploadingLogo: readonly(isUploadingLogo),
        isConfirmingLogo: readonly(isConfirmingLogo),
        isFounderLoading: readonly(isFounderLoading),
        isFounderSaving: readonly(isFounderSaving),
        isFounderUsersLoading: readonly(isFounderUsersLoading),
        isFounderAccessResetting: readonly(isFounderAccessResetting),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        clearMessages,
        clearLogoPreview,
        fetchProfile,
        fetchFounderConfig,
        searchFounderUsers,
        registerFounder,
        resetFounderAccess,
        clearFounderTemporaryCredentials,
        updateProfile,
        uploadLogoPreview,
        confirmLogo,
    }
}