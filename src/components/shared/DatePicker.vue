<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  modelValue: string
  min?: string
  max?: string
  label?: string
  id?: string
  required?: boolean
  invalid?: boolean
  errorMessage?: string
  disabled?: boolean
  rangeStart?: string
  rangeEnd?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  min: '',
  max: '',
  label: '',
  id: undefined,
  required: false,
  invalid: false,
  errorMessage: '',
  disabled: false,
  rangeStart: '',
  rangeEnd: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.id || `date-picker-${Math.random().toString(36).slice(2)}`)
const popupId = computed(() => `${inputId.value}-calendar`)
const inputElement = ref<HTMLInputElement | null>(null)
const rootElement = ref<HTMLElement | null>(null)
const popupElement = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const viewMode = ref<'days' | 'months'>('days')
const draft = ref('')
const manualError = ref('')
const activeDate = ref(new Date())
const visibleMonth = ref(new Date())
const popupPosition = ref({ top: 0, left: 0, width: 320 })

const parseISODate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? date
    : null
}

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const toDisplayDate = (value: string) => {
  const date = parseISODate(value)
  return date
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    : ''
}

const formatHeaderMonth = (date: Date) =>
  new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date)

const displayedError = computed(() => props.errorMessage || manualError.value)
const hasError = computed(() => props.invalid || Boolean(manualError.value))
const monthLabel = computed(() => formatHeaderMonth(visibleMonth.value))
const yearLabel = computed(() => String(visibleMonth.value.getFullYear()))

const calendarDays = computed(() => {
  const firstOfMonth = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth(), 1)
  const offset = (firstOfMonth.getDay() + 6) % 7
  const firstVisibleDay = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - offset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstVisibleDay.getFullYear(), firstVisibleDay.getMonth(), firstVisibleDay.getDate() + index)
    const iso = toISODate(date)
    return {
      date,
      iso,
      day: date.getDate(),
      otherMonth: date.getMonth() !== visibleMonth.value.getMonth(),
      selected: iso === props.modelValue,
      today: iso === toISODate(new Date()),
      inRange: Boolean(props.rangeStart && props.rangeEnd)
        && iso >= props.rangeStart
        && iso <= props.rangeEnd,
      disabled: (Boolean(props.min) && iso < props.min) || (Boolean(props.max) && iso > props.max),
    }
  })
})

const months = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(2020, index, 1)),
)

watch(
  () => props.modelValue,
  (value) => {
    draft.value = toDisplayDate(value)
    manualError.value = ''
    const selected = parseISODate(value)
    if (selected) {
      activeDate.value = selected
      visibleMonth.value = new Date(selected.getFullYear(), selected.getMonth(), 1)
    }
  },
  { immediate: true },
)

const updatePopupPosition = () => {
  const rect = inputElement.value?.getBoundingClientRect()
  if (!rect) return

  const viewportPadding = 12
  const width = Math.min(320, window.innerWidth - viewportPadding * 2)
  const left = Math.min(
    Math.max(viewportPadding, rect.left),
    window.innerWidth - width - viewportPadding,
  )
  const estimatedHeight = Math.min(
    viewMode.value === 'days' ? 380 : 330,
    window.innerHeight - viewportPadding * 2,
  )
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const openAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow
  popupPosition.value = {
    top: openAbove
      ? Math.max(viewportPadding, rect.top - estimatedHeight - 6)
      : Math.max(
        viewportPadding,
        Math.min(window.innerHeight - estimatedHeight - viewportPadding, rect.bottom + 6),
      ),
    left,
    width,
  }
}

const onDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target as Node
  if (!rootElement.value?.contains(target) && !popupElement.value?.contains(target)) {
    closeCalendar()
  }
}

const onWindowChange = () => updatePopupPosition()

const closeCalendar = () => {
  isOpen.value = false
  viewMode.value = 'days'
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, true)
}

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    closeCalendar()
    inputElement.value?.focus()
  }
}

