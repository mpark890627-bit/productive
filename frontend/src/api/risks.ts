import { apiClient, type ApiEnvelope, type ApiMeta, unwrapData } from './apiClient'
import type { PageResponse } from '../types/project'
import type {
  RiskActionItem,
  RiskActivityItem,
  RiskCommentItem,
  RiskItem,
  RiskLevelBucket,
  RiskLinkedTaskItem,
  RiskMatrixSummary,
  RiskStatus,
  RiskSummary,
  RiskTagItem,
} from '../types/risk'

interface ListRisksParams {
  page?: number
  size?: number
  sort?: string
  status?: RiskStatus
  levelBucket?: RiskLevelBucket
  probability?: number
  impact?: number
  ownerUserId?: string
  keyword?: string
  tagId?: string
}

export interface RiskCreatePayload {
  title: string
  description?: string
  category?: string
  status?: RiskStatus
  probability?: number
  impact?: number
  ownerUserId?: string
  nextReviewDate?: string
  mitigationPlan?: string
  contingencyPlan?: string
  triggers?: string
}

export interface RiskPatchPayload {
  title?: string
  description?: string
  category?: string
  status?: RiskStatus
  probability?: number
  impact?: number
  ownerUserId?: string
  nextReviewDate?: string
  mitigationPlan?: string
  contingencyPlan?: string
  triggers?: string
}

export interface RiskActionCreatePayload {
  title: string
  description?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  dueDate?: string
  assigneeUserId?: string
}

export interface RiskActionPatchPayload {
  title?: string
  description?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  dueDate?: string
  assigneeUserId?: string
}

interface PagingParams {
  page?: number
  size?: number
  sort?: string
}

function toPageResponse<T>(envelope: ApiEnvelope<T[], ApiMeta | null>): PageResponse<T> {
  return {
    content: envelope.data,
    totalElements: envelope.meta?.totalElements ?? envelope.data.length,
    totalPages: envelope.meta?.totalPages ?? 1,
    size: envelope.meta?.size ?? envelope.data.length,
    number: envelope.meta?.page ?? 0,
  }
}

export async function listRisks(projectId: string, params: ListRisksParams = {}) {
  const { data } = await apiClient.get(`/api/projects/${projectId}/risks`, { params })
  const envelope = data as ApiEnvelope<RiskItem[], ApiMeta | null>
  return toPageResponse(envelope)
}

export async function createRisk(projectId: string, payload: RiskCreatePayload) {
  const { data } = await apiClient.post(`/api/projects/${projectId}/risks`, payload)
  return unwrapData<RiskItem>(data)
}

export async function getRisk(riskId: string) {
  const { data } = await apiClient.get(`/api/risks/${riskId}`)
  return unwrapData<RiskItem>(data)
}

export async function updateRisk(riskId: string, payload: RiskPatchPayload) {
  const { data } = await apiClient.patch(`/api/risks/${riskId}`, payload)
  return unwrapData<RiskItem>(data)
}

export async function deleteRisk(riskId: string) {
  await apiClient.delete(`/api/risks/${riskId}`)
}

export async function closeRisk(riskId: string) {
  const { data } = await apiClient.post(`/api/risks/${riskId}/close`)
  return unwrapData<RiskItem>(data)
}

export async function getRiskSummary(projectId: string) {
  const { data } = await apiClient.get(`/api/projects/${projectId}/risks/summary`)
  return unwrapData<RiskSummary>(data)
}

interface MatrixSummaryParams {
  status?: RiskStatus
  levelBucket?: RiskLevelBucket
  ownerUserId?: string
  keyword?: string
  tagId?: string
}

export async function getRiskMatrixSummary(projectId: string, params: MatrixSummaryParams = {}) {
  const { data } = await apiClient.get(`/api/projects/${projectId}/risks/matrix-summary`, { params })
  return unwrapData<RiskMatrixSummary>(data)
}

export async function createRiskAction(riskId: string, payload: RiskActionCreatePayload) {
  const { data } = await apiClient.post(`/api/risks/${riskId}/actions`, payload)
  return unwrapData<RiskActionItem>(data)
}

export async function listRiskActions(riskId: string, params: PagingParams = {}) {
  const { data } = await apiClient.get(`/api/risks/${riskId}/actions`, { params })
  return toPageResponse(data as ApiEnvelope<RiskActionItem[], ApiMeta | null>)
}

export async function updateRiskAction(actionId: string, payload: RiskActionPatchPayload) {
  const { data } = await apiClient.patch(`/api/risk-actions/${actionId}`, payload)
  return unwrapData<RiskActionItem>(data)
}

export async function deleteRiskAction(actionId: string) {
  await apiClient.delete(`/api/risk-actions/${actionId}`)
}

export async function linkTaskToRisk(riskId: string, taskId: string) {
  await apiClient.post(`/api/risks/${riskId}/tasks/${taskId}`)
}

export async function unlinkTaskFromRisk(riskId: string, taskId: string) {
  await apiClient.delete(`/api/risks/${riskId}/tasks/${taskId}`)
}

export async function listRiskLinkedTasks(riskId: string) {
  const { data } = await apiClient.get(`/api/risks/${riskId}/tasks`)
  return unwrapData<RiskLinkedTaskItem[]>(data)
}

export async function addRiskTag(riskId: string, tagId: string) {
  await apiClient.post(`/api/risks/${riskId}/tags/${tagId}`)
}

export async function removeRiskTag(riskId: string, tagId: string) {
  await apiClient.delete(`/api/risks/${riskId}/tags/${tagId}`)
}

export async function listRiskTags(riskId: string) {
  const { data } = await apiClient.get(`/api/risks/${riskId}/tags`)
  return unwrapData<RiskTagItem[]>(data)
}

export async function createRiskComment(riskId: string, content: string) {
  const { data } = await apiClient.post(`/api/risks/${riskId}/comments`, { content })
  return unwrapData<RiskCommentItem>(data)
}

export async function listRiskComments(riskId: string, params: PagingParams = {}) {
  const { data } = await apiClient.get(`/api/risks/${riskId}/comments`, { params })
  return toPageResponse(data as ApiEnvelope<RiskCommentItem[], ApiMeta | null>)
}

export async function deleteRiskComment(commentId: string) {
  await apiClient.delete(`/api/risk-comments/${commentId}`)
}

export async function listRiskActivities(riskId: string, params: PagingParams = {}) {
  const { data } = await apiClient.get('/api/activity', {
    params: {
      entityType: 'RISK',
      entityId: riskId,
      page: params.page,
      size: params.size,
      sort: params.sort,
    },
  })
  return toPageResponse(data as ApiEnvelope<RiskActivityItem[], ApiMeta | null>)
}
