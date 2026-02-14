import { apiClient, unwrapData } from './apiClient';
export async function getProjects(params = {}) {
    const { data } = await apiClient.get('/api/projects', { params });
    const envelope = data;
    return {
        content: envelope.data,
        totalElements: envelope.meta?.totalElements ?? envelope.data.length,
        totalPages: envelope.meta?.totalPages ?? 1,
        size: envelope.meta?.size ?? envelope.data.length,
        number: envelope.meta?.page ?? 0,
    };
}
export async function getProjectById(projectId) {
    const { data } = await apiClient.get(`/api/projects/${projectId}`);
    return unwrapData(data);
}
export async function createProject(payload) {
    const { data } = await apiClient.post('/api/projects', payload);
    return unwrapData(data);
}
export async function updateProject(projectId, payload) {
    const { data } = await apiClient.patch(`/api/projects/${projectId}`, payload);
    return unwrapData(data);
}
export async function deleteProject(projectId) {
    await apiClient.delete(`/api/projects/${projectId}`);
}
