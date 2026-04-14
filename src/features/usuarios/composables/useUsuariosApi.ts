import { reactive, ref, shallowRef } from 'vue'
import axios from 'axios'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
    SuspendUsuarioPayload,
    UpdateUsuarioPayload,
    UsuarioDetail,
    UsuarioListItem,
    UsuariosPaginationMeta,
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
}

const defaultPagination = (): UsuariosPaginationMeta => ({
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

export function useUsuariosApi() {
    const { platformHeaders } = useAuthenticatedSession()

    const usuarios = ref<UsuarioListItem[]>([])
    const usuarioDetail = shallowRef<UsuarioDetail | null>(null)
    const temporaryPassword = shallowRef('')
    const isLoading = shallowRef(false)
    const isDetailLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const isResettingPassword = shallowRef(false)
    const mutatingUsuarioId = shallowRef<number | null>(null)
    const mutatingMembresiaId = shallowRef<number | null>(null)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')
    const pagination = reactive<UsuariosPaginationMeta>(defaultPagination())

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const clearTemporaryPassword = () => {
        temporaryPassword.value = ''
    }

    const applyPagination = (payload: PaginationPayload<UsuarioListItem>) => {
        pagination.current_page = payload.current_page
        pagination.last_page = payload.last_page
        pagination.per_page = payload.per_page
        pagination.total = payload.total
    }

    const fetchUsuarios = async (page = 1) => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<PaginationPayload<UsuarioListItem>>>(
                '/superadmin/usuarios',
                {
                    headers: platformHeaders(),
                    params: { page },
                },
            )

            usuarios.value = response.data.data.data
            applyPagination(response.data.data)
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
        } finally {
            isLoading.value = false
        }
    }

    const fetchUsuarioDetail = async (usuarioId: number) => {
        isDetailLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<UsuarioDetail>>(
                `/superadmin/usuarios/${usuarioId}`,
                {
                    headers: platformHeaders(),
                },
            )

            usuarioDetail.value = response.data.data
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            usuarioDetail.value = null
            throw error
        } finally {
            isDetailLoading.value = false
        }
    }

    const refreshUsuariosAndDetail = async (usuarioId?: number) => {
        await fetchUsuarios(pagination.current_page)

        if (usuarioId != null) {
            await fetchUsuarioDetail(usuarioId)
        }
    }

    const updateUsuario = async (usuarioId: number, payload: UpdateUsuarioPayload) => {
        isSaving.value = true
        clearMessages()

        try {
            const response = await apiClient.put<SuccessResponse<UsuarioDetail>>(
                `/superadmin/usuarios/${usuarioId}`,
                payload,
                {
                    headers: platformHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Usuario actualizado correctamente.'
            usuarioDetail.value = response.data.data
            await fetchUsuarios(pagination.current_page)
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    const suspendUsuarioGlobal = async (usuarioId: number, payload: SuspendUsuarioPayload) => {
        mutatingUsuarioId.value = usuarioId
        clearMessages()
        clearTemporaryPassword()

        try {
            const response = await apiClient.post<SuccessResponse<UsuarioDetail>>(
                `/superadmin/usuarios/${usuarioId}/suspender-global`,
                payload,
                {
                    headers: platformHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Cuenta global suspendida correctamente.'
            usuarioDetail.value = response.data.data
            await fetchUsuarios(pagination.current_page)
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            mutatingUsuarioId.value = null
        }
    }

    const reactivateUsuarioGlobal = async (usuarioId: number) => {
        mutatingUsuarioId.value = usuarioId
        clearMessages()
        clearTemporaryPassword()

        try {
            const response = await apiClient.post<SuccessResponse<UsuarioDetail>>(
                `/superadmin/usuarios/${usuarioId}/reactivar-global`,
                {},
                {
                    headers: platformHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Cuenta global reactivada correctamente.'
            usuarioDetail.value = response.data.data
            await fetchUsuarios(pagination.current_page)
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            mutatingUsuarioId.value = null
        }
    }

    const resetUsuarioPassword = async (usuarioId: number) => {
        isResettingPassword.value = true
        clearMessages()
        clearTemporaryPassword()

        try {
            const response = await apiClient.post<
                SuccessResponse<{ usuario: UsuarioDetail; password_temporal: string }>
            >(
                `/superadmin/usuarios/${usuarioId}/reset-password`,
                {},
                {
                    headers: platformHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Contrasena temporal generada correctamente.'
            usuarioDetail.value = response.data.data.usuario
            temporaryPassword.value = response.data.data.password_temporal
            await fetchUsuarios(pagination.current_page)
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isResettingPassword.value = false
        }
    }

    const suspendUsuarioMembresia = async (usuarioId: number, membresiaId: number) => {
        mutatingMembresiaId.value = membresiaId
        clearMessages()
        clearTemporaryPassword()

        try {
            const response = await apiClient.post<SuccessResponse<UsuarioDetail>>(
                `/superadmin/usuarios/${usuarioId}/membresias/${membresiaId}/suspender`,
                {},
                {
                    headers: platformHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Membresia suspendida correctamente.'
            usuarioDetail.value = response.data.data
            await fetchUsuarios(pagination.current_page)
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            mutatingMembresiaId.value = null
        }
    }

    const reactivateUsuarioMembresia = async (usuarioId: number, membresiaId: number) => {
        mutatingMembresiaId.value = membresiaId
        clearMessages()
        clearTemporaryPassword()

        try {
            const response = await apiClient.post<SuccessResponse<UsuarioDetail>>(
                `/superadmin/usuarios/${usuarioId}/membresias/${membresiaId}/reactivar`,
                {},
                {
                    headers: platformHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Membresia reactivada correctamente.'
            usuarioDetail.value = response.data.data
            await fetchUsuarios(pagination.current_page)
            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            mutatingMembresiaId.value = null
        }
    }

    return {
        usuarios,
        usuarioDetail,
        temporaryPassword,
        isLoading,
        isDetailLoading,
        isSaving,
        isResettingPassword,
        mutatingUsuarioId,
        mutatingMembresiaId,
        errorMessage,
        successMessage,
        pagination,
        clearMessages,
        clearTemporaryPassword,
        fetchUsuarios,
        fetchUsuarioDetail,
        refreshUsuariosAndDetail,
        updateUsuario,
        suspendUsuarioGlobal,
        reactivateUsuarioGlobal,
        resetUsuarioPassword,
        suspendUsuarioMembresia,
        reactivateUsuarioMembresia,
    }
}