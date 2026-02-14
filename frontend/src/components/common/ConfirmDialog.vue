<template>
  <v-dialog :model-value="open" max-width="460" @update:model-value="$emit('update:open', $event)">
    <v-card class="section-card" rounded="lg" elevation="0">
      <v-card-title class="pt-5 px-5">{{ title }}</v-card-title>
      <v-card-text class="px-5 pb-2">
        <p class="message">{{ message }}</p>
      </v-card-text>
      <v-card-actions class="px-5 pb-5">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="$emit('cancel')">취소</v-btn>
        <v-btn :color="confirmColor" :loading="loading" :disabled="loading" @click="$emit('confirm')">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmText?: string
    confirmColor?: 'primary' | 'error'
    loading?: boolean
  }>(),
  {
    confirmText: '확인',
    confirmColor: 'error',
    loading: false,
  },
)

defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.message {
  margin: 0;
  color: #64748b;
}
</style>
