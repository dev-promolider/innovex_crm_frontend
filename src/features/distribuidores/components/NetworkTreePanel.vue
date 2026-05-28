<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import NetworkTreeNode from './NetworkTreeNode.vue'

const API_BASE = 'http://127.0.0.1:8000/api'

export interface TreeNode {
  id: number
  nombre_completo: string
  email?: string | null
  documento?: string | null
  estado_validacion: string
  nivel_en_arbol: number
  nivel_confianza: number
  insignia?: string | null
  hijos_directos_count: number
  rango?: { id: number; nombre: string; nivel: number } | null
  patrocinador?: { id: number; nombre_completo: string } | null
  children: TreeNode[]
}

const { authHeaders } = useAuthenticatedSession()
const hdrs = () => authHeaders({ 'Content-Type': 'application/json' })

const nodes = ref<TreeNode[]>([])
const meta = ref({ scope: 'roots', focused_membresia_id: null as number | null, total_raices: 0 })
const busqueda = ref('')
const cargando = ref(false)
const errorMsg = ref('')
const expandedIds = ref<Set<number>>(new Set())

const totalNodos = computed(() => {
  const count = (items: TreeNode[]): number =>
    items.reduce((sum, node) => sum + 1 + count(node.children ?? []), 0)

  return count(nodes.value)
})

const toggleExpanded = (id: number) => {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

const cargarArbol = async () => {
  cargando.value = true
  errorMsg.value = ''

  const params = new URLSearchParams()
  const term = busqueda.value.trim()
  if (term) params.set('search', term)

  try {
    const res = await fetch(
      `${API_BASE}/workspace/admin/distribuidores/arbol${params.toString() ? `?${params}` : ''}`,
      { headers: hdrs() },
    )
    const json = await res.json()

    if (!res.ok || json.status !== 'success') {
      errorMsg.value = json.message ?? 'No se pudo cargar el árbol de distribuidores.'
      return
    }

    nodes.value = json.data ?? []
    meta.value = json.meta ?? meta.value
    expandedIds.value = new Set(nodes.value.map((node) => node.id))
  } catch {
    errorMsg.value = 'Error de conexión al cargar el árbol.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  void cargarArbol()
})

defineExpose({ recargar: cargarArbol })
</script>

<template>
  <div class="tree-panel">
    <div class="tree-toolbar">
      <div class="search-box search-wide">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar nodo por nombre, email o documento..."
          class="search-input"
          @keyup.enter="cargarArbol"
        />
      </div>
      <button class="btn-secondary" type="button" @click="cargarArbol">
        Buscar / actualizar
      </button>
    </div>

    <p v-if="errorMsg" class="tree-error" role="alert">{{ errorMsg }}</p>

    <div v-if="cargando" class="loading-state" aria-live="polite">
      <div class="spinner" />
      <span>Cargando árbol...</span>
    </div>

    <div v-else class="tree-card">
      <div class="tree-meta">
        <span>{{ totalNodos }} nodos visibles</span>
        <span v-if="meta.scope === 'search'">· resultado de búsqueda</span>
        <span v-else>· {{ meta.total_raices }} raíces</span>
      </div>

      <p v-if="nodes.length === 0" class="empty-state">No hay nodos para mostrar con los filtros actuales.</p>

      <ul v-else class="tree-root-list">
        <NetworkTreeNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :depth="0"
          :expanded-ids="expandedIds"
          @toggle="toggleExpanded"
        />
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tree-panel { display: flex; flex-direction: column; gap: 12px; }
.tree-toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.tree-card { background: #fff; border-radius: 10px; border: 1px solid #e8ecf0; padding: 14px; }
.tree-meta { font-size: 12px; color: #64748b; margin-bottom: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
.tree-root-list { list-style: none; margin: 0; padding: 0; }
.tree-error { color: #b91c1c; font-size: 13px; }
.loading-state { display: flex; align-items: center; gap: 10px; padding: 24px; color: #64748b; }
.spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid #dbeafe; border-top-color: #2563eb;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { padding: 20px; text-align: center; color: #94a3b8; font-size: 13px; }
.search-box { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 10px; flex: 1; min-width: 220px; }
.search-input { border: none; outline: none; padding: 10px 0; width: 100%; font-size: 13px; }
.btn-secondary { background: #fff; border: 1px solid #d1d5db; color: #374151; padding: 9px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; }
</style>
