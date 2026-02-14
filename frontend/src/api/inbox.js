import { apiClient } from './apiClient';
export async function getInboxTasks(params) {
    const query = new URLSearchParams();
    query.set('mode', params.mode);
    if (params.status?.length) {
        params.status.forEach((status) => query.append('status', status));
    }
    if (params.projectId) {
        query.set('projectId', params.projectId);
    }
    if (params.keyword?.trim()) {
        query.set('keyword', params.keyword.trim());
    }
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    query.set('sort', params.sort ?? 'updatedAt,desc');
    const { data } = await apiClient.get(`/api/inbox/tasks?${query.toString()}`);
    const envelope = data;
    return {
        content: envelope.data,
        totalElements: envelope.meta?.totalElements ?? envelope.data.length,
        totalPages: envelope.meta?.totalPages ?? 1,
        size: envelope.meta?.size ?? envelope.data.length,
        number: envelope.meta?.page ?? 0,
    };
}
export async function watchTask(taskId) {
    await apiClient.post(`/api/tasks/${taskId}/watch`);
}
export async function unwatchTask(taskId) {
    await apiClient.delete(`/api/tasks/${taskId}/watch`);
}
export async function getTaskWatchers(taskId) {
    const { data } = await apiClient.get(`/api/tasks/${taskId}/watchers`);
    return data.data;
}