const openCalendar = async () => {
  if (props.disabled || isOpen.value) return
  const current = parseISODate(props.modelValue) || new Date()
  activeDate.value = current
  visibleMonth.value = new Date(current.getFullYear(), current.getMonth(), 1)
  isOpen.value = true
  await nextTick()
  updatePopupPosition()
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeydown)
  window.addEventListener('resize', onWindowChange)
  window.addEventListener('scroll', onWindowChange, true)
}

const selectDate = (value: string) => {
  if (value && ((props.min && value < props.min) || (props.max && value > props.max))) return
  emit('update:modelValue', value)
  draft.value = toDisplayDate(value)
  manualError.value = ''
  closeCalendar()
  inputElement.value?.focus()
}

const parseManualDate = () => {
  const value = draft.value.trim()
  if (!value) {
    manualError.value = ''
    emit('update:modelValue', '')
    return
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) {
    manualError.value = 'Escribe la fecha como dd/mm/aaaa.'
    return
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    manualError.value = 'Escribe una fecha válida.'
    return
  }

  const iso = toISODate(date)
  if ((props.min && iso < props.min) || (props.max && iso > props.max)) {
    manualError.value = 'La fecha debe estar dentro del rango permitido.'
    return
  }

  manualError.value = ''
  emit('update:modelValue', iso)
}

const changeMonth = (amount: number) => {
  const date = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() + amount, 1)
  visibleMonth.value = date
  activeDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  updatePopupPosition()
}

const changeYear = (amount: number) => {
  const date = new Date(visibleMonth.value.getFullYear() + amount, visibleMonth.value.getMonth(), 1)
  visibleMonth.value = date
  activeDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
}

const chooseMonth = (month: number) => {
  visibleMonth.value = new Date(visibleMonth.value.getFullYear(), month, 1)
  activeDate.value = new Date(visibleMonth.value.getFullYear(), month, 1)
  viewMode.value = 'days'
  updatePopupPosition()
}

const onCalendarKeydown = (event: KeyboardEvent) => {
  if (viewMode.value !== 'days') {
    if (event.key === 'Escape') {
      event.preventDefault()
      viewMode.value = 'days'
    }
    return
  }

  let nextDate: Date | null = null
  if (event.key === 'ArrowLeft') nextDate = new Date(activeDate.value.getFullYear(), activeDate.value.getMonth(), activeDate.value.getDate() - 1)
  if (event.key === 'ArrowRight') nextDate = new Date(activeDate.value.getFullYear(), activeDate.value.getMonth(), activeDate.value.getDate() + 1)
  if (event.key === 'ArrowUp') nextDate = new Date(activeDate.value.getFullYear(), activeDate.value.getMonth(), activeDate.value.getDate() - 7)
  if (event.key === 'ArrowDown') nextDate = new Date(activeDate.value.getFullYear(), activeDate.value.getMonth(), activeDate.value.getDate() + 7)
  if (event.key === 'PageUp') {
    event.preventDefault()
    changeMonth(event.shiftKey ? -12 : -1)
    return
  }
  if (event.key === 'PageDown') {
    event.preventDefault()
    changeMonth(event.shiftKey ? 12 : 1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    selectDate(toISODate(activeDate.value))
    return
  }
  if (nextDate) {
    event.preventDefault()
    activeDate.value = nextDate
    visibleMonth.value = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1)
    updatePopupPosition()
    const nextISODate = toISODate(nextDate)
    void nextTick(() => {
      popupElement.value
        ?.querySelector<HTMLButtonElement>(`[data-date="${nextISODate}"]`)
        ?.focus()
    })
  }
}

const onInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    closeCalendar()
    return
  }
  if (event.key === 'ArrowDown' && !isOpen.value) {
    event.preventDefault()
    openCalendar()
  } else if (isOpen.value) {
    onCalendarKeydown(event)
  }
}

onBeforeUnmount(() => closeCalendar())
</script>

