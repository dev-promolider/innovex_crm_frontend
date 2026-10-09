<script setup lang="ts">
import logoInnovex from '../assets/logo-innovex.png'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { primaryNavigation, secondaryNavigation } from '../app/navigation'
import { useAuthenticatedSession } from '../composables/useAuthenticatedSession'
import AppIcon from './layout/AppIcon.vue'

const props = withDefaults(
	defineProps<{
		isOpen?: boolean
		isPinned?: boolean
		brandLogoSrc?: string
	}>(),
	{
		isOpen: false,
		isPinned: false,
		brandLogoSrc: '',
	},
)

const emit = defineEmits<{
	navigate: []
	logout: []
	togglePin: []
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

const hasBrandLogoError = ref(false)
const resolvedBrandLogo = computed(
	() => (props.brandLogoSrc?.trim() && !hasBrandLogoError.value ? props.brandLogoSrc.trim() : logoInnovex),
)
const pointerExpanded = ref(false)
const focusWithin = ref(false)
const escapeCollapsed = ref(false)
const scrollReady = ref(false)
const isExpanded = computed(
	() => props.isPinned || props.isOpen || (!escapeCollapsed.value && (pointerExpanded.value || focusWithin.value)),
)
let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
let scrollTimer: ReturnType<typeof setTimeout> | undefined

watch(
	() => props.brandLogoSrc,
	() => {
		hasBrandLogoError.value = false
	},
)

const handleBrandLogoError = (event: Event) => {
	const image = event.currentTarget
	if (!(image instanceof HTMLImageElement)) return

	console.warn('No se pudo cargar el logo del workspace:', image.src)
	hasBrandLogoError.value = true
}

const supportsDesktopHover = () =>
	typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px) and (hover: hover)').matches

const clearTimer = (timer: ReturnType<typeof setTimeout> | undefined) => {
	if (timer !== undefined) {
		clearTimeout(timer)
	}
}

const clearHoverTimers = () => {
	clearTimer(openTimer)
	clearTimer(closeTimer)
	openTimer = undefined
	closeTimer = undefined
}

const handlePointerEnter = () => {
	if (!supportsDesktopHover()) return
	clearHoverTimers()
	escapeCollapsed.value = false
	if (!props.isPinned && !props.isOpen) {
		openTimer = setTimeout(() => {
			pointerExpanded.value = true
			openTimer = undefined
		}, 120)
	}
}

const handlePointerLeave = () => {
	if (!supportsDesktopHover()) return
	clearTimer(openTimer)
	openTimer = undefined
	closeTimer = setTimeout(() => {
		pointerExpanded.value = false
		closeTimer = undefined
	}, 250)
}

const handleFocusIn = () => {
	if (!supportsDesktopHover() || escapeCollapsed.value) return
	clearHoverTimers()
	focusWithin.value = true
}

const handleFocusOut = (event: FocusEvent) => {
	if (!supportsDesktopHover()) return
	const sidebar = event.currentTarget
	if (sidebar instanceof HTMLElement && event.relatedTarget instanceof Node && sidebar.contains(event.relatedTarget)) {
		return
	}
	focusWithin.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
	if (event.key === 'Tab') {
		escapeCollapsed.value = false
		return
	}
	if (event.key !== 'Escape' || !supportsDesktopHover()) return

	clearHoverTimers()
	pointerExpanded.value = false
	focusWithin.value = false
	escapeCollapsed.value = true
	if (props.isOpen) emit('navigate')
	const activeLink = document.querySelector<HTMLElement>('.app-sidebar__link--active')
	activeLink?.focus()
}

watch(isExpanded, (expanded) => {
	clearTimer(scrollTimer)
	scrollReady.value = false
	if (expanded && !props.isPinned) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			scrollReady.value = true
			return
		}
		scrollTimer = setTimeout(() => {
			scrollReady.value = true
			scrollTimer = undefined
		}, 200)
	}
})

onBeforeUnmount(() => {
	clearHoverTimers()
	clearTimer(scrollTimer)
})

const handleNavigate = () => emit('navigate')
const handleLogout = () => emit('logout')
</script>

