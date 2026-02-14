import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
const dashboardLight = {
    dark: false,
    colors: {
        primary: '#2563eb',
        surface: '#f1f5f9',
        background: '#e9eef6',
        outline: '#94a3b8',
        'on-surface': '#0f172a',
    },
};
const dashboardDark = {
    dark: true,
    colors: {
        primary: '#60a5fa',
        surface: '#111827',
        background: '#0b1220',
        outline: '#334155',
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
            variant: 'tonal',
            rounded: 'lg',
            height: 38,
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
        VCard: {
            rounded: 'lg',
            elevation: 1,
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
