<script setup lang="ts">
import { onMounted } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import ProfilePage from '@/features/profile/components/ProfilePage.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

onMounted(() => window.scrollTo(0, 0))
</script>

<template>
  <AppShell :show-search="false">
    <template #breadcrumb>
      <span class="breadcrumb">{{ t('common.home') }} · <strong>{{ t('profile.breadcrumb') }}</strong></span>
    </template>

    <div class="perfil-view">
      <div class="perfil-view__hero">
        <p class="perfil-view__eyebrow">{{ t('profile.heroEyebrow') }}</p>
        <h1 class="perfil-view__title">{{ t('profile.heroTitle') }}</h1>
        <p class="perfil-view__subtitle">
          {{ t('profile.heroSubtitle') }}
        </p>
      </div>

      <ProfilePage />
    </div>
  </AppShell>
</template>

<style scoped>
.perfil-view {
  width: 100%;
  padding: 24px 28px 32px;
  box-sizing: border-box;
}

.perfil-view__hero {
  margin-bottom: 24px;
}

.perfil-view__eyebrow {
  margin: 0 0 8px;
  color: #9a6b2f;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.perfil-view__title {
  margin: 0;
  color: #122033;
  font-size: clamp(1.8rem, 2vw + 1rem, 2.4rem);
  line-height: 1.05;
}

.perfil-view__subtitle {
  margin: 8px 0 0;
  max-width: 58ch;
  color: #5d697d;
  font-size: 1rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .perfil-view {
    padding: 16px 16px 24px;
  }

  .perfil-view__hero {
    margin-bottom: 16px;
  }
}
</style>
