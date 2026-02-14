import { apiClient, unwrapData } from './apiClient';
export async function createTag(name) {
    const { data } = await apiClient.post('/api/tags', { name });
    return unwrapData(data);
}
export async function getTags(keyword) {
    const { data } = await apiClient.get('/api/tags', {
        params: keyword ? { keyword } : {},
    });
    return unwrapData(data);
}
