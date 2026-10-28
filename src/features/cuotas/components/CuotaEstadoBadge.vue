<script setup lang="ts">
import type { EstadoCuota } from '../types'
import { estadoCuotaLabel } from '../utils'

defineProps<{ estado: EstadoCuota }>()
</script>

<template>
  <span class="cuota-badge" :class="`cuota-badge--${estado}`">{{ estadoCuotaLabel(estado) }}</span>
</template>

<style scoped>
.cuota-badge { display: inline-flex; border-radius: 999px; padding: 4px 9px; font-size: 11px; font-weight: 700; }
.cuota-badge--pendiente { background: #fef3c7; color: #92400e; }
.cuota-badge--pagada { background: #dcfce7; color: #166534; }
.cuota-badge--vencida { background: #fee2e2; color: #b91c1c; }
.cuota-badge--parcial { background: #dbeafe; color: #1d4ed8; }
</style>
