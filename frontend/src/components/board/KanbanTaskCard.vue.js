import { computed } from 'vue';
import { taskPriorityColors } from '../../utils/taskVisuals';
const props = defineProps();
const emit = defineEmits();
const safeTitle = computed(() => props.task.title?.trim() || '(제목 없음)');
const safePriority = computed(() => {
    const value = props.task.priority;
    return value === 'LOW' || value === 'MEDIUM' || value === 'HIGH' ? value : 'MEDIUM';
});
const priorityColor = computed(() => taskPriorityColors[safePriority.value]);
const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
const isTaskStatus = (value) => value === 'TODO' || value === 'IN_PROGRESS' || value === 'DONE';
const onStatusSelect = (value) => {
    if (!isTaskStatus(value)) {
        return;
    }
    emitStatusChange(value);
};
const emitStatusChange = (status) => {
    if (status === props.task.status) {
        return;
    }
    emit('statusChange', props.task, status);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['task-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "task-card section-card" },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "task-card section-card" },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$emit('open', __VLS_ctx.task);
    }
};
var __VLS_8 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "head-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "title" },
    title: (__VLS_ctx.safeTitle),
});
(__VLS_ctx.safeTitle);
const __VLS_9 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    color: (__VLS_ctx.priorityColor),
    variant: "tonal",
}));
const __VLS_11 = __VLS_10({
    color: (__VLS_ctx.priorityColor),
    variant: "tonal",
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
(__VLS_ctx.safePriority);
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "desc" },
});
(__VLS_ctx.task.description || '설명 없음');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "meta-row" },
});
const __VLS_13 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    variant: "outlined",
    prependIcon: "mdi-calendar-month-outline",
}));
const __VLS_15 = __VLS_14({
    variant: "outlined",
    prependIcon: "mdi-calendar-month-outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
(__VLS_ctx.task.dueDate || '마감 없음');
var __VLS_16;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: () => { } },
    ...{ class: "status-row" },
});
const __VLS_17 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.task.status),
    items: (__VLS_ctx.statuses),
    density: "compact",
    hideDetails: true,
    variant: "outlined",
    ...{ class: "status-select" },
}));
const __VLS_19 = __VLS_18({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.task.status),
    items: (__VLS_ctx.statuses),
    density: "compact",
    hideDetails: true,
    variant: "outlined",
    ...{ class: "status-select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
let __VLS_21;
let __VLS_22;
let __VLS_23;
const __VLS_24 = {
    'onUpdate:modelValue': (__VLS_ctx.onStatusSelect)
};
var __VLS_20;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['head-row']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['desc']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['status-row']} */ ;
/** @type {__VLS_StyleScopedClasses['status-select']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            safeTitle: safeTitle,
            safePriority: safePriority,
            priorityColor: priorityColor,
            statuses: statuses,
            onStatusSelect: onStatusSelect,
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