<template>
	<aside
		class="app-sidebar"
		:class="{
			'app-sidebar--open': isOpen,
			'app-sidebar--expanded': isExpanded,
			'app-sidebar--pinned': isPinned,
			'app-sidebar--scrollable': isPinned || scrollReady,
		}"
		:aria-expanded="isExpanded"
		@pointerenter="handlePointerEnter"
		@pointerleave="handlePointerLeave"
		@focusin="handleFocusIn"
		@focusout="handleFocusOut"
		@keydown="handleKeydown"
	>
		<div class="app-sidebar__brand">
			<img
				:src="resolvedBrandLogo"
				:alt="t('common.appName')"
				class="app-sidebar__logo"
				@error="handleBrandLogoError"
			/>
			<button
				v-if="isExpanded"
				type="button"
				class="app-sidebar__pin"
				:aria-label="t(isPinned ? 'common.unpinNavigation' : 'common.pinNavigation')"
				:aria-pressed="isPinned"
				@click="emit('togglePin')"
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M16 3 21 8l-4 1-4 4v5l-2 2-2-7-6-6 2-2 6 6 7 2 2-2z" />
				</svg>
				<span>{{ t(isPinned ? 'common.unpinNavigation' : 'common.pinNavigation') }}</span>
			</button>
		</div>

		<div class="app-sidebar__section">{{ t('common.general') }}</div>
		<nav class="app-sidebar__nav" :aria-label="t('common.general')">
			<RouterLink
				v-for="item in visiblePrimaryNavigation"
				:key="item.to"
				:to="item.to"
				class="app-sidebar__link"
				:aria-label="isExpanded ? undefined : t(item.labelKey)"
				:data-tooltip="t(item.labelKey)"
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
				:aria-label="isExpanded ? undefined : t(item.labelKey)"
				:data-tooltip="t(item.labelKey)"
				active-class="app-sidebar__link--active"
				@click="handleNavigate"
			>
				<span class="app-sidebar__link-icon">
					<AppIcon :name="item.icon" :size="18" />
				</span>
				<strong class="app-sidebar__link-label">{{ t(item.labelKey) }}</strong>
			</RouterLink>

			<button
				type="button"
				class="app-sidebar__link app-sidebar__logout"
				:aria-label="isExpanded ? undefined : t('common.logout')"
				:data-tooltip="t('common.logout')"
				@click="handleLogout"
			>
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
	padding: 20px 12px 14px;
	color: #e3e9f1;
	background:
		radial-gradient(circle at top left, rgba(62, 181, 245, 0.08), transparent 34%),
		linear-gradient(180deg, #0b1118 0%, #0e151d 100%);
	border-right: 1px solid rgba(255, 255, 255, 0.08);
	overflow-y: auto;
	overscroll-behavior: contain;
	scrollbar-width: thin;
	scrollbar-color: rgba(170, 185, 201, 0.24) transparent;
}

.app-sidebar::-webkit-scrollbar {
	width: 6px;
}

.app-sidebar::-webkit-scrollbar-track {
	background: transparent;
}

.app-sidebar::-webkit-scrollbar-thumb {
	border-radius: 999px;
	background: rgba(170, 185, 201, 0.24);
}

