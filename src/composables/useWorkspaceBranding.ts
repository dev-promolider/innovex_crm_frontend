import { readonly, shallowRef, watch } from 'vue'
import apiClient from '@/app/apiClient'
import { setWorkspaceLogo, useAuthenticatedSession } from '@/composables/useAuthenticatedSession'

interface WorkspaceProfileResponse {
    status: string
    data: {
        logo_url: string | null
        logo_variantes?: {
            lobby_card?: string | null
        } | null
    }
}

const isRefreshing = shallowRef(false)

export function useWorkspaceBranding() {
    const { token, empresaId, workspaceRole, workspaceLogo, authHeaders } = useAuthenticatedSession()

    const refreshWorkspaceBranding = async () => {
        if (!token.value || !empresaId.value) {
            setWorkspaceLogo(null)
            return null
        }

        if (workspaceRole.value !== 'administrador_empresa') {
            return workspaceLogo.value || null
        }

        isRefreshing.value = true

        try {
            const response = await apiClient.get<WorkspaceProfileResponse>('/workspace/admin/empresa/perfil', {
                headers: authHeaders(),
            })

            const nextLogo = response.data.data.logo_url ?? response.data.data.logo_variantes?.lobby_card ?? null
            setWorkspaceLogo(nextLogo)

            return nextLogo
        } finally {
            isRefreshing.value = false
        }
    }

    watch(
        () => [token.value, empresaId.value, workspaceRole.value] as const,
        () => {
            void refreshWorkspaceBranding()
        },
        { immediate: true },
    )

    return {
        workspaceLogo: readonly(workspaceLogo),
        isRefreshing: readonly(isRefreshing),
        refreshWorkspaceBranding,
    }
}