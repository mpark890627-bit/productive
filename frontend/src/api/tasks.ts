import { apiClient, type ApiEnvelope, type ApiMeta, unwrapData } from './apiClient'
import type { TaskItem, TaskStatus } from '../types/task'
import type { PageResponse } from '../types/project'

interface GetProjectTasksParams {
  page?: number
  size?: number
  sort?: string
  status?: TaskStatus
  assigneeUserId?: string
  dueFrom?: string
  dueTo?: string
  keyword?: string
}

interface UpdateTaskPayload {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
  assigneeUserId?: string
}

interface CreateTaskPayload {
  title: string
  description?: string | null
  status: TaskStatus
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string | null
  assigneeUserId?: string | null
}

export async function getProjectTasks(projectId: string, params: GetProjectTasksParams = {}) {
  const { data } = await apiClient.get(`/api/projects/${projectId}/tasks`, { params })
  const envelope = data as ApiEnvelope<TaskItem[], ApiMeta | null>
  return {
    content: envelope.data,
    totalElements: envelope.meta?.totalElements ?? envelope.data.length,
    totalPages: envelope.meta?.totalPages ?? 1,
    size: envelope.meta?.size ?? envelope.data.length,
    number: envelope.meta?.page ?? 0,
  } satisfies PageResponse<TaskItem>
}

export async function createTaskInProject(projectId: string, payload: CreateTaskPayload) {
  const { data } = await apiClient.post(`/api/projects/${projectId}/tasks`, payload)
  return unwrapData<TaskItem>(data)
}

export async function getTaskById(taskId: string) {
  const { data } = await apiClient.get(`/api/tasks/${taskId}`)
  return unwrapData<TaskItem>(data)
}

export async function patchTask(taskId: string, payload: UpdateTaskPayload) {
  const { data } = await apiClient.patch(`/api/tasks/${taskId}`, payload)
  return unwrapData<TaskItem>(data)
}

export async function attachTagToTask(taskId: string, tagId: string) {
  await apiClient.post(`/api/tasks/${taskId}/tags/${tagId}`)
}
