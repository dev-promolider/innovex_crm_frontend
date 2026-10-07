export type NavigationIconName =
  | 'dashboard'
  | 'companies'
  | 'campaigns'
  | 'leaders'
  | 'approvals'
  | 'contracts'
  | 'metrics'
  | 'users'
  | 'validation'
  | 'inventory'
  | 'debts'
  | 'rewards'
  | 'reports'
  | 'settings'
  | 'profile'

export interface NavigationItem {
  to: string
  labelKey: string
  icon: NavigationIconName
  descriptionKey: string
  requiresSuperadmin?: boolean
  requiresWorkspaceContext?: boolean
}

export const primaryNavigation: NavigationItem[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard.label', icon: 'dashboard', descriptionKey: 'nav.dashboard.description', requiresWorkspaceContext: true },
  { to: '/empresas', labelKey: 'nav.companies.label', icon: 'companies', descriptionKey: 'nav.companies.description', requiresSuperadmin: true },
  { to: '/campanas', labelKey: 'nav.campaigns.label', icon: 'campaigns', descriptionKey: 'nav.campaigns.description', requiresWorkspaceContext: true },
  { to: '/distribuidores', labelKey: 'nav.leaders.label', icon: 'leaders', descriptionKey: 'nav.leaders.description', requiresWorkspaceContext: true },
  { to: '/aprobaciones', labelKey: 'nav.approvals.label', icon: 'approvals', descriptionKey: 'nav.approvals.description', requiresWorkspaceContext: true },
  { to: '/validacion', labelKey: 'nav.validation.label', icon: 'validation', descriptionKey: 'nav.validation.description', requiresWorkspaceContext: true },
  { to: '/inventario', labelKey: 'nav.inventory.label', icon: 'inventory', descriptionKey: 'nav.inventory.description', requiresWorkspaceContext: true },
  { to: '/deudas', labelKey: 'nav.debts.label', icon: 'debts', descriptionKey: 'nav.debts.description', requiresWorkspaceContext: true },
  { to: '/contratos', labelKey: 'nav.contracts.label', icon: 'contracts', descriptionKey: 'nav.contracts.description', requiresWorkspaceContext: true },
  { to: '/recompensas', labelKey: 'nav.rewards.label', icon: 'rewards', descriptionKey: 'nav.rewards.description', requiresWorkspaceContext: true },
  { to: '/metricas', labelKey: 'nav.metrics.label', icon: 'metrics', descriptionKey: 'nav.metrics.description', requiresWorkspaceContext: true },
  { to: '/reportes', labelKey: 'nav.reports.label', icon: 'reports', descriptionKey: 'nav.reports.description', requiresWorkspaceContext: true },
]

export const secondaryNavigation: NavigationItem[] = [
  { to: '/perfil', labelKey: 'nav.profile.label', icon: 'profile', descriptionKey: 'nav.profile.description' },
  { to: '/usuarios', labelKey: 'nav.users.label', icon: 'users', descriptionKey: 'nav.users.description', requiresSuperadmin: true },
  { to: '/configuracion', labelKey: 'nav.configuration.label', icon: 'settings', descriptionKey: 'nav.configuration.description', requiresWorkspaceContext: true },
]
