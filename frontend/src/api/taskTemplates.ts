import { apiClient, type ApiEnvelope, type ApiMeta, unwrapData } from './apiClient'
import type {
  TaskTemplate,
  TaskTemplateApplyPayload,
  TaskTemplateApplyResult,
  TaskTemplateCreatePayload,
  TaskTemplateItem,
  TaskTemplateItemUpsertPayload,
  TaskTemplateUpdatePayload,
  TemplatePage,
} from '../types/template'

interface GetTaskTemplatesParams {
  page?: number
  size?: number
  sort?: string
}

export async function getTaskTemplates(params: GetTaskTemplatesParams = {}) {
  const { data } = await apiClient.get('/api/task-templates', { params })
  const envelope = data as ApiEnvelope<TaskTemplate[], ApiMeta | null>
  return {
    data: envelope.data,
    meta: envelope.meta,
  } satisfies TemplatePage
}

export async function getTaskTemplateById(templateId: string) {
  const { data } = await apiClient.get(`/api/task-templates/${templateId}`)
  return unwrapData<TaskTemplate>(data)
}

export async function createTaskTemplate(payload: TaskTemplateCreatePayload) {
  const { data } = await apiClient.post('/api/task-templates', payload)
  return unwrapData<TaskTemplate>(data)
}

export async function updateTaskTemplate(templateId: string, payload: TaskTemplateUpdatePayload) {
  const { data } = await apiClient.patch(`/api/task-templates/${templateId}`, payload)
  return unwrapData<TaskTemplate>(data)
}

export async function deleteTaskTemplate(templateId: string) {
  await apiClient.delete(`/api/task-templates/${templateId}`)
}

export async function createTaskTemplateItem(templateId: string, payload: TaskTemplateItemUpsertPayload) {
  const { data } = await apiClient.post(`/api/task-templates/${templateId}/items`, payload)
  return unwrapData<TaskTemplateItem>(data)
}

export async function updateTaskTemplateItem(itemId: string, payload: Partial<TaskTemplateItemUpsertPayload>) {
  const { data } = await apiClient.patch(`/api/task-template-items/${itemId}`, payload)
  return unwrapData<TaskTemplateItem>(data)
}

export async function deleteTaskTemplateItem(itemId: string) {
  await apiClient.delete(`/api/task-template-items/${itemId}`)
}

export async function applyTaskTemplateToProject(
  projectId: string,
  templateId: string,
  payload: TaskTemplateApplyPayload = {},
) {
  const { data } = await apiClient.post(`/api/projects/${projectId}/task-templates/${templateId}/apply`, payload)
  return unwrapData<TaskTemplateApplyResult>(data)
}
