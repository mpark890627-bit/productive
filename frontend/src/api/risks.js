import { apiClient, unwrapData } from './apiClient';
function toPageResponse(envelope) {
    return {
        content: envelope.data,
        totalElements: envelope.meta?.totalElements ?? envelope.data.length,
        totalPages: envelope.meta?.totalPages ?? 1,
        size: envelope.meta?.size ?? envelope.data.length,
        number: envelope.meta?.page ?? 0,
    };
}
export async function listRisks(projectId, params = {}) {
    const { data } = await apiClient.get(`/api/projects/${projectId}/risks`, { params });
    const envelope = data;
    return toPageResponse(envelope);
}
export async function createRisk(projectId, payload) {
    const { data } = await apiClient.post(`/api/projects/${projectId}/risks`, payload);
    return unwrapData(data);
}
export async function getRisk(riskId) {
    const { data } = await apiClient.get(`/api/risks/${riskId}`);
    return unwrapData(data);
}
export async function updateRisk(riskId, payload) {
    const { data } = await apiClient.patch(`/api/risks/${riskId}`, payload);
    return unwrapData(data);
}
export async function deleteRisk(riskId) {
    await apiClient.delete(`/api/risks/${riskId}`);
}
export async function closeRisk(riskId) {
    const { data } = await apiClient.post(`/api/risks/${riskId}/close`);
    return unwrapData(data);
}
export async function getRiskSummary(projectId) {
    const { data } = await apiClient.get(`/api/projects/${projectId}/risks/summary`);
    return unwrapData(data);
}
export async function getRiskMatrixSummary(projectId, params = {}) {
    const { data } = await apiClient.get(`/api/projects/${projectId}/risks/matrix-summary`, { params });
    return unwrapData(data);
}
export async function createRiskAction(riskId, payload) {
    const { data } = await apiClient.post(`/api/risks/${riskId}/actions`, payload);
    return unwrapData(data);
}
export async function listRiskActions(riskId, params = {}) {
    const { data } = await apiClient.get(`/api/risks/${riskId}/actions`, { params });
    return toPageResponse(data);
}
export async function updateRiskAction(actionId, payload) {
    const { data } = await apiClient.patch(`/api/risk-actions/${actionId}`, payload);
    return unwrapData(data);
}
export async function deleteRiskAction(actionId) {
    await apiClient.delete(`/api/risk-actions/${actionId}`);
}
export async function linkTaskToRisk(riskId, taskId) {
    await apiClient.post(`/api/risks/${riskId}/tasks/${taskId}`);
}
export async function unlinkTaskFromRisk(riskId, taskId) {
    await apiClient.delete(`/api/risks/${riskId}/tasks/${taskId}`);
}
export async function listRiskLinkedTasks(riskId) {
    const { data } = await apiClient.get(`/api/risks/${riskId}/tasks`);
    return unwrapData(data);
}
export async function addRiskTag(riskId, tagId) {
    await apiClient.post(`/api/risks/${riskId}/tags/${tagId}`);
}
export async function removeRiskTag(riskId, tagId) {
    await apiClient.delete(`/api/risks/${riskId}/tags/${tagId}`);
}
export async function listRiskTags(riskId) {
    const { data } = await apiClient.get(`/api/risks/${riskId}/tags`);
    return unwrapData(data);
}
export async function createRiskComment(riskId, content) {
    const { data } = await apiClient.post(`/api/risks/${riskId}/comments`, { content });
    return unwrapData(data);
}
export async function listRiskComments(riskId, params = {}) {
    const { data } = await apiClient.get(`/api/risks/${riskId}/comments`, { params });
    return toPageResponse(data);
}
export async function deleteRiskComment(commentId) {
    await apiClient.delete(`/api/risk-comments/${commentId}`);
}
export async function listRiskActivities(riskId, params = {}) {
    const { data } = await apiClient.get('/api/activity', {
        params: {
            entityType: 'RISK',
            entityId: riskId,
            page: params.page,
            size: params.size,
            sort: params.sort,
        },
    });
    return toPageResponse(data);
}
