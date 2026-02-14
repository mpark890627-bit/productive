import { apiClient, type ApiEnvelope, type ApiMeta } from './apiClient'
import type { PageResponse } from '../types/project'
import type { InboxMode, InboxTaskItem, TaskWatcherItem } from '../types/inbox'
import type { TaskStatus } from '../types/task'

interface GetInboxTasksParams {
  mode: InboxMode
  status?: TaskStatus[]
  projectId?: string
  keyword?: string
  page?: number
  size?: number
  sort?: string
}

export async function getInboxTasks(params: GetInboxTasksParams) {
  const query = new URLSearchParams()
  query.set('mode', params.mode)
  if (params.status?.length) {
    params.status.forEach((status) => query.append('status', status))
  }
  if (params.projectId) {
    query.set('projectId', params.projectId)
  }
  if (params.keyword?.trim()) {
    query.set('keyword', params.keyword.trim())
  }
  query.set('page', String(params.page ?? 0))
  query.set('size', String(params.size ?? 20))
  query.set('sort', params.sort ?? 'updatedAt,desc')

  const { data } = await apiClient.get(`/api/inbox/tasks?${query.toString()}`)
  const envelope = data as ApiEnvelope<InboxTaskItem[], ApiMeta | null>

  return {
    content: envelope.data,
    totalElements: envelope.meta?.totalElements ?? envelope.data.length,
    totalPages: envelope.meta?.totalPages ?? 1,
    size: envelope.meta?.size ?? envelope.data.length,
    number: envelope.meta?.page ?? 0,
  } satisfies PageResponse<InboxTaskItem>
}

export async function watchTask(taskId: string) {
  await apiClient.post(`/api/tasks/${taskId}/watch`)
}

export async function unwatchTask(taskId: string) {
  await apiClient.delete(`/api/tasks/${taskId}/watch`)
}

export async function getTaskWatchers(taskId: string) {
  const { data } = await apiClient.get(`/api/tasks/${taskId}/watchers`)
  return (data as ApiEnvelope<TaskWatcherItem[], null>).data
}
