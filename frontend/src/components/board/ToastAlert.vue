<template>
  <div v-if="show" class="toast" :class="type">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
  type?: 'success' | 'error'
}>()
</script>

<style scoped>
.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  z-index: 50;
}

.toast.success {
  background: #0f766e;
}

.toast.error {
  background: #b91c1c;
}
</style>
