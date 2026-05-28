<script setup lang="ts">
import logo from '../assets/logo.png'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { primaryNavigation, secondaryNavigation } from '../app/navigation'
import { useAuthenticatedSession } from '../composables/useAuthenticatedSession'
import AppIcon from './layout/AppIcon.vue'

const props = withDefaults(
	defineProps<{
		isOpen?: boolean
		brandLogoSrc?: string
	}>(),
	{
		isOpen: false,
		brandLogoSrc: '',
	},
)

const emit = defineEmits<{
	navigate: []
	logout: []
}>()

const { t } = useI18n()
const { isSuperadmin, empresaId } = useAuthenticatedSession()

const hasWorkspaceContext = computed(() => empresaId.value.length > 0)

const canShowItem = (item: { requiresSuperadmin?: boolean; requiresWorkspaceContext?: boolean }) => {
	if (item.requiresSuperadmin && !isSuperadmin.value) {
		return false
	}

	if (item.requiresWorkspaceContext && !hasWorkspaceContext.value) {
		return false
	}

	return true
}

const visiblePrimaryNavigation = computed(() => primaryNavigation.filter(canShowItem))
const visibleSecondaryNavigation = computed(() => secondaryNavigation.filter(canShowItem))

const resolvedBrandLogo = computed(() => props.brandLogoSrc?.trim() || logo)

const handleNavigate = () => emit('navigate')
const handleLogout = () => emit('logout')
</script>

<template>
	<aside class="app-sidebar" :class="{ 'app-sidebar--open': isOpen }">
		<div class="app-sidebar__brand">
			<img :src="resolvedBrandLogo" :alt="t('common.appName')" class="app-sidebar__logo" />
		</div>

		<div class="app-sidebar__section">{{ t('common.general') }}</div>
		<nav class="app-sidebar__nav" :aria-label="t('common.general')">
			<RouterLink
				v-for="item in visiblePrimaryNavigation"
				:key="item.to"
				:to="item.to"
				class="app-sidebar__link"
				active-class="app-sidebar__link--active"
				@click="handleNavigate"
			>
				<span class="app-sidebar__link-icon">
					<AppIcon :name="item.icon" :size="18" />
				</span>
				<strong class="app-sidebar__link-label">{{ t(item.labelKey) }}</strong>
			</RouterLink>
		</nav>

		<div class="app-sidebar__section app-sidebar__section--secondary">{{ t('common.settings') }}</div>
		<div class="app-sidebar__footer">
			<RouterLink
				v-for="item in visibleSecondaryNavigation"
				:key="item.to"
				:to="item.to"
				class="app-sidebar__link"
				active-class="app-sidebar__link--active"
				@click="handleNavigate"
			>
				<span class="app-sidebar__link-icon">
					<AppIcon :name="item.icon" :size="18" />
				</span>
				<strong class="app-sidebar__link-label">{{ t(item.labelKey) }}</strong>
			</RouterLink>

			<button type="button" class="app-sidebar__link app-sidebar__logout" @click="handleLogout">
				<span class="app-sidebar__link-icon">
					<AppIcon name="logout" :size="18" />
				</span>
				<strong class="app-sidebar__link-label">{{ t('common.logout') }}</strong>
			</button>
		</div>
	</aside>
</template>

<style scoped>
.app-sidebar {
	width: 248px;
	height: 100vh;
	max-width: calc(100vw - 20px);
	position: fixed;
	top: 0;
	left: 0;
	z-index: 220;
	display: flex;
	flex-direction: column;
	padding: 16px 12px 14px;
	color: #d4e5fb;
	background:
		radial-gradient(circle at top, rgba(69, 148, 255, 0.14), transparent 32%),
		linear-gradient(180deg, #0b1624 0%, #0f1d30 100%);
	border-right: 1px solid rgba(132, 169, 214, 0.14);
	box-shadow: 16px 0 40px rgba(6, 16, 32, 0.16);
	overflow-y: auto;
	overscroll-behavior: contain;
	scrollbar-width: none;
}

.app-sidebar::-webkit-scrollbar {
	display: none;
}

.app-sidebar__brand {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px 10px 18px;
	margin-bottom: 8px;
	border-bottom: 1px solid rgba(132, 169, 214, 0.12);
}

.app-sidebar__logo {
	width: 138px;
	height: auto;
	object-fit: contain;
	max-width: 100%;
	flex-shrink: 0;
}

.app-sidebar__section {
	padding: 12px 10px 8px;
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: #6c89ad;
}

.app-sidebar__section--secondary {
	margin-top: 18px;
}

.app-sidebar__nav,
.app-sidebar__footer {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.app-sidebar__footer {
	margin-top: auto;
	padding-top: 6px;
	padding-bottom: max(8px, env(safe-area-inset-bottom));
}

.app-sidebar__link {
	width: 100%;
	border: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	border-radius: 14px;
	background: rgba(255, 255, 255, 0.02);
	color: #9bb9db;
	font: inherit;
	font-size: 13px;
	font-weight: 500;
	text-decoration: none;
	text-align: left;
	cursor: pointer;
	transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.app-sidebar__link-icon {
	width: 34px;
	height: 34px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 11px;
	background: rgba(109, 151, 202, 0.1);
	color: currentColor;
	flex-shrink: 0;
	transition: background-color 0.2s ease;
}

.app-sidebar__link-label {
	font-size: 13px;
	font-weight: 600;
	color: inherit;
}

.app-sidebar__link:hover {
	background: rgba(28, 58, 92, 0.76);
	color: #edf5ff;
	transform: translateX(2px);
	box-shadow: inset 0 0 0 1px rgba(92, 147, 214, 0.12);
}

.app-sidebar__link:hover .app-sidebar__link-icon {
	background: rgba(74, 184, 245, 0.16);
}

.app-sidebar__link--active {
	background: linear-gradient(135deg, rgba(64, 144, 255, 0.22), rgba(32, 87, 152, 0.42));
	color: #ffffff;
	box-shadow:
		inset 0 0 0 1px rgba(103, 173, 255, 0.24),
		0 8px 24px rgba(7, 24, 49, 0.18);
}

.app-sidebar__link--active .app-sidebar__link-icon {
	background: rgba(255, 255, 255, 0.14);
}

.app-sidebar__logout {
	color: #f0b4b4;
}

.app-sidebar__logout:hover {
	background: rgba(94, 28, 28, 0.46);
	color: #fff2f2;
}

@media (max-width: 768px) {
	.app-sidebar {
		width: min(248px, calc(100vw - 24px));
		height: calc(100vh - 16px);
		top: 8px;
		left: 8px;
		border-radius: 20px;
		border: 1px solid rgba(132, 169, 214, 0.14);
		transform: translateX(-100%);
		transition: transform 0.24s ease;
	}

	.app-sidebar--open {
		transform: translateX(0);
	}

	.app-sidebar__logo {
		width: 126px;
	}
}
</style>
