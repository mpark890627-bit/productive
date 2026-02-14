import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { createSavedView, deleteSavedView, getSavedViews } from '../api/savedViews'
import { getInboxTasks, getTaskWatchers, unwatchTask, watchTask } from '../api/inbox'
import { useAuthStore } from './auth'
import type { InboxFilterState, InboxMode, InboxTaskItem, SavedViewItem } from '../types/inbox'
import type { TaskStatus } from '../types/task'

const defaultFilterState = (): InboxFilterState => ({
  mode: 'ASSIGNED',
  statuses: [],
  projectId: null,
  keyword: '',
  sort: 'updatedAt,desc',
})

const readStatusList = (value: unknown): TaskStatus[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value.filter((item): item is TaskStatus =>
    item === 'TODO' || item === 'IN_PROGRESS' || item === 'DONE',
  )
}

const readString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export const useInboxStore = defineStore('inbox', () => {
  const authStore = useAuthStore()

  const tasks = ref<InboxTaskItem[]>([])
  const savedViews = ref<SavedViewItem[]>([])
  const selectedSavedViewId = ref<string | null>(null)
  const watchedTaskIds = ref<Set<string>>(new Set())

  const page = ref(0)
  const size = ref(20)
  const totalPages = ref(0)
  const totalElements = ref(0)

  const loadingTasks = ref(false)
  const loadingSavedViews = ref(false)
  const taskError = ref('')
  const savedViewError = ref('')

  const filters = reactive<InboxFilterState>(defaultFilterState())

  const selectedSavedView = computed(() =>
    savedViews.value.find((view) => view.id === selectedSavedViewId.value) ?? null,
  )

  const isWatched = (taskId: string) => watchedTaskIds.value.has(taskId)

  const loadWatchState = async (items: InboxTaskItem[]) => {
    const currentUserId = authStore.user?.userId
    if (!currentUserId || items.length === 0) {
      watchedTaskIds.value = new Set()
      return
    }

    const pairs = await Promise.all(
      items.map(async (task) => {
        try {
          const watchers = await getTaskWatchers(task.id)
          return [task.id, watchers.some((watcher) => watcher.userId === currentUserId)] as const
        } catch {
          return [task.id, false] as const
        }
      }),
    )

    watchedTaskIds.value = new Set(pairs.filter(([, watched]) => watched).map(([taskId]) => taskId))
  }

  const loadTasks = async () => {
    loadingTasks.value = true
    taskError.value = ''
    try {
      const response = await getInboxTasks({
        mode: filters.mode,
        status: filters.statuses.length > 0 ? filters.statuses : undefined,
        projectId: filters.projectId ?? undefined,
        keyword: filters.keyword.trim() || undefined,
        page: page.value,
        size: size.value,
        sort: filters.sort,
      })

      tasks.value = response.content
      totalPages.value = response.totalPages
      totalElements.value = response.totalElements
      await loadWatchState(response.content)
    } catch {
      taskError.value = '인박스 태스크를 불러오지 못했습니다.'
      tasks.value = []
      watchedTaskIds.value = new Set()
    } finally {
      loadingTasks.value = false
    }
  }

  const loadSavedViewList = async () => {
    loadingSavedViews.value = true
    savedViewError.value = ''
    try {
      savedViews.value = await getSavedViews('TASKS')
    } catch {
      savedViewError.value = '저장된 뷰를 불러오지 못했습니다.'
      savedViews.value = []
    } finally {
      loadingSavedViews.value = false
    }
  }

  const setMode = async (mode: InboxMode) => {
    filters.mode = mode
    page.value = 0
    selectedSavedViewId.value = null
    await loadTasks()
  }

  const setStatuses = async (statuses: TaskStatus[]) => {
    filters.statuses = statuses
    page.value = 0
    selectedSavedViewId.value = null
    await loadTasks()
  }

  const setProjectId = async (projectId: string | null) => {
    filters.projectId = projectId
    page.value = 0
    selectedSavedViewId.value = null
    await loadTasks()
  }

  const setKeyword = async (keyword: string) => {
    filters.keyword = keyword
    page.value = 0
    selectedSavedViewId.value = null
    await loadTasks()
  }

  const setPage = async (nextPage: number) => {
    page.value = nextPage
    await loadTasks()
  }

  const applyFilters = async (next: { statuses: TaskStatus[]; projectId: string | null; keyword: string }) => {
    filters.statuses = next.statuses
    filters.projectId = next.projectId
    filters.keyword = next.keyword
    page.value = 0
    selectedSavedViewId.value = null
    await loadTasks()
  }

  const saveCurrentView = async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      throw new Error('저장된 뷰 이름은 필수입니다.')
    }

    const created = await createSavedView({
      name: trimmed,
      targetType: 'TASKS',
      filterJson: {
        mode: filters.mode,
        status: filters.statuses,
        projectId: filters.projectId,
        keyword: filters.keyword.trim() || null,
      },
      sortJson: { value: filters.sort },
    })
    await loadSavedViewList()
    selectedSavedViewId.value = created.id
    return created
  }

  const applySavedView = async (savedViewId: string | null) => {
    selectedSavedViewId.value = savedViewId
    if (!savedViewId) {
      Object.assign(filters, defaultFilterState())
      page.value = 0
      await loadTasks()
      return
    }

    const view = savedViews.value.find((item) => item.id === savedViewId)
    if (!view) {
      return
    }

    const modeFromView = view.filterJson.mode
    filters.mode =
      modeFromView === 'ASSIGNED' ||
      modeFromView === 'WATCHING' ||
      modeFromView === 'DUE_SOON' ||
      modeFromView === 'OVERDUE' ||
      modeFromView === 'ALL_VISIBLE'
        ? modeFromView
        : 'ASSIGNED'
    filters.statuses = readStatusList(view.filterJson.status)
    filters.projectId = readString(view.filterJson.projectId)
    filters.keyword = readString(view.filterJson.keyword) ?? ''
    filters.sort = readString(view.sortJson.value) ?? 'updatedAt,desc'

    page.value = 0
    await loadTasks()
  }

  const removeSavedView = async (savedViewId: string) => {
    await deleteSavedView(savedViewId)
    if (selectedSavedViewId.value === savedViewId) {
      selectedSavedViewId.value = null
    }
    await loadSavedViewList()
  }

  const toggleWatch = async (taskId: string) => {
    const watched = watchedTaskIds.value.has(taskId)
    const next = new Set(watchedTaskIds.value)
    if (watched) {
      await unwatchTask(taskId)
      next.delete(taskId)
    } else {
      await watchTask(taskId)
      next.add(taskId)
    }
    watchedTaskIds.value = next
  }

  return {
    filters,
    tasks,
    page,
    size,
    totalPages,
    totalElements,
    loadingTasks,
    loadingSavedViews,
    taskError,
    savedViewError,
    savedViews,
    selectedSavedViewId,
    selectedSavedView,
    isWatched,
    loadTasks,
    loadSavedViewList,
    setMode,
    setStatuses,
    setProjectId,
    setKeyword,
    setPage,
    applyFilters,
    saveCurrentView,
    applySavedView,
    removeSavedView,
    toggleWatch,
  }
})
