import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type { InventoryMovement, InventoryMovementFilters, PaginatedPayload } from '../types'

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

    return 'No fue posible cargar los movimientos de inventario.'
}

export function useInventoryMovementsApi() {
    const { authHeaders } = useAuthenticatedSession()

    const movements = shallowRef<InventoryMovement[]>([])
    const isLoading = shallowRef(false)
    const errorMessage = shallowRef('')
    const pagination = shallowRef({
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 20,
    })

    const fetchMovements = async (filters: InventoryMovementFilters = {}) => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const searchParams = new URLSearchParams()
            searchParams.set('page', String(filters.page ?? 1))

            if (filters.search) {
                searchParams.set('search', filters.search)
            }

            if (filters.tipo) {
                searchParams.set('tipo', filters.tipo)
            }

            const response = await apiClient.get<SuccessResponse<PaginatedPayload<InventoryMovement>>>(
                `/workspace/admin/inventario/movimientos?${searchParams.toString()}`,
                { headers: authHeaders() },
            )

            movements.value = response.data.data.data ?? []
            pagination.value = {
                total: response.data.data.total ?? movements.value.length,
                current_page: response.data.data.current_page ?? 1,
                last_page: response.data.data.last_page ?? 1,
                per_page: response.data.data.per_page ?? 20,
            }
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    return {
        movements: readonly(movements),
        isLoading: readonly(isLoading),
        errorMessage: readonly(errorMessage),
        pagination: readonly(pagination),
        fetchMovements,
    }
}