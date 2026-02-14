<template>
  <v-card class="skeleton-wrap section-card" rounded="lg" elevation="0">
    <v-skeleton-loader type="heading, paragraph, table-row-divider@4" />
  </v-card>
</template>

<script setup lang="ts"></script>

<style scoped>
.skeleton-wrap {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding: 14px;
}
</style>
