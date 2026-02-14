import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi } from '../api/auth'
import type { AuthUser } from '../types/user'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setSession(token: string, nextUser: AuthUser) {
    accessToken.value = token
    user.value = nextUser
    localStorage.setItem('accessToken', token)
    localStorage.setItem('authUser', JSON.stringify(nextUser))
  }

  async function login(email: string, password: string) {
    const response = await loginApi({ email, password })
    setSession(response.accessToken, {
      userId: response.userId,
      email: response.email,
      name: response.name,
      role: response.role,
    })
  }

  async function register(email: string, password: string, name: string) {
    const response = await registerApi({ email, password, name })
    setSession(response.accessToken, {
      userId: response.userId,
      email: response.email,
      name: response.name,
      role: response.role,
    })
  }

  function loadFromStorage() {
    const token = localStorage.getItem('accessToken')
    const userJson = localStorage.getItem('authUser')

    accessToken.value = token
    if (userJson) {
      try {
        user.value = JSON.parse(userJson) as AuthUser
      } catch {
        user.value = null
      }
    }
  }

  function logout() {
    accessToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('authUser')
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    register,
    logout,
    loadFromStorage,
  }
})
