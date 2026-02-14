import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
const dashboardLight = {
    dark: false,
    colors: {
        primary: '#2563eb',
        secondary: '#0f766e',
        background: '#eef3f9',
        surface: '#f8fbff',
        'surface-bright': '#ffffff',
        'surface-variant': '#e7eef8',
        outline: '#8ea0b8',
        error: '#dc2626',
        warning: '#d97706',
        success: '#15803d',
        info: '#0369a1',
        'on-surface': '#0f172a',
    },
};
const dashboardDark = {
    dark: true,
    colors: {
        primary: '#60a5fa',
        secondary: '#34d399',
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
};
export const THEME_MODE_KEY = 'themeMode';
const resolveThemeName = (mode) => {
    if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dashboardDark'
            : 'dashboardLight';
    }
    return mode === 'dark' ? 'dashboardDark' : 'dashboardLight';
};
const getInitialThemeName = () => {
    const saved = localStorage.getItem(THEME_MODE_KEY);
    return resolveThemeName(saved ?? 'system');
};
export const vuetify = createVuetify({
    theme: {
        defaultTheme: getInitialThemeName(),
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
            elevation: 1,
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
});
