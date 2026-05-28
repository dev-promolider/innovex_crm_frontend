export type SponsorChangeFilter = 'pendientes' | 'historico'

export interface SponsorChangeUserRef {
  id: number
  nombre?: string | null
  apellido?: string | null
  email?: string | null
  numero_documento?: string | null
}

export interface SponsorChangeMembershipRef {
  id: number
  usuario?: SponsorChangeUserRef | null
}

export interface SponsorChangeRequest {
  id: number
  empresa_id: number
  membresia_id: number
  referente_anterior_id: number | null
  referente_propuesto_id: number
  solicitado_por_id: number
  origen: string
  justificacion: string
  estado: string
  motivo_rechazo?: string | null
  revisado_por_id?: number | null
  revisado_at?: string | null
  created_at?: string | null
  membresia?: SponsorChangeMembershipRef | null
  referente_anterior?: SponsorChangeMembershipRef | null
  referente_propuesto?: SponsorChangeMembershipRef | null
  solicitante?: SponsorChangeUserRef | null
  revisor?: SponsorChangeUserRef | null
}

export interface SponsorChangePaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
