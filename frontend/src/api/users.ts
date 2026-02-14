import { apiClient, type ApiEnvelope, type ApiMeta } from './apiClient'

export interface UserOption {
  userId: string
  name: string
  email: string
}

export async function getProjectUsers(projectId: string, keyword = '', page = 0, size = 30) {
  const { data } = await apiClient.get(`/api/projects/${projectId}/users`, {
    params: {
      keyword: keyword || undefined,
      page,
      size,
      sort: 'name,asc',
    },
  })
  const envelope = data as ApiEnvelope<UserOption[], ApiMeta | null>
  return envelope.data
}
