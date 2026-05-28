<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet'
  size?: 'sm' | 'md'
  iconOnly?: boolean
  block?: boolean
}>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  block: false,
})

const classes = computed(() => [
  'app-button',
  `app-button--${props.variant}`,
  `app-button--${props.size}`,
  {
    'app-button--icon-only': props.iconOnly,
    'app-button--block': props.block,
  },
])
</script>

<template>
  <button :type="props.type" :class="classes">
    <span v-if="$slots.leading" class="app-button__icon app-button__icon--leading" aria-hidden="true">
      <slot name="leading" />
    </span>
    <span v-if="$slots.default" class="app-button__label">
      <slot />
    </span>
    <span v-if="$slots.trailing" class="app-button__icon app-button__icon--trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
  </button>
</template>

<style scoped>
.app-button {
  --app-button-shadow: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.62rem;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  transition:
    background-color 160ms cubic-bezier(0.23, 1, 0.32, 1),
    color 160ms cubic-bezier(0.23, 1, 0.32, 1),
    border-color 160ms cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 160ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}

.app-button:hover:not(:disabled) {
  box-shadow: 0 12px 24px var(--app-button-shadow);
}

.app-button:active:not(:disabled) {
  transform: scale(0.97);
}

.app-button:focus-visible {
  outline: 2px solid #2263e5;
  outline-offset: 3px;
}

.app-button:disabled {
  cursor: not-allowed;
  opacity: 0.56;
  box-shadow: none;
}

.app-button--block {
  width: 100%;
}

.app-button--sm {
  min-height: 38px;
  padding: 0 0.88rem;
  font-size: 0.84rem;
}

.app-button--icon-only {
  width: 42px;
  min-width: 42px;
  padding: 0;
}

.app-button--icon-only.app-button--sm {
  width: 36px;
  min-width: 36px;
}

.app-button--primary {
  --app-button-shadow: rgba(31, 122, 224, 0.22);
  background: linear-gradient(135deg, #1f7ae0 0%, #145fbe 100%);
  color: #fff;
}

.app-button--secondary {
  --app-button-shadow: rgba(26, 49, 87, 0.14);
  background: #17253f;
  color: #f7fbff;
}

.app-button--ghost {
  --app-button-shadow: rgba(26, 49, 87, 0.08);
  border-color: rgba(32, 51, 79, 0.16);
  background: rgba(255, 255, 255, 0.92);
  color: #1c2f4b;
}

.app-button--danger {
  --app-button-shadow: rgba(156, 43, 43, 0.16);
  background: #8f2e2e;
  color: #fff6f6;
}

.app-button--quiet {
  --app-button-shadow: transparent;
  background: transparent;
  color: #365071;
}

.app-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
}

.app-button__label {
  white-space: nowrap;
}
</style>