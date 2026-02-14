import { computed, onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { THEME_MODE_KEY, type ThemeMode } from '../plugins/vuetify'

const modeState = ref<ThemeMode>((localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null) ?? 'system')

const resolveThemeName = (mode: ThemeMode): 'dashboardLight' | 'dashboardDark' => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dashboardDark'
      : 'dashboardLight'
  }
  return mode === 'dark' ? 'dashboardDark' : 'dashboardLight'
}

export function useThemeMode() {
  const theme = useTheme()

  const applyMode = (mode: ThemeMode) => {
    modeState.value = mode
    localStorage.setItem(THEME_MODE_KEY, mode)
    theme.global.name.value = resolveThemeName(mode)
  }

  onMounted(() => {
    theme.global.name.value = resolveThemeName(modeState.value)
  })

  const mode = computed(() => modeState.value)

  return {
    mode,
    setThemeMode: applyMode,
  }
}
