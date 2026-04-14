<script setup lang="ts">
import logoBlanco from '../assets/logo-blanco.png'
import { computed } from 'vue'
import { primaryNavigation, secondaryNavigation } from '../app/navigation'
import { useAuthenticatedSession } from '../composables/useAuthenticatedSession'
import AppIcon from './layout/AppIcon.vue'

withDefaults(
	defineProps<{
		isOpen?: boolean
	}>(),
	{
		isOpen: false,
	},
)

const emit = defineEmits<{
	navigate: []
	logout: []
}>()

const { isSuperadmin } = useAuthenticatedSession()

const visiblePrimaryNavigation = computed(() => primaryNavigation.filter((item) => !item.requiresSuperadmin || isSuperadmin.value))
const visibleSecondaryNavigation = computed(() => secondaryNavigation.filter((item) => !item.requiresSuperadmin || isSuperadmin.value))

const handleNavigate = () => emit('navigate')
const handleLogout = () => emit('logout')
</script>

<template>
	<aside class="app-sidebar" :class="{ 'app-sidebar--open': isOpen }">
		<div class="app-sidebar__brand">
			<img :src="logoBlanco" alt="Innovex" class="app-sidebar__logo" />
			<div class="app-sidebar__brand-copy">
				<span class="app-sidebar__eyebrow">CRM operativo</span>
				<span class="app-sidebar__name">Innovex</span>
			</div>
		</div>

		<div class="app-sidebar__meta">
			<span class="app-sidebar__meta-label">Workspace</span>
			<strong>Operacion comercial</strong>
			<small>{{ visiblePrimaryNavigation.length + visibleSecondaryNavigation.length }} modulos disponibles</small>
		</div>

		<div class="app-sidebar__section">General</div>
		<nav class="app-sidebar__nav" aria-label="Navegacion principal">
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
				<strong class="app-sidebar__link-label">{{ item.label }}</strong>
			</RouterLink>
		</nav>

		<div class="app-sidebar__section app-sidebar__section--secondary">Ajustes</div>
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
				<strong class="app-sidebar__link-label">{{ item.label }}</strong>
			</RouterLink>

			<button type="button" class="app-sidebar__link app-sidebar__logout" @click="handleLogout">
				<span class="app-sidebar__link-icon">
					<AppIcon name="logout" :size="18" />
				</span>
				<strong class="app-sidebar__link-label">Cerrar sesion</strong>
			</button>
		</div>
	</aside>
</template>

<style scoped>
.app-sidebar {
	width: 248px;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	z-index: 220;
	display: flex;
	flex-direction: column;
	padding: 18px 14px 14px;
	color: #d4e5fb;
	background:
		radial-gradient(circle at top, rgba(69, 148, 255, 0.16), transparent 34%),
		linear-gradient(180deg, #0c1727 0%, #0e1b2d 100%);
	border-right: 1px solid rgba(132, 169, 214, 0.16);
	box-shadow: 16px 0 40px rgba(6, 16, 32, 0.14);
	overflow-y: auto;
}

.app-sidebar__brand {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 10px 20px;
	margin-bottom: 2px;
	border-bottom: 1px solid rgba(132, 169, 214, 0.12);
}

.app-sidebar__logo {
	width: 52px;
	height: 52px;
	object-fit: contain;
	flex-shrink: 0;
}

.app-sidebar__brand-copy {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.app-sidebar__eyebrow {
	font-size: 10px;
	text-transform: uppercase;
	letter-spacing: 0.18em;
	color: #7da2ce;
}

.app-sidebar__name {
	font-size: 20px;
	font-weight: 700;
	letter-spacing: 0.04em;
	color: #ffffff;
}

.app-sidebar__meta {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin: 8px 8px 10px;
	padding: 12px 14px;
	border-radius: 14px;
	background: rgba(255, 255, 255, 0.04);
	box-shadow: inset 0 0 0 1px rgba(132, 169, 214, 0.08);
}

.app-sidebar__meta-label {
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: #7e9fc6;
}

.app-sidebar__meta strong {
	font-size: 14px;
	color: #f4f9ff;
}

.app-sidebar__meta small {
	font-size: 11px;
	color: #89a6ca;
}

.app-sidebar__section {
	padding: 14px 10px 8px;
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: #6c89ad;
}

.app-sidebar__section--secondary {
	margin-top: auto;
}

.app-sidebar__nav,
.app-sidebar__footer {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.app-sidebar__link {
	width: 100%;
	border: 0;
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 11px 12px;
	border-radius: 12px;
	background: transparent;
	color: #8eb0d7;
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
	border-radius: 10px;
	background: rgba(109, 151, 202, 0.08);
	color: currentColor;
	flex-shrink: 0;
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
}

.app-sidebar__link:hover .app-sidebar__link-icon {
	background: rgba(74, 184, 245, 0.14);
}

.app-sidebar__link--active {
	background: linear-gradient(135deg, rgba(64, 144, 255, 0.22), rgba(32, 87, 152, 0.42));
	color: #ffffff;
	box-shadow: inset 0 0 0 1px rgba(103, 173, 255, 0.24);
}

.app-sidebar__link--active .app-sidebar__link-icon {
	background: rgba(255, 255, 255, 0.12);
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
		transform: translateX(-100%);
		transition: transform 0.24s ease;
	}

	.app-sidebar--open {
		transform: translateX(0);
	}
}
</style>