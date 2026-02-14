import { apiClient, unwrapData } from './apiClient'
import type { SavedViewCreatePayload, SavedViewItem, SavedViewUpdatePayload } from '../types/inbox'

export async function getSavedViews(targetType: 'TASKS' = 'TASKS') {
  const { data } = await apiClient.get('/api/saved-views', { params: { targetType } })
  return unwrapData<SavedViewItem[]>(data)
}

export async function createSavedView(payload: SavedViewCreatePayload) {
  const { data } = await apiClient.post('/api/saved-views', payload)
  return unwrapData<SavedViewItem>(data)
}

export async function patchSavedView(savedViewId: string, payload: SavedViewUpdatePayload) {
  const { data } = await apiClient.patch(`/api/saved-views/${savedViewId}`, payload)
  return unwrapData<SavedViewItem>(data)
}

export async function deleteSavedView(savedViewId: string) {
  await apiClient.delete(`/api/saved-views/${savedViewId}`)
}
