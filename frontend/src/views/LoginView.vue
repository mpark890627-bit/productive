<template>
  <v-card-text class="auth-content app-page">
    <div class="brand-head">
      <v-chip color="primary" variant="tonal" size="small">PRODUCTIV</v-chip>
      <h2>로그인</h2>
      <p>프로젝트와 태스크를 한 화면에서 관리하세요.</p>
    </div>

    <v-form ref="formRef" class="auth-form" @submit.prevent="onSubmit">
      <v-text-field
        v-model="email"
        label="이메일"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        :rules="emailRules"
        :disabled="submitting"
      />

      <v-text-field
        v-model="password"
        label="비밀번호"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        :rules="passwordRules"
        :disabled="submitting"
        @click:append-inner="showPassword = !showPassword"
      />

      <v-btn type="submit" color="primary" block :loading="submitting" :disabled="submitting">
        {{ submitting ? '로그인 중...' : '로그인' }}
      </v-btn>
    </v-form>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">{{ errorMessage }}</v-alert>

    <div class="helper-row">
      <span>계정이 없나요?</span>
      <v-btn variant="text" color="primary" :to="'/register'" :disabled="submitting">회원가입</v-btn>
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailRules = [
  (v: string) => !!v || '이메일을 입력하세요.',
  (v: string) => emailRegex.test(v) || '이메일 형식이 올바르지 않습니다.',
]
const passwordRules = [(v: string) => !!v || '비밀번호를 입력하세요.']

const onSubmit = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    return
  }

  try {
    submitting.value = true
    errorMessage.value = ''
    await authStore.login(email.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/app/projects'
    await router.push(redirect)
  } catch {
    errorMessage.value = '로그인에 실패했습니다. 이메일/비밀번호를 확인하세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-content {
  padding: 32px;
}

.brand-head h2 {
  margin: 14px 0 0;
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.brand-head p {
  margin: 10px 0 0;
  color: #5f6f86;
  font-size: 0.95rem;
}

.auth-form {
  margin-top: 8px;
  display: grid;
  gap: 10px;
}

.helper-row {
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5f6f86;
  font-size: 0.92rem;
}

@media (max-width: 640px) {
  .auth-content {
    padding: 24px;
  }

  .brand-head h2 {
    font-size: 26px;
  }
}
</style>
