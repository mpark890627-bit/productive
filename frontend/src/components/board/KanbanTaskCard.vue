<template>
  <v-card class="task-card" rounded="lg" elevation="1" @click="$emit('open', task)">
    <div class="head-row">
      <h4 class="title" :title="safeTitle">{{ safeTitle }}</h4>
      <v-chip size="x-small" :color="priorityColor" variant="tonal">{{ safePriority }}</v-chip>
    </div>

    <p class="desc">{{ task.description || '설명 없음' }}</p>

    <div class="meta-row">
      <v-chip size="x-small" variant="outlined" prepend-icon="mdi-calendar-month-outline">
        {{ task.dueDate || '마감 없음' }}
      </v-chip>
    </div>

    <div class="status-row" @click.stop>
      <v-select
        :model-value="task.status"
        :items="statuses"
        density="compact"
        hide-details
        variant="outlined"
        class="status-select"
        @update:model-value="onStatusSelect"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskItem, TaskStatus } from '../../types/task'
import { taskPriorityColors } from '../../utils/taskVisuals'

const props = defineProps<{
  task: TaskItem
}>()

const emit = defineEmits<{
  open: [task: TaskItem]
  statusChange: [task: TaskItem, targetStatus: TaskStatus]
}>()

const safeTitle = computed(() => props.task.title?.trim() || '(제목 없음)')
const safePriority = computed(() => {
  const value = props.task.priority
  return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH' ? value : 'MEDIUM'
})

const priorityColor = computed(() => taskPriorityColors[safePriority.value])
const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']

const isTaskStatus = (value: unknown): value is TaskStatus =>
  value === 'TODO' || value === 'IN_PROGRESS' || value === 'DONE'

const onStatusSelect = (value: unknown) => {
  if (!isTaskStatus(value)) {
    return
  }
  emitStatusChange(value)
}

const emitStatusChange = (status: TaskStatus) => {
  if (status === props.task.status) {
    return
  }
  emit('statusChange', props.task, status)
}
</script>

<style scoped>
.task-card {
  padding: 10px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.45);
}

.head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.title {
  margin: 0;
  font-size: 14px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  margin: 8px 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.status-row {
  margin-top: 8px;
}

.status-select {
  max-width: 160px;
}
</style>
