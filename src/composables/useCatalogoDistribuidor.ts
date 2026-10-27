import axios from 'axios'
import { readonly, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'

export type EstadoPedido = 'solicitado' | 'confirmado' | 'entregado' | 'cancelado'

export interface PedidoItem {
  kit_id: number
  nombre: string | null
  cantidad: number
  precio_referencial: number
  subtotal: number
}

export interface PedidoComprador {
  nombres: string
  apellidos: string
  telefono: string
  email: string
  documento: string | null
}

export interface PedidoCatalogo {
  id: number
  codigo: string
  estado: EstadoPedido
  notas: string | null
  motivo_cancelacion: string | null
  comprador?: PedidoComprador
  items: PedidoItem[]
  total_referencial: number
  creado_en: string | null
  confirmado_en: string | null
  entregado_en: string | null
  cancelado_en: string | null
}

export interface PedidosPage {
  data: PedidoCatalogo[]
  meta?: { current_page: number; last_page: number; total: number }
}

const BASE = '/workspace/mobile'

const pendingCount = shallowRef(0)
let badgeDisabled = false

// Misma firma de dispositivo que se registra al iniciar sesión en el panel web.
const deviceFingerprint = () =>
  btoa(navigator.userAgent + screen.width + screen.height + navigator.language).substring(0, 64)

export const catalogoErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response as { status: number; data?: { message?: unknown } }
    const message = typeof data?.message === 'string' ? data.message.trim() : ''
    if (message && [403, 409, 423, 429].includes(status)) {
      return message
    }
    if (status === 429) {
      return 'Hiciste muchas solicitudes seguidas. Espera un momento e inténtalo de nuevo'
    }
  }
  return getApiErrorMessage(error)
}

export function useCatalogoDistribuidor() {
  const { authHeaders } = useAuthenticatedSession()

  const headers = () => ({ ...authHeaders(), 'X-Device-Fingerprint': deviceFingerprint() })

  const obtenerEnlace = async (): Promise<string> => {
    const { data } = await apiClient.get<{ data: { url: string } }>(`${BASE}/mi-catalogo/enlace`, { headers: headers() })
    return data.data.url
  }

  const regenerarEnlace = async (): Promise<string> => {
    const { data } = await apiClient.post<{ data: { url: string } }>(`${BASE}/mi-catalogo/enlace`, null, { headers: headers() })
    return data.data.url
  }

  const listarPedidos = async (estado: EstadoPedido | '', page: number): Promise<PedidosPage> => {
    const { data } = await apiClient.get<PedidosPage>(`${BASE}/pedidos-catalogo`, {
      headers: headers(),
      params: { ...(estado ? { estado } : {}), page, per_page: 15 },
    })
    return data
  }

  const obtenerPedido = async (id: number): Promise<PedidoCatalogo> => {
    const { data } = await apiClient.get<{ data: PedidoCatalogo }>(`${BASE}/pedidos-catalogo/${id}`, { headers: headers() })
    return data.data
  }

  const accionPedido = async (id: number, accion: 'confirmar' | 'entregar' | 'cancelar', motivo?: string) => {
    const { data } = await apiClient.post<{ message?: string; data: PedidoCatalogo }>(
      `${BASE}/pedidos-catalogo/${id}/${accion}`,
      motivo ? { motivo } : null,
      { headers: headers() },
    )
    void refrescarPendientes()
    return data
  }

  const refrescarPendientes = async () => {
    if (badgeDisabled) return
    try {
      const page = await listarPedidos('solicitado', 1)
      pendingCount.value = page.meta?.total ?? page.data.length
    } catch (error) {
      // Sin acceso al catálogo (403): no volver a consultar para evitar ruido.
      if (axios.isAxiosError(error) && error.response?.status === 403) badgeDisabled = true
    }
  }

  return {
    pendingCount: readonly(pendingCount),
    obtenerEnlace,
    regenerarEnlace,
    listarPedidos,
    obtenerPedido,
    accionPedido,
    refrescarPendientes,
  }
}
