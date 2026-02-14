<template>
  <v-dialog :model-value="open" max-width="640" @update:model-value="onDialogToggle">
    <v-card>
      <v-card-title class="pt-5 px-5">새 태스크</v-card-title>

      <v-card-text class="px-5 pb-1">
        <v-form ref="formRef" class="form-grid" @submit.prevent="submit">
          <v-text-field v-model="title" label="제목" maxlength="255" :rules="titleRules" :disabled="submitting" />

          <v-textarea
            v-model="description"
            label="설명"
            rows="3"
            auto-grow
            maxlength="4000"
            :disabled="submitting"
          />

          <div class="row">
            <v-select
              v-model="status"
              label="상태"
              :items="statusItems"
              item-title="label"
              item-value="value"
              :disabled="submitting"
            />

            <v-select
              v-model="priority"
              label="우선순위"
              :items="priorityItems"
              item-title="label"
              item-value="value"
              :disabled="submitting"
            />
          </div>

          <v-text-field v-model="dueDate" label="마감일" type="date" :disabled="submitting" />
        </v-form>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-2">{{ errorMessage }}</v-alert>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-spacer />
        <v-btn variant="text" :disabled="submitting" @click="$emit('close')">취소</v-btn>
        <v-btn color="primary" :loading="submitting" :disabled="submitting" @click="submit">생성</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TaskPriority, TaskStatus } from '../../types/task'

const props = defineProps<{
  open: boolean
  submitting: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: { title: string; description: string | null; status: TaskStatus; priority: TaskPriority; dueDate: string | null }]
}>()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const title = ref('')
const description = ref('')
const status = ref<TaskStatus>('TODO')
const priority = ref<TaskPriority>('MEDIUM')
const dueDate = ref('')

const titleRules = [(v: string) => !!v?.trim() || '제목은 필수입니다.']

const statusItems = [
  { label: 'TODO', value: 'TODO' },
  { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
  { label: 'DONE', value: 'DONE' },
]

const priorityItems = [
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
]

watch(
  () => props.open,
  (open) => {
    if (open) {
      title.value = ''
      description.value = ''
      status.value = 'TODO'
      priority.value = 'MEDIUM'
      dueDate.value = ''
    }
  },
)

const onDialogToggle = (value: boolean) => {
  if (!value) {
    emit('close')
  }
}

const submit = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    return
  }

  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim() ? description.value.trim() : null,
    status: status.value,
    priority: priority.value,
    dueDate: dueDate.value || null,
  })
}
</script>

<style scoped>
.form-grid {
  display: grid;
  gap: 8px;
}

.row {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 640px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
