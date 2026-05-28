<script setup lang="ts">
import type { EmpresaEstado, EmpresaListItem } from '../types'

interface Props {
  empresas: EmpresaListItem[]
  loading: boolean
  pendingEmpresaId: number | null
}

defineProps<Props>()

const emit = defineEmits<{
  configure: [empresaId: number]
  activate: [empresaId: number]
  suspend: [empresaId: number]
  delete: [empresaId: number]
}>()

const estadoLabel: Record<EmpresaEstado, string> = {
  configuracion: 'Configuracion',
  activa: 'Activa',
  suspendida: 'Suspendida',
  inactiva: 'Inactiva',
}

const estadoVariant = (estado: EmpresaEstado) => {
  if (estado === 'activa') {
    return 'emp-activa'
  }

  if (estado === 'suspendida') {
    return 'emp-suspendida'
  }

  if (estado === 'configuracion') {
    return 'emp-configuracion'
  }

  return 'emp-inactiva'
}

const planLabel = (empresa: EmpresaListItem) => empresa.plan_saas ?? 'Sin plan'

const companySecondaryText = (empresa: EmpresaListItem) =>
  empresa.nombre_comercial ?? empresa.ruc_nit ?? 'Sin alias comercial'
</script>

<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner" />
    <span>Cargando empresas...</span>
  </div>

  <div v-else class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Estado</th>
          <th>Plan</th>
          <th>Moneda</th>
          <th>Miembros</th>
          <th>Contacto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="empresas.length === 0">
          <td colspan="7" class="empty-state">No hay empresas para mostrar con los filtros actuales.</td>
        </tr>

        <tr v-for="empresa in empresas" v-else :key="empresa.id">
          <td>
            <div class="empresa-info">
              <div class="empresa-avatar">{{ empresa.nombre.slice(0, 1).toUpperCase() }}</div>
              <div>
                <div class="empresa-name">{{ empresa.nombre }}</div>
                <div class="empresa-meta">{{ companySecondaryText(empresa) }}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge" :class="estadoVariant(empresa.estado)">{{ estadoLabel[empresa.estado] }}</span>
          </td>
          <td class="td-kit">{{ planLabel(empresa) }}</td>
          <td class="td-center">{{ empresa.moneda_iso ?? 'USD' }}</td>
          <td class="td-center">{{ empresa.membresias_activas_count }}</td>
          <td class="td-lider">{{ empresa.email_contacto ?? 'No registrado' }}</td>
          <td>
            <div class="acciones">
              <button class="btn-detalle" @click="emit('configure', empresa.id)">Configurar</button>
              <button
                v-if="empresa.estado === 'configuracion' || empresa.estado === 'inactiva'"
                class="btn-aprobar"
                :disabled="pendingEmpresaId === empresa.id"
                @click="emit('activate', empresa.id)"
              >
                {{ pendingEmpresaId === empresa.id ? '...' : 'Activar' }}
              </button>
              <button
                v-if="empresa.estado === 'activa'"
                class="btn-rechazar"
                :disabled="pendingEmpresaId === empresa.id"
                @click="emit('suspend', empresa.id)"
              >
                {{ pendingEmpresaId === empresa.id ? '...' : 'Suspender' }}
              </button>
              <button
                class="btn-rechazar"
                :disabled="pendingEmpresaId === empresa.id"
                @click="emit('delete', empresa.id)"
              >
                {{ pendingEmpresaId === empresa.id ? '...' : 'Eliminar' }}
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
  color: #999;
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
  color: white;
}

.data-table th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.data-table td {
  padding: 10px 14px;
  vertical-align: middle;
}

.empresa-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.empresa-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
  color: white;
  font-weight: 700;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.empresa-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 12px;
}

.empresa-meta,
.td-lider {
  color: #666;
  font-size: 12px;
}

.td-kit {
  font-weight: 600;
  color: #333;
}

.td-center {
  text-align: center;
  font-weight: 600;
  color: #333;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.emp-activa { background: #dbeafe; color: #1e40af; }
.emp-configuracion { background: #fef3c7; color: #b45309; }
.emp-suspendida { background: #fee2e2; color: #991b1b; }
.emp-inactiva { background: #e2e8f0; color: #475569; }

.acciones {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.btn-detalle,
.btn-aprobar,
.btn-rechazar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-detalle {
  border: 1px solid #d7dee8;
  background: white;
  color: #334155;
}

.btn-aprobar {
  border: none;
  background: #dcfce7;
  color: #166534;
}

.btn-rechazar {
  border: none;
  background: #fee2e2;
  color: #991b1b;
}

.btn-aprobar:disabled,
.btn-rechazar:disabled,
.btn-detalle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 13px;
}
</style>
