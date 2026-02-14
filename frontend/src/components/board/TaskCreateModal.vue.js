import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const formRef = ref(null);
const title = ref('');
const description = ref('');
const status = ref('TODO');
const priority = ref('MEDIUM');
const dueDate = ref('');
const titleRules = [(v) => !!v?.trim() || '제목은 필수입니다.'];
const statusItems = [
    { label: 'TODO', value: 'TODO' },
    { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
    { label: 'DONE', value: 'DONE' },
];
const priorityItems = [
    { label: 'LOW', value: 'LOW' },
    { label: 'MEDIUM', value: 'MEDIUM' },
    { label: 'HIGH', value: 'HIGH' },
];
watch(() => props.open, (open) => {
    if (open) {
        title.value = '';
        description.value = '';
        status.value = 'TODO';
        priority.value = 'MEDIUM';
        dueDate.value = '';
    }
});
const onDialogToggle = (value) => {
    if (!value) {
        emit('close');
    }
};
const submit = async () => {
    const result = await formRef.value?.validate();
    if (!result?.valid) {
        return;
    }
    emit('submit', {
        title: title.value.trim(),
        description: description.value.trim() ? description.value.trim() : null,
        status: status.value,
        priority: priority.value,
        dueDate: dueDate.value || null,
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open),
    maxWidth: "640",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open),
    maxWidth: "640",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (__VLS_ctx.onDialogToggle)
};
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_9 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ class: "pt-5 px-5" },
}));
const __VLS_15 = __VLS_14({
    ...{ class: "pt-5 px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
var __VLS_16;
const __VLS_17 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ class: "px-5 pb-1" },
}));
const __VLS_19 = __VLS_18({
    ...{ class: "px-5 pb-1" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.VForm;
/** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    ...{ class: "form-grid" },
}));
const __VLS_23 = __VLS_22({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    ...{ class: "form-grid" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onSubmit: (__VLS_ctx.submit)
};
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_29 = {};
__VLS_24.slots.default;
const __VLS_31 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.title),
    label: "제목",
    maxlength: "255",
    rules: (__VLS_ctx.titleRules),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.title),
    label: "제목",
    maxlength: "255",
    rules: (__VLS_ctx.titleRules),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const __VLS_35 = {}.VTextarea;
/** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.description),
    label: "설명",
    rows: "3",
    autoGrow: true,
    maxlength: "4000",
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_37 = __VLS_36({
    modelValue: (__VLS_ctx.description),
    label: "설명",
    rows: "3",
    autoGrow: true,
    maxlength: "4000",
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "row" },
});
const __VLS_39 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    modelValue: (__VLS_ctx.status),
    label: "상태",
    items: (__VLS_ctx.statusItems),
    itemTitle: "label",
    itemValue: "value",
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_41 = __VLS_40({
    modelValue: (__VLS_ctx.status),
    label: "상태",
    items: (__VLS_ctx.statusItems),
    itemTitle: "label",
    itemValue: "value",
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const __VLS_43 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.priority),
    label: "우선순위",
    items: (__VLS_ctx.priorityItems),
    itemTitle: "label",
    itemValue: "value",
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_45 = __VLS_44({
    modelValue: (__VLS_ctx.priority),
    label: "우선순위",
    items: (__VLS_ctx.priorityItems),
    itemTitle: "label",
    itemValue: "value",
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const __VLS_47 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    modelValue: (__VLS_ctx.dueDate),
    label: "마감일",
    type: "date",
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_49 = __VLS_48({
    modelValue: (__VLS_ctx.dueDate),
    label: "마감일",
    type: "date",
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
var __VLS_24;
if (__VLS_ctx.errorMessage) {
    const __VLS_51 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-2" },
    }));
    const __VLS_53 = __VLS_52({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_54.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_54;
}
var __VLS_20;
const __VLS_55 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_57 = __VLS_56({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
__VLS_58.slots.default;
const __VLS_59 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({}));
const __VLS_61 = __VLS_60({}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const __VLS_63 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_65 = __VLS_64({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_67;
let __VLS_68;
let __VLS_69;
const __VLS_70 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$emit('close');
    }
};
__VLS_66.slots.default;
var __VLS_66;
const __VLS_71 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.submitting),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_73 = __VLS_72({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.submitting),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_75;
let __VLS_76;
let __VLS_77;
const __VLS_78 = {
    onClick: (__VLS_ctx.submit)
};
__VLS_74.slots.default;
var __VLS_74;
var __VLS_58;
var __VLS_12;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
// @ts-ignore
var __VLS_30 = __VLS_29;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formRef: formRef,
            title: title,
            description: description,
            status: status,
            priority: priority,
            dueDate: dueDate,
            titleRules: titleRules,
            statusItems: statusItems,
            priorityItems: priorityItems,
            onDialogToggle: onDialogToggle,
            submit: submit,
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
