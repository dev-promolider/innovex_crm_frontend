import { formatDate } from '@/utils/formatters'
import { estadosCuota, type EstadoCuota } from './types'

export const estadoCuotaLabel = (estado: EstadoCuota) =>
  estadosCuota.find((item) => item.value === estado)?.label ?? estado

// Las fechas YYYY-MM-DD se interpretan en hora local para no mostrar el día anterior.
export const formatVencimiento = (value: string | null | undefined) =>
  value ? formatDate(`${value}T00:00:00`) : '—'

export const diasLabel = (dias: number) => {
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Falta 1 día'
  if (dias > 1) return `Faltan ${dias} días`
  if (dias === -1) return 'Venció hace 1 día'
  return `Venció hace ${Math.abs(dias)} días`
}
