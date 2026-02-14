<template>
  <v-data-table
    :headers="headers"
    :items="projects"
    item-value="id"
    class="project-table"
    density="comfortable"
    hover
    hide-default-footer
  >
    <template #[`item.name`]="{ item }">
      <div class="name-cell">
        <strong>{{ item.name }}</strong>
      </div>
    </template>

    <template #[`item.description`]="{ item }">
      <span class="desc-cell">{{ item.description || '-' }}</span>
    </template>

    <template #[`item.updatedAt`]="{ item }">
      {{ formatDate(item.updatedAt) }}
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="actions">
        <v-btn size="small" variant="tonal" @click="$emit('open', item)">열기</v-btn>
        <v-btn size="small" variant="outlined" @click="$emit('edit', item)">수정</v-btn>
        <v-btn size="small" color="error" variant="text" @click="$emit('delete', item)">삭제</v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import type { ProjectItem } from '../../types/project'

defineProps<{
  projects: ProjectItem[]
}>()

defineEmits<{
  open: [project: ProjectItem]
  edit: [project: ProjectItem]
  delete: [project: ProjectItem]
}>()

const headers = [
  { title: '이름', key: 'name' },
  { title: '설명', key: 'description' },
  { title: '수정일', key: 'updatedAt' },
  { title: '액션', key: 'actions', sortable: false, width: 220 },
]

const formatDate = (dateTime: string) => new Date(dateTime).toLocaleString()
</script>

<style scoped>
.project-table {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 14px;
  overflow: hidden;
}

.name-cell {
  max-width: 240px;
}

.desc-cell {
  color: #475569;
}

.actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
</style>
