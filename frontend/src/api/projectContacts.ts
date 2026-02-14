import { apiClient, unwrapData } from './apiClient'
import type {
  ProjectContactCreateRequest,
  ProjectContactItem,
  ProjectContactUpdateRequest,
} from '../types/projectContact'

export async function getProjectContacts(projectId: string) {
  const { data } = await apiClient.get(`/api/projects/${projectId}/contacts`)
  return unwrapData<ProjectContactItem[]>(data)
}

export async function createProjectContact(projectId: string, payload: ProjectContactCreateRequest) {
  const { data } = await apiClient.post(`/api/projects/${projectId}/contacts`, payload)
  return unwrapData<ProjectContactItem>(data)
}

export async function updateProjectContact(
  projectId: string,
  contactId: string,
  payload: ProjectContactUpdateRequest,
) {
  const { data } = await apiClient.patch(`/api/projects/${projectId}/contacts/${contactId}`, payload)
  return unwrapData<ProjectContactItem>(data)
}

export async function deleteProjectContact(projectId: string, contactId: string) {
  await apiClient.delete(`/api/projects/${projectId}/contacts/${contactId}`)
}
