<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import AppButton from '@/components/shared/AppButton.vue'
import { useBankValidationApi } from '../composables/useBankValidationApi'

const emit = defineEmits<{
  pendingCountChange: [count: number]
}>()

const {
  pendingSales,
  isLoading,
  isConfirming,
  errorMessage,
  successMessage,
  pagination,
  totalPendingCommissions,
  clearMessages,
  fetchPendingSales,
  confirmDeposit,
} = useBankValidationApi()

const search = shallowRef('')
const selectedSaleId = shallowRef<number | null>(null)

const selectedSale = computed(() =>
  pendingSales.value.find((sale) => sale.id === selectedSaleId.value) ?? filteredSales.value[0] ?? null,
)

const filteredSales = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return pendingSales.value
  }

  return pendingSales.value.filter((sale) => {
    const sellerName = sellerLabel(sale).toLowerCase()
    const bankLabel = bankAccountLabel(sale).toLowerCase()

    return [
      String(sale.id),
      sale.consumidor_nombre ?? '',
      sale.consumidor_documento ?? '',
      sellerName,
      sale.kit?.nombre ?? '',
      bankLabel,
    ].some((value) => value.toLowerCase().includes(term))
  })
})

watch(
  () => pendingSales.value.length,
  (count) => {
    emit('pendingCountChange', count)
  },
  { immediate: true },
)

watch(filteredSales, (sales) => {
  if (!sales.length) {
    selectedSaleId.value = null
    return
  }

  const stillExists = sales.some((sale) => sale.id === selectedSaleId.value)
  if (!stillExists) {
    const [firstSale] = sales
    selectedSaleId.value = firstSale ? firstSale.id : null
  }
}, { immediate: true })

const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))

const formatDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Pendiente'

function sellerLabel(sale: (typeof pendingSales.value)[number]) {
  const seller = sale.vendedor?.usuario
  return `${seller?.nombre ?? ''} ${seller?.apellido ?? ''}`.trim() || 'Sin vendedor'
}

function bankAccountLabel(sale: (typeof pendingSales.value)[number]) {
  const bankAccount = sale.cuenta_bancaria ?? sale.cuentaBancaria

  if (!bankAccount) {
    return 'Cuenta no disponible'
  }

  return `${bankAccount.alias_cuenta ?? 'Sin alias'} · ${bankAccount.banco_nombre ?? 'Banco no informado'}`
}

function commissionTotal(sale: (typeof pendingSales.value)[number]) {
  return (sale.comisiones ?? []).reduce((accumulator, commission) => {
    return accumulator + Number(commission.monto_comision ?? 0)
  }, 0)
}

const confirmSelectedSale = async () => {
  if (!selectedSale.value) {
    return
  }

  try {
    await confirmDeposit(selectedSale.value.id)
  } catch {
    return
  }
}

const goToPage = async (page: number) => {
  clearMessages()
  await fetchPendingSales(page)
}

onMounted(async () => {
  await fetchPendingSales()
})
</script>

