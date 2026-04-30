import axios from 'axios'
import { computed, readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'

interface UserSummary {
    nombre?: string | null
    apellido?: string | null
}

interface VendedorSummary {
    usuario?: UserSummary | null
}

interface KitSummary {
    nombre?: string | null
}

interface CuentaBancariaSummary {
    alias_cuenta?: string | null
    banco_nombre?: string | null
}

interface ComisionSummary {
    monto_comision?: number | string | null
}

export interface BankValidationSale {
    id: number
    consumidor_nombre?: string | null
    consumidor_documento?: string | null
    monto_total_venta?: number | string | null
    validado_at?: string | null
    vendedor?: VendedorSummary | null
    kit?: KitSummary | null
    cuenta_bancaria?: CuentaBancariaSummary | null
    cuentaBancaria?: CuentaBancariaSummary | null
    comisiones?: ComisionSummary[]
}

interface PaginationPayload<T> {
    data: T[]
    total?: number
    current_page?: number
    last_page?: number
}

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

interface ConfirmDepositResponse {
    venta_id: number
    total_comisiones_liberadas: number
    beneficiarios: number
    confirmacion_preexistente?: boolean
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

export function useBankValidationApi() {
    const { authHeaders } = useAuthenticatedSession()

    const pendingSales = shallowRef<BankValidationSale[]>([])
    const isLoading = shallowRef(false)
    const isConfirming = shallowRef<number | null>(null)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')
    const pagination = shallowRef({
        total: 0,
        currentPage: 1,
        lastPage: 1,
    })

    const totalPendingCommissions = computed(() =>
        pendingSales.value.reduce((accumulator, sale) => {
            const totalSaleCommissions = (sale.comisiones ?? []).reduce((saleAccumulator, commission) => {
                return saleAccumulator + Number(commission.monto_comision ?? 0)
            }, 0)

            return accumulator + totalSaleCommissions
        }, 0),
    )

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const fetchPendingSales = async (page = 1) => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<PaginationPayload<BankValidationSale>>>(
                `/workspace/admin/validacion-bancaria/pendientes?page=${page}`,
                { headers: authHeaders() },
            )

            const payload = response.data.data
            pendingSales.value = payload.data ?? []
            pagination.value = {
                total: payload.total ?? pendingSales.value.length,
                currentPage: payload.current_page ?? 1,
                lastPage: payload.last_page ?? 1,
            }
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const confirmDeposit = async (saleId: number) => {
        isConfirming.value = saleId
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<ConfirmDepositResponse>>(
                `/workspace/admin/validacion-bancaria/${saleId}/confirmar`,
                {},
                { headers: authHeaders() },
            )

            successMessage.value = response.data.message ?? 'Deposito confirmado correctamente.'
            pendingSales.value = pendingSales.value.filter((sale) => sale.id !== saleId)
            pagination.value = {
                ...pagination.value,
                total: Math.max(0, pagination.value.total - 1),
            }

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isConfirming.value = null
        }
    }

    return {
        pendingSales: readonly(pendingSales),
        isLoading: readonly(isLoading),
        isConfirming: readonly(isConfirming),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        pagination: readonly(pagination),
        totalPendingCommissions,
        clearMessages,
        fetchPendingSales,
        confirmDeposit,
    }
}