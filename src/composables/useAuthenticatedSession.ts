import { computed, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

type HeaderMap = Record<string, string>

export function useAuthenticatedSession() {
  const router = useRouter()

  const token = localStorage.getItem('token') ?? ''
  const empresaId = localStorage.getItem('empresa_id') ?? '1'
  const userName = shallowRef(localStorage.getItem('user_nombre') ?? 'Admin')
  const userEmail = shallowRef(localStorage.getItem('user_email') ?? '')
  const isSuperadmin = shallowRef(localStorage.getItem('user_es_superadmin') === 'true')

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
    userInitial,
    authHeaders,
    platformHeaders,
    logout,
  }
}