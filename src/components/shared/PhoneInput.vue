<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { countries } from '@/utils/countries'
import type { PhoneCountry } from '@/utils/countries'

interface Props {
  modelValue?: string
  defaultCountry?: string
  required?: boolean
  id?: string
  invalid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  defaultCountry: 'PE',
  required: false,
  id: undefined,
  invalid: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = useId()
const inputId = computed(() => props.id || `phone-input-${generatedId}`)
const countryButtonId = computed(() => `${inputId.value}-country`)
const countrySearchId = computed(() => `${inputId.value}-country-search`)
const countryListId = computed(() => `${inputId.value}-country-list`)
const containerRef = ref<HTMLElement | null>(null)
const countryButtonRef = ref<HTMLButtonElement | null>(null)
const countrySearchRef = ref<HTMLInputElement | null>(null)
const selectedCountry = ref<PhoneCountry>(
  countries.find((country) => country.iso === props.defaultCountry)
  ?? countries.find((country) => country.iso === 'PE')!,
)
const phoneDigits = ref('')
const isCountryMenuOpen = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)

const normalizeText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase()

const filteredCountries = computed(() => {
  const query = normalizeText(searchQuery.value.trim())
  if (!query) return countries

  return countries.filter((country) =>
    normalizeText(country.nombre).includes(query)
    || country.prefijo.includes(query)
    || country.iso.toLowerCase().includes(query),
  )
})

const cleanPhoneDigits = (value: string) => value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12)

const countriesForPrefix = (digits: string) => countries
  .filter((country) => digits.startsWith(country.prefijo.slice(1)))
  .sort((first, second) => second.prefijo.length - first.prefijo.length)

const countryForPrefix = (digits: string) => {
  const matches = countriesForPrefix(digits)
  if (matches.length === 0) return null

  return matches.find((country) => country.iso === selectedCountry.value.iso) ?? matches[0]
}

const emitPhoneValue = () => {
  emit('update:modelValue', phoneDigits.value ? `${selectedCountry.value.prefijo}${phoneDigits.value}` : '')
}

const updatePhoneDigits = (value: string, input?: HTMLInputElement) => {
  phoneDigits.value = cleanPhoneDigits(value)
  if (input) input.value = phoneDigits.value
  emitPhoneValue()
}

const applyPastedValue = (value: string, input: HTMLInputElement) => {
  const trimmedValue = value.trim()
  if (trimmedValue.startsWith('+')) {
    const allDigits = trimmedValue.replace(/\D/g, '')
    const matchingCountry = countryForPrefix(allDigits)
    if (matchingCountry) {
      selectedCountry.value = matchingCountry
      const nationalNumber = allDigits.slice(matchingCountry.prefijo.length - 1)
      updatePhoneDigits(nationalNumber, input)
      return
    }
  }

  updatePhoneDigits(trimmedValue, input)
}

const parseModelValue = (value: string) => {
  if (!value) {
    phoneDigits.value = ''
    return
  }

  if (value.startsWith('+')) {
    const allDigits = value.replace(/\D/g, '')
    const matchingCountry = countryForPrefix(allDigits)
    if (matchingCountry) {
      selectedCountry.value = matchingCountry
      phoneDigits.value = cleanPhoneDigits(allDigits.slice(matchingCountry.prefijo.length - 1))
      return
    }
  }

  phoneDigits.value = cleanPhoneDigits(value)
}

watch(() => props.modelValue, parseModelValue, { immediate: true })

watch(() => props.defaultCountry, (iso) => {
  if (!props.modelValue.startsWith('+')) {
    selectedCountry.value = countries.find((country) => country.iso === iso) ?? selectedCountry.value
  }
})

watch(searchQuery, () => {
  activeIndex.value = filteredCountries.value.length > 0 ? 0 : -1
})

const closeCountryMenu = (returnFocus = false) => {
  isCountryMenuOpen.value = false
  searchQuery.value = ''
  if (returnFocus) countryButtonRef.value?.focus()
}

const openCountryMenu = async () => {
  isCountryMenuOpen.value = true
  searchQuery.value = ''
  activeIndex.value = 0
  await nextTick()
  countrySearchRef.value?.focus()
}

const toggleCountryMenu = () => {
  if (isCountryMenuOpen.value) closeCountryMenu()
  else void openCountryMenu()
}

const selectCountry = (country: PhoneCountry) => {
  selectedCountry.value = country
  closeCountryMenu(true)
  emitPhoneValue()
}

const handleCountryButtonKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    void openCountryMenu()
  } else if (event.key === 'Escape' && isCountryMenuOpen.value) {
    event.preventDefault()
    closeCountryMenu(true)
  }
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' && filteredCountries.value.length > 0) {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % filteredCountries.value.length
  } else if (event.key === 'ArrowUp' && filteredCountries.value.length > 0) {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + filteredCountries.value.length) % filteredCountries.value.length
  } else if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    const country = filteredCountries.value[activeIndex.value]
    if (country) selectCountry(country)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeCountryMenu(true)
  }
}

