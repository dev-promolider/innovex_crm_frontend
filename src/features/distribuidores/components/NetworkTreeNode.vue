<script setup lang="ts">
import type { TreeNode } from './NetworkTreePanel.vue'

defineProps<{
  node: TreeNode
  depth: number
  expandedIds: Set<number>
}>()

const emit = defineEmits<{
  toggle: [id: number]
}>()

const labelEstado = (estado: string) =>
  ({
    activa: 'Activo',
    suspendida: 'Suspendida',
    pre_registro: 'Pre-registro',
    revision_admin: 'Revisión admin',
    pendiente_activacion: 'Pendiente activación',
  }[estado] ?? estado)

const labelInsignia = (insignia?: string | null) =>
  ({
    nuevo: 'Nuevo',
    confiable: 'Confiable',
    verificado: 'Verificado',
    elite_biometrico: 'Elite biométrico',
  }[insignia ?? ''] ?? 'Sin insignia')

const scoreClass = (score: number) => {
  if (score >= 800) return 'score-elite'
  if (score >= 500) return 'score-good'
  if (score >= 200) return 'score-watch'
  return 'score-risk'
}
</script>

<template>
  <li class="tree-node" :style="{ marginLeft: `${depth * 18}px` }">
    <div class="tree-node-row">
      <button
        v-if="(node.children?.length ?? 0) > 0"
        type="button"
        class="tree-toggle"
        :aria-expanded="expandedIds.has(node.id)"
        @click="emit('toggle', node.id)"
      >
        {{ expandedIds.has(node.id) ? '▾' : '▸' }}
      </button>
      <span v-else class="tree-toggle tree-toggle--spacer" aria-hidden="true" />

      <div class="tree-node-main">
        <div class="tree-node-title">{{ node.nombre_completo }}</div>
        <div class="tree-node-meta">
          <span>{{ node.rango?.nombre ?? 'Sin rango' }}</span>
          <span>· Nivel {{ node.nivel_en_arbol }}</span>
          <span>· {{ node.hijos_directos_count }} hijos directos</span>
          <span v-if="node.patrocinador">· Patrocinador: {{ node.patrocinador.nombre_completo }}</span>
        </div>
        <div class="tree-node-score">
          <span class="score-pill" :class="scoreClass(node.nivel_confianza)">
            Confianza {{ node.nivel_confianza }}/1000
          </span>
          <span class="score-badge">{{ labelInsignia(node.insignia) }}</span>
        </div>
      </div>

      <span class="badge" :class="`est-${node.estado_validacion}`">{{ labelEstado(node.estado_validacion) }}</span>
    </div>

    <ul v-if="(node.children?.length ?? 0) > 0 && expandedIds.has(node.id)" class="tree-children">
      <NetworkTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :expanded-ids="expandedIds"
        @toggle="emit('toggle', $event)"
      />
    </ul>
  </li>
</template>

<style scoped>
.tree-node { margin-bottom: 4px; list-style: none; }
.tree-children { list-style: none; margin: 0; padding: 0; }
.tree-node-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #eef2f7;
}
.tree-node-row:hover { background: rgba(74, 184, 245, 0.06); }
.tree-toggle {
  width: 22px;
  height: 22px;
  border: none;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
}
.tree-toggle--spacer { visibility: hidden; }
.tree-node-main { flex: 1; min-width: 0; }
.tree-node-title { font-weight: 600; font-size: 13px; color: #0f172a; }
.tree-node-meta { font-size: 11px; color: #64748b; margin-top: 2px; display: flex; flex-wrap: wrap; gap: 4px; }
.tree-node-score { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.score-pill,
.score-badge { font-size: 10px; padding: 3px 8px; border-radius: 999px; font-weight: 700; }
.score-pill { background: #f1f5f9; color: #334155; }
.score-badge { background: #eef2ff; color: #4338ca; }
.score-elite { background: #dcfce7; color: #166534; }
.score-good { background: #dbeafe; color: #1d4ed8; }
.score-watch { background: #fef3c7; color: #92400e; }
.score-risk { background: #fee2e2; color: #991b1b; }
.badge { font-size: 10px; padding: 3px 8px; border-radius: 999px; font-weight: 600; white-space: nowrap; }
.est-activa { background: #dcfce7; color: #166534; }
.est-suspendida { background: #fee2e2; color: #991b1b; }
.est-revision_admin,
.est-pendiente_activacion,
.est-pre_registro { background: #fef3c7; color: #92400e; }
</style>
