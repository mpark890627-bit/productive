<template>
  <v-app-bar flat color="surface" border="b" height="72" class="topbar">
    <v-btn
      :icon="mobile ? 'mdi-menu' : 'mdi-dock-left'"
      variant="text"
      @click="mobile ? emit('toggle-drawer') : emit('toggle-rail')"
    />

    <div class="title-wrap">
      <h1>{{ title }}</h1>
    </div>

    <v-text-field
      class="search-field"
      prepend-inner-icon="mdi-magnify"
      placeholder="검색 (준비중)"
      density="compact"
      variant="solo-filled"
      flat
      readonly
      hide-details
    />

    <v-btn icon="mdi-bell-outline" variant="text" aria-label="알림" />

    <v-btn-toggle
      v-model="themeMode"
      density="compact"
      mandatory
      class="theme-toggle"
      @update:model-value="onThemeChange"
    >
      <v-btn value="light" icon="mdi-weather-sunny" />
      <v-btn value="dark" icon="mdi-weather-night" />
      <v-btn value="system" icon="mdi-theme-light-dark" />
    </v-btn-toggle>

    <v-btn prepend-icon="mdi-logout" variant="outlined" @click="onLogout">Logout</v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeMode } from '../../composables/useThemeMode'
import type { ThemeMode } from '../../plugins/vuetify'
import { useAuthStore } from '../../stores/auth'

defineProps<{
  title: string
  mobile: boolean
}>()

const emit = defineEmits<{
  'toggle-drawer': []
  'toggle-rail': []
}>()

const router = useRouter()
const authStore = useAuthStore()
const { mode, setThemeMode } = useThemeMode()
const themeMode = ref<ThemeMode>(mode.value)

watch(
  () => mode.value,
  (next) => {
    themeMode.value = next
  },
)

const onThemeChange = (value: ThemeMode | null) => {
  if (value) {
    setThemeMode(value)
  }
}

const onLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  border-bottom-color: rgba(var(--v-theme-outline), 0.2);
  padding-inline: 12px;
  backdrop-filter: blur(6px);
}

.title-wrap {
  min-width: 220px;
  margin-inline: 8px 12px;
}

.title-wrap h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.search-field {
  max-width: 360px;
  margin-right: 8px;
}

.theme-toggle {
  margin-inline: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.22);
  border-radius: 10px;
}

@media (max-width: 960px) {
  .search-field {
    display: none;
  }

  .title-wrap {
    min-width: 120px;
  }
}
</style>
