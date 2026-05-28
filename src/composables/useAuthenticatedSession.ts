import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

type HeaderMap = Record<string, string>

export type PanelRole = 'administrador_empresa' | 'administrador_financiero'

const token = shallowRef(localStorage.getItem('token') ?? '')
const empresaId = shallowRef(localStorage.getItem('empresa_id') ?? '')
const userName = shallowRef(localStorage.getItem('user_nombre') ?? 'Admin')
const userEmail = shallowRef(localStorage.getItem('user_email') ?? '')
const isSuperadmin = shallowRef(localStorage.getItem('user_es_superadmin') === 'true')
const workspaceRole = shallowRef((localStorage.getItem('workspace_role') ?? '') as PanelRole | '')
const workspaceLogo = shallowRef(localStorage.getItem('workspace_logo') ?? '')

const persistItem = (key: string, value: string) => {
  localStorage.setItem(key, value)
}

const removeItem = (key: string) => {
  localStorage.removeItem(key)
}

export function hydrateAuthenticatedSession() {
  token.value = localStorage.getItem('token') ?? ''
  empresaId.value = localStorage.getItem('empresa_id') ?? ''
  userName.value = localStorage.getItem('user_nombre') ?? 'Admin'
  userEmail.value = localStorage.getItem('user_email') ?? ''
  isSuperadmin.value = localStorage.getItem('user_es_superadmin') === 'true'
  workspaceRole.value = (localStorage.getItem('workspace_role') ?? '') as PanelRole | ''
  workspaceLogo.value = localStorage.getItem('workspace_logo') ?? ''
}

export function updateAuthenticatedUserProfile(profile: { nombre?: string | null; email?: string | null }) {
  if (typeof profile.nombre === 'string') {
    const normalizedName = profile.nombre.trim() || 'Admin'
    persistItem('user_nombre', normalizedName)
    userName.value = normalizedName
  }

  if (typeof profile.email === 'string') {
    const normalizedEmail = profile.email.trim()
    persistItem('user_email', normalizedEmail)
    userEmail.value = normalizedEmail
  }
}

export function clearAuthenticatedSession() {
  localStorage.clear()
  token.value = ''
  empresaId.value = ''
  userName.value = 'Admin'
  userEmail.value = ''
  isSuperadmin.value = false
  workspaceRole.value = ''
  workspaceLogo.value = ''
}

export function setWorkspaceLogo(nextLogoUrl: string | null) {
  const normalizedLogoUrl = typeof nextLogoUrl === 'string' ? nextLogoUrl.trim() : ''

  if (normalizedLogoUrl.length > 0) {
    persistItem('workspace_logo', normalizedLogoUrl)
    workspaceLogo.value = normalizedLogoUrl
    return
  }

  removeItem('workspace_logo')
  workspaceLogo.value = ''
}

export function setWorkspaceContext(nextEmpresaId: string | null, nextWorkspaceRole: PanelRole | '' = '') {
  if (nextEmpresaId && nextEmpresaId.length > 0) {
    persistItem('empresa_id', nextEmpresaId)
    empresaId.value = nextEmpresaId
  } else {
    removeItem('empresa_id')
    empresaId.value = ''
    setWorkspaceLogo(null)
  }

  if (nextWorkspaceRole.length > 0) {
    persistItem('workspace_role', nextWorkspaceRole)
    workspaceRole.value = nextWorkspaceRole
  } else {
    removeItem('workspace_role')
    workspaceRole.value = ''
  }
}

export function useAuthenticatedSession() {
  const router = useRouter()

  const hasPanelAccess = computed(() => isSuperadmin.value || workspaceRole.value.length > 0)
  const isWorkspaceAdmin = computed(() => workspaceRole.value === 'administrador_empresa')
  const isFinancialAdmin = computed(() => workspaceRole.value === 'administrador_financiero')
  const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

  const authHeaders = (extraHeaders: HeaderMap = {}): HeaderMap => ({
    Accept: 'application/json',
    Authorization: `Bearer ${token.value}`,
    'X-Empresa-Id': empresaId.value,
    ...extraHeaders,
  })

  const platformHeaders = (extraHeaders: HeaderMap = {}): HeaderMap => ({
    Accept: 'application/json',
    Authorization: `Bearer ${token.value}`,
    ...extraHeaders,
  })

  const logout = () => {
    clearAuthenticatedSession()
    router.push({ name: 'login' })
  }

  return {
    token,
    empresaId,
    userName,
    userEmail,
    isSuperadmin,
    workspaceRole,
    workspaceLogo,
    hasPanelAccess,
    isWorkspaceAdmin,
    isFinancialAdmin,
    userInitial,
    authHeaders,
    platformHeaders,
    logout,
  }
}
