<template>
  <v-data-table
    :headers="headers"
    :items="projects"
    item-value="id"
    class="project-table section-card"
    density="comfortable"
    hover
    hide-default-footer
  >
    <template #[`item.name`]="{ item }">
      <button type="button" class="name-link" @click="$emit('open', item)">
        <strong>{{ item.name }}</strong>
      </button>
    </template>

    <template #[`item.description`]="{ item }">
      <span class="desc-cell">{{ item.description || '-' }}</span>
    </template>

    <template #[`item.updatedAt`]="{ item }">
      {{ formatDate(item.updatedAt) }}
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="actions">
        <v-tooltip text="수정" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-pencil-outline"
              size="small"
              variant="text"
              @click="$emit('edit', item)"
            />
          </template>
        </v-tooltip>
        <v-tooltip text="삭제" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-trash-can-outline"
              size="small"
              color="error"
              variant="text"
              @click="$emit('delete', item)"
            />
          </template>
        </v-tooltip>
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
  border-radius: 12px;
  overflow: hidden;
}

.project-table :deep(thead th) {
  background: rgba(var(--v-theme-surface-variant), 0.62);
  font-weight: 600;
  color: #425166;
}

.project-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04);
}

.name-link {
  border: 0;
  background: transparent;
  padding: 2px 0;
  cursor: pointer;
  color: rgb(var(--v-theme-primary));
  text-align: left;
  font: inherit;
  max-width: 240px;
  font-weight: 600;
}

.name-link:hover {
  text-decoration: underline;
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
