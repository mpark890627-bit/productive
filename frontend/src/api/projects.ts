import { apiClient, type ApiEnvelope, type ApiMeta, unwrapData } from './apiClient'
import type { PageResponse, ProjectCreateRequest, ProjectItem, ProjectUpdateRequest } from '../types/project'

interface GetProjectsParams {
  page?: number
  size?: number
  sort?: string
}

export async function getProjects(params: GetProjectsParams = {}) {
  const { data } = await apiClient.get('/api/projects', { params })
  const envelope = data as ApiEnvelope<ProjectItem[], ApiMeta | null>
  return {
    content: envelope.data,
    totalElements: envelope.meta?.totalElements ?? envelope.data.length,
    totalPages: envelope.meta?.totalPages ?? 1,
    size: envelope.meta?.size ?? envelope.data.length,
    number: envelope.meta?.page ?? 0,
  } satisfies PageResponse<ProjectItem>
}

export async function getProjectById(projectId: string) {
  const { data } = await apiClient.get(`/api/projects/${projectId}`)
  return unwrapData<ProjectItem>(data)
}

export async function createProject(payload: ProjectCreateRequest) {
  const { data } = await apiClient.post('/api/projects', payload)
  return unwrapData<ProjectItem>(data)
}

export async function updateProject(projectId: string, payload: ProjectUpdateRequest) {
  const { data } = await apiClient.patch(`/api/projects/${projectId}`, payload)
  return unwrapData<ProjectItem>(data)
}

export async function deleteProject(projectId: string) {
  await apiClient.delete(`/api/projects/${projectId}`)
}
