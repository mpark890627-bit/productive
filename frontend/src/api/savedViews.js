import { apiClient, unwrapData } from './apiClient';
export async function getSavedViews(targetType = 'TASKS') {
    const { data } = await apiClient.get('/api/saved-views', { params: { targetType } });
    return unwrapData(data);
}
export async function createSavedView(payload) {
    const { data } = await apiClient.post('/api/saved-views', payload);
    return unwrapData(data);
}
export async function patchSavedView(savedViewId, payload) {
    const { data } = await apiClient.patch(`/api/saved-views/${savedViewId}`, payload);
    return unwrapData(data);
}
export async function deleteSavedView(savedViewId) {
    await apiClient.delete(`/api/saved-views/${savedViewId}`);
}
