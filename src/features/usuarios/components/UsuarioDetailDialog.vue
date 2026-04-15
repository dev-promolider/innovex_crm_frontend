<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import type { UpdateUsuarioPayload, UsuarioDetail } from '../types'

interface Props {
  open: boolean
  usuario: UsuarioDetail | null
  loading: boolean
  saving: boolean
  mutatingUsuarioId: number | null
  mutatingMembresiaId: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [payload: UpdateUsuarioPayload]
  suspendGlobal: [motivo: string]
  reactivateGlobal: []
  suspendMembership: [membresiaId: number]
  reactivateMembership: [membresiaId: number]
  requestPasswordReset: []
}>()

const form = reactive<UpdateUsuarioPayload>({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  tipo_documento: 'dni',
  numero_documento: '',
  direccion: '',
})

const suspensionReason = reactive({ motivo: '' })

watch(
  () => props.usuario,
  (usuario) => {
    if (!usuario) {
      return
    }

    form.nombre = usuario.nombre
    form.apellido = usuario.apellido
    form.email = usuario.email
    form.telefono = usuario.telefono ?? ''
    form.tipo_documento = usuario.tipo_documento
    form.numero_documento = usuario.numero_documento
    form.direccion = usuario.direccion ?? ''
    suspensionReason.motivo = ''
  },
  { immediate: true },
)

const headerTitle = computed(() => props.usuario?.nombre_completo ?? 'Detalle de usuario')
const isGlobalMutation = computed(() => props.usuario != null && props.mutatingUsuarioId === props.usuario.id)

const submit = () => {
  emit('save', {
    ...form,
    direccion: form.direccion?.trim() || undefined,
  })
}

const requestSuspend = () => {
  emit('suspendGlobal', suspensionReason.motivo)
}

const membershipActionLabel = (estadoValidacion: string) => {
  return estadoValidacion === 'activa' ? 'Suspender' : 'Reactivar'
}
</script>

