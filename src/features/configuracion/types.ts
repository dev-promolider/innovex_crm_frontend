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
    es_rango_raiz: boolean
    version_configuracion?: number
    accesos_json?: string[] | null
    reglas_comision: WorkspaceCommissionRule[]
}

export interface WorkspaceNetworkPreviewLevel {
    nivel: number
    rangos: string[]
}

export interface WorkspaceNetworkConfiguration {
    profundidad_maxima: number
    version_configuracion: number
    rangos: WorkspaceNetworkRank[]
    preview_niveles: WorkspaceNetworkPreviewLevel[]
}

export interface WorkspaceNetworkConfigurationPayload {
    profundidad_maxima: number
    motivo_cambio?: string | null
    rangos: Array<{
        nombre_rango: string
        nivel: number
        orden_jerarquico: number
        max_distribuidores_directos?: number | null
        limite_kits_credito: number
        es_rango_raiz?: boolean
        accesos_json?: string[] | null
        reglas_comision?: WorkspaceCommissionRule[]
    }>
}

export interface WorkspaceCommissionSimulation {
    precio_kit: number
    nivel_vendedor: number
    total_comisiones: number
    distribucion: Array<{
        rango_patrocinador: string
        nivel_patrocinador: number
        nivel_objetivo: number
        porcentaje_comision: number
        monto_a_recibir: number
    }>
}