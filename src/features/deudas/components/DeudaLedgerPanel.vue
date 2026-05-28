<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { formatDate as formatLocalizedDate } from '@/utils/formatters'
import type { DebtDetail, DebtListItem, LedgerAccountStatement, LedgerMovement } from '../types'

const props = defineProps<{
  debts: DebtListItem[]
  selectedDebtId: number | null
  debtDetail: DebtDetail | null
  accountStatement: LedgerAccountStatement | null
  isLoading: boolean
  isAccountStatementLoading: boolean
}>()

const emit = defineEmits<{
  select: [debtId: number]
  reverseMovement: [movement: LedgerMovement]
  openDispute: [debtId: number]
  resolveDispute: [debtId: number]
}>()

const { formatCurrency: formatMoney } = useWorkspaceCurrency()

const selectedDebtLabel = computed(() => {
  if (!props.debtDetail?.modelo_pago) {
    return 'Sin detalle cargado'
  }

  return props.debtDetail.modelo_pago === 'fraccionado' ? 'Calendario fraccionado' : 'Pago bullet'
})

const stateLabel = (state: string | null | undefined) => ({
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  pagada: 'Pagada',
  vencida: 'Vencida',
  en_disputa: 'En disputa',
}[state ?? ''] ?? 'Sin estado')

const formatDate = (value: string | null | undefined) =>
  formatLocalizedDate(value)

const avatarLabel = (debt: DebtListItem) => {
  const fullName = debt.distribuidor.nombre?.trim() ?? ''
  if (!fullName) {
    return '#'
  }

  return fullName
    .split(' ')
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('')
}

const accentColor = (debtId: number) => {
  const palette = ['#006466', '#0f766e', '#2563eb', '#c2410c', '#be123c', '#6d28d9']
  return palette[debtId % palette.length]
}

const movementLabel = (movement: LedgerMovement) =>
  movement.descripcion || movement.tipo.replace(/_/g, ' ')
</script>