<template>
  <AppModal
    :open="open"
    :title="headerTitle"
    description="Administra datos globales, seguridad y membresias por empresa desde una sola ficha operativa."
    size="xl"
    @close="emit('close')"
  >
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <span>Cargando detalle del usuario...</span>
    </div>

    <div v-else-if="usuario" class="detail-layout">
      <section class="detail-summary card-surface">
        <div class="summary-top">
          <div>
            <p class="eyebrow">Cuenta global</p>
            <h3>{{ usuario.nombre_completo }}</h3>
            <p class="summary-copy">{{ usuario.email }} · {{ usuario.tipo_documento.toUpperCase() }} {{ usuario.numero_documento }}</p>
          </div>

          <div class="summary-badges">
            <span class="badge" :class="usuario.estado_global === 'activo' ? 'badge-success' : 'badge-danger'">
              {{ usuario.estado_global }}
            </span>
            <span class="badge badge-neutral">{{ usuario.es_superadmin ? 'superadmin' : 'estandar' }}</span>
            <span v-if="usuario.es_usuario_sistema" class="badge badge-neutral">sistema</span>
          </div>
        </div>

        <div class="summary-metrics">
          <div class="metric-card">
            <strong>{{ usuario.membresias_activas_count }}</strong>
            <span>Membresias activas</span>
          </div>
          <div class="metric-card">
            <strong>{{ usuario.membresias_count }}</strong>
            <span>Total de empresas</span>
          </div>
          <div class="metric-card">
            <strong>{{ usuario.ultimo_acceso_at ? new Date(usuario.ultimo_acceso_at).toLocaleDateString() : 'Sin dato' }}</strong>
            <span>Ultimo acceso</span>
          </div>
        </div>
      </section>

      <section class="detail-form card-surface">
        <div class="section-head">
          <div>
            <h4>Datos globales</h4>
            <p>Edita la identidad base del usuario sin alterar sus membresias.</p>
          </div>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>Nombre</span>
            <input v-model="form.nombre" type="text" autocomplete="off" />
          </label>

          <label class="field">
            <span>Apellido</span>
            <input v-model="form.apellido" type="text" autocomplete="off" />
          </label>

          <label class="field">
            <span>Correo</span>
            <input v-model="form.email" type="email" autocomplete="off" />
          </label>

          <label class="field">
            <span>Telefono</span>
            <input v-model="form.telefono" type="text" autocomplete="off" />
          </label>

          <label class="field">
            <span>Tipo documento</span>
            <select v-model="form.tipo_documento">
              <option value="dni">DNI</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="cedula">Cedula</option>
              <option value="ruc">RUC</option>
              <option value="otro">Otro</option>
            </select>
          </label>

          <label class="field">
            <span>Numero documento</span>
            <input v-model="form.numero_documento" type="text" autocomplete="off" />
          </label>

          <label class="field field-full">
            <span>Direccion</span>
            <textarea v-model="form.direccion" rows="3" />
          </label>
        </div>
      </section>

      <section class="detail-security card-surface">
        <div class="section-head">
          <div>
            <h4>Seguridad y estado global</h4>
            <p>Estas acciones afectan la cuenta global del usuario en toda la plataforma.</p>
          </div>
        </div>

        <div class="security-grid">
          <div class="security-card security-card--danger">
            <div>
              <strong>Suspension global</strong>
              <p>Bloquea el acceso a toda la plataforma hasta reactivacion manual.</p>
            </div>

            <template v-if="usuario.estado_global === 'activo'">
              <textarea v-model="suspensionReason.motivo" rows="3" placeholder="Motivo obligatorio para suspender la cuenta" />
              <button type="button" class="btn-danger" :disabled="isGlobalMutation || suspensionReason.motivo.trim().length === 0" @click="requestSuspend">
                {{ isGlobalMutation ? 'Suspendiendo...' : 'Suspender cuenta global' }}
              </button>
            </template>

            <button v-else type="button" class="btn-success" :disabled="isGlobalMutation" @click="emit('reactivateGlobal')">
              {{ isGlobalMutation ? 'Reactivando...' : 'Reactivar cuenta global' }}
            </button>
          </div>

          <div class="security-card security-card--neutral">
            <div>
              <strong>Reset de contrasena</strong>
              <p>Genera una contrasena temporal y revoca todas las sesiones activas.</p>
            </div>

            <button type="button" class="btn-outline" @click="emit('requestPasswordReset')">Generar password temporal</button>
          </div>
        </div>
      </section>

      <section class="detail-memberships card-surface">
        <div class="section-head">
          <div>
            <h4>Membresias por empresa</h4>
            <p>Opera solo sobre la relacion del usuario con cada empresa, sin tocar la cuenta global.</p>
          </div>
        </div>

        <div class="membership-table-wrap">
          <table class="membership-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Web</th>
                <th>Rol</th>
                <th>Confianza</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usuario.membresias.length === 0">
                <td colspan="6" class="empty-state">El usuario no tiene membresias registradas.</td>
              </tr>

              <tr v-for="membresia in usuario.membresias" v-else :key="membresia.id">
                <td>
                  <div class="membership-company">
                    <strong>{{ membresia.empresa_nombre ?? 'Empresa sin nombre' }}</strong>
                    <span>{{ membresia.rango ?? 'Sin rango' }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="membresia.estado_validacion === 'activa' ? 'badge-success' : 'badge-warning'">
                    {{ membresia.estado_validacion }}
                  </span>
                </td>
                <td>{{ membresia.perfil_web_activo ? 'Habilitado' : 'Solo movil' }}</td>
                <td>{{ membresia.es_admin_empresa ? 'Administrador' : 'Operativo' }}</td>
                <td>{{ membresia.nivel_confianza }}</td>
                <td>
                  <button
                    type="button"
                    class="btn-inline"
                    :disabled="mutatingMembresiaId === membresia.id || !['activa', 'suspendida'].includes(membresia.estado_validacion)"
                    @click="membresia.estado_validacion === 'activa'
                      ? emit('suspendMembership', membresia.id)
                      : emit('reactivateMembership', membresia.id)"
                  >
                    {{ mutatingMembresiaId === membresia.id ? 'Procesando...' : membershipActionLabel(membresia.estado_validacion) }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <template #footer>
      <button type="button" class="btn-outline" @click="emit('close')">Cerrar</button>
      <button v-if="usuario" type="button" class="btn-primary" :disabled="saving" @click="submit">
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </template>
  </AppModal>
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

.detail-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-surface {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.summary-top,
.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.summary-top h3,
.section-head h4 {
  margin: 0;
  color: #172033;
}

.summary-copy,
.section-head p {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}

.summary-badges,
.summary-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-metrics {
  margin-top: 16px;
}

.metric-card {
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 14px;
  background: #eef4ff;
}

.metric-card strong {
  font-size: 18px;
  color: #1e3a8a;
}

.metric-card span {
  font-size: 12px;
  color: #475569;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-success { background: #dcfce7; color: #166534; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-warning { background: #fef3c7; color: #b45309; }
.badge-neutral { background: #e2e8f0; color: #334155; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-full {
  grid-column: 1 / -1;
}

.field span {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.field input,
.field select,
.field textarea,
.security-card textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 12px;
  font-size: 13px;
  color: #172033;
  background: #fff;
}

.field textarea,
.security-card textarea {
  resize: vertical;
}

.security-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.security-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
}

.security-card strong {
  color: #172033;
}

.security-card p {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}

.security-card--danger {
  background: #fff7f7;
  border: 1px solid #fecaca;
}

.security-card--neutral {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.membership-table-wrap {
  overflow-x: auto;
}

.membership-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.membership-table th,
.membership-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.membership-table th {
  font-size: 12px;
  color: #475569;
}

.membership-company {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.membership-company strong {
  color: #172033;
}

.membership-company span,
.empty-state {
  color: #64748b;
  font-size: 12px;
}

.btn-primary,
.btn-outline,
.btn-danger,
.btn-success,
.btn-inline {
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
}

.btn-primary {
  border: none;
  background: #2563eb;
  color: #fff;
}

.btn-outline,
.btn-inline {
  border: 1px solid #d7dee8;
  background: #fff;
  color: #334155;
}

.btn-danger {
  border: none;
  background: #b91c1c;
  color: #fff;
}

.btn-success {
  border: none;
  background: #15803d;
  color: #fff;
}

.btn-primary:disabled,
.btn-danger:disabled,
.btn-success:disabled,
.btn-inline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 920px) {
  .form-grid,
  .security-grid {
    grid-template-columns: 1fr;
  }
}
</style>