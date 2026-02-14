import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    type: 'table',
});
const resolvedType = computed(() => {
    if (props.type === 'list') {
        return 'list-item-three-line@4';
    }
    if (props.type === 'cards') {
        return 'card@3';
    }
    return 'heading, table-row-divider@5';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    type: 'table',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "section-card skeleton-list" },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "section-card skeleton-list" },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.VSkeletonLoader;
/** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    type: (__VLS_ctx.resolvedType),
}));
const __VLS_7 = __VLS_6({
    type: (__VLS_ctx.resolvedType),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['skeleton-list']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            resolvedType: resolvedType,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