const handleOutsidePointer = (event: PointerEvent) => {
  if (containerRef.value && event.target instanceof Node && !containerRef.value.contains(event.target)) {
    closeCountryMenu()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  const pastedValue = event.clipboardData?.getData('text')
  const input = event.target
  if (!pastedValue || !(input instanceof HTMLInputElement)) return

  event.preventDefault()
  applyPastedValue(pastedValue, input)
}

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutsidePointer))
</script>

<template>
  <div ref="containerRef" class="phone-input" :class="{ 'is-invalid': invalid }">
    <div class="phone-country">
      <button
        :id="countryButtonId"
        ref="countryButtonRef"
        type="button"
        class="phone-country-button"
        :aria-label="`País del teléfono: ${selectedCountry.nombre}`"
        aria-haspopup="listbox"
        :aria-expanded="isCountryMenuOpen"
        :aria-controls="countryListId"
        @click="toggleCountryMenu"
        @keydown="handleCountryButtonKeydown"
      >
        <span>{{ selectedCountry.iso }} {{ selectedCountry.prefijo }}</span>
        <span class="phone-country-chevron" aria-hidden="true" />
      </button>

      <div v-if="isCountryMenuOpen" class="phone-country-menu" @click.stop>
        <input
          :id="countrySearchId"
          ref="countrySearchRef"
          v-model="searchQuery"
          class="phone-country-search"
          type="search"
          role="combobox"
          aria-label="Buscar país por nombre o prefijo"
          aria-autocomplete="list"
          :aria-expanded="isCountryMenuOpen"
          :aria-controls="countryListId"
          :aria-activedescendant="activeIndex >= 0 ? `${countryListId}-${activeIndex}` : undefined"
          placeholder="Buscar país o prefijo"
          @keydown="handleSearchKeydown"
        />
        <div :id="countryListId" class="phone-country-options" role="listbox" :aria-labelledby="countryButtonId">
          <div v-if="filteredCountries.length === 0" class="phone-country-empty">No se encontraron países.</div>
          <div
            v-for="(country, index) in filteredCountries"
            :id="`${countryListId}-${index}`"
            :key="country.iso"
            class="phone-country-option"
            :class="{ 'is-active': index === activeIndex }"
            role="option"
            :aria-selected="country.iso === selectedCountry.iso"
            @pointerdown.prevent
            @mouseenter="activeIndex = index"
            @click="selectCountry(country)"
          >
            <span>{{ country.nombre }}</span>
            <span class="phone-country-option-code">{{ country.iso }} {{ country.prefijo }}</span>
          </div>
        </div>
      </div>
    </div>

    <input
      :id="inputId"
      class="phone-number"
      type="tel"
      inputmode="numeric"
      autocomplete="tel-national"
      :value="phoneDigits"
      :placeholder="selectedCountry.placeholder"
      :required="required"
      :aria-required="required"
      :aria-invalid="invalid"
      aria-label="Número de teléfono"
      maxlength="12"
      @input="updatePhoneDigits(($event.target as HTMLInputElement).value, $event.target as HTMLInputElement)"
      @paste="handlePaste"
    />
  </div>
</template>

<style scoped>
.phone-input {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 40px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  color: #334155;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.phone-input:focus-within {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.phone-input:focus-within :focus-visible {
  outline: none;
}

.phone-input.is-invalid {
  border-color: #dc2626;
}

.phone-country {
  position: relative;
  flex: 0 0 auto;
  height: 100%;
}

.phone-country-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 12px 0 16px;
  border: 0;
  border-right: 1px solid #dbe3ef;
  border-radius: 9px 0 0 9px;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.phone-country-button:focus-visible,
.phone-country-search:focus-visible,
.phone-country-option:focus-visible,
.phone-number:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.45);
  outline-offset: 2px;
  z-index: 1;
}

.phone-country-chevron {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
}

.phone-country-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  width: min(320px, calc(100vw - 32px));
  padding: 8px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
}

.phone-country-search {
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  color: #334155;
  font: inherit;
}

.phone-country-options {
  max-height: 240px;
  overflow-y: auto;
  margin-top: 8px;
}

.phone-country-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
  padding: 8px;
  border-radius: 6px;
  color: #334155;
  font-size: 13px;
  cursor: pointer;
}

.phone-country-option:hover,
.phone-country-option.is-active {
  background: #eff6ff;
}

.phone-country-option-code {
  color: #64748b;
  white-space: nowrap;
}

.phone-country-empty {
  padding: 12px 8px;
  color: #64748b;
  font-size: 13px;
}

.phone-number {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 8px 16px;
  border: 0;
  border-radius: 0 9px 9px 0;
  outline: none;
  background: transparent;
  color: #334155;
  font: inherit;
  font-size: 13px;
}

.phone-number::placeholder {
  color: #94a3b8;
}

@media (max-width: 480px) {
  .phone-input {
    width: 100%;
  }

  .phone-country-button {
    padding-left: 12px;
  }
}
</style>