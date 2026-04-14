import { reactive, ref, shallowRef } from 'vue'
import axios from 'axios'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
    CreateEmpresaPayload,
    EmpresaDetail,
    EmpresaListItem,
    EmpresasPaginationMeta,
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

const defaultPagination = (): EmpresasPaginationMeta => ({
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

export function useEmpresasApi() {
    const { authHeaders } = useAuthenticatedSession()

    const empresas = ref<EmpresaListItem[]>([])
    const empresaDetail = shallowRef<EmpresaDetail | null>(null)
    const isLoading = shallowRef(false)
    const isDetailLoading = shallowRef(false)
    const isCreating = shallowRef(false)
    const mutatingEmpresaId = shallowRef<number | null>(null)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')
    const pagination = reactive<EmpresasPaginationMeta>(defaultPagination())

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const applyPagination = (payload: PaginationPayload<EmpresaListItem>) => {
        pagination.current_page = payload.current_page
        pagination.last_page = payload.last_page
        pagination.per_page = payload.per_page
        pagination.total = payload.total
    }

    const fetchEmpresas = async (page = 1) => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<PaginationPayload<EmpresaListItem>>>(
                '/superadmin/empresas',
                {
                    headers: authHeaders(),
                    params: { page },
                },
            )

            empresas.value = response.data.data.data
            applyPagination(response.data.data)
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
        } finally {
            isLoading.value = false
        }
    }

    const fetchEmpresaDetail = async (empresaId: number) => {
        isDetailLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<EmpresaDetail>>(
                `/superadmin/empresas/${empresaId}`,
                {
                    headers: authHeaders(),
                },
            )

            empresaDetail.value = response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            empresaDetail.value = null
        } finally {
            isDetailLoading.value = false
        }
    }

    const createEmpresa = async (payload: CreateEmpresaPayload) => {
        isCreating.value = true
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<EmpresaListItem>>(
                '/superadmin/empresas',
                payload,
                {
                    headers: authHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Empresa creada correctamente.'
            await fetchEmpresas(1)

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isCreating.value = false
        }
    }

    const activateEmpresa = async (empresaId: number) => {
        mutatingEmpresaId.value = empresaId
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<null>>(
                `/superadmin/empresas/${empresaId}/activar`,
                {},
                {
                    headers: authHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Empresa activada correctamente.'
            await Promise.all([
                fetchEmpresas(pagination.current_page),
                fetchEmpresaDetail(empresaId),
            ])
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            mutatingEmpresaId.value = null
        }
    }

    const suspendEmpresa = async (empresaId: number, motivo: string) => {
        mutatingEmpresaId.value = empresaId
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<null>>(
                `/superadmin/empresas/${empresaId}/suspender`,
                { motivo },
                {
                    headers: authHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Empresa suspendida correctamente.'
            await Promise.all([
                fetchEmpresas(pagination.current_page),
                fetchEmpresaDetail(empresaId),
            ])
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            mutatingEmpresaId.value = null
        }
    }

    return {
        empresas,
        empresaDetail,
        isLoading,
        isDetailLoading,
        isCreating,
        mutatingEmpresaId,
        errorMessage,
        successMessage,
        pagination,
        clearMessages,
        fetchEmpresas,
        fetchEmpresaDetail,
        createEmpresa,
        activateEmpresa,
        suspendEmpresa,
    }
}
