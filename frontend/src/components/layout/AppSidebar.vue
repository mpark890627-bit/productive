<template>
  <v-navigation-drawer
    :model-value="drawer"
    :temporary="mobile"
    :permanent="!mobile"
    :rail="!mobile && rail"
    :width="mobile ? 270 : 248"
    class="sidebar"
    color="surface"
    border="end"
    @update:model-value="(v) => emit('update:drawer', Boolean(v))"
  >
    <div class="sidebar-head" :class="{ compact: !mobile && rail }">
      <v-btn
        v-if="!mobile"
        icon="mdi-chevron-left"
        size="small"
        variant="text"
        class="collapse-btn"
        @click="emit('update:rail', !rail)"
      />
      <div v-if="mobile || !rail">
        <span class="eyebrow">Work Hub</span>
        <h2 class="logo">PRODUCTIV</h2>
      </div>
      <v-icon v-else icon="mdi-briefcase-clock-outline" />
    </div>

    <v-list nav density="comfortable" class="menu-list">
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.enabled ? item.to : undefined"
        :disabled="!item.enabled"
        rounded="lg"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
export interface SidebarMenuItem {
  title: string
  icon: string
  to: string
  enabled: boolean
}

defineProps<{
  drawer: boolean
  rail: boolean
  mobile: boolean
  menuItems: SidebarMenuItem[]
}>()

const emit = defineEmits<{
  'update:drawer': [value: boolean]
  'update:rail': [value: boolean]
}>()
</script>

<style scoped>
.sidebar {
  border-right-color: rgba(var(--v-theme-outline), 0.2);
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 0.94), rgba(var(--v-theme-surface-variant), 0.78));
}

.sidebar-head {
  min-height: 80px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.16);
}

.sidebar-head.compact {
  justify-content: center;
  padding-inline: 0;
}

.collapse-btn {
  margin-right: 2px;
}

.eyebrow {
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f6f86;
  font-weight: 600;
}

.logo {
  margin: 4px 0 0;
  font-size: 17px;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.menu-list {
  padding: 10px 10px;
}
</style>
