<script setup lang="ts">
import { shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import AppSearchInput from '../shared/AppSearchInput.vue'

withDefaults(
  defineProps<{
    userName: string
    userEmail: string
    userInitial: string
    sectionLabel: string
    sectionDescription?: string
    notificationCount?: number | string
    avatarImageSrc?: string
    searchPlaceholder?: string
    showSearch?: boolean
  }>(),
  {
    notificationCount: 1,
    avatarImageSrc: undefined,
    searchPlaceholder: 'Buscar...',
    showSearch: true,
  },
)

defineEmits<{
  toggleMenu: []
}>()

const { t } = useI18n()
const searchQuery = shallowRef('')
const router = useRouter()

const goToProfile = () => {
  router.push({ name: 'perfil' })
}
</script>

<template>
  <header class="app-topbar">
    <div class="app-topbar__left">
      <button type="button" class="app-topbar__menu" :aria-label="t('common.openNavigation')" @click="$emit('toggleMenu')">
        <AppIcon name="menu" :size="20" />
      </button>

      <div class="app-topbar__heading">
        <div class="app-topbar__breadcrumb">
          <slot name="breadcrumb">
            <span>{{ t('common.home') }}</span>
          </slot>
        </div>

        <div class="app-topbar__section">
          <strong class="app-topbar__title">{{ sectionLabel }}</strong>
          <span v-if="sectionDescription" class="app-topbar__description">{{ sectionDescription }}</span>
        </div>
      </div>
    </div>

    <div v-if="showSearch" class="app-topbar__center">
      <AppSearchInput
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
        class="app-topbar__search-control"
      />
    </div>

    <div class="app-topbar__right">
      <button type="button" class="app-topbar__notifications" :aria-label="t('common.notifications')">
        <AppIcon name="notification" :size="18" />
        <span class="app-topbar__badge">{{ notificationCount }}</span>
      </button>

      <button
        type="button"
        class="app-topbar__user"
        :aria-label="t('common.openProfile')"
        @click="goToProfile"
      >
        <div class="app-topbar__avatar" aria-hidden="true">
          <img v-if="avatarImageSrc" :src="avatarImageSrc" :alt="userName" class="app-topbar__avatar-image" />
          <span v-else>{{ userInitial }}</span>
        </div>

        <div class="app-topbar__meta">
          <span class="app-topbar__name">{{ userName }}</span>
          <span class="app-topbar__email">{{ userEmail }}</span>
        </div>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-topbar {
  position: sticky;
  top: 0;
  z-index: 160;
  display: grid;
   grid-template-columns: minmax(240px, 1.2fr) minmax(220px, 0.9fr) auto;
   align-items: center;
   gap: 16px;
   min-height: 84px;
   margin: 16px var(--shell-content-gutter) 0;
   padding: 16px 18px;
   background: rgba(255, 255, 255, 0.78);
   backdrop-filter: blur(16px);
   border: 1px solid rgba(203, 213, 225, 0.82);
   border-radius: 20px;
   box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.app-topbar__left {
  display: flex;
   align-items: center;
   gap: 12px;
   min-width: 0;
}

.app-topbar__heading {
  display: flex;
  flex-direction: column;
   gap: 6px;
   min-width: 0;
}

.app-topbar__section {
  display: flex;
  flex-direction: column;
   gap: 2px;
}

.app-topbar__menu {
   display: none;
   align-items: center;
   justify-content: center;
   width: 40px;
   height: 40px;
   border: 0;
   border-radius: 12px;
   background: #eff4fa;
   color: #274a6d;
   cursor: pointer;
   box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.22);
}

.app-topbar__title {
   font-size: 22px;
   line-height: 1.1;
   color: #0f172a;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.app-topbar__description {
   font-size: 12px;
   color: #64748b;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.app-topbar__breadcrumb {
   width: fit-content;
   max-width: 100%;
   padding: 6px 10px;
   border-radius: 999px;
   font-size: 12px;
   color: #47627f;
   background: #f3f7fb;
   box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.app-topbar__breadcrumb :deep(strong) {
   color: #0f172a;
}

.app-topbar__breadcrumb :deep(a) {
   color: #2563eb;
   text-decoration: none;
}

.app-topbar__breadcrumb :deep(a:hover) {
  text-decoration: underline;
}

.app-topbar__center {
   display: flex;
   justify-content: center;
   min-width: 0;
}

.app-topbar__search-control {
   width: min(100%, 360px);
}

.app-topbar__right {
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 12px;
}

.app-topbar__user {
   border: 0;
   display: flex;
   align-items: center;
   gap: 10px;
   min-width: 0;
   padding: 8px 10px 8px 8px;
   border-radius: 16px;
   background: #f8fbff;
   box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
   cursor: pointer;
   transition: transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.app-topbar__user:hover {
   background: #f2f7fd;
   box-shadow:
     inset 0 0 0 1px rgba(90, 132, 182, 0.18),
     0 12px 28px rgba(15, 23, 42, 0.08);
}

.app-topbar__user:focus-visible {
   outline: 2px solid #2263e5;
   outline-offset: 3px;
}

.app-topbar__user:active {
   transform: scale(0.99);
}

.app-topbar__avatar {
   width: 42px;
   height: 42px;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 50%;
   overflow: hidden;
   background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
   color: #ffffff;
   font-weight: 700;
   box-shadow: 0 8px 18px rgba(10, 42, 82, 0.14);
}

.app-topbar__avatar-image {
   width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-topbar__meta {
   display: flex;
   flex-direction: column;
   gap: 2px;
   min-width: 0;
}

.app-topbar__name {
   font-size: 13px;
   font-weight: 700;
   color: #0f172a;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.app-topbar__email {
   font-size: 11px;
   color: #64748b;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
}

.app-topbar__notifications {
   position: relative;
   width: 40px;
   height: 40px;
   border: 0;
   border-radius: 14px;
   background: #f3f7fb;
   color: #294765;
   cursor: pointer;
   box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
}

.app-topbar__badge {
   position: absolute;
   top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 999px;
  background: #ff7a59;
  color: #ffffff;
  font-size: 10px;
   font-weight: 700;
}

@media (max-width: 1100px) {
   .app-topbar {
     grid-template-columns: minmax(0, 1fr) auto;
   }

   .app-topbar__center {
     display: none;
   }
}

@media (max-width: 768px) {
   .app-topbar {
     grid-template-columns: 1fr auto;
     min-height: 74px;
     margin: 12px 12px 0;
     padding: 14px 14px;
     border-radius: 18px;
   }

   .app-topbar__menu {
     display: inline-flex;
   }

   .app-topbar__meta,
   .app-topbar__description {
     display: none;
   }

   .app-topbar__title {
     font-size: 17px;
   }

   .app-topbar__breadcrumb {
     max-width: 100%;
     font-size: 11px;
     padding: 5px 8px;
   }

   .app-topbar__user {
     padding: 4px;
     background: transparent;
     box-shadow: none;
   }
}
</style>
