export type UsuarioEstadoGlobal = 'activo' | 'suspendido' | 'baneado'

export interface UsuarioEmpresaResumen {
    empresa_id: number
    nombre: string | null
    estado_validacion: string
}

export interface UsuarioListItem {
    id: number
    uuid: string
    nombre: string
    apellido: string
    nombre_completo: string
    email: string
    telefono: string | null
    numero_documento: string
    tipo_documento: string
    estado_global: UsuarioEstadoGlobal
    es_superadmin: boolean
    es_usuario_sistema: boolean
    membresias_count: number
    membresias_activas_count: number
    membresias_suspendidas_count: number
    empresas: UsuarioEmpresaResumen[]
    created_at: string | null
    updated_at: string | null
}

export interface UsuarioMembresiaDetail {
    id: number
    empresa_id: number
    empresa_nombre: string | null
    empresa_estado: string | null
    estado_validacion: string
    perfil_web_activo: boolean
    nivel_confianza: number
    rango: string | null
    validado_at: string | null
    es_admin_empresa: boolean
}

export interface UsuarioDetail extends Omit<UsuarioListItem, 'empresas' | 'membresias_suspendidas_count'> {
    direccion: string | null
    ultimo_acceso_at: string | null
    membresias: UsuarioMembresiaDetail[]
}

export interface UsuariosPaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface UpdateUsuarioPayload {
    nombre: string
    apellido: string
    email: string
    telefono: string
    tipo_documento: string
    numero_documento: string
    direccion?: string
}

export interface SuspendUsuarioPayload {
    motivo: string
}