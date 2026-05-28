<script setup lang="ts">
import { formatDate as formatLocalizedDate } from '@/utils/formatters'
import type { ApprovalListItem, ApprovalQueueFilter, MembershipValidationStatus } from '../types'

interface Props {
  approvals: readonly ApprovalListItem[]
  loading: boolean
  activeFilter: ApprovalQueueFilter
}

defineProps<Props>()

const emit = defineEmits<{
  review: [approvalId: number]
}>()

const statusLabel = (value: MembershipValidationStatus) => ({
  pre_registro: 'Pre-registro',
  biometria_pendiente: 'Firma pendiente',
  documentos_pendientes: 'Documentos pendientes',
  revision_admin: 'Revision admin',
  pendiente_activacion: 'Pendiente activacion',
  activa: 'Activa',
  suspendida: 'Suspendida',
  bloqueada_riesgo: 'Bloqueada por riesgo',
  retirada: 'Retirada',
  rechazada: 'Rechazada',
}[value] ?? value)

const statusVariant = (status: MembershipValidationStatus) => {
  if (status === 'activa') {
    return 'approval-activa'
  }

  if (status === 'revision_admin' || status === 'pendiente_activacion' || status === 'documentos_pendientes') {
    return 'approval-configuracion'
  }

  if (status === 'suspendida' || status === 'rechazada' || status === 'bloqueada_riesgo' || status === 'retirada') {
    return 'approval-suspendida'
  }

  return 'approval-inactiva'
}

const getApplicantName = (approval: ApprovalListItem) =>
  `${approval.usuario.nombre} ${approval.usuario.apellido}`.trim()

const getSponsorName = (approval: ApprovalListItem) => (
  approval.referente?.usuario
    ? `${approval.referente.usuario.nombre ?? ''} ${approval.referente.usuario.apellido ?? ''}`.trim()
    : 'Sin patrocinador'
)

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return 'Sin fecha'
  }

  return formatLocalizedDate(value)
}
</script>

<template>
  <div v-if="loading" class="loading-state">
    <div class="spinner" />
    <span>Cargando aprobaciones...</span>
  </div>

  <div v-else class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>Solicitante</th>
          <th>Estado</th>
          <th>Rango</th>
          <th>Patrocinador</th>
          <th>Documento</th>
          <th>Ingreso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="approvals.length === 0">
          <td colspan="7" class="empty-state">
            {{
              activeFilter === 'pendientes'
                ? 'No hay aprobaciones pendientes con los filtros actuales.'
                : 'No hay aprobaciones historicas para mostrar con los filtros actuales.'
            }}
          </td>
        </tr>

        <tr v-for="approval in approvals" v-else :key="approval.id">
          <td>
            <div class="approval-info">
              <div class="approval-avatar">{{ approval.usuario.nombre.slice(0, 1).toUpperCase() }}</div>
              <div>
                <div class="approval-name">{{ getApplicantName(approval) }}</div>
                <div class="approval-meta">{{ approval.usuario.email }}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge" :class="statusVariant(approval.estado_validacion)">
              {{ statusLabel(approval.estado_validacion) }}
            </span>
          </td>
          <td class="td-strong">{{ approval.rango?.nombre_rango ?? 'Sin rango' }}</td>
          <td class="td-muted">{{ getSponsorName(approval) }}</td>
          <td class="td-muted">{{ approval.usuario.numero_documento }}</td>
          <td class="td-center">{{ formatDate(approval.created_at) }}</td>
          <td>
            <div class="acciones">
              <button class="btn-detalle" @click="emit('review', approval.id)">Revisar</button>
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

.approval-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.approval-avatar {
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

.approval-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 12px;
}

.approval-meta,
.td-muted {
  color: #666;
  font-size: 12px;
}

.td-strong,
.td-center {
  font-weight: 600;
  color: #333;
}

.td-center {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.approval-activa { background: #dbeafe; color: #1e40af; }
.approval-configuracion { background: #fef3c7; color: #b45309; }
.approval-suspendida { background: #fee2e2; color: #991b1b; }
.approval-inactiva { background: #e2e8f0; color: #475569; }

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
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #d7dee8;
  background: white;
  color: #334155;
}

.empty-state {
  padding: 30px 14px;
  text-align: center;
  color: #64748b;
}
</style>
