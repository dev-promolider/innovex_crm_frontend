import { shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import type { EstadoCuota } from '../types'

export interface BancoPago {
  codigo: string
  nombre: string
}

export interface IniciarPagoPayload {
  cuota_id: number
  banco_codigo: string
  cedula: string
  telefono: string
  monto: number
}

export interface PagoIniciado {
  pago_id: number
  estado: string
  expira_en: string
  monto: number
  moneda: string
  payment_url?: string | null
}

export interface PagoEstado {
  id?: number
  estado: string
}

export interface PagoConfirmado {
  pago: { id?: number; referencia?: string | null; monto?: number; moneda?: string }
  cuota: { id: number; estado: EstadoCuota; saldo: number }
  puntos_ganados: number
}

export function usePagoMovilApi() {
  const { authHeaders } = useAuthenticatedSession()

  const bancos = shallowRef<BancoPago[]>([])
  const isLoadingBancos = shallowRef(false)
  const bancosError = shallowRef('')

  const fetchBancos = async () => {
    if (bancos.value.length) return
    isLoadingBancos.value = true
    bancosError.value = ''
    try {
      const { data } = await apiClient.get<{ data: BancoPago[] }>('/bancos-pago', { headers: authHeaders() })
      bancos.value = data.data
    } catch (error) {
      bancosError.value = getApiErrorMessage(error)
    } finally {
      isLoadingBancos.value = false
    }
  }

  const iniciarPago = (payload: IniciarPagoPayload) =>
    apiClient.post<{ data: PagoIniciado }>('/pagos/iniciar', payload, { headers: authHeaders() })
      .then(({ data }) => data.data)

  const confirmarPago = (pagoId: number, codigo: string) =>
    apiClient.post<{ data: PagoConfirmado }>(`/pagos/${pagoId}/confirmar`, { codigo }, { headers: authHeaders() })
      .then(({ data }) => data.data)

  const consultarPago = (pagoId: number | string) =>
    apiClient.get<{ data?: PagoEstado } & Partial<PagoEstado>>(`/pagos/${pagoId}`, { headers: authHeaders() })
      .then(({ data }) => (data.data ?? data) as PagoEstado)

  return { bancos, isLoadingBancos, bancosError, fetchBancos, iniciarPago, confirmarPago, consultarPago }
}
