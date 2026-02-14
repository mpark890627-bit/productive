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
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VDataTable;
/** @type {[typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.projects),
    itemValue: "id",
    ...{ class: "project-table" },
    density: "comfortable",
    hover: true,
    hideDefaultFooter: true,
}));
const __VLS_2 = __VLS_1({
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.projects),
    itemValue: "id",
    ...{ class: "project-table" },
    density: "comfortable",
    hover: true,
    hideDefaultFooter: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
{
    const { [__VLS_tryAsConstant(`item.name`)]: __VLS_thisSlot } = __VLS_3.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name-cell" },
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
    const __VLS_5 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        ...{ 'onClick': {} },
        size: "small",
        variant: "tonal",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        size: "small",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    let __VLS_11;
    const __VLS_12 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$emit('open', item);
        }
    };
    __VLS_8.slots.default;
    var __VLS_8;
    const __VLS_13 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        ...{ 'onClick': {} },
        size: "small",
        variant: "outlined",
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onClick': {} },
        size: "small",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_17;
    let __VLS_18;
    let __VLS_19;
    const __VLS_20 = {
        onClick: (...[$event]) => {
            __VLS_ctx.$emit('edit', item);
        }
    };
    __VLS_16.slots.default;
    var __VLS_16;
    const __VLS_21 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        ...{ 'onClick': {} },
        size: "small",
        color: "error",
        variant: "text",
    }));
    const __VLS_23 = __VLS_22({
        ...{ 'onClick': {} },
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
    __VLS_24.slots.default;
    var __VLS_24;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['project-table']} */ ;
/** @type {__VLS_StyleScopedClasses['name-cell']} */ ;
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
