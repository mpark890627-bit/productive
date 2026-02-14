<template>
  <v-card class="empty section-card" rounded="lg" elevation="0">
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
  padding: 32px 24px;
  text-align: center;
  border: 1px dashed rgba(var(--v-theme-outline), 0.34);
  background: rgba(var(--v-theme-surface), 0.74);
}

h3 {
  margin: 14px 0 8px;
  font-size: 19px;
  font-weight: 700;
}

p {
  margin: 0;
  color: #5f6f86;
  font-size: 0.94rem;
}
</style>
