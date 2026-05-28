<script setup lang="ts">
import { computed } from 'vue'
import TabMenu from 'primevue/tabmenu'

export interface AppTabMenuItem {
  key: string
  label: string
  icon?: string
  route?: string
  url?: string
  target?: string
  command?: (...args: any[]) => void | Promise<void>
}

interface ClickableTabItem {
  key?: string
  command?: (...args: any[]) => void | Promise<void>
}

const props = defineProps<{
  items: AppTabMenuItem[]
  activeKey: string
}>()

const emit = defineEmits<{
  'update:activeKey': [key: string]
}>()

const activeIndex = computed(() => {
  const index = props.items.findIndex((item) => item.key === props.activeKey)
  return index >= 0 ? index : 0
})

const handleItemClick = (item: ClickableTabItem) => {
  if (item.key) {
    emit('update:activeKey', item.key)
  }

  item.command?.()
}

const handleRouteClick = (item: ClickableTabItem, navigate: () => void) => {
  handleItemClick(item)
  navigate()
}
</script>

<template>
  <TabMenu :model="props.items" :active-index="activeIndex">
    <template #item="{ item, props: tabProps }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a
          :href="href"
          v-bind="tabProps.action"
          @click.prevent="handleRouteClick(item, navigate)"
        >
          <span v-if="item.icon" :class="item.icon" v-bind="tabProps.icon" />
          <span v-bind="tabProps.label">{{ item.label }}</span>
        </a>
      </router-link>

      <a
        v-else
        :href="item.url ?? '#'"
        :target="item.target"
        v-bind="tabProps.action"
        @click.prevent="handleItemClick(item)"
      >
        <span v-if="item.icon" :class="item.icon" v-bind="tabProps.icon" />
        <span v-bind="tabProps.label">{{ item.label }}</span>
      </a>
    </template>
  </TabMenu>
</template>
