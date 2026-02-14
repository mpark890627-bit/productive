<template>
  <section class="inbox-view">
    <v-card class="inbox-header" rounded="lg" elevation="1">
      <div>
        <h2>Inbox</h2>
        <p>담당 태스크와 보는중 태스크를 빠르게 모아봅니다.</p>
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="reloadAll">새로고침</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save-plus-outline" @click="openSaveDialog">현재 필터 저장</v-btn>
      </div>
    </v-card>

    <v-tabs
      :model-value="inboxStore.filters.mode"
      color="primary"
      density="comfortable"
      class="mode-tabs"
      @update:model-value="onModeChange"
    >
      <v-tab value="ASSIGNED">담당</v-tab>
      <v-tab value="WATCHING">보는중</v-tab>
      <v-tab value="DUE_SOON">마감임박</v-tab>
      <v-tab value="OVERDUE">연체</v-tab>
    </v-tabs>

    <v-card class="filter-card" rounded="lg" elevation="1">
      <div class="filter-grid">
        <v-select
          v-model="statusModel"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          label="상태"
          variant="outlined"
          density="comfortable"
          hide-details
          multiple
          chips
          clearable
        />
        <v-select
          v-model="projectModel"
          :items="projectOptions"
          item-title="title"
          item-value="value"
          label="프로젝트"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />
        <v-text-field
          v-model="keywordModel"
          label="키워드"
          placeholder="제목/설명 검색"
          variant="outlined"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="applyFilters"
        />
      </div>
      <div class="filter-actions">
        <v-select
          :model-value="inboxStore.selectedSavedViewId"
          :items="savedViewOptions"
          item-title="title"
          item-value="value"
          label="Saved View"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          :loading="inboxStore.loadingSavedViews"
          @update:model-value="onSavedViewChange"
        />
        <v-btn variant="outlined" :disabled="!inboxStore.selectedSavedViewId" @click="deleteSelectedSavedView">삭제</v-btn>
        <v-btn color="primary" @click="applyFilters">필터 적용</v-btn>
      </div>
      <v-alert v-if="inboxStore.savedViewError" type="warning" variant="tonal" class="mt-3">
        {{ inboxStore.savedViewError }}
      </v-alert>
    </v-card>

    <v-alert v-if="inboxStore.taskError" type="error" variant="tonal">
      {{ inboxStore.taskError }}
    </v-alert>

    <v-card rounded="lg" elevation="1">
      <v-skeleton-loader v-if="inboxStore.loadingTasks" type="list-item-three-line@4" class="pa-4" />
      <EmptyState
        v-else-if="inboxStore.tasks.length === 0"
        title="표시할 태스크가 없습니다"
        description="필터를 조정하거나 다른 모드를 확인해보세요."
        icon="mdi-inbox-outline"
        class="py-8"
      />
      <v-list v-else lines="two">
        <v-list-item
          v-for="task in inboxStore.tasks"
          :key="task.id"
          class="task-row"
          @click="openTask(task.id)"
        >
          <template #title>
            <div class="task-title-row">
              <span class="task-title">{{ task.title }}</span>
              <div class="task-meta">
                <v-chip size="small" :color="priorityColor(task.priority)" variant="tonal">{{ task.priority }}</v-chip>
                <v-chip size="small" variant="outlined">{{ task.status }}</v-chip>
                <v-chip size="small" prepend-icon="mdi-calendar-month-outline" variant="tonal">
                  {{ task.dueDate || '마감 없음' }}
                </v-chip>
                <v-btn
                  size="small"
                  variant="text"
                  :prepend-icon="inboxStore.isWatched(task.id) ? 'mdi-eye' : 'mdi-eye-outline'"
                  @click.stop="toggleWatch(task.id)"
                >
                  Watch
                </v-btn>
              </div>
            </div>
          </template>
          <template #subtitle>
            <p class="task-description">{{ task.description || '설명 없음' }}</p>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <footer v-if="inboxStore.totalPages > 1" class="pager">
      <v-btn variant="outlined" :disabled="inboxStore.page <= 0" @click="onPrevPage">Prev</v-btn>
      <span>Page {{ inboxStore.page + 1 }} / {{ inboxStore.totalPages }}</span>
      <v-btn
        variant="outlined"
        :disabled="inboxStore.page >= inboxStore.totalPages - 1"
        @click="onNextPage"
      >
        Next
      </v-btn>
    </footer>

    <TaskDetailModal
      :open="taskModalOpen"
      :task="selectedTask"
      @close="taskModalOpen = false"
      @error="showSnackbar($event, 'error')"
      @updated="onTaskUpdated"
    />

    <v-dialog v-model="saveDialogOpen" max-width="460">
      <v-card>
        <v-card-title class="pt-5 px-5">현재 필터 저장</v-card-title>
        <v-card-text class="px-5">
          <v-text-field
            v-model="saveViewName"
            label="뷰 이름"
            variant="outlined"
            density="comfortable"
            :error-messages="saveDialogError ? [saveDialogError] : []"
            @keyup.enter="submitSaveView"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="savingView" @click="closeSaveDialog">취소</v-btn>
          <v-btn color="primary" :loading="savingView" :disabled="savingView" @click="submitSaveView">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" timeout="2400">
      {{ snackbar.message }}
    </v-snackbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { extractErrorMessage } from '../../api/apiClient'
import { getProjects } from '../../api/projects'
import { getTaskById } from '../../api/tasks'
import EmptyState from '../../components/common/EmptyState.vue'
import TaskDetailModal from '../../components/board/TaskDetailModal.vue'
import { useInboxStore } from '../../stores/inbox'
import { taskPriorityColors } from '../../utils/taskVisuals'
import type { InboxMode } from '../../types/inbox'
import type { TaskItem, TaskPriority, TaskStatus } from '../../types/task'

