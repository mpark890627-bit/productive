const props = defineProps();
const emit = defineEmits();
const countOf = (probability, impact) => props.cells.find((cell) => cell.probability === probability && cell.impact === impact)?.count ?? 0;
const isSelected = (probability, impact) => props.selectedProbability === probability && props.selectedImpact === impact;
const levelClass = (score) => {
    if (score >= 16)
        return 'critical';
    if (score >= 10)
        return 'high';
    if (score >= 5)
        return 'medium';
    return 'low';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['matrix-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['matrix-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['matrix-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['matrix-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['matrix-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['axis-label']} */ ;
/** @type {__VLS_StyleScopedClasses['axis-label']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    rounded: "lg",
    elevation: "1",
}));
const __VLS_2 = __VLS_1({
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "matrix-title" },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "matrix-title" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
var __VLS_8;
const __VLS_9 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "axis-label top" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "matrix-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "axis-label left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cell header empty" },
});
for (const [impact] of __VLS_getVForSourceType(([1, 2, 3, 4, 5]))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`h-${impact}`),
        ...{ class: "cell header" },
    });
    (impact);
}
for (const [probability] of __VLS_getVForSourceType(([5, 4, 3, 2, 1]))) {
    (`row-${probability}`);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cell header" },
    });
    (probability);
    for (const [impact] of __VLS_getVForSourceType(([1, 2, 3, 4, 5]))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.emit('select', { probability, impact });
                } },
            key: (`c-${probability}-${impact}`),
            type: "button",
            ...{ class: "cell matrix-btn" },
            ...{ class: ([
                    __VLS_ctx.levelClass(probability * impact),
                    __VLS_ctx.isSelected(probability, impact) ? 'selected' : '',
                ]) },
        });
        (__VLS_ctx.countOf(probability, impact));
    }
}
var __VLS_12;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['matrix-title']} */ ;
/** @type {__VLS_StyleScopedClasses['axis-label']} */ ;
/** @type {__VLS_StyleScopedClasses['top']} */ ;
/** @type {__VLS_StyleScopedClasses['matrix-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['axis-label']} */ ;
/** @type {__VLS_StyleScopedClasses['left']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['cell']} */ ;
/** @type {__VLS_StyleScopedClasses['matrix-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
            countOf: countOf,
            isSelected: isSelected,
            levelClass: levelClass,
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
