<script setup lang="ts">
import AppIcon from './AppIcon.vue'

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
</script>

<template>
  <header class="app-topbar">
    <div class="app-topbar__left">
      <button type="button" class="app-topbar__menu" @click="$emit('toggleMenu')">
        <AppIcon name="menu" :size="20" />
      </button>
      <div class="app-topbar__heading">
        <div class="app-topbar__section">
          <span class="app-topbar__eyebrow">Panel actual</span>
          <strong class="app-topbar__title">{{ sectionLabel }}</strong>
          <span v-if="sectionDescription" class="app-topbar__description">{{ sectionDescription }}</span>
        </div>
        <div class="app-topbar__breadcrumb">
          <slot name="breadcrumb">
            <span>Inicio</span>
          </slot>
        </div>
      </div>
    </div>

    <div v-if="showSearch" class="app-topbar__center">
      <label class="app-topbar__search">
        <AppIcon name="search" :size="15" />
        <input :placeholder="searchPlaceholder" type="text" class="app-topbar__search-input" />
      </label>
    </div>

    <div class="app-topbar__right">
      <div class="app-topbar__user">
        <div class="app-topbar__avatar">
          <img v-if="avatarImageSrc" :src="avatarImageSrc" :alt="userName" class="app-topbar__avatar-image" />
          <span v-else>{{ userInitial }}</span>
        </div>
        <div class="app-topbar__meta">
          <span class="app-topbar__name">{{ userName }}</span>
          <span class="app-topbar__email">{{ userEmail }}</span>
        </div>
      </div>

      <button type="button" class="app-topbar__notifications">
        <AppIcon name="notification" :size="18" />
        <span class="app-topbar__badge">{{ notificationCount }}</span>
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
  grid-template-columns: minmax(220px, auto) minmax(200px, 1fr) auto;
  align-items: center;
  gap: 18px;
  min-height: 92px;
  margin: 18px var(--shell-content-gutter) 0;
  padding: 18px 22px;
  background: linear-gradient(135deg, rgba(18, 31, 49, 0.96), rgba(25, 43, 67, 0.94));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(93, 126, 168, 0.22);
  border-radius: 22px;
  box-shadow: 0 18px 42px rgba(10, 19, 34, 0.12);
}

.app-topbar__left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.app-topbar__heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.app-topbar__section {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.app-topbar__menu {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: #f1f7ff;
  cursor: pointer;
}

.app-topbar__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8db0da;
}

.app-topbar__title {
  font-size: 20px;
  line-height: 1.1;
  color: #ffffff;
}

.app-topbar__description {
  font-size: 12px;
  color: #9bb4d4;
}

.app-topbar__breadcrumb {
  font-size: 12px;
  color: #7d94b3;
}

.app-topbar__breadcrumb :deep(strong) {
  color: #ffffff;
}

.app-topbar__breadcrumb :deep(a) {
  color: #7ec1ff;
  text-decoration: none;
}

.app-topbar__breadcrumb :deep(a:hover) {
  text-decoration: underline;
}

.app-topbar__center {
  display: flex;
  justify-content: center;
}

.app-topbar__search {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(100%, 360px);
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #91aac9;
  box-shadow: inset 0 0 0 1px rgba(116, 145, 182, 0.16);
}

.app-topbar__search-input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #f4f8fd;
  font: inherit;
  font-size: 13px;
}

.app-topbar__search-input::placeholder {
  color: #91aac9;
}

.app-topbar__right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.app-topbar__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-topbar__avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(10, 42, 82, 0.24);
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
}

.app-topbar__name {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.app-topbar__email {
  font-size: 11px;
  color: #9eb4d0;
}

.app-topbar__notifications {
  position: relative;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: #f1f7ff;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(116, 145, 182, 0.16);
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

@media (max-width: 768px) {
  .app-topbar {
    grid-template-columns: 1fr auto;
    min-height: 76px;
    margin: 12px 12px 0;
    padding: 14px 16px;
  }

  .app-topbar__menu {
    display: inline-flex;
  }

  .app-topbar__center,
  .app-topbar__meta,
  .app-topbar__description,
  .app-topbar__breadcrumb {
    display: none;
  }

  .app-topbar__title {
    font-size: 17px;
  }
}
</style>