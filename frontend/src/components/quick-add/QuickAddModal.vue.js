import { nextTick, ref, watch } from 'vue';
import { quickAddTask } from '../../services/quickAdd';
const props = defineProps();
const emit = defineEmits();
const inputRef = ref(null);
const rawInput = ref('');
const submitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
watch(() => props.open, async (open) => {
    if (open) {
        await nextTick();
        inputRef.value?.focus();
        inputRef.value?.select();
        errorMessage.value = '';
        successMessage.value = '';
    }
});
const onClose = () => {
    emit('close');
};
const submit = async () => {
    try {
        errorMessage.value = '';
        successMessage.value = '';
        submitting.value = true;
        const { taskId } = await quickAddTask(rawInput.value);
        successMessage.value = '태스크가 생성되었습니다.';
        rawInput.value = '';
        emit('created', taskId);
        window.setTimeout(() => {
            emit('close');
        }, 500);
    }
    catch (error) {
        errorMessage.value = error instanceof Error ? error.message : '태스크 추가에 실패했습니다.';
    }
    finally {
        submitting.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.onClose) },
        ...{ class: "overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onClose) },
        type: "button",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hint" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.submit) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ref: "inputRef",
        value: (__VLS_ctx.rawInput),
        type: "text",
        placeholder: "프로젝트명 / 제목 #태그 due:YYYY-MM-DD p:high",
        required: true,
    });
    /** @type {typeof __VLS_ctx.inputRef} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onClose) },
        type: "button",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        type: "submit",
        ...{ class: "primary" },
        disabled: (__VLS_ctx.submitting),
    });
    (__VLS_ctx.submitting ? '추가 중...' : '추가');
    if (__VLS_ctx.errorMessage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "error" },
        });
        (__VLS_ctx.errorMessage);
    }
    if (__VLS_ctx.successMessage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "success" },
        });
        (__VLS_ctx.successMessage);
    }
}
/** @type {__VLS_StyleScopedClasses['overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            inputRef: inputRef,
            rawInput: rawInput,
            submitting: submitting,
            errorMessage: errorMessage,
            successMessage: successMessage,
            onClose: onClose,
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
