import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useThemeMode } from '../../composables/useThemeMode';
import { useAuthStore } from '../../stores/auth';
const __VLS_props = defineProps();
const emit = defineEmits();
const router = useRouter();
const authStore = useAuthStore();
const { mode, setThemeMode } = useThemeMode();
const themeMode = ref(mode.value);
watch(() => mode.value, (next) => {
    themeMode.value = next;
});
const onThemeChange = (value) => {
    if (value) {
        setThemeMode(value);
    }
};
const onLogout = () => {
    authStore.logout();
    router.push('/login');
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['title-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['search-field']} */ ;
/** @type {__VLS_StyleScopedClasses['title-wrap']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VAppBar;
/** @type {[typeof __VLS_components.VAppBar, typeof __VLS_components.vAppBar, typeof __VLS_components.VAppBar, typeof __VLS_components.vAppBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    flat: true,
    color: "surface",
    border: "b",
    height: "72",
    ...{ class: "topbar" },
}));
const __VLS_2 = __VLS_1({
    flat: true,
    color: "surface",
    border: "b",
    height: "72",
    ...{ class: "topbar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.mobile ? 'mdi-menu' : 'mdi-dock-left'),
    variant: "text",
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
    icon: (__VLS_ctx.mobile ? 'mdi-menu' : 'mdi-dock-left'),
    variant: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_9;
let __VLS_10;
let __VLS_11;
const __VLS_12 = {
    onClick: (...[$event]) => {
        __VLS_ctx.mobile ? __VLS_ctx.emit('toggle-drawer') : __VLS_ctx.emit('toggle-rail');
    }
};
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(__VLS_ctx.title);
const __VLS_13 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ class: "search-field" },
    prependInnerIcon: "mdi-magnify",
    placeholder: "검색 (준비중)",
    density: "compact",
    variant: "solo-filled",
    flat: true,
    readonly: true,
    hideDetails: true,
}));
const __VLS_15 = __VLS_14({
    ...{ class: "search-field" },
    prependInnerIcon: "mdi-magnify",
    placeholder: "검색 (준비중)",
    density: "compact",
    variant: "solo-filled",
    flat: true,
    readonly: true,
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const __VLS_17 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    icon: "mdi-bell-outline",
    variant: "text",
    'aria-label': "알림",
}));
const __VLS_19 = __VLS_18({
    icon: "mdi-bell-outline",
    variant: "text",
    'aria-label': "알림",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const __VLS_21 = {}.VBtnToggle;
/** @type {[typeof __VLS_components.VBtnToggle, typeof __VLS_components.vBtnToggle, typeof __VLS_components.VBtnToggle, typeof __VLS_components.vBtnToggle, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.themeMode),
    density: "compact",
    mandatory: true,
    ...{ class: "theme-toggle" },
}));
const __VLS_23 = __VLS_22({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.themeMode),
    density: "compact",
    mandatory: true,
    ...{ class: "theme-toggle" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    'onUpdate:modelValue': (__VLS_ctx.onThemeChange)
};
__VLS_24.slots.default;
const __VLS_29 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    value: "light",
    icon: "mdi-weather-sunny",
}));
const __VLS_31 = __VLS_30({
    value: "light",
    icon: "mdi-weather-sunny",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const __VLS_33 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    value: "dark",
    icon: "mdi-weather-night",
}));
const __VLS_35 = __VLS_34({
    value: "dark",
    icon: "mdi-weather-night",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const __VLS_37 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    value: "system",
    icon: "mdi-theme-light-dark",
}));
const __VLS_39 = __VLS_38({
    value: "system",
    icon: "mdi-theme-light-dark",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
var __VLS_24;
const __VLS_41 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    ...{ 'onClick': {} },
    prependIcon: "mdi-logout",
    variant: "outlined",
}));
const __VLS_43 = __VLS_42({
    ...{ 'onClick': {} },
    prependIcon: "mdi-logout",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_45;
let __VLS_46;
let __VLS_47;
const __VLS_48 = {
    onClick: (__VLS_ctx.onLogout)
};
__VLS_44.slots.default;
var __VLS_44;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['topbar']} */ ;
/** @type {__VLS_StyleScopedClasses['title-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['search-field']} */ ;
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
            themeMode: themeMode,
            onThemeChange: onThemeChange,
            onLogout: onLogout,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
