<template>
  <v-main class="auth-main">
    <v-container class="auth-container fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" class="auth-col">
          <v-card class="auth-card" rounded="xl" elevation="3">
            <RouterView />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup lang="ts"></script>

<style scoped>
.auth-main {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 16%, rgba(37, 99, 235, 0.16), transparent 30%),
    radial-gradient(circle at 85% 86%, rgba(15, 118, 110, 0.12), transparent 28%),
    repeating-linear-gradient(
      135deg,
      rgba(148, 163, 184, 0.08) 0,
      rgba(148, 163, 184, 0.08) 1px,
      transparent 1px,
      transparent 14px
    ),
    rgba(var(--v-theme-background), 1);
}

.auth-container {
  padding: 24px;
}

.auth-col {
  max-width: 480px;
}

.auth-card {
  border: 1px solid rgba(var(--v-theme-outline), 0.28);
  background: rgba(var(--v-theme-surface-bright), 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.09);
}
</style>