<template>
  <aside class="ledger-panel">
    <div class="ledger-header">
      <div>
        <p class="ledger-kicker">Monitoreo</p>
        <h3 class="ledger-title">Cartera viva</h3>
      </div>
      <span class="ledger-count">{{ debts.length }}</span>
    </div>

    <div v-if="isLoading" class="ledger-loading">Cargando cartera...</div>

    <div v-else-if="debts.length === 0" class="ledger-empty">
      No hay deudas activas para inspeccionar.
    </div>

    <div v-else class="ledger-list">
      <button
        v-for="debt in debts"
        :key="debt.id"
        class="ledger-item"
        :class="{ 'ledger-item-selected': selectedDebtId === debt.id }"
        type="button"
        @click="emit('select', debt.id)"
      >
        <span class="ledger-avatar" :style="{ backgroundColor: accentColor(debt.id) }">{{ avatarLabel(debt) }}</span>
        <span class="ledger-copy">
          <span class="ledger-name">{{ debt.distribuidor.nombre ?? 'Distribuidor sin nombre' }}</span>
          <span class="ledger-meta">{{ debt.kit.nombre ?? 'Kit sin nombre' }} · {{ formatMoney(debt.monto_pendiente) }}</span>
        </span>
        <span class="ledger-state" :class="`ledger-state-${debt.estado}`">{{ stateLabel(debt.estado) }}</span>
      </button>
    </div>

    <div v-if="debtDetail" class="detail-card">
      <div class="detail-head">
        <div>
          <h4 class="detail-title">{{ debtDetail.distribuidor.nombre ?? 'Distribuidor' }}</h4>
          <p class="detail-subtitle">{{ selectedDebtLabel }} · {{ debtDetail.contrato.numero ?? 'Sin contrato' }}</p>
        </div>
        <div class="detail-head__actions">
          <span class="detail-balance">{{ formatMoney(debtDetail.monto_pendiente) }}</span>
          <button
            v-if="debtDetail.estado !== 'en_disputa' && debtDetail.estado !== 'pagada'"
            class="mini-action"
            type="button"
            @click="emit('openDispute', debtDetail.id)"
          >
            Abrir disputa
          </button>
          <button
            v-else-if="debtDetail.estado === 'en_disputa'"
            class="mini-action"
            type="button"
            @click="emit('resolveDispute', debtDetail.id)"
          >
            Resolver disputa
          </button>
        </div>
      </div>

      <div v-if="debtDetail.estado === 'en_disputa'" class="dispute-box">
        <strong>Deuda en disputa</strong>
        <p>{{ debtDetail.disputa?.motivo ?? 'Sin motivo registrado.' }}</p>
      </div>

      <div class="detail-grid">
        <div class="detail-metric">
          <span class="detail-label">Campaña</span>
          <strong>{{ debtDetail.campana.nombre ?? '—' }}</strong>
        </div>
        <div class="detail-metric">
          <span class="detail-label">Próximo vencimiento</span>
          <strong>{{ formatDate(debtDetail.proxima_cuota?.fecha_vencimiento ?? debtDetail.fecha_vencimiento) }}</strong>
        </div>
        <div class="detail-metric">
          <span class="detail-label">Pagado</span>
          <strong>{{ formatMoney(debtDetail.monto_pagado) }}</strong>
        </div>
        <div class="detail-metric">
          <span class="detail-label">Estado</span>
          <strong>{{ stateLabel(debtDetail.estado) }}</strong>
        </div>
      </div>

      <div class="quota-block">
        <h5 class="block-title">Cuotas</h5>
        <div v-if="debtDetail.cuotas.length === 0" class="block-empty">Esta deuda no tiene cuotas generadas.</div>
        <div v-else class="quota-list">
          <div v-for="quota in debtDetail.cuotas" :key="quota.id" class="quota-item">
            <div>
              <strong>Cuota {{ quota.numero_cuota }}</strong>
              <p>{{ formatDate(quota.fecha_vencimiento) }}</p>
            </div>
            <div class="quota-right">
              <strong>{{ formatMoney(quota.monto_cuota) }}</strong>
              <span class="ledger-state" :class="`ledger-state-${quota.estado}`">{{ stateLabel(quota.estado) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="transactions-block">
        <h5 class="block-title">Movimientos</h5>
        <div v-if="debtDetail.transacciones.length === 0" class="block-empty">Aún no hay movimientos aplicados a esta deuda.</div>
        <div v-else class="transaction-list">
          <div v-for="transaction in debtDetail.transacciones" :key="transaction.id" class="transaction-item">
            <div>
              <strong>{{ transaction.descripcion || transaction.tipo }}</strong>
              <p>{{ formatDate(transaction.created_at) }}</p>
            </div>
            <strong>{{ formatMoney(transaction.monto) }}</strong>
          </div>
        </div>
      </div>

      <div class="account-block">
        <div class="account-block__head">
          <div>
            <h5 class="block-title">Estado de cuenta</h5>
            <p class="detail-subtitle">Resumen financiero del distribuidor seleccionado.</p>
          </div>
          <span v-if="props.accountStatement?.distribuidor.estado" class="ledger-state" :class="`ledger-state-${props.accountStatement.distribuidor.estado}`">
            {{ stateLabel(props.accountStatement.distribuidor.estado) }}
          </span>
        </div>

        <div v-if="props.isAccountStatementLoading" class="block-empty">Cargando estado de cuenta...</div>
        <div v-else-if="!props.accountStatement" class="block-empty">No se pudo obtener el estado de cuenta del distribuidor.</div>
        <template v-else>
          <div class="account-grid">
            <div class="detail-metric">
              <span class="detail-label">Saldo disponible</span>
              <strong>{{ formatMoney(props.accountStatement.resumen.saldo_disponible_actual) }}</strong>
            </div>
            <div class="detail-metric">
              <span class="detail-label">Deuda pendiente actual</span>
              <strong>{{ formatMoney(props.accountStatement.resumen.deuda_pendiente_actual) }}</strong>
            </div>
            <div class="detail-metric">
              <span class="detail-label">Comisiones liberadas</span>
              <strong>{{ formatMoney(props.accountStatement.resumen.total_comisiones_liberadas) }}</strong>
            </div>
            <div class="detail-metric">
              <span class="detail-label">Retiros registrados</span>
              <strong>{{ formatMoney(props.accountStatement.resumen.total_retiros) }}</strong>
            </div>
          </div>

          <div v-if="props.accountStatement.deuda_activa" class="active-debt-card">
            <div>
              <span class="detail-label">Deuda activa enlazada</span>
              <p class="detail-subtitle">Vencimiento {{ formatDate(props.accountStatement.deuda_activa.fecha_vencimiento) }}</p>
            </div>
            <strong>{{ formatMoney(props.accountStatement.deuda_activa.monto_pendiente) }}</strong>
          </div>

          <div class="transactions-block">
            <h5 class="block-title">Ultimos movimientos del ledger</h5>
            <div v-if="props.accountStatement.movimientos.length === 0" class="block-empty">Sin movimientos financieros recientes.</div>
            <div v-else class="transaction-list">
              <div v-for="movement in props.accountStatement.movimientos" :key="movement.id" class="transaction-item">
                <div>
                  <strong>{{ movementLabel(movement) }}</strong>
                  <p>{{ formatDate(movement.created_at) }} · saldo {{ formatMoney(movement.saldo_disponible_posterior) }}</p>
                </div>
                <div class="movement-actions">
                  <strong>{{ formatMoney(movement.monto) }}</strong>
                  <button
                    v-if="movement.es_reversible"
                    class="mini-action"
                    type="button"
                    @click="emit('reverseMovement', movement)"
                  >
                    Revertir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.ledger-panel {
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  border-radius: 24px;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.ledger-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.ledger-kicker {
  color: #67e8f9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin: 0 0 4px;
  text-transform: uppercase;
}

.ledger-title {
  font-size: 20px;
  margin: 0;
}

.ledger-count {
  align-items: center;
  background: rgba(103, 232, 249, 0.12);
  border: 1px solid rgba(103, 232, 249, 0.2);
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  height: 36px;
  justify-content: center;
  min-width: 36px;
  padding: 0 12px;
}

.ledger-loading,
.ledger-empty,
.block-empty {
  color: #94a3b8;
  font-size: 13px;
}

.ledger-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ledger-item {
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
  border-radius: 18px;
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: 12px;
  padding: 12px;
  text-align: left;
}

.ledger-item-selected {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(103, 232, 249, 0.35);
}

.ledger-avatar {
  align-items: center;
  border-radius: 16px;
  color: white;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  height: 42px;
  justify-content: center;
  min-width: 42px;
}

.ledger-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.ledger-name,
.detail-title,
.block-title {
  font-weight: 700;
}

.ledger-meta,
.detail-subtitle,
.detail-label,
.quota-item p,
.transaction-item p {
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
}

.ledger-state {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
}

.ledger-state-pagada {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
}

.ledger-state-vencida {
  background: rgba(248, 113, 113, 0.16);
  color: #fca5a5;
}

.ledger-state-en_curso,
.ledger-state-pendiente {
  background: rgba(96, 165, 250, 0.16);
  color: #93c5fd;
}

.ledger-state-en_disputa {
  background: rgba(216, 180, 254, 0.16);
  color: #d8b4fe;
}

.detail-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px;
}

.detail-head,
.quota-item,
.transaction-item {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.detail-balance {
  color: #fef08a;
  font-size: 18px;
  font-weight: 700;
}

.detail-head__actions,
.movement-actions {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-action {
  background: rgba(103, 232, 249, 0.12);
  border: 1px solid rgba(103, 232, 249, 0.28);
  border-radius: 999px;
  color: #67e8f9;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
}

.dispute-box {
  background: rgba(216, 180, 254, 0.12);
  border: 1px solid rgba(216, 180, 254, 0.24);
  border-radius: 16px;
  padding: 12px;
}

.dispute-box p {
  color: #d8b4fe;
  font-size: 12px;
  margin: 4px 0 0;
}

.detail-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-metric {
  background: rgba(15, 23, 42, 0.36);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
}

.quota-block,
.transactions-block,
.account-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.account-block__head,
.active-debt-card {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.account-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.active-debt-card {
  background: rgba(15, 23, 42, 0.36);
  border-radius: 16px;
  padding: 12px;
}

.quota-list,
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quota-item,
.transaction-item {
  background: rgba(15, 23, 42, 0.36);
  border-radius: 16px;
  padding: 12px;
}

.quota-right {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 960px) {
  .detail-grid,
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
