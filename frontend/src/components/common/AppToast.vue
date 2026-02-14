<template>
  <v-snackbar :model-value="show" :color="color" location="bottom right" timeout="2400" @update:model-value="$emit('update:show', $event)">
    {{ message }}
  </v-snackbar>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    show: boolean
    message: string
    color?: 'success' | 'error' | 'warning' | 'info'
  }>(),
  {
    color: 'success',
  },
)

defineEmits<{
  'update:show': [value: boolean]
}>()
</script>
