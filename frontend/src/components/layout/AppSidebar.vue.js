const __VLS_props = defineProps();
const emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar-head']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['v-list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
/** @type {__VLS_StyleScopedClasses['v-list-item--active']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VNavigationDrawer;
/** @type {[typeof __VLS_components.VNavigationDrawer, typeof __VLS_components.vNavigationDrawer, typeof __VLS_components.VNavigationDrawer, typeof __VLS_components.vNavigationDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.drawer),
    temporary: (__VLS_ctx.mobile),
    permanent: (!__VLS_ctx.mobile),
    rail: (!__VLS_ctx.mobile && __VLS_ctx.rail),
    width: (__VLS_ctx.mobile ? 270 : 248),
    ...{ class: "sidebar" },
    color: "surface",
    border: "end",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.drawer),
    temporary: (__VLS_ctx.mobile),
    permanent: (!__VLS_ctx.mobile),
    rail: (!__VLS_ctx.mobile && __VLS_ctx.rail),
    width: (__VLS_ctx.mobile ? 270 : 248),
    ...{ class: "sidebar" },
    color: "surface",
    border: "end",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': ((v) => __VLS_ctx.emit('update:drawer', Boolean(v)))
};
var __VLS_8 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-head" },
    ...{ class: ({ compact: !__VLS_ctx.mobile && __VLS_ctx.rail }) },
});
if (!__VLS_ctx.mobile) {
    const __VLS_9 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        ...{ 'onClick': {} },
        icon: "mdi-chevron-left",
        size: "small",
        variant: "text",
        ...{ class: "collapse-btn" },
    }));
    const __VLS_11 = __VLS_10({
        ...{ 'onClick': {} },
        icon: "mdi-chevron-left",
        size: "small",
        variant: "text",
        ...{ class: "collapse-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    let __VLS_13;
    let __VLS_14;
    let __VLS_15;
    const __VLS_16 = {
        onClick: (...[$event]) => {
            if (!(!__VLS_ctx.mobile))
                return;
            __VLS_ctx.emit('update:rail', !__VLS_ctx.rail);
        }
    };
    var __VLS_12;
}
if (__VLS_ctx.mobile || !__VLS_ctx.rail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "eyebrow" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "logo" },
    });
}
else {
    const __VLS_17 = {}.VIcon;
    /** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        icon: "mdi-briefcase-clock-outline",
    }));
    const __VLS_19 = __VLS_18({
        icon: "mdi-briefcase-clock-outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
}
const __VLS_21 = {}.VList;
/** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    nav: true,
    density: "comfortable",
    ...{ class: "menu-list" },
}));
const __VLS_23 = __VLS_22({
    nav: true,
    density: "comfortable",
    ...{ class: "menu-list" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.menuItems))) {
    const __VLS_25 = {}.VListItem;
    /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        key: (item.title),
        prependIcon: (item.icon),
        title: (item.title),
        to: (item.enabled ? item.to : undefined),
        disabled: (!item.enabled),
        rounded: "lg",
    }));
    const __VLS_27 = __VLS_26({
        key: (item.title),
        prependIcon: (item.icon),
        title: (item.title),
        to: (item.enabled ? item.to : undefined),
        disabled: (!item.enabled),
        rounded: "lg",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
}
var __VLS_24;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-head']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-list']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
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