<template>
  <section class="bank-validation">
    <header class="bank-validation__hero">
      <div>
        <p class="bank-validation__eyebrow">Finanzas</p>
        <h2 class="bank-validation__title">Confirmacion bancaria de ventas</h2>
        <p class="bank-validation__subtitle">
          Libera comisiones solo cuando el deposito ya aparecio en la cuenta corporativa.
        </p>
      </div>

      <div class="bank-validation__hero-actions">
        <input v-model="search" class="bank-validation__search" type="search" placeholder="Buscar venta, cliente o cuenta" />
        <AppButton variant="ghost" size="sm" :disabled="isLoading" @click="goToPage(pagination.currentPage)">
          {{ isLoading ? 'Sincronizando...' : 'Actualizar' }}
        </AppButton>
      </div>
    </header>

    <section class="bank-validation__summary-grid">
      <article class="summary-card summary-card--ocean">
        <span class="summary-card__label">Ventas pendientes</span>
        <strong class="summary-card__value">{{ pendingSales.length }}</strong>
        <small class="summary-card__caption">Cola disponible para confirmacion financiera</small>
      </article>

      <article class="summary-card summary-card--gold">
        <span class="summary-card__label">Comisiones por liberar</span>
        <strong class="summary-card__value">{{ formatCurrency(totalPendingCommissions) }}</strong>
        <small class="summary-card__caption">Monto agregado de la pagina actual</small>
      </article>

      <article class="summary-card summary-card--slate">
        <span class="summary-card__label">Beneficiarios esperados</span>
        <strong class="summary-card__value">
          {{ pendingSales.reduce((accumulator, sale) => accumulator + (sale.comisiones?.length ?? 0), 0) }}
        </strong>
        <small class="summary-card__caption">Distribuidores en espera de liberacion</small>
      </article>
    </section>

    <div v-if="errorMessage" class="bank-validation__alert bank-validation__alert--error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="bank-validation__alert bank-validation__alert--success">
      {{ successMessage }}
    </div>

    <div class="bank-validation__workspace">
      <section class="bank-validation__queue">
        <header class="bank-validation__section-head">
          <div>
            <h3 class="bank-validation__section-title">Cola de confirmacion</h3>
            <p class="bank-validation__section-copy">Solo aparecen ventas aprobadas y aun no confirmadas bancariamente.</p>
          </div>
          <span class="bank-validation__count-chip">{{ filteredSales.length }} visibles</span>
        </header>

        <div v-if="isLoading" class="bank-validation__state">Cargando confirmaciones pendientes...</div>
        <div v-else-if="filteredSales.length === 0" class="bank-validation__state">No hay ventas pendientes con este filtro.</div>

        <div v-else class="bank-validation__queue-list">
          <button
            v-for="sale in filteredSales"
            :key="sale.id"
            type="button"
            class="queue-card"
            :class="{ 'queue-card--active': selectedSale?.id === sale.id }"
            @click="selectedSaleId = sale.id"
          >
            <div class="queue-card__head">
              <strong>#{{ sale.id }} · {{ sale.consumidor_nombre ?? 'Consumidor final' }}</strong>
              <span>{{ formatCurrency(sale.monto_total_venta) }}</span>
            </div>
            <p class="queue-card__copy">{{ sellerLabel(sale) }} · {{ sale.kit?.nombre ?? 'Kit sin nombre' }}</p>
            <div class="queue-card__meta">
              <span>{{ bankAccountLabel(sale) }}</span>
              <span>{{ formatDate(sale.validado_at) }}</span>
            </div>
          </button>
        </div>

        <footer v-if="pagination.lastPage > 1" class="bank-validation__pagination">
          <AppButton variant="ghost" size="sm" :disabled="pagination.currentPage === 1 || isLoading" @click="goToPage(pagination.currentPage - 1)">
            Anterior
          </AppButton>
          <span>Pagina {{ pagination.currentPage }} de {{ pagination.lastPage }}</span>
          <AppButton variant="ghost" size="sm" :disabled="pagination.currentPage === pagination.lastPage || isLoading" @click="goToPage(pagination.currentPage + 1)">
            Siguiente
          </AppButton>
        </footer>
      </section>

      <section class="bank-validation__detail">
        <header class="bank-validation__section-head">
          <div>
            <h3 class="bank-validation__section-title">Detalle financiero</h3>
            <p class="bank-validation__section-copy">Revisa cuenta, cadena comercial y total a liberar antes de confirmar.</p>
          </div>
        </header>

        <div v-if="!selectedSale" class="bank-validation__state">Selecciona una venta para revisar el detalle.</div>

        <div v-else class="detail-card">
          <div class="detail-card__hero">
            <div>
              <p class="detail-card__eyebrow">Venta #{{ selectedSale.id }}</p>
              <h4 class="detail-card__title">{{ selectedSale.consumidor_nombre ?? 'Consumidor final' }}</h4>
              <p class="detail-card__copy">{{ selectedSale.consumidor_documento ?? 'Documento no informado' }}</p>
            </div>

            <div class="detail-card__amount-box">
              <span>Monto depositado</span>
              <strong>{{ formatCurrency(selectedSale.monto_total_venta) }}</strong>
            </div>
          </div>

          <dl class="detail-grid">
            <div class="detail-grid__item">
              <dt>Vendedor</dt>
              <dd>{{ sellerLabel(selectedSale) }}</dd>
            </div>
            <div class="detail-grid__item">
              <dt>Kit</dt>
              <dd>{{ selectedSale.kit?.nombre ?? 'No informado' }}</dd>
            </div>
            <div class="detail-grid__item">
              <dt>Cuenta corporativa</dt>
              <dd>{{ bankAccountLabel(selectedSale) }}</dd>
            </div>
            <div class="detail-grid__item">
              <dt>Validada</dt>
              <dd>{{ formatDate(selectedSale.validado_at) }}</dd>
            </div>
          </dl>

          <section class="commission-box">
            <div class="commission-box__head">
              <div>
                <h5>Comisiones pendientes</h5>
                <p>{{ selectedSale.comisiones?.length ?? 0 }} beneficiarios esperan liberacion</p>
              </div>
              <strong>{{ formatCurrency(commissionTotal(selectedSale)) }}</strong>
            </div>

            <ul v-if="(selectedSale.comisiones?.length ?? 0) > 0" class="commission-list">
              <li v-for="(commission, index) in selectedSale.comisiones ?? []" :key="`${selectedSale.id}-${index}`" class="commission-list__item">
                <span>Beneficiario {{ index + 1 }}</span>
                <strong>{{ formatCurrency(commission.monto_comision) }}</strong>
              </li>
            </ul>
            <p v-else class="commission-box__empty">Esta venta no tiene comisiones pendientes asociadas.</p>
          </section>

          <div class="detail-card__actions">
            <AppButton variant="ghost" size="sm" :disabled="isLoading" @click="goToPage(pagination.currentPage)">
              Refrescar cola
            </AppButton>
            <AppButton size="sm" :disabled="isConfirming === selectedSale.id" @click="confirmSelectedSale">
              {{ isConfirming === selectedSale.id ? 'Confirmando...' : 'Confirmar deposito y liberar comisiones' }}
            </AppButton>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.bank-validation {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bank-validation__hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: end;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f2f8ff 0%, #ffffff 48%, #fff8ef 100%);
  border: 1px solid rgba(26, 58, 92, 0.08);
}

