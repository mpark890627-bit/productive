import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import AppSidebar from '../components/layout/AppSidebar.vue';
import AppTopbar from '../components/layout/AppTopbar.vue';
import QuickAddModal from '../components/quick-add/QuickAddModal.vue';
import { useTabsStore } from '../stores/tabsStore';
const route = useRoute();
const router = useRouter();
const { mobile } = useDisplay();
const tabsStore = useTabsStore();
const { tabs, activeTabId } = storeToRefs(tabsStore);
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
const onTabSelect = (tabId) => {
    const targetTab = tabsStore.tabs.find((tab) => tab.id === tabId);
    if (!targetTab) {
        return;
    }
    tabsStore.setActive(targetTab.id);
    if (route.fullPath !== targetTab.fullPath) {
        void router.push(targetTab.fullPath);
    }
};
const onTabClose = (tabId) => {
    const targetPath = tabsStore.closeTab(tabId);
    if (targetPath && route.fullPath !== targetPath) {
        void router.push(targetPath);
    }
};
const resolveViewCacheKey = (viewRoute) => {
    if (viewRoute.meta.tabbed) {
        return tabsStore.buildTabId(viewRoute);
    }
    return viewRoute.fullPath;
};
const closeCurrentTab = () => {
    if (!activeTabId.value) {
        return;
    }
    const targetPath = tabsStore.closeTab(activeTabId.value);
    if (targetPath && route.fullPath !== targetPath) {
        void router.push(targetPath);
    }
};
const moveTabFocus = (step) => {
    if (tabs.value.length <= 1 || !activeTabId.value) {
        return;
    }
    const index = tabs.value.findIndex((tab) => tab.id === activeTabId.value);
    if (index === -1) {
        return;
    }
    const nextIndex = (index + step + tabs.value.length) % tabs.value.length;
    const target = tabs.value[nextIndex];
    tabsStore.setActive(target.id);
    if (route.fullPath !== target.fullPath) {
        void router.push(target.fullPath);
    }
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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w' && route.path.startsWith('/app')) {
        if (!isTypingContext(event)) {
            event.preventDefault();
            closeCurrentTab();
        }
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Tab' && route.path.startsWith('/app')) {
        if (!isTypingContext(event)) {
            event.preventDefault();
            moveTabFocus(event.shiftKey ? -1 : 1);
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
/** @type {__VLS_StyleScopedClasses['workspace-tabs-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tab__label']} */ ;
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
if (__VLS_ctx.tabs.length > 0) {
    const __VLS_20 = {}.VSheet;
    /** @type {[typeof __VLS_components.VSheet, typeof __VLS_components.vSheet, typeof __VLS_components.VSheet, typeof __VLS_components.vSheet, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ class: "workspace-tabs" },
        color: "surface",
        border: "b",
    }));
    const __VLS_22 = __VLS_21({
        ...{ class: "workspace-tabs" },
        color: "surface",
        border: "b",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.VTabs;
    /** @type {[typeof __VLS_components.VTabs, typeof __VLS_components.vTabs, typeof __VLS_components.VTabs, typeof __VLS_components.vTabs, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.activeTabId),
        alignTabs: "start",
        density: "comfortable",
        showArrows: true,
        ...{ class: "workspace-tabs-bar" },
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.activeTabId),
        alignTabs: "start",
        density: "comfortable",
        showArrows: true,
        ...{ class: "workspace-tabs-bar" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        'onUpdate:modelValue': (__VLS_ctx.onTabSelect)
    };
    __VLS_27.slots.default;
    for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.tabs))) {
        const __VLS_32 = {}.VTab;
        /** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            key: (tab.id),
            value: (tab.id),
            ...{ class: "workspace-tab" },
        }));
        const __VLS_34 = __VLS_33({
            key: (tab.id),
            value: (tab.id),
            ...{ class: "workspace-tab" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "workspace-tab__label" },
        });
        (tab.title);
        if (!tab.affix) {
            const __VLS_36 = {}.VBtn;
            /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
            // @ts-ignore
            const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
                ...{ 'onClick': {} },
                icon: "mdi-close",
                size: "x-small",
                variant: "text",
                ...{ class: "workspace-tab__close" },
            }));
            const __VLS_38 = __VLS_37({
                ...{ 'onClick': {} },
                icon: "mdi-close",
                size: "x-small",
                variant: "text",
                ...{ class: "workspace-tab__close" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_37));
            let __VLS_40;
            let __VLS_41;
            let __VLS_42;
            const __VLS_43 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.tabs.length > 0))
                        return;
                    if (!(!tab.affix))
                        return;
                    __VLS_ctx.onTabClose(tab.id);
                }
            };
            var __VLS_39;
        }
        var __VLS_35;
    }
    var __VLS_27;
    var __VLS_23;
}
const __VLS_44 = {}.VContainer;
/** @type {[typeof __VLS_components.VContainer, typeof __VLS_components.vContainer, typeof __VLS_components.VContainer, typeof __VLS_components.vContainer, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    fluid: true,
    ...{ class: "workspace-content" },
}));
const __VLS_46 = __VLS_45({
    fluid: true,
    ...{ class: "workspace-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.RouterView, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
{
    const { default: __VLS_thisSlot } = __VLS_51.slots;
    const { Component, route: viewRoute } = __VLS_getSlotParam(__VLS_thisSlot);
    const __VLS_52 = {}.KeepAlive;
    /** @type {[typeof __VLS_components.KeepAlive, typeof __VLS_components.KeepAlive, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        max: (12),
    }));
    const __VLS_54 = __VLS_53({
        max: (12),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    if (viewRoute.meta.keepAlive) {
        const __VLS_56 = ((Component));
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            key: (__VLS_ctx.resolveViewCacheKey(viewRoute)),
        }));
        const __VLS_58 = __VLS_57({
            key: (__VLS_ctx.resolveViewCacheKey(viewRoute)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    }
    var __VLS_55;
    if (!viewRoute.meta.keepAlive) {
        const __VLS_60 = ((Component));
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            key: (viewRoute.fullPath),
        }));
        const __VLS_62 = __VLS_61({
            key: (viewRoute.fullPath),
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    }
    __VLS_51.slots['' /* empty slot name completion */];
}
var __VLS_51;
var __VLS_47;
var __VLS_11;
/** @type {[typeof QuickAddModal, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(QuickAddModal, new QuickAddModal({
    ...{ 'onClose': {} },
    open: (__VLS_ctx.quickAddOpen),
}));
const __VLS_65 = __VLS_64({
    ...{ 'onClose': {} },
    open: (__VLS_ctx.quickAddOpen),
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_67;
let __VLS_68;
let __VLS_69;
const __VLS_70 = {
    onClose: (...[$event]) => {
        __VLS_ctx.quickAddOpen = false;
    }
};
var __VLS_66;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-main']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tabs-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tab__label']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-tab__close']} */ ;
/** @type {__VLS_StyleScopedClasses['workspace-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppSidebar: AppSidebar,
            AppTopbar: AppTopbar,
            QuickAddModal: QuickAddModal,
            mobile: mobile,
            tabs: tabs,
            activeTabId: activeTabId,
            drawer: drawer,
            rail: rail,
            quickAddOpen: quickAddOpen,
            menuItems: menuItems,
            pageTitle: pageTitle,
            toggleDrawer: toggleDrawer,
            toggleRail: toggleRail,
            onTabSelect: onTabSelect,
            onTabClose: onTabClose,
            resolveViewCacheKey: resolveViewCacheKey,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
