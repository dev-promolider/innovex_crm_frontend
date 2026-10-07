import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'

interface WorkspaceProfileResponse {
    status: string
    data?: {
        moneda_iso?: string | null
    }
}

const workspaceCurrencyCode = shallowRef('USD')
const isCurrencyLoaded = shallowRef(false)
const isCurrencyLoading = shallowRef(false)
let inFlightCurrencyRequest: Promise<string> | null = null

const currencySymbols: Record<string, string> = {
    ARS: 'AR$',
    BOB: 'Bs',
    BRL: 'R$',
    CLP: 'CLP$',
    COP: 'COP$',
    CRC: 'C',
    EUR: '€',
    GBP: '£',
    MXN: 'MX$',
    PEN: 'S/',
    PYG: 'Gs',
    UYU: '$U',
    USD: '$',
    VES: 'Bs.',
}

const normalizeCurrencyCode = (value: unknown) => {
    if (typeof value !== 'string') {
        return 'USD'
    }

    const normalized = value.trim().toUpperCase()

    return /^[A-Z]{3}$/.test(normalized) ? normalized : 'USD'
}

const resolveCurrencySymbol = (currency: string, fallback: string) => {
    return currencySymbols[currency] ?? fallback
}

export function useWorkspaceCurrency() {
    const { authHeaders } = useAuthenticatedSession()

    const ensureCurrencyLoaded = async (force = false) => {
        if (isCurrencyLoaded.value && !force) {
            return workspaceCurrencyCode.value
        }

        if (inFlightCurrencyRequest && !force) {
            return inFlightCurrencyRequest
        }

        isCurrencyLoading.value = true

        inFlightCurrencyRequest = apiClient
            .get<WorkspaceProfileResponse>('/workspace/admin/empresa/perfil', {
                headers: authHeaders(),
            })
            .then((response) => {
                workspaceCurrencyCode.value = normalizeCurrencyCode(response.data?.data?.moneda_iso)
                isCurrencyLoaded.value = true

                return workspaceCurrencyCode.value
            })
            .catch(() => workspaceCurrencyCode.value)
            .finally(() => {
                isCurrencyLoading.value = false
                inFlightCurrencyRequest = null
            })

        return inFlightCurrencyRequest
    }

    const formatCurrency = (value: number | string | null | undefined, currencyOverride?: string) => {
        const amount = Number(value ?? 0)
        const currency = normalizeCurrencyCode(currencyOverride ?? workspaceCurrencyCode.value)
        const safeAmount = Number.isFinite(amount) ? amount : 0

        const formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })

        return formatter
            .formatToParts(safeAmount)
            .map((part) => part.type === 'currency'
                ? resolveCurrencySymbol(currency, part.value)
                : part.value)
            .join('')
    }

    return {
        currencyCode: readonly(workspaceCurrencyCode),
        isCurrencyLoaded: readonly(isCurrencyLoaded),
        isCurrencyLoading: readonly(isCurrencyLoading),
        ensureCurrencyLoaded,
        formatCurrency,
    }
}