<template>
  <div ref="rootElement" class="date-picker">
    <label v-if="label" class="date-picker-label" :for="inputId">{{ label }}</label>
    <div class="date-picker-control" :class="{ 'is-invalid': hasError, 'is-disabled': disabled }">
      <input
        :id="inputId"
        ref="inputElement"
        v-model="draft"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder="Selecciona una fecha"
        :required="required"
        :disabled="disabled"
        :aria-invalid="hasError"
        :aria-describedby="displayedError ? `${inputId}-error` : undefined"
        :aria-expanded="isOpen"
        :aria-controls="popupId"
        @click="openCalendar"
        @input="manualError = ''"
        @change="parseManualDate"
        @blur="parseManualDate"
        @keydown="onInputKeydown"
      />
      <button
        type="button"
        class="calendar-trigger"
        :disabled="disabled"
        :aria-label="`Abrir calendario${label ? ` para ${label}` : ''}`"
        :aria-expanded="isOpen"
        :aria-controls="popupId"
        @click="isOpen ? closeCalendar() : openCalendar()"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      </button>
    </div>
    <span v-if="displayedError" :id="`${inputId}-error`" class="date-picker-error" role="alert">
      {{ displayedError }}
    </span>

    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="popupId"
        ref="popupElement"
        class="date-picker-popup"
        role="dialog"
        :aria-label="`Calendario${label ? `: ${label}` : ''}`"
        :style="{
          top: `${popupPosition.top}px`,
          left: `${popupPosition.left}px`,
          width: `${popupPosition.width}px`,
        }"
        @keydown="onCalendarKeydown"
      >
        <div v-if="viewMode === 'days'" class="calendar-days-view">
          <div class="calendar-header">
            <button type="button" class="calendar-nav" aria-label="Mes anterior" @click="changeMonth(-1)">
              ‹
            </button>
            <button
              type="button"
              class="calendar-month-title"
              :aria-label="`Elegir mes y año: ${monthLabel} ${yearLabel}`"
              @click="viewMode = 'months'"
            >
              {{ monthLabel }} {{ yearLabel }}
            </button>
            <button type="button" class="calendar-nav" aria-label="Mes siguiente" @click="changeMonth(1)">
              ›
            </button>
          </div>
          <div class="calendar-weekdays" aria-hidden="true">
            <span v-for="weekday in ['L', 'M', 'X', 'J', 'V', 'S', 'D']" :key="weekday">{{ weekday }}</span>
          </div>
          <div class="calendar-grid" role="grid">
            <button
              v-for="day in calendarDays"
              :key="day.iso"
              type="button"
              class="calendar-day"
              :class="{
                'is-other-month': day.otherMonth,
                'is-today': day.today,
                'is-selected': day.selected,
                'is-in-range': day.inRange,
              }"
              :disabled="day.disabled"
              :tabindex="day.iso === toISODate(activeDate) ? 0 : -1"
              :data-date="day.iso"
              :aria-label="day.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })"
              :aria-selected="day.selected"
              role="gridcell"
              @focus="activeDate = day.date"
              @click="selectDate(day.iso)"
            >
              {{ day.day }}
            </button>
          </div>
        </div>
        <div v-else class="calendar-months-view">
          <div class="calendar-header">
            <button type="button" class="calendar-nav" aria-label="Año anterior" @click="changeYear(-1)">‹</button>
            <span class="calendar-month-title">{{ yearLabel }}</span>
            <button type="button" class="calendar-nav" aria-label="Año siguiente" @click="changeYear(1)">›</button>
          </div>
          <div class="calendar-month-grid">
            <button
              v-for="(month, index) in months"
              :key="month"
              type="button"
              class="calendar-month-option"
              :class="{ 'is-current-month': index === visibleMonth.getMonth() }"
              @click="chooseMonth(index)"
            >
              {{ month }}
            </button>
          </div>
        </div>
        <div class="calendar-footer">
          <button type="button" class="calendar-footer-button" :disabled="Boolean((props.min && toISODate(new Date()) < props.min) || (props.max && toISODate(new Date()) > props.max))" @click="selectDate(toISODate(new Date()))">
            Hoy
          </button>
          <button type="button" class="calendar-footer-button" @click="selectDate('')">Limpiar</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.date-picker {
  width: 100%;
}

