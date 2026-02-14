import { apiClient, unwrapData } from './apiClient';
export async function getProjectTasks(projectId, params = {}) {
    const { data } = await apiClient.get(`/api/projects/${projectId}/tasks`, { params });
    const envelope = data;
    return {
        content: envelope.data,
        totalElements: envelope.meta?.totalElements ?? envelope.data.length,
        totalPages: envelope.meta?.totalPages ?? 1,
        size: envelope.meta?.size ?? envelope.data.length,
        number: envelope.meta?.page ?? 0,
    };
}
export async function createTaskInProject(projectId, payload) {
    const { data } = await apiClient.post(`/api/projects/${projectId}/tasks`, payload);
    return unwrapData(data);
}
export async function getTaskById(taskId) {
    const { data } = await apiClient.get(`/api/tasks/${taskId}`);
    return unwrapData(data);
}
export async function patchTask(taskId, payload) {
    const { data } = await apiClient.patch(`/api/tasks/${taskId}`, payload);
    return unwrapData(data);
}
export async function attachTagToTask(taskId, tagId) {
    await apiClient.post(`/api/tasks/${taskId}/tags/${tagId}`);
}
export async function detachTagFromTask(taskId, tagId) {
    await apiClient.delete(`/api/tasks/${taskId}/tags/${tagId}`);
}
