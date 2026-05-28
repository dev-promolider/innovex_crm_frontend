import { computed, reactive, ref, shallowRef } from 'vue'
import axios from 'axios'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import type {
    DebtDetail,
    DebtListItem,
    DebtPaginationMeta,
    LedgerAccountStatement,
    PaginatedPayload,
} from '../types'

interface SuccessResponse<T> {
    status: string
    message?: string
    data: T
}

const defaultPagination = (): DebtPaginationMeta => ({
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

    return 'No fue posible cargar la cartera de deudas.'
}

export function useDeudasApi() {
    const { authHeaders } = useAuthenticatedSession()

    const debts = ref<DebtListItem[]>([])
    const debtDetail = shallowRef<DebtDetail | null>(null)
    const accountStatement = shallowRef<LedgerAccountStatement | null>(null)
    const selectedDebtId = shallowRef<number | null>(null)
    const isLoading = shallowRef(false)
    const isDetailLoading = shallowRef(false)
    const isAccountStatementLoading = shallowRef(false)
    const errorMessage = shallowRef('')
    const pagination = reactive<DebtPaginationMeta>(defaultPagination())
    const filters = reactive({
        estado: 'todos',
        modeloPago: 'todos',
        search: '',
    })

    const applyPagination = (payload: PaginatedPayload<DebtListItem>) => {
        pagination.current_page = payload.current_page
        pagination.last_page = payload.last_page
        pagination.per_page = payload.per_page
        pagination.total = payload.total
    }

    const fetchDebts = async (page = 1) => {
        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<PaginatedPayload<DebtListItem>>>(
                '/workspace/admin/finanzas/deudas',
                {
                    headers: authHeaders(),
                    params: {
                        page,
                        estado: filters.estado !== 'todos' ? filters.estado : undefined,
                        modelo_pago: filters.modeloPago !== 'todos' ? filters.modeloPago : undefined,
                    },
                },
            )

            debts.value = response.data.data.data
            applyPagination(response.data.data)

            const firstDebt = debts.value[0]

            if (firstDebt && !selectedDebtId.value) {
                await selectDebt(firstDebt.id)
            }

            if (debts.value.length === 0) {
                selectedDebtId.value = null
                debtDetail.value = null
            }
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
        } finally {
            isLoading.value = false
        }
    }

    const fetchDebtDetail = async (debtId: number) => {
        isDetailLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiClient.get<SuccessResponse<DebtDetail>>(
                `/workspace/admin/finanzas/deudas/${debtId}`,
                { headers: authHeaders() },
            )

            debtDetail.value = response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            debtDetail.value = null
        } finally {
            isDetailLoading.value = false
        }
    }

    const fetchAccountStatement = async (membresiaId: number | null | undefined) => {
        if (!membresiaId) {
            accountStatement.value = null
            return
        }

        isAccountStatementLoading.value = true

        try {
            const response = await apiClient.get<SuccessResponse<LedgerAccountStatement>>(
                `/workspace/admin/finanzas/ledger/estado-cuenta/${membresiaId}`,
                { headers: authHeaders() },
            )

            accountStatement.value = response.data.data
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            accountStatement.value = null
        } finally {
            isAccountStatementLoading.value = false
        }
    }

    const abrirDisputa = async (debtId: number, motivo: string) => {
        try {
            await apiClient.post(
                `/workspace/admin/finanzas/deudas/${debtId}/disputa`,
                { motivo },
                { headers: authHeaders() },
            )
            await selectDebt(debtId)
            await fetchDebts(pagination.current_page)
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        }
    }

    const resolverDisputa = async (debtId: number, resolucion: string) => {
        try {
            await apiClient.post(
                `/workspace/admin/finanzas/deudas/${debtId}/resolver-disputa`,
                { resolucion },
                { headers: authHeaders() },
            )
            await selectDebt(debtId)
            await fetchDebts(pagination.current_page)
        } catch (error) {
            errorMessage.value = normalizeErrorMessage(error)
            throw error
        }
    }

    const selectDebt = async (debtId: number) => {
        selectedDebtId.value = debtId
        const selectedDebt = debts.value.find((debt) => debt.id === debtId) ?? null

        await Promise.all([
            fetchDebtDetail(debtId),
            fetchAccountStatement(selectedDebt?.distribuidor.membresia_id),
        ])
    }

    const filteredDebts = computed(() => {
        const search = filters.search.trim().toLowerCase()

        if (!search) {
            return debts.value
        }

        return debts.value.filter((debt) => {
            const distributor = debt.distribuidor.nombre?.toLowerCase() ?? ''
            const campaign = debt.campana.nombre?.toLowerCase() ?? ''
            const kit = debt.kit.nombre?.toLowerCase() ?? ''
            const contract = debt.contrato.numero?.toLowerCase() ?? ''

            return [distributor, campaign, kit, contract].some((value) => value.includes(search))
        })
    })

    const totalPending = computed(() =>
        debts.value.reduce((sum, debt) => sum + Number(debt.monto_pendiente ?? 0), 0),
    )

    const totalOverdue = computed(() =>
        debts.value
            .filter((debt) => debt.estado === 'vencida')
            .reduce((sum, debt) => sum + Number(debt.monto_pendiente ?? 0), 0),
    )

    const activeDebtsCount = computed(() =>
        debts.value.filter((debt) => debt.estado === 'en_curso' || debt.estado === 'pendiente').length,
    )

    const overdueInstallments = computed(() =>
        debts.value.reduce((sum, debt) => sum + debt.cuotas_vencidas, 0),
    )

    return {
        debts,
        debtDetail,
        accountStatement,
        selectedDebtId,
        isLoading,
        isDetailLoading,
        isAccountStatementLoading,
        errorMessage,
        pagination,
        filters,
        filteredDebts,
        totalPending,
        totalOverdue,
        activeDebtsCount,
        overdueInstallments,
        fetchDebts,
        fetchDebtDetail,
        fetchAccountStatement,
        selectDebt,
        abrirDisputa,
        resolverDisputa,
    }
}
