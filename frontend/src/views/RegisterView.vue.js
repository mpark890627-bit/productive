import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const showPassword = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const submitting = ref(false);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRules = [(v) => !!v?.trim() || '이름을 입력하세요.'];
const emailRules = [
    (v) => !!v || '이메일을 입력하세요.',
    (v) => emailRegex.test(v) || '이메일 형식이 올바르지 않습니다.',
];
const passwordRules = [
    (v) => !!v || '비밀번호를 입력하세요.',
    (v) => v.length >= 8 || '비밀번호는 최소 8자 이상이어야 합니다.',
];
const onSubmit = async () => {
    const result = await formRef.value?.validate();
    if (!result?.valid) {
        return;
    }
    try {
        submitting.value = true;
        errorMessage.value = '';
        await authStore.register(email.value.trim(), password.value, name.value.trim());
        await router.push('/app/projects');
    }
    catch {
        errorMessage.value = '회원가입에 실패했습니다. 입력값을 확인하세요.';
    }
    finally {
        submitting.value = false;
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brand-head']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "auth-content" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "auth-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-head" },
});
const __VLS_5 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    color: "primary",
    variant: "tonal",
    size: "small",
}));
const __VLS_7 = __VLS_6({
    color: "primary",
    variant: "tonal",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
const __VLS_9 = {}.VForm;
/** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    ...{ class: "auth-form" },
}));
const __VLS_11 = __VLS_10({
    ...{ 'onSubmit': {} },
    ref: "formRef",
    ...{ class: "auth-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onSubmit: (__VLS_ctx.onSubmit)
};
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_17 = {};
__VLS_12.slots.default;
const __VLS_19 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.name),
    label: "이름",
    prependInnerIcon: "mdi-account-outline",
    rules: (__VLS_ctx.nameRules),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.name),
    label: "이름",
    prependInnerIcon: "mdi-account-outline",
    rules: (__VLS_ctx.nameRules),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const __VLS_23 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.email),
    label: "이메일",
    type: "email",
    prependInnerIcon: "mdi-email-outline",
    rules: (__VLS_ctx.emailRules),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.email),
    label: "이메일",
    type: "email",
    prependInnerIcon: "mdi-email-outline",
    rules: (__VLS_ctx.emailRules),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
const __VLS_27 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
    ...{ 'onClick:appendInner': {} },
    modelValue: (__VLS_ctx.password),
    label: "비밀번호",
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    prependInnerIcon: "mdi-lock-outline",
    appendInnerIcon: (__VLS_ctx.showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'),
    rules: (__VLS_ctx.passwordRules),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_29 = __VLS_28({
    ...{ 'onClick:appendInner': {} },
    modelValue: (__VLS_ctx.password),
    label: "비밀번호",
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    prependInnerIcon: "mdi-lock-outline",
    appendInnerIcon: (__VLS_ctx.showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'),
    rules: (__VLS_ctx.passwordRules),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
let __VLS_31;
let __VLS_32;
let __VLS_33;
const __VLS_34 = {
    'onClick:appendInner': (...[$event]) => {
        __VLS_ctx.showPassword = !__VLS_ctx.showPassword;
    }
};
var __VLS_30;
const __VLS_35 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
    type: "submit",
    color: "primary",
    block: true,
    loading: (__VLS_ctx.submitting),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_37 = __VLS_36({
    type: "submit",
    color: "primary",
    block: true,
    loading: (__VLS_ctx.submitting),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
__VLS_38.slots.default;
(__VLS_ctx.submitting ? '가입 중...' : '가입하기');
var __VLS_38;
var __VLS_12;
if (__VLS_ctx.errorMessage) {
    const __VLS_39 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-4" },
    }));
    const __VLS_41 = __VLS_40({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    __VLS_42.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_42;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "helper-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_43 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    variant: "text",
    color: "primary",
    to: ('/login'),
    disabled: (__VLS_ctx.submitting),
}));
const __VLS_45 = __VLS_44({
    variant: "text",
    color: "primary",
    to: ('/login'),
    disabled: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
var __VLS_46;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['auth-content']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-head']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-form']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-row']} */ ;
// @ts-ignore
var __VLS_18 = __VLS_17;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formRef: formRef,
            showPassword: showPassword,
            name: name,
            email: email,
            password: password,
            errorMessage: errorMessage,
            submitting: submitting,
            nameRules: nameRules,
            emailRules: emailRules,
            passwordRules: passwordRules,
            onSubmit: onSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
