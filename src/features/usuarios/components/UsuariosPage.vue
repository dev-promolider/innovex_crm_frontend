<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { useUsuariosApi } from '../composables/useUsuariosApi'
import type { UsuarioEstadoGlobal } from '../types'
import ResetPasswordDialog from './ResetPasswordDialog.vue'
import UsuarioDetailDialog from './UsuarioDetailDialog.vue'
import UsuariosTable from './UsuariosTable.vue'

const {
  usuarios,
  usuarioDetail,
  temporaryPassword,
  isLoading,
  isDetailLoading,
  isSaving,
  isResettingPassword,
  mutatingUsuarioId,
  mutatingMembresiaId,
  errorMessage,
  successMessage,
  pagination,
  clearMessages,
  clearTemporaryPassword,
  fetchUsuarios,
  fetchUsuarioDetail,
  updateUsuario,
  suspendUsuarioGlobal,
  reactivateUsuarioGlobal,
  resetUsuarioPassword,
  suspendUsuarioMembresia,
  reactivateUsuarioMembresia,
} = useUsuariosApi()

const filters = reactive({
  search: '',
  estadoGlobal: 'todos' as 'todos' | UsuarioEstadoGlobal,
})

const detailDialogOpen = shallowRef(false)
const resetPasswordDialogOpen = shallowRef(false)
const selectedUsuarioId = shallowRef<number | null>(null)

const filteredUsuarios = computed(() => {
  const normalizedSearch = filters.search.trim().toLowerCase()

  return usuarios.value.filter((usuario) => {
    const matchesStatus = filters.estadoGlobal === 'todos' || usuario.estado_global === filters.estadoGlobal
    const matchesSearch =
      normalizedSearch.length === 0
      || usuario.nombre_completo.toLowerCase().includes(normalizedSearch)
      || usuario.email.toLowerCase().includes(normalizedSearch)
      || usuario.numero_documento.toLowerCase().includes(normalizedSearch)
      || usuario.empresas.some((empresa) => empresa.nombre?.toLowerCase().includes(normalizedSearch))

    return matchesStatus && matchesSearch
  })
})

const activeCount = computed(
  () => usuarios.value.filter((usuario) => usuario.estado_global === 'activo').length,
)

const suspendedCount = computed(
  () => usuarios.value.filter((usuario) => usuario.estado_global === 'suspendido').length,
)

const superadminCount = computed(
  () => usuarios.value.filter((usuario) => usuario.es_superadmin).length,
)

const activeMembershipsCount = computed(
  () => usuarios.value.reduce((total, usuario) => total + usuario.membresias_activas_count, 0),
)

const selectedUserName = computed(() => usuarioDetail.value?.nombre_completo ?? 'este usuario')

const loadPage = async (page = 1) => {
  await fetchUsuarios(page)
}

const openDetailDialog = async (usuarioId: number) => {
  clearMessages()
  clearTemporaryPassword()
  selectedUsuarioId.value = usuarioId
  detailDialogOpen.value = true
  await fetchUsuarioDetail(usuarioId)
}

const closeDetailDialog = () => {
  detailDialogOpen.value = false
  clearTemporaryPassword()
}

const openResetPasswordDialog = () => {
  clearTemporaryPassword()
  resetPasswordDialogOpen.value = true
}

const closeResetPasswordDialog = () => {
  resetPasswordDialogOpen.value = false
  clearTemporaryPassword()
}

const handleSave = async (payload: Parameters<typeof updateUsuario>[1]) => {
  if (selectedUsuarioId.value == null) {
    return
  }

  try {
    await updateUsuario(selectedUsuarioId.value, payload)
  } catch {
    return
  }
}

const handleSuspendGlobal = async (motivo: string) => {
  if (selectedUsuarioId.value == null) {
    return
  }

  try {
    await suspendUsuarioGlobal(selectedUsuarioId.value, { motivo })
  } catch {
    return
  }
}

