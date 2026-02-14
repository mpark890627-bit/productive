import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import AppSidebar from '../components/layout/AppSidebar.vue';
import AppTopbar from '../components/layout/AppTopbar.vue';
import QuickAddModal from '../components/quick-add/QuickAddModal.vue';
const route = useRoute();
const { mobile } = useDisplay();
const drawer = ref(true);
const rail = ref(false);
const quickAddOpen = ref(false);
const menuItems = [
    { title: 'Inbox', icon: 'mdi-inbox-arrow-down-outline', to: '/app/inbox', enabled: true },
    { title: 'Tasks', icon: 'mdi-format-list-checks', to: '/app/tasks', enabled: true },
    { title: 'Projects', icon: 'mdi-view-dashboard-outline', to: '/app/projects', enabled: true },
    { title: 'Calendar', icon: 'mdi-calendar-month-outline', to: '/app/calendar', enabled: true },
    { title: 'Templates', icon: 'mdi-file-document-edit-outline', to: '/app/templates', enabled: true },
    { title: 'Approvals', icon: 'mdi-clipboard-check-outline', to: '/app/approvals', enabled: false },
    { title: 'Settings', icon: 'mdi-cog-outline', to: '/app/settings', enabled: false },
];
const pageTitle = computed(() => {
    if (typeof route.meta.title === 'string' && route.meta.title.trim().length > 0) {
        return route.meta.title;
    }
    if (typeof route.name === 'string') {
        return route.name;
    }
    return 'Dashboard';
});
watch(() => mobile.value, (isMobile) => {
    if (isMobile) {
        drawer.value = false;
        rail.value = false;
    }
    else {
        drawer.value = true;
    }
}, { immediate: true });
const toggleDrawer = () => {
    drawer.value = !drawer.value;
};
const toggleRail = () => {
    if (mobile.value) {
        drawer.value = !drawer.value;
        return;
    }
    rail.value = !rail.value;
};
const isTypingContext = (event) => {
    const target = event.target;
    if (!target) {
        return false;
    }
    const tagName = target.tagName.toLowerCase();
    return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
};
const onGlobalKeydown = (event) => {
    if (!event.repeat && (event.key === '/' || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)))) {
        if (!isTypingContext(event)) {
            event.preventDefault();
            quickAddOpen.value = true;
        }
    }
    if (event.key === 'Escape' && quickAddOpen.value) {
        quickAddOpen.value = false;
    }
};
onMounted(() => {
    window.addEventListener('keydown', onGlobalKeydown);
});
onUnmounted(() => {
    window.removeEventListener('keydown', onGlobalKeydown);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['workspace-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VLayout;
/** @type {[typeof __VLS_components.VLayout, typeof __VLS_components.vLayout, typeof __VLS_components.VLayout, typeof __VLS_components.vLayout, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "app-layout" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "app-layout" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
/** @type {[typeof AppSidebar, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(AppSidebar, new AppSidebar({
    drawer: (__VLS_ctx.drawer),
    rail: (__VLS_ctx.rail),
    mobile: (__VLS_ctx.mobile),
    menuItems: (__VLS_ctx.menuItems),
}));
const __VLS_6 = __VLS_5({
    drawer: (__VLS_ctx.drawer),
    rail: (__VLS_ctx.rail),
    mobile: (__VLS_ctx.mobile),
    menuItems: (__VLS_ctx.menuItems),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
const __VLS_8 = {}.VMain;
/** @type {[typeof __VLS_components.VMain, typeof __VLS_components.vMain, typeof __VLS_components.VMain, typeof __VLS_components.vMain, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "workspace-main" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "workspace-main" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
/** @type {[typeof AppTopbar, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(AppTopbar, new AppTopbar({
    ...{ 'onToggleDrawer': {} },
    ...{ 'onToggleRail': {} },
    title: (__VLS_ctx.pageTitle),
    mobile: (__VLS_ctx.mobile),
}));
const __VLS_13 = __VLS_12({
    ...{ 'onToggleDrawer': {} },
    ...{ 'onToggleRail': {} },
    title: (__VLS_ctx.pageTitle),
    mobile: (__VLS_ctx.mobile),
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_15;
let __VLS_16;
let __VLS_17;
const __VLS_18 = {
    onToggleDrawer: (__VLS_ctx.toggleDrawer)
};
const __VLS_19 = {
    onToggleRail: (__VLS_ctx.toggleRail)
};
var __VLS_14;
const __VLS_20 = {}.VContainer;
/** @type {[typeof __VLS_components.VContainer, typeof __VLS_components.vContainer, typeof __VLS_components.VContainer, typeof __VLS_components.vContainer, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    fluid: true,
    ...{ class: "workspace-content" },
}));
const __VLS_22 = __VLS_21({
    fluid: true,
    ...{ class: "workspace-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_23;
var __VLS_11;
/** @type {[typeof QuickAddModal, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(QuickAddModal, new QuickAddModal({
    ...{ 'onClose': {} },
    open: (__VLS_ctx.quickAddOpen),
}));
const __VLS_29 = __VLS_28({
    ...{ 'onClose': {} },
    open: (__VLS_ctx.quickAddOpen),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
let __VLS_31;
let __VLS_32;
let __VLS_33;
const __VLS_34 = {
    onClose: (...[$event]) => {
        __VLS_ctx.quickAddOpen = false;
    }
};
var __VLS_30;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-main']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppSidebar: AppSidebar,
            AppTopbar: AppTopbar,
            QuickAddModal: QuickAddModal,
            mobile: mobile,
            drawer: drawer,
            rail: rail,
            quickAddOpen: quickAddOpen,
            menuItems: menuItems,
            pageTitle: pageTitle,
            toggleDrawer: toggleDrawer,
            toggleRail: toggleRail,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
