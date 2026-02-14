const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
const headers = [
    { title: '이름', key: 'name' },
    { title: '설명', key: 'description' },
    { title: '수정일', key: 'updatedAt' },
    { title: '액션', key: 'actions', sortable: false, width: 220 },
];
const formatDate = (dateTime) => new Date(dateTime).toLocaleString();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['project-table']} */ ;
/** @type {__VLS_StyleScopedClasses['project-table']} */ ;
/** @type {__VLS_StyleScopedClasses['name-link']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VDataTable;
/** @type {[typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.projects),
    itemValue: "id",
    ...{ class: "project-table section-card" },
    density: "comfortable",
    hover: true,
    hideDefaultFooter: true,
}));
const __VLS_2 = __VLS_1({
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.projects),
    itemValue: "id",
    ...{ class: "project-table section-card" },
    density: "comfortable",
    hover: true,
    hideDefaultFooter: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
{
    const { [__VLS_tryAsConstant(`item.name`)]: __VLS_thisSlot } = __VLS_3.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('open', item);
            } },
        type: "button",
        ...{ class: "name-link" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.name);
}
{
    const { [__VLS_tryAsConstant(`item.description`)]: __VLS_thisSlot } = __VLS_3.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "desc-cell" },
    });
    (item.description || '-');
}
{
    const { [__VLS_tryAsConstant(`item.updatedAt`)]: __VLS_thisSlot } = __VLS_3.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDate(item.updatedAt));
}
{
    const { [__VLS_tryAsConstant(`item.actions`)]: __VLS_thisSlot } = __VLS_3.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions" },
    });
    const __VLS_5 = {}.VTooltip;
    /** @type {[typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        text: "수정",
        location: "top",
    }));
    const __VLS_7 = __VLS_6({
        text: "수정",
        location: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_8.slots.default;
    {
        const { activator: __VLS_thisSlot } = __VLS_8.slots;
        const { props: tooltipProps } = __VLS_getSlotParam(__VLS_thisSlot);
        const __VLS_9 = {}.VBtn;
        /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
        // @ts-ignore
        const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
            ...{ 'onClick': {} },
            ...(tooltipProps),
            icon: "mdi-pencil-outline",
            size: "small",
            variant: "text",
        }));
        const __VLS_11 = __VLS_10({
            ...{ 'onClick': {} },
            ...(tooltipProps),
            icon: "mdi-pencil-outline",
            size: "small",
            variant: "text",
        }, ...__VLS_functionalComponentArgsRest(__VLS_10));
        let __VLS_13;
        let __VLS_14;
        let __VLS_15;
        const __VLS_16 = {
            onClick: (...[$event]) => {
                __VLS_ctx.$emit('edit', item);
            }
        };
        var __VLS_12;
    }
    var __VLS_8;
    const __VLS_17 = {}.VTooltip;
    /** @type {[typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, typeof __VLS_components.VTooltip, typeof __VLS_components.vTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        text: "삭제",
        location: "top",
    }));
    const __VLS_19 = __VLS_18({
        text: "삭제",
        location: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    {
        const { activator: __VLS_thisSlot } = __VLS_20.slots;
        const { props: tooltipProps } = __VLS_getSlotParam(__VLS_thisSlot);
        const __VLS_21 = {}.VBtn;
        /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
            ...{ 'onClick': {} },
            ...(tooltipProps),
            icon: "mdi-trash-can-outline",
            size: "small",
            color: "error",
            variant: "text",
        }));
        const __VLS_23 = __VLS_22({
            ...{ 'onClick': {} },
            ...(tooltipProps),
            icon: "mdi-trash-can-outline",
            size: "small",
            color: "error",
            variant: "text",
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
        let __VLS_25;
        let __VLS_26;
        let __VLS_27;
        const __VLS_28 = {
            onClick: (...[$event]) => {
                __VLS_ctx.$emit('delete', item);
            }
        };
        var __VLS_24;
    }
    var __VLS_20;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['project-table']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['name-link']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            headers: headers,
            formatDate: formatDate,
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