const handleReactivateGlobal = async () => {
  if (selectedUsuarioId.value == null) {
    return
  }

  try {
    await reactivateUsuarioGlobal(selectedUsuarioId.value)
  } catch {
    return
  }
}

const handleResetPassword = async () => {
  if (selectedUsuarioId.value == null) {
    return
  }

  try {
    await resetUsuarioPassword(selectedUsuarioId.value)
  } catch {
    return
  }
}

const handleSuspendMembership = async (membresiaId: number) => {
  if (selectedUsuarioId.value == null) {
    return
  }

  try {
    await suspendUsuarioMembresia(selectedUsuarioId.value, membresiaId)
  } catch {
    return
  }
}

const handleReactivateMembership = async (membresiaId: number) => {
  if (selectedUsuarioId.value == null) {
    return
  }

  try {
    await reactivateUsuarioMembresia(selectedUsuarioId.value, membresiaId)
  } catch {
    return
  }
}

onMounted(async () => {
  await loadPage()
})
</script>

<template>
  <div class="page-body usuarios-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Administracion de usuarios</h1>
        <p class="page-subtitle">
          Supervisa cuentas globales, seguridad y membresias por empresa desde la consola de plataforma.
        </p>
      </div>

      <div class="page-actions">
        <button class="btn-outline" @click="loadPage(pagination.current_page)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          Actualizar
        </button>
      </div>
    </div>

    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-val kpi-blue-txt">{{ activeCount }}</span>
          <div class="kpi-icon blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <span class="kpi-label">Usuarios activos</span>
        <span class="kpi-sub">{{ pagination.total }} cuentas en esta pagina.</span>
      </div>

      <div class="kpi-card kpi-danger">
        <div class="kpi-top">
          <span class="kpi-val kpi-red-txt">{{ suspendedCount }}</span>
          <div class="kpi-icon red">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>
          </div>
        </div>
        <span class="kpi-label">Suspendidos globalmente</span>
        <span class="kpi-sub">Cuentas bloqueadas para toda la plataforma.</span>
      </div>

      <div class="kpi-card kpi-accent">
        <div class="kpi-top">
          <span class="kpi-val kpi-teal-txt">{{ superadminCount }}</span>
          <div class="kpi-icon teal">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.09 6.26H20l-4.91 3.57L16.18 18 12 14.9 7.82 18l1.09-6.17L4 8.26h5.91z"/></svg>
          </div>
        </div>
        <span class="kpi-label">Superadmins</span>
        <span class="kpi-sub">Operadores con alcance global de plataforma.</span>
      </div>

      <div class="kpi-card kpi-warn">
        <div class="kpi-top">
          <span class="kpi-val kpi-orange-txt">{{ activeMembershipsCount }}</span>
          <div class="kpi-icon orange">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
          </div>
        </div>
        <span class="kpi-label">Membresias activas</span>
        <span class="kpi-sub">Relaciones operativas vigentes en empresas.</span>
      </div>
    </section>

    <div v-if="errorMessage" class="alert-error">
      {{ errorMessage }}
      <button class="alert-close" @click="clearMessages">✕</button>
    </div>

    <div v-if="successMessage" class="alert-success">
      {{ successMessage }}
      <button class="alert-close" @click="clearMessages">✕</button>
    </div>

    <div class="card usuarios-card">
      <div class="section-header">
        <div>
          <h3 class="section-title">Usuarios del sistema</h3>
          <p class="section-sub">
            {{ filteredUsuarios.length }} resultados visibles en esta pagina · {{ pagination.total }} registros cargados.
          </p>
        </div>
      </div>

      <div class="table-filters usuarios-filters">
        <div class="search-box search-wide usuarios-search">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="filters.search" type="text" placeholder="Buscar por nombre, correo, documento o empresa" class="search-input" />
        </div>

        <select v-model="filters.estadoGlobal" class="select-filter">
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="suspendido">Suspendidos</option>
          <option value="baneado">Baneados</option>
        </select>
      </div>

      <UsuariosTable
        :usuarios="filteredUsuarios"
        :loading="isLoading"
        :pending-usuario-id="mutatingUsuarioId"
        @view="openDetailDialog"
      />

      <div class="table-footer">
        <span class="table-count usuarios-count">
          Pagina {{ pagination.current_page }} de {{ pagination.last_page }} · {{ pagination.per_page }} por pagina
        </span>

        <div class="pagination-actions">
          <button class="btn-outline btn-small" :disabled="pagination.current_page <= 1 || isLoading" @click="loadPage(pagination.current_page - 1)">
            Anterior
          </button>
          <button class="btn-outline btn-small" :disabled="pagination.current_page >= pagination.last_page || isLoading" @click="loadPage(pagination.current_page + 1)">
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <UsuarioDetailDialog
      :open="detailDialogOpen"
      :usuario="usuarioDetail"
      :loading="isDetailLoading"
      :saving="isSaving"
      :mutating-usuario-id="mutatingUsuarioId"
      :mutating-membresia-id="mutatingMembresiaId"
      @close="closeDetailDialog"
      @save="handleSave"
      @suspend-global="handleSuspendGlobal"
      @reactivate-global="handleReactivateGlobal"
      @suspend-membership="handleSuspendMembership"
      @reactivate-membership="handleReactivateMembership"
      @request-password-reset="openResetPasswordDialog"
    />

    <ResetPasswordDialog
      :open="resetPasswordDialogOpen"
      :loading="isResettingPassword"
      :user-name="selectedUserName"
      :temporary-password="temporaryPassword"
      @close="closeResetPasswordDialog"
      @confirm="handleResetPassword"
    />
  </div>