const inboxStore = useInboxStore()

const statusModel = ref<TaskStatus[]>([])
const projectModel = ref<string | null>(null)
const keywordModel = ref('')
const projectOptions = ref<Array<{ title: string; value: string }>>([])

const taskModalOpen = ref(false)
const selectedTask = ref<TaskItem | null>(null)

const saveDialogOpen = ref(false)
const saveViewName = ref('')
const saveDialogError = ref('')
const savingView = ref(false)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

const statusOptions = [
  { title: 'TODO', value: 'TODO' },
  { title: 'IN_PROGRESS', value: 'IN_PROGRESS' },
  { title: 'DONE', value: 'DONE' },
] as const

const savedViewOptions = computed(() =>
  inboxStore.savedViews.map((view) => ({
    title: view.name,
    value: view.id,
  })),
)

const syncFilterInputs = () => {
  statusModel.value = [...inboxStore.filters.statuses]
  projectModel.value = inboxStore.filters.projectId
  keywordModel.value = inboxStore.filters.keyword
}

const priorityColor = (priority: TaskPriority) => taskPriorityColors[priority]

const showSnackbar = (message: string, color: 'success' | 'error') => {
  snackbar.show = false
  snackbar.message = message
  snackbar.color = color
  setTimeout(() => {
    snackbar.show = true
  }, 10)
}

const loadProjectOptions = async () => {
  const page = await getProjects({ page: 0, size: 200, sort: 'name,asc' })
  projectOptions.value = page.content.map((project) => ({
    title: project.name,
    value: project.id,
  }))
}

const reloadAll = async () => {
  try {
    await Promise.all([loadProjectOptions(), inboxStore.loadSavedViewList(), inboxStore.loadTasks()])
    showSnackbar('인박스를 새로고침했습니다.', 'success')
  } catch {
    showSnackbar('새로고침 중 오류가 발생했습니다.', 'error')
  }
}

const onModeChange = async (mode: InboxMode) => {
  await inboxStore.setMode(mode)
  syncFilterInputs()
}

const applyFilters = async () => {
  await inboxStore.applyFilters({
    statuses: [...statusModel.value],
    projectId: projectModel.value,
    keyword: keywordModel.value.trim(),
  })
}

const onSavedViewChange = async (savedViewId: string | null) => {
  await inboxStore.applySavedView(savedViewId)
  syncFilterInputs()
}

const openSaveDialog = () => {
  saveDialogOpen.value = true
  saveViewName.value = ''
  saveDialogError.value = ''
}

const closeSaveDialog = () => {
  saveDialogOpen.value = false
  saveViewName.value = ''
  saveDialogError.value = ''
  savingView.value = false
}

const submitSaveView = async () => {
  try {
    savingView.value = true
    saveDialogError.value = ''
    await inboxStore.saveCurrentView(saveViewName.value)
    closeSaveDialog()
    showSnackbar('Saved View가 저장되었습니다.', 'success')
  } catch (error) {
    saveDialogError.value = extractErrorMessage(error, '저장된 뷰 저장에 실패했습니다.')
  } finally {
    savingView.value = false
  }
}

const deleteSelectedSavedView = async () => {
  if (!inboxStore.selectedSavedViewId) {
    return
  }
  try {
    await inboxStore.removeSavedView(inboxStore.selectedSavedViewId)
    showSnackbar('Saved View를 삭제했습니다.', 'success')
  } catch (error) {
    showSnackbar(extractErrorMessage(error, 'Saved View 삭제에 실패했습니다.'), 'error')
  }
}

const openTask = async (taskId: string) => {
  try {
    selectedTask.value = await getTaskById(taskId)
    taskModalOpen.value = true
  } catch (error) {
    showSnackbar(extractErrorMessage(error, '태스크 상세를 불러오지 못했습니다.'), 'error')
  }
}

const toggleWatch = async (taskId: string) => {
  try {
    await inboxStore.toggleWatch(taskId)
    showSnackbar('Watch 상태가 변경되었습니다.', 'success')
    if (inboxStore.filters.mode === 'WATCHING') {
      await inboxStore.loadTasks()
    }
  } catch (error) {
    showSnackbar(extractErrorMessage(error, 'Watch 상태 변경에 실패했습니다.'), 'error')
  }
}

const onTaskUpdated = async (task: TaskItem) => {
  selectedTask.value = task
  await inboxStore.loadTasks()
}

const onPrevPage = async () => {
  if (inboxStore.page > 0) {
    await inboxStore.setPage(inboxStore.page - 1)
  }
}

const onNextPage = async () => {
  if (inboxStore.page < inboxStore.totalPages - 1) {
    await inboxStore.setPage(inboxStore.page + 1)
  }
}

onMounted(async () => {
  syncFilterInputs()
  await Promise.all([loadProjectOptions(), inboxStore.loadSavedViewList(), inboxStore.loadTasks()])
})
</script>

<style scoped>
.inbox-view {
  display: grid;
  gap: 12px;
}

.inbox-header {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.inbox-header h2 {
  margin: 0;
}

.inbox-header p {
  margin: 2px 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.mode-tabs {
  background: rgba(var(--v-theme-surface), 0.7);
  border-radius: 12px;
  padding-inline: 8px;
}

.filter-card {
  padding: 14px;
}

.filter-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.filter-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-actions :deep(.v-input) {
  flex: 1;
}

.task-row {
  cursor: pointer;
}

.task-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.task-title {
  font-weight: 600;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.task-description {
  margin: 4px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pager {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 1000px) {
  .inbox-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-wrap: wrap;
  }
}
</style>
