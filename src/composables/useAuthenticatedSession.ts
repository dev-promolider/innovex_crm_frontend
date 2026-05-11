import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

type HeaderMap = Record<string, string>

type PanelRole = 'administrador_empresa' | 'administrador_financiero'

export function useAuthenticatedSession() {
  const router = useRouter()

  const token = localStorage.getItem('token') ?? ''
  const empresaId = localStorage.getItem('empresa_id') ?? ''
  const userName = shallowRef(localStorage.getItem('user_nombre') ?? 'Admin')
  const userEmail = shallowRef(localStorage.getItem('user_email') ?? '')
  const isSuperadmin = shallowRef(localStorage.getItem('user_es_superadmin') === 'true')
  const workspaceRole = shallowRef((localStorage.getItem('workspace_role') ?? '') as PanelRole | '')
  const hasPanelAccess = computed(() => isSuperadmin.value || workspaceRole.value.length > 0)
  const isWorkspaceAdmin = computed(() => workspaceRole.value === 'administrador_empresa')
  const isFinancialAdmin = computed(() => workspaceRole.value === 'administrador_financiero')

  const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

  const authHeaders = (extraHeaders: HeaderMap = {}): HeaderMap => ({
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    'X-Empresa-Id': empresaId,
    ...extraHeaders,
  })

  const platformHeaders = (extraHeaders: HeaderMap = {}): HeaderMap => ({
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  })

  const logout = () => {
    localStorage.clear()
    router.push({ name: 'login' })
  }

  return {
    token,
    empresaId,
    userName,
    userEmail,
    isSuperadmin,
    workspaceRole,
    hasPanelAccess,
    isWorkspaceAdmin,
    isFinancialAdmin,
    userInitial,
    authHeaders,
    platformHeaders,
    logout,
  }
}