.date-picker-label {
  display: block;
  margin-bottom: 6px;
  color: #555;
  font-size: 12px;
  font-weight: 600;
}

.date-picker-control {
  display: flex;
  width: 100%;
  height: 36px;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.date-picker-control:focus-within {
  border-color: #4ab8f5;
  box-shadow: 0 0 0 2px rgba(74, 184, 245, 0.16);
}

.date-picker-control.is-invalid {
  border-color: #ef4444;
}

.date-picker-control.is-disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.date-picker-control input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  padding: 0 12px;
  background: transparent;
  color: #333;
  font: inherit;
  font-size: 13px;
}

.date-picker-control input::placeholder {
  color: #94a3b8;
}

.date-picker-control input:disabled {
  cursor: not-allowed;
}

.calendar-trigger {
  display: grid;
  width: 38px;
  flex: 0 0 38px;
  place-items: center;
  border: 0;
  background: transparent;
  color: #7eb8e8;
  cursor: pointer;
}

.calendar-trigger:focus-visible,
.date-picker-popup button:focus-visible {
  outline: 2px solid #1768b8;
  outline-offset: 2px;
}

.calendar-trigger:disabled {
  cursor: not-allowed;
}

.calendar-trigger svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.date-picker-error {
  display: block;
  margin-top: 4px;
  color: #ef4444;
  font-size: 11px;
}

.date-picker-popup {
  position: fixed;
  z-index: 10000;
  box-sizing: border-box;
  max-height: calc(100vh - 24px);
  max-width: calc(100vw - 24px);
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.2);
  color: #334155;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  margin-bottom: 8px;
}

.calendar-nav,
.calendar-month-title,
.calendar-footer-button,
.calendar-month-option {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.calendar-nav {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  color: #1768b8;
  font-size: 24px;
  line-height: 1;
}

.calendar-nav:hover,
.calendar-month-option:hover {
  background: #eff6ff;
}

.calendar-month-title {
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  text-transform: capitalize;
}

.calendar-month-title:hover {
  background: #f1f5f9;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
}

.calendar-weekdays {
  margin-bottom: 4px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.calendar-weekdays span {
  padding: 5px 0;
}

.calendar-day {
  position: relative;
  display: grid;
  min-width: 0;
  aspect-ratio: 1;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font-size: 12px;
}

.calendar-day:not(:disabled):hover {
  background: #e8f4fd;
}

.calendar-day.is-other-month {
  color: #b6c1ce;
}

.calendar-day.is-today {
  box-shadow: inset 0 0 0 1px #3eb5f5;
}

.calendar-day.is-in-range:not(.is-selected) {
  border-radius: 8px;
  background: #e7f4fc;
}

.calendar-day.is-selected {
  background: linear-gradient(135deg, #3eb5f5, #1768b8);
  color: #fff;
  font-weight: 700;
}

.calendar-day:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
  text-decoration: line-through;
}

.calendar-month-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  padding: 8px 0 12px;
}

.calendar-month-option {
  padding: 10px 4px;
  border-radius: 7px;
  font-size: 12px;
  text-transform: capitalize;
}

.calendar-month-option.is-current-month {
  background: #e7f4fc;
  color: #1768b8;
  font-weight: 700;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #edf1f5;
}

.calendar-footer-button {
  padding: 5px 8px;
  border-radius: 6px;
  color: #1768b8;
  font-size: 12px;
  font-weight: 600;
}

.calendar-footer-button:hover:not(:disabled) {
  background: #eff6ff;
}

.calendar-footer-button:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}
</style>