.app-sidebar__brand {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 80px;
	padding: 10px 10px 20px;
	margin-bottom: 8px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.app-sidebar__logo {
	width: 138px;
	height: auto;
	object-fit: contain;
	max-width: 100%;
	flex-shrink: 0;
}

.app-sidebar__pin {
	position: absolute;
	top: 2px;
	right: 0;
	display: none;
	align-items: center;
	gap: 5px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: 6px;
	padding: 4px 7px;
	background: rgba(255, 255, 255, 0.05);
	color: #cbd6e2;
	font: inherit;
	font-size: 11px;
	cursor: pointer;
}

.app-sidebar__pin svg {
	width: 13px;
	height: 13px;
	fill: none;
	stroke: currentColor;
	stroke-width: 1.8;
	stroke-linecap: round;
	stroke-linejoin: round;
}

.app-sidebar__pin:hover {
	background: rgba(62, 181, 245, 0.14);
	color: #f2f8ff;
}

.app-sidebar__pin:focus-visible {
	outline: 2px solid #3eb5f5;
	outline-offset: 2px;
}

.app-sidebar__section {
	padding: 16px 10px 7px;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0;
	text-transform: uppercase;
	color: #778493;
}

.app-sidebar__section--secondary {
	margin-top: 20px;
}

.app-sidebar__nav,
.app-sidebar__footer {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.app-sidebar__footer {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding-bottom: max(8px, env(safe-area-inset-bottom));
}

.app-sidebar__link {
	width: 100%;
	height: 40px;
	min-height: 40px;
	box-sizing: border-box;
	border: 0;
	display: flex;
	position: relative;
	align-items: center;
	gap: 10px;
	padding: 0 10px;
	border-radius: 8px;
	background: transparent;
	color: #a5afbb;
	font: inherit;
	font-size: 14px;
	font-weight: 500;
	text-decoration: none;
	text-align: left;
	cursor: pointer;
	transition: background-color 150ms ease, color 150ms ease;
}

.app-sidebar__link-icon {
	width: 20px;
	height: 20px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: currentColor;
	flex-shrink: 0;
}

.app-sidebar__link-icon :deep(svg) {
	width: 18px;
	height: 18px;
}

.app-sidebar__link-label {
	font-size: 14px;
	font-weight: 500;
	color: inherit;
}

.app-sidebar__link:hover {
	background: rgba(255, 255, 255, 0.05);
	color: #f2f6fb;
}

.app-sidebar__link:focus-visible {
	outline: 2px solid #3eb5f5;
	outline-offset: 2px;
}

.app-sidebar__link--active {
	background: rgba(62, 181, 245, 0.12);
	color: #f4faff;
}

.app-sidebar__link--active::before {
	position: absolute;
	left: 0;
	width: 3px;
	height: 18px;
	border-radius: 0 3px 3px 0;
	background: #3eb5f5;
	content: '';
}

.app-sidebar__logout {
	margin-top: auto;
	padding-top: 8px;
	color: #a5afbb;
}

.app-sidebar__logout::before {
	position: absolute;
	top: -9px;
	right: 0;
	left: 0;
	border-top: 1px solid rgba(255, 255, 255, 0.09);
	content: '';
}

.app-sidebar__logout:hover {
	background: rgba(239, 68, 68, 0.08);
	color: #fca5a5;
}

@media (min-width: 1024px) {
	.app-sidebar {
		width: 72px;
		max-width: none;
		overflow: visible;
		transition: width 200ms ease;
	}

	.app-sidebar--expanded {
		width: 248px;
	}

	.app-sidebar--expanded:not(.app-sidebar--scrollable) {
		overflow: hidden;
	}

	.app-sidebar--scrollable {
		overflow-y: auto;
		scrollbar-width: thin;
	}

	.app-sidebar__brand {
		min-height: 62px;
		padding: 0 0 12px;
		overflow: hidden;
	}

	.app-sidebar__logo {
		width: 42px;
		height: 42px;
		object-fit: cover;
		object-position: center top;
	}

	.app-sidebar--expanded .app-sidebar__brand {
		min-height: 80px;
		padding: 10px 10px 20px;
		overflow: visible;
	}

	.app-sidebar--expanded .app-sidebar__pin {
		display: inline-flex;
	}

	.app-sidebar--expanded .app-sidebar__logo {
		width: 138px;
		height: auto;
		object-fit: contain;
	}

	.app-sidebar__section {
		height: 1px;
		margin: 12px 8px 6px;
		padding: 0;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.1);
		font-size: 0;
	}

	.app-sidebar__section--secondary {
		margin-top: 20px;
	}

	.app-sidebar--expanded .app-sidebar__section {
		height: auto;
		margin: 0;
		padding: 16px 10px 7px;
		overflow: visible;
		background: transparent;
		font-size: 11px;
	}

	.app-sidebar--expanded .app-sidebar__section--secondary {
		margin-top: 20px;
	}

	.app-sidebar__link {
		justify-content: center;
		gap: 0;
		padding: 0;
	}

	.app-sidebar--expanded .app-sidebar__link {
		justify-content: flex-start;
		gap: 10px;
		padding: 0 10px;
	}

	.app-sidebar__link-label {
		display: none;
	}

	.app-sidebar--expanded .app-sidebar__link-label {
		display: inline;
	}

	.app-sidebar__link[data-tooltip]::after {
		position: absolute;
		top: 50%;
		left: calc(100% + 10px);
		z-index: 2;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 6px 9px;
		transform: translateY(-50%);
		background: #111a24;
		box-shadow: 0 5px 18px rgba(0, 0, 0, 0.25);
		color: #f2f6fb;
		content: attr(data-tooltip);
		font-size: 12px;
		line-height: 1.2;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
	}

	.app-sidebar__link[data-tooltip]:hover::after,
	.app-sidebar__link[data-tooltip]:focus-visible::after {
		opacity: 1;
	}

	.app-sidebar--expanded .app-sidebar__link[data-tooltip]::after {
		display: none;
	}
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

@media (prefers-reduced-motion: reduce) {
	.app-sidebar,
	.app-sidebar__link {
		transition: none !important;
	}
}
</style>
