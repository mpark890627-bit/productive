import axios from 'axios';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export function unwrapData(envelope) {
    return envelope.data;
}
export function extractErrorMessage(error, fallback) {
    if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
            return apiMessage;
        }
    }
    return fallback;
}
export const apiClient = axios.create({
    baseURL: apiBaseUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error?.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authUser');
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
