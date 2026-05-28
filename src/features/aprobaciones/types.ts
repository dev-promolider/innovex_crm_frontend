export type ApprovalQueueFilter = 'pendientes' | 'historico'

export type MembershipValidationStatus =
  | 'pre_registro'
  | 'biometria_pendiente'
  | 'documentos_pendientes'
  | 'revision_admin'
  | 'pendiente_activacion'
  | 'activa'
  | 'suspendida'
  | 'bloqueada_riesgo'
  | 'retirada'
  | 'rechazada'

export interface ApprovalUserSummary {
  id: number
  nombre: string
  apellido: string
  email: string
  numero_documento: string
}

export interface ApprovalRankSummary {
  id: number
  nombre_rango: string
  nivel?: number | null
}

export interface ApprovalSponsorSummary {
  id: number
  usuario_id: number
  nombre: string
  apellido: string
  email: string
  numero_documento: string
}

export interface ApprovalListItem {
  id: number
  estado_validacion: MembershipValidationStatus
  created_at: string | null
  updated_at: string | null
  usuario: ApprovalUserSummary
  rango?: ApprovalRankSummary | null
  referente?: {
    usuario?: {
      id?: number
      nombre?: string | null
      apellido?: string | null
    } | null
  } | null
}

export interface ApprovalValidationSignature {
  tipo_firma: string
  huella_firma: string
  registrada_at: string | null
  ip_origen: string | null
}

export interface ApprovalConsentSummary {
  id: number
  version_documento: string | null
  aceptado: boolean
  aceptado_at: string | null
}

export interface ApprovalDeviceHistoryItem {
  id: number
  fingerprint: string
  nombre_dispositivo: string | null
  plataforma: string | null
  estado: string | null
  primer_uso_at: string | null
  ultimo_uso_at: string | null
  ultimo_ip: string | null
}

export interface ApprovalInfractionItem {
  id: number
  gravedad: string
  tipo: string
  descripcion: string
  penalizacion_puntaje: number | null
  bloqueo_temporal_hasta: string | null
  created_at: string | null
}

export interface ApprovalBiometricHistoryItem {
  id: number
  tipo_biometria: string
  huella_integridad: string | null
  version: number | null
  created_at: string | null
}

export interface ApprovalRecentScoringEvaluation {
  id: number
  rol_evaluado: string | null
  score_final_calculado: number
  nivel_confianza_anterior: number | null
  nivel_confianza_resultante: number | null
  valor_salud_red: number | null
  periodo_desde: string | null
  periodo_hasta: string | null
  created_at: string | null
}

export interface ApprovalDetail {
  id: number
  estado_validacion: MembershipValidationStatus
  created_at: string | null
  motivo_rechazo: string | null
  nivel_confianza: number | null
  insignia: string | null
  puntos_marketplace: number | null
  usuario: {
    id: number
    nombre: string
    apellido: string
    email: string
    numero_documento: string
    tipo_documento: string
    telefono: string | null
    direccion: string | null
  }
  rango_propuesto: ApprovalRankSummary | null
  patrocinador_propuesto: ApprovalSponsorSummary | null
  validacion_global: {
    firma_identidad_registrada: boolean
    firma_identidad_activa: ApprovalValidationSignature | null
    consentimientos_firma_identidad: readonly ApprovalConsentSummary[]
  }
  riesgo_dispositivos: {
    total_dispositivos: number
    dispositivos_bloqueados: number
    dispositivos_confiables: number
    historial: readonly ApprovalDeviceHistoryItem[]
  }
  infracciones_workspace: {
    total: number
    alto_riesgo: number
    items: readonly ApprovalInfractionItem[]
  }
  historial_biometrico: readonly ApprovalBiometricHistoryItem[]
  evaluacion_scoring_reciente: ApprovalRecentScoringEvaluation | null
}

export interface ApprovalPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
