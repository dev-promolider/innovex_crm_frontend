<script setup lang="ts">
import { Languages } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/shared/AppButton.vue'
import { useLocalePreference } from '@/composables/useLocalePreference'

const { t } = useI18n()
const { locale, setLocale, useBrowserLocale } = useLocalePreference()

const browserLanguage = typeof navigator === 'undefined' ? 'es' : navigator.language
</script>

<template>
  <section class="locale-card">
    <div class="locale-card__header">
      <div>
        <p class="locale-card__eyebrow">{{ t('locale.title') }}</p>
        <h2 class="locale-card__title">{{ t('locale.title') }}</h2>
        <p class="locale-card__subtitle">
          {{ t('locale.subtitle') }}
        </p>
      </div>

      <div class="locale-card__badge">
        <Languages class="size-4" />
        {{ t('locale.current', { language: locale === 'es' ? t('locale.spanish') : t('locale.english') }) }}
      </div>
    </div>

    <div class="locale-card__options">
      <button type="button" class="locale-option" @click="useBrowserLocale">
        <div>
          <strong>{{ t('locale.browser') }}</strong>
          <p>{{ t('locale.browserHelp') }}</p>
        </div>
        <span class="locale-option__meta">{{ browserLanguage }}</span>
      </button>

      <div class="locale-card__actions">
        <AppButton type="button" :variant="locale === 'es' ? 'primary' : 'secondary'" @click="setLocale('es')">
          {{ t('locale.spanish') }}
        </AppButton>

        <AppButton type="button" :variant="locale === 'en' ? 'primary' : 'secondary'" @click="setLocale('en')">
          {{ t('locale.english') }}
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.locale-card {
  border-radius: 28px;
  border: 1px solid rgba(24, 42, 67, 0.1);
  background:
    radial-gradient(circle at top right, rgba(244, 180, 0, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(247, 250, 253, 0.95));
  box-shadow: 0 24px 60px rgba(31, 53, 84, 0.08);
  padding: 28px;
}

.locale-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.locale-card__eyebrow {
  margin: 0 0 8px;
  color: #9a6b2f;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.locale-card__title {
  margin: 0;
  color: #122033;
  font-size: 1.55rem;
}

.locale-card__subtitle {
  margin: 8px 0 0;
  max-width: 58ch;
  color: #5d697d;
  font-size: 0.95rem;
  line-height: 1.6;
}

.locale-card__badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #314760;
  font-size: 0.82rem;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
}

.locale-card__options {
  display: grid;
  gap: 16px;
}

.locale-option {
  width: 100%;
  border: 0;
  border-radius: 20px;
  padding: 18px;
  text-align: left;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
}

.locale-option strong {
  color: #122033;
}

.locale-option p {
  margin: 8px 0 0;
  color: #5d697d;
  font-size: 0.9rem;
}

.locale-option__meta {
  align-self: center;
  color: #47627f;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
}

.locale-card__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .locale-card {
    padding: 20px;
  }

  .locale-card__header {
    flex-direction: column;
  }
}
</style>
