<script setup lang="ts">
import type { UsuarioEstadoGlobal, UsuarioListItem } from '../types'

interface Props {
  usuarios: UsuarioListItem[]
  loading: boolean
  pendingUsuarioId: number | null
}

defineProps<Props>()

const emit = defineEmits<{
  view: [usuarioId: number]
}>()

const estadoLabel: Record<UsuarioEstadoGlobal, string> = {
  activo: 'Activo',
  suspendido: 'Suspendido',
  baneado: 'Baneado',
}

const estadoVariant = (estado: UsuarioEstadoGlobal) => {
  if (estado === 'activo') {
    return 'usr-activo'
  }

  if (estado === 'suspendido') {
    return 'usr-suspendido'
  }

  return 'usr-baneado'
}

const secondaryCompaniesText = (usuario: UsuarioListItem) => {
  if (usuario.empresas.length === 0) {
    return 'Sin membresias registradas'
  }

  if (usuario.empresas.length === 1) {
    return usuario.empresas[0]?.nombre ?? 'Empresa sin nombre'
  }

  return `${usuario.empresas[0]?.nombre ?? 'Empresa sin nombre'} +${usuario.empresas.length - 1} mas`
}
</script>

<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner" />
    <span>Cargando usuarios...</span>
  </div>

  <div v-else class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Estado global</th>
          <th>Empresas</th>
          <th>Membresias activas</th>
          <th>Tipo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="usuarios.length === 0">
          <td colspan="6" class="empty-state">No hay usuarios para mostrar con los filtros actuales.</td>
        </tr>

        <tr v-for="usuario in usuarios" v-else :key="usuario.id">
          <td>
            <div class="usuario-info">
              <div class="usuario-avatar">{{ usuario.nombre_completo.slice(0, 1).toUpperCase() }}</div>
              <div>
                <div class="usuario-name">{{ usuario.nombre_completo }}</div>
                <div class="usuario-meta">{{ usuario.email }}</div>
                <div class="usuario-meta">{{ usuario.tipo_documento.toUpperCase() }} · {{ usuario.numero_documento }}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge" :class="estadoVariant(usuario.estado_global)">{{ estadoLabel[usuario.estado_global] }}</span>
          </td>
          <td class="td-muted">{{ secondaryCompaniesText(usuario) }}</td>
          <td class="td-center">{{ usuario.membresias_activas_count }} / {{ usuario.membresias_count }}</td>
          <td>
            <div class="type-stack">
              <span class="inline-chip" :class="usuario.es_superadmin ? 'inline-chip--accent' : 'inline-chip--neutral'">
                {{ usuario.es_superadmin ? 'Superadmin' : 'Cuenta estandar' }}
              </span>
              <span v-if="usuario.es_usuario_sistema" class="inline-chip inline-chip--neutral">Sistema</span>
            </div>
          </td>
          <td>
            <div class="acciones">
              <button class="btn-detalle" :disabled="pendingUsuarioId === usuario.id" @click="emit('view', usuario.id)">
                {{ pendingUsuarioId === usuario.id ? '...' : 'Ver detalle' }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #64748b;
  font-size: 13px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead tr {
  background: #1d2a3d;
  color: #fff;
}

.data-table th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #edf2f7;
  transition: background 0.15s ease;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.data-table td {
  padding: 12px 14px;
  vertical-align: middle;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.usuario-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #1d4ed8);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.usuario-name {
  font-size: 13px;
  font-weight: 700;
  color: #172033;
}

.usuario-meta,
.td-muted {
  color: #64748b;
  font-size: 12px;
}

.td-center {
  text-align: center;
  font-weight: 700;
  color: #172033;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
}

.usr-activo { background: #dcfce7; color: #166534; }
.usr-suspendido { background: #fee2e2; color: #991b1b; }
.usr-baneado { background: #f1f5f9; color: #334155; }

.type-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.inline-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
}

.inline-chip--accent {
  background: #dbeafe;
  color: #1d4ed8;
}

.inline-chip--neutral {
  background: #e2e8f0;
  color: #334155;
}

.acciones {
  display: flex;
  justify-content: flex-end;
}

.btn-detalle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #d7dee8;
  background: #fff;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.btn-detalle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 40px;
  font-size: 13px;
}
</style>