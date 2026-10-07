<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { primaryNavigation, secondaryNavigation, type NavigationItem } from '../../app/navigation'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'
import { useWorkspaceBranding } from '../../composables/useWorkspaceBranding'
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
const { workspaceLogo } = useWorkspaceBranding()
const { t } = useI18n()
const route = useRoute()

const sidebarOpen = shallowRef(false)
const sidebarPinned = ref(false)
const sidebarPinStorageKey = 'innovex:sidebar-pinned'
let stopPersistingPin: (() => void) | undefined

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

const toggleSidebarPin = () => {
  sidebarPinned.value = !sidebarPinned.value
  sidebarOpen.value = false
}

onMounted(() => {
  try {
    sidebarPinned.value = window.localStorage.getItem(sidebarPinStorageKey) === 'true'
  } catch (error) {
    console.warn('No se pudo leer la preferencia de fijado del menú lateral.', error)
  }

  stopPersistingPin = watch(sidebarPinned, (pinned) => {
    try {
      window.localStorage.setItem(sidebarPinStorageKey, String(pinned))
    } catch (error) {
      console.warn('No se pudo guardar la preferencia de fijado del menú lateral.', error)
    }
  })
})

onBeforeUnmount(() => stopPersistingPin?.())
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--sidebar-pinned': sidebarPinned }">
    <NavBar
      :is-open="sidebarOpen"
      :is-pinned="sidebarPinned"
      :brand-logo-src="workspaceLogo"
      @navigate="closeSidebar"
      @logout="logout"
      @toggle-pin="toggleSidebarPin"
    />

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

@media (min-width: 1024px) {
  .app-shell__main {
    margin-left: 72px;
    transition: margin-left 200ms ease;
  }

  .app-shell--sidebar-pinned .app-shell__main {
    margin-left: var(--shell-sidebar-width);
  }
}

@media (min-width: 1024px) and (hover: none) {
  .app-shell__overlay--active {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 180;
    border: 0;
    padding: 0;
    background: rgba(9, 16, 27, 0.32);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-shell__main,
  .app-shell__overlay {
    transition: none !important;
  }
}
</style>
