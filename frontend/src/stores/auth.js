import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi } from '../api/auth';
export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const user = ref(null);
    const isAuthenticated = computed(() => !!accessToken.value);
    function setSession(token, nextUser) {
        accessToken.value = token;
        user.value = nextUser;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('authUser', JSON.stringify(nextUser));
    }
    async function login(email, password) {
        const response = await loginApi({ email, password });
        setSession(response.accessToken, {
            userId: response.userId,
            email: response.email,
            name: response.name,
            role: response.role,
        });
    }
    async function register(email, password, name) {
        const response = await registerApi({ email, password, name });
        setSession(response.accessToken, {
            userId: response.userId,
            email: response.email,
            name: response.name,
            role: response.role,
        });
    }
    function loadFromStorage() {
        const token = localStorage.getItem('accessToken');
        const userJson = localStorage.getItem('authUser');
        accessToken.value = token;
        if (userJson) {
            try {
                user.value = JSON.parse(userJson);
            }
            catch {
                user.value = null;
            }
        }
    }
    function logout() {
        accessToken.value = null;
        user.value = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authUser');
    }
    return {
        user,
        accessToken,
        isAuthenticated,
        login,
        register,
        logout,
        loadFromStorage,
    };
});
