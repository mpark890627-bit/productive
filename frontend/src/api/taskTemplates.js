import { apiClient, unwrapData } from './apiClient';
export async function getTaskTemplates(params = {}) {
    const { data } = await apiClient.get('/api/task-templates', { params });
    const envelope = data;
    return {
        data: envelope.data,
        meta: envelope.meta,
    };
}
export async function getTaskTemplateById(templateId) {
    const { data } = await apiClient.get(`/api/task-templates/${templateId}`);
    return unwrapData(data);
}
export async function createTaskTemplate(payload) {
    const { data } = await apiClient.post('/api/task-templates', payload);
    return unwrapData(data);
}
export async function updateTaskTemplate(templateId, payload) {
    const { data } = await apiClient.patch(`/api/task-templates/${templateId}`, payload);
    return unwrapData(data);
}
export async function deleteTaskTemplate(templateId) {
    await apiClient.delete(`/api/task-templates/${templateId}`);
}
export async function createTaskTemplateItem(templateId, payload) {
    const { data } = await apiClient.post(`/api/task-templates/${templateId}/items`, payload);
    return unwrapData(data);
}
export async function updateTaskTemplateItem(itemId, payload) {
    const { data } = await apiClient.patch(`/api/task-template-items/${itemId}`, payload);
    return unwrapData(data);
}
export async function deleteTaskTemplateItem(itemId) {
    await apiClient.delete(`/api/task-template-items/${itemId}`);
}
export async function applyTaskTemplateToProject(projectId, templateId, payload = {}) {
    const { data } = await apiClient.post(`/api/projects/${projectId}/task-templates/${templateId}/apply`, payload);
    return unwrapData(data);
}
