<script setup lang="ts">
import { onMounted, shallowRef, watch } from 'vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import { useMarketplaceConfigApi } from '../composables/useMarketplaceConfigApi'

const {
  config,
  isLoading,
  isSaving,
  errorMessage,
  successMessage,
  fetchConfig,
  saveConfig,
} = useMarketplaceConfigApi()

const form = shallowRef({
  puntos_por_unidad_moneda_venta: 10,
  puntos_pago_puntual: 15,
  puntos_crecimiento_equipo: 25,
})

watch(config, (value) => {
  if (!value) {
    return
  }

  form.value = {
    puntos_por_unidad_moneda_venta: value.puntos_por_unidad_moneda_venta,
    puntos_pago_puntual: value.puntos_pago_puntual,
    puntos_crecimiento_equipo: value.puntos_crecimiento_equipo,
  }
})

const save = async () => {
  await saveConfig({ ...form.value })
}

onMounted(() => {
  void fetchConfig()
})
</script>

<template>
  <div class="reward-panel">
    <div class="panel-toolbar">
      <div>
        <h3 class="section-title">Reglas de acumulacion de puntos</h3>
        <p class="section-sub">
          Configuracion por empresa. Si no guardas cambios, se usan los valores por defecto del servidor.
        </p>
      </div>
    </div>

    <ApiErrorState v-if="errorMessage" :message="errorMessage" :retrying="isLoading" @retry="fetchConfig" />
    <div v-if="successMessage" class="inline-success">{{ successMessage }}</div>

    <div v-if="isLoading" class="panel-state">Cargando configuracion...</div>
    <form v-else-if="!errorMessage" class="config-form" @submit.prevent="save">
      <div class="form-row">
        <div class="form-group">
          <label>Moneda por punto (venta aprobada)</label>
          <input v-model.number="form.puntos_por_unidad_moneda_venta" type="number" min="1" class="form-input" />
          <small>1 punto cada N unidades monetarias de venta (minimo 1 si hay monto).</small>
        </div>
        <div class="form-group">
          <label>Puntos por cobro puntual</label>
          <input v-model.number="form.puntos_pago_puntual" type="number" min="0" class="form-input" />
        </div>
        <div class="form-group">
          <label>Puntos por referido activado</label>
          <input v-model.number="form.puntos_crecimiento_equipo" type="number" min="0" class="form-input" />
        </div>
      </div>
      <button type="submit" class="filter-button" :disabled="isSaving">
        {{ isSaving ? 'Guardando...' : 'Guardar reglas' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.reward-panel { display: flex; flex-direction: column; gap: 16px; }
.panel-toolbar { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.section-title { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a2e; }
.section-sub { margin: 4px 0 0; color: #666; font-size: 13px; }
.config-form { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 20px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #333; }
.form-group small { color: #888; font-size: 12px; }
.form-input { padding: 10px 12px; border: 1px solid #dde3ea; border-radius: 8px; font-size: 14px; }
.filter-button { padding: 10px 18px; background: #1a3a5c; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.filter-button:disabled { opacity: 0.6; cursor: not-allowed; }
.panel-state { padding: 24px; text-align: center; color: #666; }
.inline-error, .inline-success { padding: 10px 14px; border-radius: 8px; font-size: 13px; }
.inline-error { background: #fdecea; color: #b42318; }
.inline-success { background: #e8f5e9; color: #2e7d32; }
</style>
