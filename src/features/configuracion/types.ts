export type WorkspaceOperationalStatus = 'configuracion' | 'activa' | 'mantenimiento' | 'suspendida'

export interface WorkspaceLogoVariants {
    thumbnail?: string | null
    lobby_card?: string | null
    original?: string | null
}

export interface WorkspaceProfile {
    id: number
    uuid: string
    nombre: string
    nombre_visible: string
    nombre_comercial: string | null
    logo_url: string | null
    logo_variantes: WorkspaceLogoVariants | null
    moneda_iso: string | null
    estado: WorkspaceOperationalStatus
    estado_operativo: WorkspaceOperationalStatus
    mensaje_estado_operativo: string | null
    moneda_bloqueada: boolean
    puede_editar_moneda: boolean
}

export interface WorkspaceFounderUserSummary {
    id: number
    nombre: string | null
    apellido: string | null
    email: string | null
    numero_documento: string | null
}

export interface WorkspaceFounderRankSummary {
    id: number | null
    nombre_rango: string | null
    nivel: number | null
    es_rango_ingreso: boolean
}

export interface WorkspaceFounderSummary {
    membresia_id: number
    usuario_id: number
    referente_id: number | null
    nivel_en_arbol: number
    estado_validacion: string
    perfil_web_activo: boolean
    usuario: WorkspaceFounderUserSummary
    rango: WorkspaceFounderRankSummary
}

export interface WorkspaceFounderConfiguration {
    empresa_id: number
    estado_empresa: WorkspaceOperationalStatus
    requiere_fundador_para_activar: boolean
    puede_registrar: boolean
    fundador: WorkspaceFounderSummary | null
    rangos_disponibles: readonly WorkspaceNetworkRank[]
}

export interface WorkspaceFounderUserCandidate {
    id: number
    nombre_completo: string
    email: string
    numero_documento: string
    estado_global: string
    membresias_activas_count: number
}

export interface WorkspaceFounderCreateUserPayload {
    nombre: string
    apellido: string
    email: string
    telefono?: string | null
    tipo_documento?: string | null
    numero_documento?: string | null
    direccion?: string | null
    password_temporal?: string | null
}

export interface WorkspaceFounderRegistrationPayload {
    usuario_id?: number
    rango_id: number
    usuario_nuevo?: WorkspaceFounderCreateUserPayload
}

export interface WorkspaceFounderDeliveryCredentials {
    email: string
    password_temporal: string
    usuario_fue_creado: boolean
}

export interface WorkspaceFounderRegistrationResult extends WorkspaceFounderSummary {
    credenciales_entrega: WorkspaceFounderDeliveryCredentials | null
}

export interface UpdateWorkspaceProfilePayload {
    nombre: string
    nombre_comercial?: string | null
    moneda_iso?: string | null
    estado?: Extract<WorkspaceOperationalStatus, 'activa' | 'mantenimiento' | 'suspendida'> | null
    mensaje_estado_operativo?: string | null
}

export interface WorkspaceLogoPreview {
    preview_token: string
    expires_at: string
    logo_url: string | null
    logo_variantes: WorkspaceLogoVariants | null
}

export interface WorkspaceBankAccount {
    id: number
    alias_cuenta: string
    banco_codigo: string
    banco_nombre: string
    numero_cuenta_cci: string
    numero_cuenta_visible: string
    titular_cuenta: string
    moneda_iso: string
    instrucciones_pago: string | null
    mostrar_numero_completo: boolean
    activa: boolean
}

export interface WorkspaceBankAccountPayload {
    alias_cuenta: string
    banco_codigo: string
    numero_cuenta_cci: string
    titular_cuenta: string
    moneda_iso: string
    instrucciones_pago?: string | null
    mostrar_numero_completo?: boolean
    activa?: boolean
}

export interface WorkspaceCommissionRule {
    id?: number
    nivel_objetivo: number
    porcentaje_comision: number
}

export interface WorkspaceNetworkRank {
    id?: number
    nombre_rango: string
    nivel: number
    orden_jerarquico: number
    max_distribuidores_directos: number | null
    limite_kits_credito: number
    es_rango_ingreso: boolean
    version_configuracion?: number
    accesos_json?: string[] | null
    reglas_comision: WorkspaceCommissionRule[]
}

export interface WorkspaceNetworkPreviewLevel {
    nivel: number
    rangos: string[]
}

export interface WorkspaceNetworkConfiguration {
    total_niveles: number
    /** @deprecated Alias legacy de total_niveles */
    profundidad_maxima?: number
    version_configuracion: number
    rangos: WorkspaceNetworkRank[]
    preview_niveles: WorkspaceNetworkPreviewLevel[]
}

export interface WorkspaceNetworkConfigurationPayload {
    motivo_cambio?: string | null
    rangos: Array<{
        nombre_rango: string
        nivel: number
        orden_jerarquico?: number
        max_distribuidores_directos?: number | null
        limite_kits_credito: number
        es_rango_ingreso?: boolean
        accesos_json?: string[] | null
        reglas_comision?: WorkspaceCommissionRule[]
    }>
}

export type WorkspacePaymentModel = 'bullet' | 'fraccionado'

export interface WorkspacePaymentPolicy {
    id: number
    modelo_pago: WorkspacePaymentModel
    dias_plazo_bullet: number | null
    numero_cuotas: number | null
    periodicidad_dias: number | null
    dias_gracia_recepcion: number | null
    tolerancia_pago_horas: number | null
    vigente_desde: string | null
}

export interface WorkspacePaymentPolicyPayload {
    modelo_pago: WorkspacePaymentModel
    dias_plazo_bullet?: number | null
    numero_cuotas?: number | null
    periodicidad_dias?: number | null
    dias_gracia_recepcion?: number | null
    tolerancia_pago_horas?: number | null
    motivo_cambio?: string | null
}

export interface WorkspacePaymentPolicyHistoryEntry {
    id: number
    motivo_cambio: string | null
    snapshot: WorkspacePaymentPolicyPayload | null
    vigente_desde: string | null
    vigente_hasta: string | null
    cambiado_por: string | null
}
