<template>
  <section class="board-view app-page">
    <v-card class="board-header section-card" rounded="lg" elevation="0">
      <div>
        <h2 class="page-title">Project Board</h2>
        <p class="page-subtitle">{{ projectName }}</p>
      </div>
      <div class="header-actions">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="taskCreateModalOpen = true">새 태스크</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadBoard">새로고침</v-btn>
        <v-btn variant="outlined" :to="`/app/projects/${projectId}/risks`">Risks</v-btn>
        <v-btn variant="text" :to="`/app/projects/${projectId}`">프로젝트 상세</v-btn>
      </div>
    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <section v-if="loading" class="kanban-grid">
      <v-card v-for="status in statuses" :key="status" class="column section-card" rounded="lg" elevation="0">
        <v-skeleton-loader type="heading, article@3" />
      </v-card>
    </section>

    <section v-else class="kanban-grid">
      <v-card v-for="status in statuses" :key="status" class="column section-card" rounded="lg" elevation="0">
        <header class="column-head">
          <h3>{{ statusLabels[status] }}</h3>
          <v-chip :color="statusColors[status]" variant="tonal" size="small">{{ columns[status].length }}</v-chip>
        </header>

        <VueDraggable
          v-model="columns[status]"
          group="tasks"
          class="column-body"
          :class="{ 'drop-active': dragOverStatus === status && isDragging }"
          :animation="150"
          @start="onDragStart"
          @change="onColumnChange(status, $event)"
          @add="onColumnAdd(status, $event)"
          @end="onDragEnd"
          @remove="clearDragOver"
          @enter="onDragEnter(status)"
        >
          <KanbanTaskCard
            v-for="element in columns[status]"
            :key="element.id"
            :data-task-id="element.id"
            :task="element"
            @open="openTaskDetail"
            @status-change="onCardStatusChange"
          />

          <EmptyState
            v-if="columns[status].length === 0"
            title="태스크 없음"
            description="새 태스크를 추가하거나 다른 컬럼에서 이동하세요."
            icon="mdi-format-list-bulleted-square"
          />
        </VueDraggable>
      </v-card>
    </section>

    <TaskDetailModal
      :open="taskModalOpen"
      :task="selectedTask"
      @close="taskModalOpen = false"
      @error="showToast($event, 'error')"
      @updated="onTaskUpdated"
    />

    <TaskCreateModal
      :open="taskCreateModalOpen"
      :submitting="taskCreateSubmitting"
      :error-message="taskCreateErrorMessage"
      @close="taskCreateModalOpen = false"
      @submit="createTask"
    />

    <AppToast v-model:show="toast.show" :message="toast.message" :color="toast.color" />
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { VueDraggable } from 'vue-draggable-plus'
import { extractErrorMessage } from '../../api/apiClient'
import { getProjectById } from '../../api/projects'
import { createTaskInProject, getProjectTasks, getTaskById, patchTask } from '../../api/tasks'
import AppToast from '../../components/common/AppToast.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import KanbanTaskCard from '../../components/board/KanbanTaskCard.vue'
import TaskCreateModal from '../../components/board/TaskCreateModal.vue'
import TaskDetailModal from '../../components/board/TaskDetailModal.vue'
import { useToast } from '../../composables/useToast'
import { taskStatusColors, taskStatusLabels } from '../../utils/taskVisuals'
import type { TaskItem, TaskPriority, TaskStatus } from '../../types/task'

type BoardColumns = Record<TaskStatus, TaskItem[]>

const route = useRoute()
const projectId = route.params.id as string

const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
const statusLabels = taskStatusLabels
const statusColors = taskStatusColors

const columns = reactive<BoardColumns>({
  TODO: [],
  IN_PROGRESS: [],
  DONE: [],
})

const loading = ref(false)
const errorMessage = ref('')
const projectName = ref('')
const taskModalOpen = ref(false)
const selectedTask = ref<TaskItem | null>(null)
const taskCreateModalOpen = ref(false)
const taskCreateSubmitting = ref(false)
const taskCreateErrorMessage = ref('')

