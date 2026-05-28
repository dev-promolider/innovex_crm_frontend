<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'

interface Props {
  open: boolean
  receiptUrl: string
  receiptLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  receiptLabel: 'Comprobante de venta',
})

const emit = defineEmits<{
  close: []
}>()

const normalizedReceiptUrl = computed(() => props.receiptUrl.trim())

const fileExtension = computed(() => {
  const normalizedUrl = normalizedReceiptUrl.value.toLowerCase()
  const sanitizedUrl = normalizedUrl.split('#')[0]?.split('?')[0] ?? ''
  const segments = sanitizedUrl.split('.')

  return segments.length > 1 ? segments.pop() ?? '' : ''
})

const isImageReceipt = computed(() => ['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension.value))
const isPdfReceipt = computed(() => fileExtension.value === 'pdf')
const canOpenOriginal = computed(() => normalizedReceiptUrl.value.length > 0)

const previewDescription = computed(() => {
  if (isImageReceipt.value) {
    return 'Revisa comprobante cargado para esta venta y abre archivo original si necesitas mas detalle.'
  }

  if (isPdfReceipt.value) {
    return 'Archivo PDF detectado. Usa accion externa para revisar comprobante original.'
  }

  return 'Tipo de archivo no compatible con vista previa embebida. Abre archivo original para revisarlo.'
})

const requestClose = () => {
  emit('close')
}
</script>

<template>
  <AppModal
    :open="open"
    :title="receiptLabel"
    :description="previewDescription"
    size="xl"
    @close="requestClose"
  >
    <div class="receipt-preview">
      <img
        v-if="isImageReceipt"
        :src="normalizedReceiptUrl"
        :alt="receiptLabel"
        class="receipt-preview__image"
      />

      <div v-else class="receipt-preview__fallback">
        <div class="receipt-preview__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8" />
            <path d="M8 17h5" />
          </svg>
        </div>
        <strong class="receipt-preview__fallback-title">
          {{ isPdfReceipt ? 'Vista previa PDF no habilitada' : 'Vista previa no disponible' }}
        </strong>
        <p class="receipt-preview__fallback-copy">
          {{ previewDescription }}
        </p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="receipt-preview__secondary" @click="requestClose">
        Cerrar
      </button>
      <a
        v-if="canOpenOriginal"
        :href="normalizedReceiptUrl"
        target="_blank"
        rel="noreferrer"
        class="receipt-preview__primary"
      >
        Abrir original
      </a>
    </template>
  </AppModal>
</template>

<style scoped>
.receipt-preview {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background:
    radial-gradient(circle at top left, rgba(26, 106, 181, 0.12), transparent 34%),
    linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
  border: 1px solid #dbe7f3;
  overflow: hidden;
}

.receipt-preview__image {
  display: block;
  width: 100%;
  max-height: min(72vh, 920px);
  object-fit: contain;
  background: #fff;
}

.receipt-preview__fallback {
  width: 100%;
  max-width: 420px;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
}

.receipt-preview__icon {
  width: 64px;
  height: 64px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #fff;
  color: #1a6ab5;
  box-shadow: 0 16px 36px rgba(26, 106, 181, 0.14);
}

.receipt-preview__icon svg {
  width: 30px;
  height: 30px;
}

.receipt-preview__fallback-title {
  color: #172033;
  font-size: 16px;
}

.receipt-preview__fallback-copy {
  margin: 0;
  color: #5a6a7f;
  font-size: 13px;
  line-height: 1.6;
}

.receipt-preview__primary,
.receipt-preview__secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.receipt-preview__primary {
  border: 1px solid #1a6ab5;
  background: #1a6ab5;
  color: #fff;
}

.receipt-preview__secondary {
  border: 1px solid #d7dfeb;
  background: #fff;
  color: #516072;
}

@media (max-width: 768px) {
  .receipt-preview {
    min-height: 240px;
  }

  .receipt-preview__fallback {
    padding: 28px 20px;
  }

  .receipt-preview__primary,
  .receipt-preview__secondary {
    width: 100%;
  }
}
</style>