import { apiClient, unwrapData } from './apiClient';
export async function login(payload) {
    const { data } = await apiClient.post('/api/auth/login', payload);
    return unwrapData(data);
}
export async function register(payload) {
    const { data } = await apiClient.post('/api/auth/register', payload);
    return unwrapData(data);
}
export async function getMe() {
    const { data } = await apiClient.get('/api/me');
    return unwrapData(data);
}