.bank-validation__eyebrow {
  margin: 0 0 8px;
  color: #8c5f2c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.bank-validation__title {
  margin: 0;
  color: #162033;
  font-size: clamp(1.8rem, 2.8vw, 2.4rem);
  line-height: 1;
}

.bank-validation__subtitle,
.bank-validation__section-copy,
.queue-card__copy,
.detail-card__copy,
.commission-box__head p,
.bank-validation__pagination,
.bank-validation__state {
  color: #5f6b7c;
  font-size: 0.92rem;
  line-height: 1.5;
}

.bank-validation__hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.bank-validation__search {
  min-width: 280px;
  padding: 12px 14px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(255, 255, 255, 0.92);
  color: #162033;
  outline: none;
}

.bank-validation__summary-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-card {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card--ocean {
  background: linear-gradient(135deg, #0f3f70, #1b5fa1);
  color: #f8fbff;
}

.summary-card--gold {
  background: linear-gradient(135deg, #fff3df, #fffaf3);
  border-color: rgba(140, 95, 44, 0.18);
  color: #5b3a11;
}

.summary-card--slate {
  background: linear-gradient(135deg, #eff2f7, #ffffff);
  border-color: rgba(15, 23, 42, 0.08);
  color: #162033;
}

.summary-card__label {
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-card__value {
  font-size: clamp(1.4rem, 2vw, 2rem);
  line-height: 1;
}

.summary-card__caption {
  opacity: 0.82;
}

.bank-validation__alert {
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 0.9rem;
}

.bank-validation__alert--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.bank-validation__alert--success {
  background: #effcf3;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.bank-validation__workspace {
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  gap: 18px;
}

.bank-validation__queue,
.bank-validation__detail {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bank-validation__section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.bank-validation__section-title,
.detail-card__title,
.commission-box__head h5 {
  margin: 0;
  color: #162033;
}

.bank-validation__count-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f2f8ff;
  color: #1b5fa1;
  font-size: 0.78rem;
  font-weight: 700;
}

.bank-validation__queue-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.queue-card {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fcfdff;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-card--active {
  border-color: rgba(27, 95, 161, 0.32);
  background: linear-gradient(135deg, #edf5ff, #ffffff);
  box-shadow: 0 14px 32px rgba(27, 95, 161, 0.12);
}

.queue-card__head,
.queue-card__meta,
.detail-card__hero,
.commission-box__head,
.detail-card__actions,
.commission-list__item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.queue-card__head,
.detail-card__amount-box strong {
  color: #162033;
}

.queue-card__meta {
  font-size: 0.8rem;
  color: #7a8699;
  flex-wrap: wrap;
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-card__eyebrow {
  margin: 0 0 4px;
  color: #8c5f2c;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.detail-card__amount-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #102b47, #0f3f70);
  color: #f7fbff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.detail-grid__item {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
}

.detail-grid__item dt {
  color: #7a8699;
  font-size: 0.78rem;
  margin-bottom: 6px;
}

.detail-grid__item dd {
  margin: 0;
  color: #162033;
  font-weight: 600;
}

.commission-box {
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fffaf2, #ffffff);
  border: 1px solid rgba(140, 95, 44, 0.14);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.commission-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.commission-list__item {
  padding-top: 10px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.commission-list__item:first-child {
  padding-top: 0;
  border-top: 0;
}

.commission-box__empty {
  margin: 0;
  color: #7a8699;
}

.bank-validation__pagination {
  justify-content: center;
}

@media (max-width: 1180px) {
  .bank-validation__summary-grid,
  .bank-validation__workspace,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .bank-validation__hero,
  .bank-validation__hero-actions,
  .queue-card__head,
  .queue-card__meta,
  .detail-card__hero,
  .commission-box__head,
  .detail-card__actions,
  .commission-list__item {
    flex-direction: column;
    align-items: stretch;
  }

  .bank-validation__search {
    min-width: 0;
    width: 100%;
  }
}
</style>