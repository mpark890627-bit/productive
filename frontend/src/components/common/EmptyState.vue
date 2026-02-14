<template>
  <v-card class="empty" rounded="lg" elevation="0">
    <v-icon size="36" color="outline">{{ icon }}</v-icon>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <slot />
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    icon?: string
  }>(),
  {
    icon: 'mdi-inbox-outline',
  },
)
</script>

<style scoped>
.empty {
  padding: 32px 20px;
  text-align: center;
  border: 1px dashed rgba(var(--v-theme-outline), 0.35);
  background: rgba(var(--v-theme-surface), 0.54);
}

h3 {
  margin: 12px 0 8px;
  font-size: 18px;
}

p {
  margin: 0;
  color: #64748b;
}
</style>
