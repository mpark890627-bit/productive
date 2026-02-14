import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits();
const formRef = ref(null);
const name = ref('');
const description = ref('');
const nameRules = [(v) => !!v?.trim() || '프로젝트 이름은 필수입니다.'];
watch(() => [props.open, props.initialProject, props.mode], () => {
    if (!props.open) {
        return;
    }
    name.value = props.initialProject?.name || '';
    description.value = props.initialProject?.description || '';
}, { immediate: true });
const onDialogToggle = (value) => {
    if (!value) {
        emit('close');
    }
};
const onClose = () => emit('close');
const onSubmit = async () => {
    const result = await formRef.value?.validate();
    if (!result?.valid) {
        return;
    }
    emit('submit', {
        name: name.value.trim(),
        description: description.value.trim(),
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open),
    maxWidth: "580",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open),
    maxWidth: "580",
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
(__VLS_ctx.mode === 'create' ? '새 프로젝트' : '프로젝트 수정');
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
}));
const __VLS_23 = __VLS_22({
    ...{ 'onSubmit': {} },
    ref: "formRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onSubmit: (__VLS_ctx.onSubmit)
};
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_29 = {};
__VLS_24.slots.default;
const __VLS_31 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
    modelValue: (__VLS_ctx.name),
    label: "이름",
    maxlength: "200",
    counter: "200",
    rules: (__VLS_ctx.nameRules),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.name),
    label: "이름",
    maxlength: "200",
    counter: "200",
    rules: (__VLS_ctx.nameRules),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const __VLS_35 = {}.VTextarea;
/** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.description),
    label: "설명",
    maxlength: "2000",
    counter: "2000",
    rows: "4",
    autoGrow: true,
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_37 = __VLS_36({
    modelValue: (__VLS_ctx.description),
    label: "설명",
    maxlength: "2000",
    counter: "2000",
    rows: "4",
    autoGrow: true,
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
var __VLS_24;
if (__VLS_ctx.errorMessage) {
    const __VLS_39 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-2" },
    }));
    const __VLS_41 = __VLS_40({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    __VLS_42.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_42;
}
var __VLS_20;
const __VLS_43 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_45 = __VLS_44({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
const __VLS_47 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({}));
const __VLS_49 = __VLS_48({}, ...__VLS_functionalComponentArgsRest(__VLS_48));
const __VLS_51 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_53 = __VLS_52({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
let __VLS_55;
let __VLS_56;
let __VLS_57;
const __VLS_58 = {
    onClick: (__VLS_ctx.onClose)
};
__VLS_54.slots.default;
var __VLS_54;
const __VLS_59 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.submitting),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_61 = __VLS_60({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.submitting),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
let __VLS_63;
let __VLS_64;
let __VLS_65;
const __VLS_66 = {
    onClick: (__VLS_ctx.onSubmit)
};
__VLS_62.slots.default;
(__VLS_ctx.mode === 'create' ? '생성' : '저장');
var __VLS_62;
var __VLS_46;
var __VLS_12;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
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
            name: name,
            description: description,
            nameRules: nameRules,
            onDialogToggle: onDialogToggle,
            onClose: onClose,
            onSubmit: onSubmit,
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
