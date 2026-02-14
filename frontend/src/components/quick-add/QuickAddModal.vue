<template>
  <div v-if="open" class="overlay" @click.self="onClose">
    <div class="modal card">
      <header class="modal-header">
        <h3>빠른 태스크 추가</h3>
        <button type="button" @click="onClose">닫기</button>
      </header>

      <p class="hint">
        예시: <code>프로젝트명 / 제목 #태그1 #태그2 due:2026-03-01 p:high</code>
      </p>

      <form @submit.prevent="submit">
        <input
          ref="inputRef"
          v-model="rawInput"
          type="text"
          placeholder="프로젝트명 / 제목 #태그 due:YYYY-MM-DD p:high"
          required
        />

        <div class="actions">
          <button type="button" @click="onClose">취소</button>
          <button type="submit" class="primary" :disabled="submitting">
            {{ submitting ? '추가 중...' : '추가' }}
          </button>
        </div>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { quickAddTask } from '../../services/quickAdd'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  created: [taskId: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const rawInput = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick()
      inputRef.value?.focus()
      inputRef.value?.select()
      errorMessage.value = ''
      successMessage.value = ''
    }
  },
)

const onClose = () => {
  emit('close')
}

const submit = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''
    submitting.value = true

    const { taskId } = await quickAddTask(rawInput.value)

    successMessage.value = '태스크가 생성되었습니다.'
    rawInput.value = ''
    emit('created', taskId)

    window.setTimeout(() => {
      emit('close')
    }, 500)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '태스크 추가에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: start center;
  padding-top: 12vh;
  z-index: 60;
}

.modal {
  width: min(760px, 94vw);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.hint {
  color: #475569;
  font-size: 13px;
}

code {
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px 6px;
}

form {
  display: grid;
  gap: 10px;
}

input {
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

button {
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

button.primary {
  background: #0f766e;
  border-color: #0f766e;
  color: #fff;
}

.error {
  color: #dc2626;
}

.success {
  color: #0f766e;
}
</style>
