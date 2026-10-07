<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import AppSearchInput from '../shared/AppSearchInput.vue'

type NotificationItem = {
  id: number | string
  icon: 'notification'
  title: string
  message: string
  relativeTime: string
  read: boolean
}

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
const notificationsOpen = shallowRef(false)
const notificationMenu = ref<HTMLElement | null>(null)
const notificationButton = ref<HTMLButtonElement | null>(null)
const notifications = ref<NotificationItem[]>([])
const unreadCount = computed(() => notifications.value.filter((notification) => !notification.read).length)

const closeNotifications = () => {
  notificationsOpen.value = false
}

const closeOnOutsideClick = (event: PointerEvent) => {
  if (event.target instanceof Node && !notificationMenu.value?.contains(event.target)) {
    closeNotifications()
  }
}

const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && notificationsOpen.value) {
    closeNotifications()
    notificationButton.value?.focus()
  }
}

const markAllAsRead = () => {
  notifications.value = notifications.value.map((notification) => ({ ...notification, read: true }))
}

onMounted(() => {
  document.addEventListener('pointerdown', closeOnOutsideClick)
  document.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutsideClick)
  document.removeEventListener('keydown', closeOnEscape)
})

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
      <div ref="notificationMenu" class="app-topbar__notification-menu">
        <button
          ref="notificationButton"
          type="button"
          class="app-topbar__notifications"
          aria-label="Notificaciones"
          aria-controls="app-topbar-notifications-panel"
          :aria-expanded="notificationsOpen"
          @click="notificationsOpen = !notificationsOpen"
        >
          <AppIcon name="notification" :size="18" />
          <span v-if="unreadCount > 0" class="app-topbar__badge">{{ unreadCount }}</span>
        </button>

        <section
          v-if="notificationsOpen"
          id="app-topbar-notifications-panel"
          class="app-topbar__notifications-panel"
          aria-labelledby="app-topbar-notifications-title"
        >
          <h2 id="app-topbar-notifications-title" class="app-topbar__notifications-title">Notificaciones</h2>

          <ul v-if="notifications.length" class="app-topbar__notification-list">
            <li v-for="notification in notifications" :key="notification.id" class="app-topbar__notification-item">
              <span class="app-topbar__notification-icon" aria-hidden="true">
                <AppIcon :name="notification.icon" :size="18" />
              </span>
              <div class="app-topbar__notification-copy">
                <strong>{{ notification.title }}</strong>
                <p>{{ notification.message }}</p>
                <time>{{ notification.relativeTime }}</time>
              </div>
            </li>
          </ul>

          <div v-else class="app-topbar__notifications-empty">
            <span class="app-topbar__notifications-empty-icon" aria-hidden="true">
              <AppIcon name="notification" :size="22" />
            </span>
            <p>No tienes notificaciones nuevas</p>
          </div>

          <button
            v-if="unreadCount > 0"
            type="button"
            class="app-topbar__mark-read"
            @click="markAllAsRead"
          >
            Marcar todas como leídas
          </button>
        </section>
      </div>

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

.app-topbar__notifications:focus-visible,
.app-topbar__mark-read:focus-visible {
  outline: 2px solid #2263e5;
  outline-offset: 3px;
}

.app-topbar__notification-menu {
  position: relative;
  flex: 0 0 auto;
}

.app-topbar__notifications-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 200;
  width: min(360px, calc(100vw - 48px));
  max-height: min(420px, calc(100vh - 110px));
  overflow-y: auto;
  padding: 18px;
  border: 1px solid #dbe3ec;
  border-radius: 14px;
  background: #ffffff;
  color: #172b40;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.18);
}

.app-topbar__notifications-title {
  margin: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid #e8edf3;
  font-size: 16px;
  line-height: 1.3;
}

.app-topbar__notification-list {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 16px 0 0;
  list-style: none;
}

.app-topbar__notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.app-topbar__notification-icon,
.app-topbar__notifications-empty-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #edf4fa;
  color: #365c7d;
}

.app-topbar__notification-icon {
  width: 36px;
  height: 36px;
}

.app-topbar__notification-copy {
  min-width: 0;
}

.app-topbar__notification-copy strong {
  display: block;
  font-size: 13px;
}

.app-topbar__notification-copy p {
  margin: 3px 0 5px;
  color: #53677c;
  font-size: 12px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.app-topbar__notification-copy time {
  color: #75869a;
  font-size: 11px;
}

.app-topbar__notifications-empty {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 28px 8px 18px;
  color: #53677c;
  text-align: center;
}

.app-topbar__notifications-empty-icon {
  width: 44px;
  height: 44px;
}

.app-topbar__notifications-empty p {
  margin: 0;
  font-size: 13px;
}

.app-topbar__mark-read {
  width: 100%;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid #dbe3ec;
  border-radius: 8px;
  background: #f8fbff;
  color: #294765;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
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

@media (min-width: 1024px) and (hover: none) {
  .app-topbar__menu {
    display: inline-flex;
  }
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

   .app-topbar__notifications-panel {
     right: -14px;
     width: min(360px, calc(100vw - 24px));
     max-height: calc(100vh - 110px);
   }
}
</style>
