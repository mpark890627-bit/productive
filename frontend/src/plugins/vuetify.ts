import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const dashboardLight: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#2563EB',
    secondary: '#0EA5E9',
    background: '#F6F9FF',
    surface: '#FFFFFF',
    'surface-bright': '#ffffff',
    'surface-variant': '#F2F6FF',
    outline: '#E2E8F0',
    error: '#DC2626',
    warning: '#F59E0B',
    success: '#16A34A',
    info: '#0EA5E9',
    'on-surface': '#0F172A',
  },
}

const dashboardDark: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#60a5fa',
    secondary: '#38bdf8',
    background: '#0b1220',
    surface: '#101a2c',
    'surface-bright': '#172236',
    'surface-variant': '#1f2e45',
    outline: '#3b4b67',
    error: '#f87171',
    warning: '#f59e0b',
    success: '#4ade80',
    info: '#38bdf8',
    'on-surface': '#e2e8f0',
  },
}

export type ThemeMode = 'light' | 'dark' | 'system'
export const THEME_MODE_KEY = 'themeMode'

const resolveThemeName = (mode: ThemeMode): 'dashboardLight' | 'dashboardDark' => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dashboardDark'
      : 'dashboardLight'
  }
  return mode === 'dark' ? 'dashboardDark' : 'dashboardLight'
}

const getInitialThemeName = (): 'dashboardLight' | 'dashboardDark' => {
  const saved = localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null
  return resolveThemeName(saved ?? 'system')
}

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dashboardLight',
    themes: {
      dashboardLight,
      dashboardDark,
    },
  },
  defaults: {
    VApp: {
      style: 'background: rgb(var(--v-theme-background));',
    },
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
      height: 40,
      ripple: true,
    },
    VTabs: {
      color: 'primary',
    },
    VTab: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      rounded: 'lg',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VDialog: {
      persistent: false,
    },
    VChip: {
      rounded: 'lg',
      size: 'small',
    },
    VDataTable: {
      density: 'comfortable',
      hover: true,
    },
    VAlert: {
      rounded: 'lg',
      variant: 'tonal',
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
