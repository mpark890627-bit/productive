import { apiClient, unwrapData } from './apiClient'

export interface TagResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export async function createTag(name: string) {
  const { data } = await apiClient.post('/api/tags', { name })
  return unwrapData<TagResponse>(data)
}

export async function getTags(keyword?: string) {
  const { data } = await apiClient.get('/api/tags', {
    params: keyword ? { keyword } : {},
  })
  return unwrapData<TagResponse[]>(data)
}
