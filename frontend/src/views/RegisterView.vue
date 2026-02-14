<template>
  <v-card-text class="auth-content app-page">
    <div class="brand-head">
      <v-chip color="primary" variant="tonal" size="small">PRODUCTIV</v-chip>
      <h2>회원가입</h2>
      <p>업무관리 워크스페이스를 시작하고 팀과 협업해보세요.</p>
    </div>

    <v-form ref="formRef" class="auth-form" @submit.prevent="onSubmit">
      <v-text-field
        v-model="name"
        label="이름"
        prepend-inner-icon="mdi-account-outline"
        :rules="nameRules"
        :disabled="submitting"
      />

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
        {{ submitting ? '가입 중...' : '가입하기' }}
      </v-btn>
    </v-form>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">{{ errorMessage }}</v-alert>

    <div class="helper-row">
      <span>이미 계정이 있나요?</span>
      <v-btn variant="text" color="primary" :to="'/login'" :disabled="submitting">로그인</v-btn>
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const showPassword = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const nameRules = [(v: string) => !!v?.trim() || '이름을 입력하세요.']
const emailRules = [
  (v: string) => !!v || '이메일을 입력하세요.',
  (v: string) => emailRegex.test(v) || '이메일 형식이 올바르지 않습니다.',
]
const passwordRules = [
  (v: string) => !!v || '비밀번호를 입력하세요.',
  (v: string) => v.length >= 8 || '비밀번호는 최소 8자 이상이어야 합니다.',
]

const onSubmit = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    return
  }

  try {
    submitting.value = true
    errorMessage.value = ''
    await authStore.register(email.value.trim(), password.value, name.value.trim())
    await router.push('/app/projects')
  } catch {
    errorMessage.value = '회원가입에 실패했습니다. 입력값을 확인하세요.'
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
