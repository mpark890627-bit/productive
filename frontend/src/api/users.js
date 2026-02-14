import { apiClient } from './apiClient';
export async function getProjectUsers(projectId, keyword = '', page = 0, size = 30) {
    const { data } = await apiClient.get(`/api/projects/${projectId}/users`, {
        params: {
            keyword: keyword || undefined,
            page,
            size,
            sort: 'name,asc',
        },
    });
    const envelope = data;
    return envelope.data;
}
