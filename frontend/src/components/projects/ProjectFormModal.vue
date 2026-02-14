<template>
  <v-dialog :model-value="open" max-width="580" @update:model-value="onDialogToggle">
    <v-card>
      <v-card-title class="pt-5 px-5">{{ mode === 'create' ? '새 프로젝트' : '프로젝트 수정' }}</v-card-title>

      <v-card-text class="px-5 pb-1">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-text-field
            v-model="name"
            label="이름"
            maxlength="200"
            counter="200"
            :rules="nameRules"
            :disabled="submitting"
          />

          <v-textarea
            v-model="description"
            label="설명"
            maxlength="2000"
            counter="2000"
            rows="4"
            auto-grow
            :disabled="submitting"
          />
        </v-form>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-2">{{ errorMessage }}</v-alert>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-spacer />
        <v-btn variant="text" :disabled="submitting" @click="onClose">취소</v-btn>
        <v-btn color="primary" :loading="submitting" :disabled="submitting" @click="onSubmit">
          {{ mode === 'create' ? '생성' : '저장' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ProjectItem } from '../../types/project'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  initialProject?: ProjectItem | null
  submitting?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [{ name: string; description: string }]
}>()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const name = ref('')
const description = ref('')

const nameRules = [(v: string) => !!v?.trim() || '프로젝트 이름은 필수입니다.']

watch(
  () => [props.open, props.initialProject, props.mode],
  () => {
    if (!props.open) {
      return
    }
    name.value = props.initialProject?.name || ''
    description.value = props.initialProject?.description || ''
  },
  { immediate: true },
)

const onDialogToggle = (value: boolean) => {
  if (!value) {
    emit('close')
  }
}

const onClose = () => emit('close')

const onSubmit = async () => {
  const result = await formRef.value?.validate()
  if (!result?.valid) {
    return
  }

  emit('submit', {
    name: name.value.trim(),
    description: description.value.trim(),
  })
}
</script>
