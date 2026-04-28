import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type { WorkspaceBankAccount, WorkspaceBankAccountPayload } from '../types'

interface PaginationPayload<T> {
    data: T[]
}

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

interface WorkspaceBankAccountsApiOptions {
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

export function useWorkspaceBankAccountsApi(options: WorkspaceBankAccountsApiOptions = {}) {
    const { authHeaders, platformHeaders } = useAuthenticatedSession()
    const isSuperadminScope = typeof options.empresaId === 'number'
    const basePath = isSuperadminScope
        ? `/superadmin/empresas/${options.empresaId}/configuracion/cuentas-bancarias`
        : '/workspace/admin/finanzas/cuentas-bancarias'
    const requestHeaders = () => (isSuperadminScope ? platformHeaders() : authHeaders())

    const bankAccounts = shallowRef<WorkspaceBankAccount[]>([])
    const isLoading = shallowRef(false)
    const isSaving = shallowRef(false)
    const deletingAccountId = shallowRef<number | null>(null)
    const errorMessage = shallowRef('')
    const successMessage = shallowRef('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const fetchBankAccounts = async () => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<PaginationPayload<WorkspaceBankAccount>>>(
                basePath,
                {
                    headers: requestHeaders(),
                },
            )

            bankAccounts.value = response.data.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const createBankAccount = async (payload: WorkspaceBankAccountPayload) => {
        isSaving.value = true
        clearMessages()

        try {
            const response = await apiClient.post<SuccessResponse<WorkspaceBankAccount>>(
                basePath,
                payload,
                {
                    headers: requestHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Cuenta bancaria registrada correctamente.'
            await fetchBankAccounts()

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    const updateBankAccount = async (accountId: number, payload: WorkspaceBankAccountPayload) => {
        isSaving.value = true
        clearMessages()

        try {
            const response = await apiClient.put<SuccessResponse<WorkspaceBankAccount>>(
                `${basePath}/${accountId}`,
                payload,
                {
                    headers: requestHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Cuenta bancaria actualizada correctamente.'
            await fetchBankAccounts()

            return response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    const deleteBankAccount = async (accountId: number) => {
        deletingAccountId.value = accountId
        clearMessages()

        try {
            const response = await apiClient.delete<SuccessResponse<null>>(
                `${basePath}/${accountId}`,
                {
                    headers: requestHeaders(),
                },
            )

            successMessage.value = response.data.message ?? 'Cuenta bancaria eliminada correctamente.'
            await fetchBankAccounts()
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        } finally {
            deletingAccountId.value = null
        }
    }

    return {
        bankAccounts: readonly(bankAccounts),
        isLoading: readonly(isLoading),
        isSaving: readonly(isSaving),
        deletingAccountId: readonly(deletingAccountId),
        errorMessage: readonly(errorMessage),
        successMessage: readonly(successMessage),
        clearMessages,
        fetchBankAccounts,
        createBankAccount,
        updateBankAccount,
        deleteBankAccount,
    }
}