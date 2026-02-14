import { apiClient, unwrapData } from './apiClient';
export async function getTaskComments(taskId, page = 0, size = 20) {
    const { data } = await apiClient.get(`/api/tasks/${taskId}/comments`, {
        params: { page, size, sort: 'createdAt,asc' },
    });
    const envelope = data;
    return {
        content: envelope.data,
        totalElements: envelope.meta?.totalElements ?? envelope.data.length,
        totalPages: envelope.meta?.totalPages ?? 1,
        size: envelope.meta?.size ?? envelope.data.length,
        number: envelope.meta?.page ?? 0,
    };
}
export async function createTaskComment(taskId, content) {
    const { data } = await apiClient.post(`/api/tasks/${taskId}/comments`, { content });
    return unwrapData(data);
}
export async function deleteComment(commentId) {
    await apiClient.delete(`/api/comments/${commentId}`);
}
