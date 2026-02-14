<template>
  <v-card class="skeleton-wrap" rounded="lg" elevation="1">
    <v-skeleton-loader type="heading, table-row-divider@4" />
  </v-card>
</template>

<script setup lang="ts"></script>

<style scoped>
.skeleton-wrap {
  border: 1px solid rgba(var(--v-theme-outline), 0.18);
}
</style>
