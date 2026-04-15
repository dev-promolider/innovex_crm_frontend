export type NavigationIconName =
  | 'dashboard'
  | 'companies'
  | 'campaigns'
  | 'leaders'
  | 'users'
  | 'validation'
  | 'inventory'
  | 'debts'
  | 'rewards'
  | 'reports'
  | 'settings'

export interface NavigationItem {
  to: string
  label: string
  icon: NavigationIconName
  description: string
  requiresSuperadmin?: boolean
}

export const primaryNavigation: NavigationItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', description: 'Resumen ejecutivo y actividad reciente' },
  { to: '/empresas', label: 'Empresas', icon: 'companies', description: 'Alta, activacion y seguimiento de workspaces', requiresSuperadmin: true },
  { to: '/campanas', label: 'Campanas y Kit', icon: 'campaigns', description: 'Planeacion comercial y kits activos' },
  { to: '/lideres', label: 'Gestion de Lideres', icon: 'leaders', description: 'Alta, seguimiento y rendimiento de lideres' },
  { to: '/validacion', label: 'Validacion Ventas', icon: 'validation', description: 'Revision operativa de ventas capturadas' },
  { to: '/inventario', label: 'Control Inventario', icon: 'inventory', description: 'Stock, solicitudes y movimientos de kits' },
  { to: '/deudas', label: 'Deudas y Finanzas', icon: 'debts', description: 'Cobranza, pagos y ledger de deuda' },
  { to: '/recompensas', label: 'Recompensas', icon: 'rewards', description: 'Marketplace, scoring y catalogo de premios' },
  { to: '/reportes', label: 'Reportes', icon: 'reports', description: 'Indicadores, cortes y analitica operativa' },
]

export const secondaryNavigation: NavigationItem[] = [
  { to: '/usuarios', label: 'Usuarios', icon: 'users', description: 'Cuentas globales, seguridad y membresias', requiresSuperadmin: true },
  { to: '/configuracion', label: 'Configuracion', icon: 'settings', description: 'Parametros generales y reglas del sistema' },
]