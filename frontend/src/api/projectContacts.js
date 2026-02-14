import { apiClient, unwrapData } from './apiClient';
export async function getProjectContacts(projectId) {
    const { data } = await apiClient.get(`/api/projects/${projectId}/contacts`);
    return unwrapData(data);
}
export async function createProjectContact(projectId, payload) {
    const { data } = await apiClient.post(`/api/projects/${projectId}/contacts`, payload);
    return unwrapData(data);
}
export async function updateProjectContact(projectId, contactId, payload) {
    const { data } = await apiClient.patch(`/api/projects/${projectId}/contacts/${contactId}`, payload);
    return unwrapData(data);
}
export async function deleteProjectContact(projectId, contactId) {
    await apiClient.delete(`/api/projects/${projectId}/contacts/${contactId}`);
}
