import type { TaskPriority, TaskStatus } from './task'

export type InboxMode = 'ASSIGNED' | 'WATCHING' | 'DUE_SOON' | 'OVERDUE' | 'ALL_VISIBLE'

export interface InboxTaskItem {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeUserId: string | null
  updatedAt: string
}

export interface TaskWatcherItem {
  userId: string
  name: string
  email: string
  watchedAt: string
}

export interface SavedViewItem {
  id: string
  name: string
  targetType: 'TASKS'
  filterJson: Record<string, unknown>
  sortJson: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SavedViewCreatePayload {
  name: string
  targetType: 'TASKS'
  filterJson: Record<string, unknown>
  sortJson: Record<string, unknown>
}

export interface SavedViewUpdatePayload {
  name?: string
  targetType?: 'TASKS'
  filterJson?: Record<string, unknown>
  sortJson?: Record<string, unknown>
}

export interface InboxFilterState {
  mode: InboxMode
  statuses: TaskStatus[]
  projectId: string | null
  keyword: string
  sort: string
}