</template>

<style scoped>
.usuarios-page {
  padding: 22px 20px 24px;
}

.page-header,
.section-header,
.table-footer,
.pagination-actions,
.kpi-top,
.page-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-header {
  margin-bottom: 18px;
}

.page-title {
  font-size: 30px;
  line-height: 1.1;
  color: #172033;
}

.page-subtitle,
.section-sub,
.kpi-sub,
.table-count {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.kpi-card,
.card {
  border: 1px solid rgba(203, 213, 225, 0.8);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.kpi-card {
  padding: 18px;
}

.kpi-val {
  font-size: 28px;
  font-weight: 800;
}

.kpi-label {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #172033;
}

.kpi-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.blue { background: #dbeafe; color: #1d4ed8; }
.red { background: #fee2e2; color: #b91c1c; }
.teal { background: #ccfbf1; color: #0f766e; }
.orange { background: #fef3c7; color: #b45309; }
.kpi-blue-txt { color: #1d4ed8; }
.kpi-red-txt { color: #b91c1c; }
.kpi-teal-txt { color: #0f766e; }
.kpi-orange-txt { color: #b45309; }

.alert-error,
.alert-success {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
}

.alert-error {
  background: #fff1f2;
  color: #b91c1c;
  border: 1px solid #fecdd3;
}

.alert-success {
  background: #ecfdf5;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.alert-close {
  border: none;
  background: transparent;
  padding: 0;
  color: currentColor;
}

.usuarios-card {
  padding: 18px;
}

.section-title {
  font-size: 18px;
  color: #172033;
}

.table-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d7dee8;
  border-radius: 12px;
  padding: 0 12px;
  background: #fff;
}

.search-wide {
  flex: 1;
}

.search-input,
.select-filter {
  height: 42px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #172033;
}

.search-input {
  width: 100%;
}

.select-filter {
  min-width: 180px;
  border: 1px solid #d7dee8;
  border-radius: 12px;
  padding: 0 12px;
  background: #fff;
}

.btn-outline,
.btn-small {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d7dee8;
  background: #fff;
  color: #334155;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
}

.btn-small {
  padding: 9px 12px;
}

.btn-outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1080px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .usuarios-page {
    padding: 18px 14px 20px;
  }

  .page-header,
  .table-filters,
  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .pagination-actions {
    width: 100%;
  }

  .pagination-actions button {
    flex: 1;
  }
}
</style>