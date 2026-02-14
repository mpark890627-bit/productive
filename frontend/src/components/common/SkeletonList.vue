<template>
  <v-card class="section-card skeleton-list" rounded="lg" elevation="0">
    <v-skeleton-loader :type="resolvedType" />
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    type?: 'table' | 'list' | 'cards'
  }>(),
  {
    type: 'table',
  },
)

const resolvedType = computed(() => {
  if (props.type === 'list') {
    return 'list-item-three-line@4'
  }
  if (props.type === 'cards') {
    return 'card@3'
  }
  return 'heading, table-row-divider@5'
})
</script>

<style scoped>
.skeleton-list {
  padding: 16px;
}
</style>
