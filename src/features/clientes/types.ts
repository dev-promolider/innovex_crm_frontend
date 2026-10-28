export type EstadoPedido = 'solicitado' | 'confirmado' | 'entregado' | 'cancelado'
export type MonedaCredito = 'USD' | 'VES'

export const estadosPedido: { value: EstadoPedido; label: string }[] = [
  { value: 'solicitado', label: 'Solicitado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export interface ClienteDistribuidor {
  id: number
  nombre: string
}

export interface ClienteListItem {
  id: number
  nombres: string
  apellidos: string
  documento: string
  telefono: string
  email: string | null
  distribuidor: ClienteDistribuidor | null
  pedidos_count: number
  monto_total: number
  moneda: MonedaCredito
  ultimo_pedido_en: string | null
  estado_ultimo_pedido: EstadoPedido | null
}

export interface ClientePedidoItem {
  nombre: string
  cantidad: number
  precio: number
}

export interface ClientePedido {
  id: number
  codigo: string
  estado: EstadoPedido
  creado_en: string
  monto: number
  moneda: MonedaCredito
  items: ClientePedidoItem[]
}

export interface ClienteDetail extends Omit<ClienteListItem, 'pedidos_count' | 'monto_total' | 'moneda' | 'ultimo_pedido_en' | 'estado_ultimo_pedido'> {
  pedidos: ClientePedido[]
}

export interface ClientesPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface MiCredito {
  credito_limite: number
  usado: number
  disponible: number
  porcentaje_usado: number
  moneda: MonedaCredito
}
