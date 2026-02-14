import { computed, onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import { THEME_MODE_KEY } from '../plugins/vuetify';
const modeState = ref(localStorage.getItem(THEME_MODE_KEY) ?? 'system');
const resolveThemeName = (mode) => {
    if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dashboardDark'
            : 'dashboardLight';
    }
    return mode === 'dark' ? 'dashboardDark' : 'dashboardLight';
};
export function useThemeMode() {
    const theme = useTheme();
    const applyMode = (mode) => {
        modeState.value = mode;
        localStorage.setItem(THEME_MODE_KEY, mode);
        theme.global.name.value = resolveThemeName(mode);
    };
    onMounted(() => {
        theme.global.name.value = resolveThemeName(modeState.value);
    });
    const mode = computed(() => modeState.value);
    return {
        mode,
        setThemeMode: applyMode,
    };
}
