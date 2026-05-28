<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { primaryNavigation, secondaryNavigation, type NavigationItem } from '../../app/navigation'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'
import NavBar from '../NavBar.vue'
import AppTopbar from './AppTopbar.vue'

withDefaults(
  defineProps<{
    notificationCount?: number | string
    avatarImageSrc?: string
    showSearch?: boolean
    searchPlaceholder?: string
  }>(),
  {
    notificationCount: 1,
    avatarImageSrc: undefined,
    showSearch: true,
    searchPlaceholder: 'Buscar...',
  },
)

const { userName, userEmail, userInitial, logout } = useAuthenticatedSession()
const { t } = useI18n()
const route = useRoute()

const sidebarOpen = shallowRef(false)

const navigationItems = computed(() => [...primaryNavigation, ...secondaryNavigation])

const currentItem = computed<NavigationItem>(() => {
  const activeItem = navigationItems.value.find(
    (item) => route.path === item.to || route.path.startsWith(`${item.to}/`),
  )

  return activeItem ?? primaryNavigation[0]!
})

const closeSidebar = () => {
  sidebarOpen.value = false
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>

<template>
  <div class="app-shell">
    <NavBar :is-open="sidebarOpen" @navigate="closeSidebar" @logout="logout" />

    <button
      type="button"
      class="app-shell__overlay"
      :class="{ 'app-shell__overlay--active': sidebarOpen }"
      aria-label="Cerrar navegacion"
      @click="closeSidebar"
    />

    <main class="app-shell__main">
      <AppTopbar
        :user-name="userName"
        :user-email="userEmail"
        :user-initial="userInitial"
        :section-label="t(currentItem.labelKey)"
        :section-description="t(currentItem.descriptionKey)"
        :notification-count="notificationCount"
        :avatar-image-src="avatarImageSrc"
        :show-search="showSearch"
        :search-placeholder="searchPlaceholder"
        @toggle-menu="toggleSidebar"
      >
        <template #breadcrumb>
          <slot name="breadcrumb" />
        </template>
      </AppTopbar>

      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(36, 71, 110, 0.14), transparent 24%),
    linear-gradient(180deg, #eef3f8 0%, #f6f8fb 100%);
  --shell-sidebar-width: 248px;
  --shell-content-gutter: 20px;
}

.app-shell__main {
  min-height: 100vh;
  margin-left: var(--shell-sidebar-width);
  display: flex;
  flex-direction: column;
}

.app-shell__overlay {
  display: none;
}

@media (max-width: 768px) {
  .app-shell__main {
    margin-left: 0;
  }

  .app-shell__overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 180;
    border: 0;
    padding: 0;
    background: rgba(9, 16, 27, 0.46);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .app-shell__overlay--active {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