const dragSnapshot = ref<BoardColumns | null>(null)
const statusUpdatePending = ref(false)
const isDragging = ref(false)
const dragOverStatus = ref<TaskStatus | null>(null)
const processedDragTaskIds = ref<Set<string>>(new Set())

const { toast, openToast } = useToast()

const cloneColumns = (source: BoardColumns): BoardColumns => ({
  TODO: source.TODO.map((task) => ({ ...task, tags: [...task.tags] })),
  IN_PROGRESS: source.IN_PROGRESS.map((task) => ({ ...task, tags: [...task.tags] })),
  DONE: source.DONE.map((task) => ({ ...task, tags: [...task.tags] })),
})

const setColumnsFromTasks = (tasks: TaskItem[]) => {
  const normalized = tasks.map((task) => ({
    ...task,
    title: task.title ?? '',
    description: task.description ?? null,
    priority: task.priority ?? 'MEDIUM',
    tags: task.tags ?? [],
  }))

  columns.TODO = normalized.filter((task) => task.status === 'TODO')
  columns.IN_PROGRESS = normalized.filter((task) => task.status === 'IN_PROGRESS')
  columns.DONE = normalized.filter((task) => task.status === 'DONE')
}

const loadBoard = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const [project, tasksPage] = await Promise.all([
      getProjectById(projectId),
      getProjectTasks(projectId, { page: 0, size: 200, sort: 'updatedAt,desc' }),
    ])

    projectName.value = project.name
    setColumnsFromTasks(tasksPage.content)
  } catch {
    errorMessage.value = '보드 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => openToast(message, type)

const onDragStart = () => {
  isDragging.value = true
  dragSnapshot.value = cloneColumns(columns)
  processedDragTaskIds.value = new Set()
}

const onDragEnd = () => {
  isDragging.value = false
  dragOverStatus.value = null
  if (!statusUpdatePending.value) {
    dragSnapshot.value = null
  }
}

const onDragEnter = (status: TaskStatus) => {
  dragOverStatus.value = status
}

const clearDragOver = () => {
  if (!isDragging.value) {
    dragOverStatus.value = null
  }
}

const rollbackDragSnapshot = () => {
  if (!dragSnapshot.value) {
    return
  }
  const restored = cloneColumns(dragSnapshot.value)
  columns.TODO = restored.TODO
  columns.IN_PROGRESS = restored.IN_PROGRESS
  columns.DONE = restored.DONE
}

const commitStatusChange = async (taskId: string, targetStatus: TaskStatus) => {
  if (processedDragTaskIds.value.has(taskId)) {
    return
  }
  processedDragTaskIds.value.add(taskId)

  const movedTask = columns[targetStatus].find((task) => task.id === taskId)
  if (!movedTask) {
    return
  }

  const previousStatus = dragSnapshot.value
    ? (statuses.find((status) => dragSnapshot.value?.[status].some((task) => task.id === taskId)) ?? movedTask.status)
    : movedTask.status

  movedTask.status = targetStatus
  if (selectedTask.value?.id === taskId) {
    selectedTask.value.status = targetStatus
  }

  try {
    statusUpdatePending.value = true
    await patchTask(taskId, { status: targetStatus })
    showToast('상태가 변경되었습니다.', 'success')
  } catch {
    rollbackDragSnapshot()
    if (selectedTask.value?.id === taskId) {
      selectedTask.value.status = previousStatus
    }
    showToast('상태 변경에 실패하여 롤백했습니다.', 'error')
  } finally {
    statusUpdatePending.value = false
  }
}

const onColumnChange = async (targetStatus: TaskStatus, event: any) => {
  if (!event?.added) {
    return
  }

  const movedTask = event.added.element as TaskItem | undefined
  if (!movedTask || movedTask.id == null) {
    return
  }
  await commitStatusChange(movedTask.id, targetStatus)
}

const onColumnAdd = async (targetStatus: TaskStatus, event: any) => {
  const domTaskId = event?.item?.dataset?.taskId
  if (typeof domTaskId !== 'string' || domTaskId.length === 0) {
    return
  }
  await commitStatusChange(domTaskId, targetStatus)
}

const onCardStatusChange = async (task: TaskItem, targetStatus: TaskStatus) => {
  const previousStatus = task.status
  if (previousStatus === targetStatus) {
    return
  }

  const snapshot = cloneColumns(columns)
  const sourceIndex = columns[previousStatus].findIndex((item) => item.id === task.id)
  if (sourceIndex >= 0) {
    const [moved] = columns[previousStatus].splice(sourceIndex, 1)
    moved.status = targetStatus
    columns[targetStatus].unshift(moved)
  }
  if (selectedTask.value?.id === task.id) {
    selectedTask.value.status = targetStatus
  }

  try {
    await patchTask(task.id, { status: targetStatus })
    showToast('상태가 변경되었습니다.', 'success')
  } catch {
    const restored = cloneColumns(snapshot)
    columns.TODO = restored.TODO
    columns.IN_PROGRESS = restored.IN_PROGRESS
    columns.DONE = restored.DONE
    if (selectedTask.value?.id === task.id) {
      selectedTask.value.status = previousStatus
    }
    showToast('상태 변경에 실패했습니다.', 'error')
  }
}

const openTaskDetail = async (task: TaskItem) => {
  try {
    const detail = await getTaskById(task.id)
    selectedTask.value = detail
    taskModalOpen.value = true
  } catch (error) {
    showToast(extractErrorMessage(error, '태스크 상세를 불러오지 못했습니다.'), 'error')
  }
}

const onTaskUpdated = (updated: TaskItem) => {
  selectedTask.value = updated

  const applyUpdated = (status: TaskStatus) => {
    const index = columns[status].findIndex((task) => task.id === updated.id)
    if (index === -1) {
      return false
    }

    if (status !== updated.status) {
      const [moved] = columns[status].splice(index, 1)
      columns[updated.status].unshift({ ...moved, ...updated })
    } else {
      columns[status][index] = { ...columns[status][index], ...updated }
    }
    return true
  }

  for (const status of statuses) {
    if (applyUpdated(status)) {
      break
    }
  }

  showToast('태스크가 업데이트되었습니다.', 'success')
}

const createTask = async (payload: {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
}) => {
  if (!payload.title.trim()) {
    taskCreateErrorMessage.value = '제목은 필수입니다.'
    return
  }

  try {
    taskCreateSubmitting.value = true
    taskCreateErrorMessage.value = ''
    await createTaskInProject(projectId, {
      title: payload.title.trim(),
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      dueDate: payload.dueDate,
      assigneeUserId: null,
    })
    taskCreateModalOpen.value = false
    showToast('태스크가 생성되었습니다.', 'success')
    await loadBoard()
  } catch (error) {
    taskCreateErrorMessage.value = extractErrorMessage(error, '태스크 생성에 실패했습니다.')
  } finally {
    taskCreateSubmitting.value = false
  }
}

void loadBoard()
</script>

<style scoped>
.board-view {
  display: grid;
  gap: 16px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.kanban-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 16px;
}

.column {
  min-height: 460px;
  padding: 14px;
  display: grid;
  grid-template-rows: auto 1fr;
}

.column-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.column-head h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #4a5a71;
}

.column-body {
  min-height: 320px;
  display: grid;
  gap: 12px;
  align-content: start;
  border-radius: 12px;
  border: 1px dashed rgba(var(--v-theme-outline), 0.24);
  background: rgba(var(--v-theme-surface-variant), 0.2);
  padding: 10px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.column-body.drop-active {
  border-color: rgba(var(--v-theme-primary), 0.55);
  background: rgba(var(--v-theme-primary), 0.09);
}

@media (max-width: 1024px) {
  .kanban-grid {
    grid-template-columns: 1fr;
  }

  .board-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
