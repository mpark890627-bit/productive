import type { ApiMeta } from '../api/apiClient'

export type TemplateDefaultAssignee = 'ME' | 'UNASSIGNED'
export type TemplateTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TemplateTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface TaskTemplateItem {
  id: string
  title: string
  description: string | null
  defaultStatus: TemplateTaskStatus
  defaultPriority: TemplateTaskPriority
  defaultAssignee: TemplateDefaultAssignee
  dueOffsetDays: number | null
  sortOrder: number
}

export interface TaskTemplate {
  id: string
  name: string
  description: string | null
  items: TaskTemplateItem[]
  createdAt: string
  updatedAt: string
}

export interface TaskTemplateCreatePayload {
  name: string
  description?: string
  items?: TaskTemplateItemUpsertPayload[]
}

export interface TaskTemplateUpdatePayload {
  name?: string
  description?: string
}

export interface TaskTemplateItemUpsertPayload {
  title: string
  description?: string
  defaultStatus?: TemplateTaskStatus
  defaultPriority?: TemplateTaskPriority
  defaultAssignee?: TemplateDefaultAssignee
  dueOffsetDays?: number | null
  sortOrder?: number
}

export interface TaskTemplateApplyPayload {
  baseDate?: string
  overrideAssigneeUserId?: string
}

export interface TaskTemplateApplyResult {
  projectId: string
  templateId: string
  createdCount: number
  createdTaskIds: string[]
}

export interface TemplatePage {
  data: TaskTemplate[]
  meta: ApiMeta | null
}
