<template>
  <section class="card app-page">
    <header class="page-header">
      <div>
        <h2 class="page-title">Tasks</h2>
        <p class="page-subtitle">프로젝트 전역 태스크를 필터/정렬하여 확인합니다.</p>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-refresh" :loading="tasksStore.loading" @click="tasksStore.fetch">
        새로고침
      </v-btn>
    </header>

    <section class="summary-grid">
      <v-card
        class="summary-card section-card"
        :class="{ active: activeQuickFilter === 'ALL' }"
        rounded="lg"
        elevation="0"
        @click="applyQuickFilter('ALL')"
      >
        <v-card-text>
          <p class="summary-label">전체</p>
          <h3>{{ tasksStore.summary?.totalCount ?? 0 }}</h3>
        </v-card-text>
      </v-card>
      <v-card
        class="summary-card section-card"
        :class="{ active: activeQuickFilter === 'IN_PROGRESS' }"
        rounded="lg"
        elevation="0"
        @click="applyQuickFilter('IN_PROGRESS')"
      >
        <v-card-text>
          <p class="summary-label">진행중</p>
          <h3>{{ tasksStore.summary?.inProgressCount ?? 0 }}</h3>
        </v-card-text>
      </v-card>
      <v-card
        class="summary-card section-card"
        :class="{ active: activeQuickFilter === 'DUE_SOON' }"
        rounded="lg"
        elevation="0"
        @click="applyQuickFilter('DUE_SOON')"
      >
        <v-card-text>
          <p class="summary-label">마감임박</p>
          <h3>{{ tasksStore.summary?.dueSoonCount ?? 0 }}</h3>
        </v-card-text>
      </v-card>
      <v-card
        class="summary-card section-card"
        :class="{ active: activeQuickFilter === 'OVERDUE' }"
        rounded="lg"
        elevation="0"
        @click="applyQuickFilter('OVERDUE')"
      >
        <v-card-text>
          <p class="summary-label">연체</p>
          <h3>{{ tasksStore.summary?.overdueCount ?? 0 }}</h3>
        </v-card-text>
      </v-card>
    </section>

    <v-card class="section-card filter-card" rounded="lg" elevation="0">
      <div class="filter-grid">
        <v-select
          v-model="projectModel"
          :items="projectOptions"
          item-title="title"
          item-value="value"
          label="프로젝트"
          clearable
          hide-details
        />
        <v-select
          v-model="statusModel"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          label="상태"
          clearable
          hide-details
        />
        <v-select
          v-model="priorityModel"
          :items="priorityOptions"
          item-title="title"
          item-value="value"
          label="우선순위"
          clearable
          hide-details
        />
        <v-select
          v-model="assigneeScope"
          :items="assigneeOptions"
          item-title="title"
          item-value="value"
          label="담당자"
          hide-details
        />
        <v-text-field v-model="dueFromModel" type="date" label="마감 시작일" hide-details />
        <v-text-field v-model="dueToModel" type="date" label="마감 종료일" hide-details />
        <v-select
          v-model="sortModel"
          :items="sortOptions"
          item-title="title"
          item-value="value"
          label="정렬"
          hide-details
        />
        <v-text-field
          v-model="keywordModel"
          label="키워드 검색"
          prepend-inner-icon="mdi-magnify"
          placeholder="제목/설명"
          hide-details
        />
      </div>
      <div class="filter-actions">
        <v-btn variant="outlined" @click="resetFilters">초기화</v-btn>
        <v-btn color="primary" @click="applyFilters">적용</v-btn>
      </div>
    </v-card>

    <v-alert v-if="tasksStore.errorMessage" type="error" class="section-card">{{ tasksStore.errorMessage }}</v-alert>

    <SkeletonList v-if="tasksStore.loading" type="table" />
    <EmptyState
      v-else-if="tasksStore.items.length === 0"
      title="태스크가 없습니다"
      description="필터를 조정하거나 프로젝트를 확인해보세요."
      icon="mdi-format-list-bulleted-square"
      class="section-card"
    />
    <v-card v-else class="section-card table-wrap" rounded="lg" elevation="0">
      <v-data-table
        :headers="headers"
        :items="tasksStore.items"
        item-key="id"
        hover
        @click:row="onRowClick"
      >
        <template #item.title="{ item }">
          <div class="title-cell">
            <strong>{{ item.title }}</strong>
            <small class="muted-text">{{ item.description || '설명 없음' }}</small>
          </div>
        </template>
        <template #item.projectId="{ item }">
          {{ projectNameMap.get(item.projectId) || '-' }}
        </template>
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" variant="tonal">{{ item.status }}</v-chip>
        </template>
        <template #item.priority="{ item }">
          <v-chip :color="priorityColor(item.priority)" variant="tonal">{{ item.priority }}</v-chip>
        </template>
        <template #item.assigneeUserId="{ item }">
          {{ item.assigneeUserId || '-' }}
        </template>
        <template #item.dueDate="{ item }">
          {{ item.dueDate || '-' }}
        </template>
        <template #item.updatedAt="{ item }">
          {{ formatDate(item.updatedAt) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn
            size="small"
            variant="text"
            prepend-icon="mdi-view-kanban-outline"
            @click.stop="goBoard(item.projectId)"
          >
            보드
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <footer class="pager" v-if="tasksStore.totalPages > 1">
      <v-pagination
        :model-value="tasksStore.page + 1"
        :length="tasksStore.totalPages"
        :total-visible="7"
        @update:model-value="onPageChange"
      />
    </footer>

    <TaskDetailModal
      :open="taskModalOpen"
      :task="selectedTask"
      @close="taskModalOpen = false"
      @updated="onTaskUpdated"
      @error="openToast($event, 'error')"
    />

    <AppToast v-model:show="toast.show" :message="toast.message" :color="toast.color" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectById, getProjects } from '../../api/projects'
import { getTaskById } from '../../api/tasks'
import AppToast from '../../components/common/AppToast.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import SkeletonList from '../../components/common/SkeletonList.vue'
import TaskDetailModal from '../../components/board/TaskDetailModal.vue'
import { useToast } from '../../composables/useToast'
import { useAuthStore } from '../../stores/auth'
import { useTasksListStore } from '../../stores/tasksList'
import { taskPriorityColors, taskStatusColors } from '../../utils/taskVisuals'
import type { TaskItem, TaskPriority, TaskStatus } from '../../types/task'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const tasksStore = useTasksListStore()
const { toast, openToast } = useToast()

const projectOptions = ref<Array<{ title: string; value: string }>>([])
const projectNameMap = ref<Map<string, string>>(new Map())
const taskModalOpen = ref(false)
const selectedTask = ref<TaskItem | null>(null)
const syncFromRoute = ref(false)

const projectModel = ref<string | null>(null)
const statusModel = ref<TaskStatus | null>(null)
const priorityModel = ref<TaskPriority | null>(null)
const assigneeScope = ref<'ALL' | 'ME'>('ALL')
const dueFromModel = ref<string | null>(null)
const dueToModel = ref<string | null>(null)
const keywordModel = ref('')
const sortModel = ref('updatedAt,desc')
const activeQuickFilter = ref<'ALL' | 'IN_PROGRESS' | 'DUE_SOON' | 'OVERDUE'>('ALL')

const headers = [
  { title: '제목', key: 'title', sortable: false },
  { title: '프로젝트', key: 'projectId', sortable: false },
  { title: '상태', key: 'status', sortable: false },
  { title: '우선순위', key: 'priority', sortable: false },
  { title: '담당자', key: 'assigneeUserId', sortable: false },
  { title: '마감일', key: 'dueDate', sortable: false },
  { title: '수정일', key: 'updatedAt', sortable: false },
  { title: '', key: 'actions', sortable: false, width: 120 },
]

const statusOptions = [
  { title: '전체', value: null },
  { title: 'TODO', value: 'TODO' },
  { title: 'IN_PROGRESS', value: 'IN_PROGRESS' },
  { title: 'DONE', value: 'DONE' },
] as const

const priorityOptions = [
  { title: '전체', value: null },
  { title: 'LOW', value: 'LOW' },
  { title: 'MEDIUM', value: 'MEDIUM' },
  { title: 'HIGH', value: 'HIGH' },
] as const

const assigneeOptions = [
  { title: '전체', value: 'ALL' },
  { title: '내 담당', value: 'ME' },
] as const

const sortOptions = [
  { title: '업데이트 최신순', value: 'updatedAt,desc' },
  { title: '업데이트 오래된순', value: 'updatedAt,asc' },
  { title: '마감일 빠른순', value: 'dueDate,asc' },
  { title: '마감일 늦은순', value: 'dueDate,desc' },
  { title: '우선순위 높은순', value: 'priority,desc' },
  { title: '우선순위 낮은순', value: 'priority,asc' },
] as const

const priorityColor = (priority: TaskPriority) => taskPriorityColors[priority]
const statusColor = (status: TaskStatus) => taskStatusColors[status]

const formatDate = (value: string) => new Date(value).toLocaleString()
const formatDateOnly = (value: Date) => value.toISOString().slice(0, 10)

const loadProjectOptions = async () => {
  const page = await getProjects({ page: 0, size: 200, sort: 'name,asc' })
  projectOptions.value = [{ title: '전체', value: '' }, ...page.content.map((project) => ({ title: project.name, value: project.id }))]
  projectNameMap.value = new Map(page.content.map((project) => [project.id, project.name]))
}

const parseRouteQuery = async () => {
  const q = route.query
  projectModel.value = typeof q.projectId === 'string' && q.projectId ? q.projectId : null
  statusModel.value = typeof q.status === 'string' ? (q.status as TaskStatus) : null
  priorityModel.value = typeof q.priority === 'string' ? (q.priority as TaskPriority) : null
  dueFromModel.value = typeof q.dueFrom === 'string' ? q.dueFrom : null
  dueToModel.value = typeof q.dueTo === 'string' ? q.dueTo : null
  keywordModel.value = typeof q.keyword === 'string' ? q.keyword : ''
  sortModel.value = typeof q.sort === 'string' ? q.sort : 'updatedAt,desc'
  assigneeScope.value = q.assignee === 'ME' ? 'ME' : 'ALL'
  const page = typeof q.page === 'string' ? Number(q.page) : 0
  tasksStore.page = Number.isFinite(page) && page >= 0 ? page : 0
}

const syncRouteQuery = async () => {
  const query: Record<string, string> = {}
  if (projectModel.value) query.projectId = projectModel.value
  if (statusModel.value) query.status = statusModel.value
  if (priorityModel.value) query.priority = priorityModel.value
  if (dueFromModel.value) query.dueFrom = dueFromModel.value
  if (dueToModel.value) query.dueTo = dueToModel.value
  if (keywordModel.value.trim()) query.keyword = keywordModel.value.trim()
  if (assigneeScope.value === 'ME') query.assignee = 'ME'
  if (sortModel.value !== 'updatedAt,desc') query.sort = sortModel.value
  if (tasksStore.page > 0) query.page = String(tasksStore.page)
  await router.replace({ query })
}

const applyFilters = async () => {
  const [field, dir] = sortModel.value.split(',')
  tasksStore.sortField = (field as any) ?? 'updatedAt'
  tasksStore.sortDir = (dir as any) ?? 'desc'
  await tasksStore.applyFilters({
    projectId: projectModel.value,
    status: statusModel.value,
    priority: priorityModel.value,
    assigneeUserId: assigneeScope.value === 'ME' ? authStore.user?.userId ?? null : null,
    dueFrom: dueFromModel.value,
    dueTo: dueToModel.value,
    keyword: keywordModel.value,
  })
  await tasksStore.fetchSummary()
  await syncRouteQuery()
}

const resetFilters = async () => {
  projectModel.value = null
  statusModel.value = null
  priorityModel.value = null
  assigneeScope.value = 'ALL'
  dueFromModel.value = null
  dueToModel.value = null
  keywordModel.value = ''
  sortModel.value = 'updatedAt,desc'
  tasksStore.sortField = 'updatedAt'
  tasksStore.sortDir = 'desc'
  activeQuickFilter.value = 'ALL'
  await tasksStore.resetFilters()
  await tasksStore.fetchSummary()
  await syncRouteQuery()
}

const applyQuickFilter = async (type: 'ALL' | 'IN_PROGRESS' | 'DUE_SOON' | 'OVERDUE') => {
  const today = new Date()
  const dueSoon = new Date(today)
  dueSoon.setDate(today.getDate() + 3)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  activeQuickFilter.value = type

  if (type === 'ALL') {
    statusModel.value = null
    dueFromModel.value = null
    dueToModel.value = null
  } else if (type === 'IN_PROGRESS') {
    statusModel.value = 'IN_PROGRESS'
    dueFromModel.value = null
    dueToModel.value = null
  } else if (type === 'DUE_SOON') {
    statusModel.value = null
    dueFromModel.value = formatDateOnly(today)
    dueToModel.value = formatDateOnly(dueSoon)
  } else if (type === 'OVERDUE') {
    statusModel.value = null
    dueFromModel.value = null
    dueToModel.value = formatDateOnly(yesterday)
  }

  await applyFilters()
}

const onPageChange = async (next: number) => {
  await tasksStore.setPage(next - 1)
  await syncRouteQuery()
}

const onRowClick = async (_event: Event, row: unknown) => {
  const candidate = row as { item?: { id?: string; raw?: { id?: string } } }
  const taskId = candidate.item?.raw?.id ?? candidate.item?.id
  if (!taskId) {
    return
  }
  try {
    selectedTask.value = await getTaskById(taskId)
    taskModalOpen.value = true
  } catch {
    openToast('태스크 상세를 불러오지 못했습니다.', 'error')
  }
}

const onTaskUpdated = (task: TaskItem) => {
  selectedTask.value = task
  void tasksStore.fetch()
}

const goBoard = async (projectId: string) => {
  if (!projectNameMap.value.has(projectId)) {
    try {
      const project = await getProjectById(projectId)
      projectNameMap.value.set(project.id, project.name)
    } catch {
      // no-op
    }
  }
  void router.push(`/app/projects/${projectId}/board`)
}

watch(keywordModel, (value) => {
  tasksStore.setKeywordDebounced(value)
  void syncRouteQuery()
})

watch(
  () => route.fullPath,
  async () => {
    if (syncFromRoute.value) {
      return
    }
    syncFromRoute.value = true
    await parseRouteQuery()
    await applyFilters()
    syncFromRoute.value = false
  },
)

onMounted(async () => {
  await loadProjectOptions()
  await parseRouteQuery()
  await applyFilters()
})
</script>

<style scoped>
.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.summary-card {
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.summary-card:hover {
  border-color: rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.04);
}

.summary-card.active {
  border-color: rgba(37, 99, 235, 0.55);
  background: rgba(37, 99, 235, 0.08);
}

.summary-label {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.summary-card h3 {
  margin: 8px 0 0;
  font-size: 28px;
  letter-spacing: -0.02em;
}

.filter-card {
  padding: 16px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.filter-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.title-cell {
  display: grid;
  gap: 4px;
}

.table-wrap :deep(.v-table__wrapper) {
  overflow-x: auto;
}

.table-wrap :deep(tbody tr:hover) {
  background: rgba(37, 99, 235, 0.05);
}

.pager {
  display: flex;
  justify-content: center;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
