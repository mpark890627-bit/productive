import { reactive, ref, watch } from 'vue';
import { extractErrorMessage } from '../../api/apiClient';
import { createTaskComment, deleteComment, getTaskComments } from '../../api/comments';
import { getTags, createTag } from '../../api/tags';
import { attachTagToTask, detachTagFromTask, getTaskById, patchTask } from '../../api/tasks';
import { useAuthStore } from '../../stores/auth';
const props = defineProps();
const emit = defineEmits();
const comments = ref([]);
const loadingComments = ref(false);
const commentInput = ref('');
const commentSubmitting = ref(false);
const deletingCommentId = ref(null);
const commentErrorMessage = ref('');
const formSubmitting = ref(false);
const formErrorMessage = ref('');
const tagInput = ref('');
const tagSubmitting = ref(false);
const authStore = useAuthStore();
const form = reactive({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeUserId: '',
});
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
const titleRules = [(v) => !!v?.trim() || '제목은 필수입니다.'];
const commentRules = [(v) => !!v?.trim() || '댓글을 입력하세요.'];
const onDialogToggle = (value) => {
    if (!value) {
        emit('close');
    }
};
const syncFormFromTask = () => {
    if (!props.task) {
        return;
    }
    form.title = props.task.title ?? '';
    form.description = props.task.description ?? '';
    form.status = props.task.status ?? 'TODO';
    form.priority = props.task.priority ?? 'MEDIUM';
    form.dueDate = props.task.dueDate ?? '';
    form.assigneeUserId = props.task.assigneeUserId ?? '';
};
const loadComments = async () => {
    if (!props.task) {
        return;
    }
    try {
        loadingComments.value = true;
        commentErrorMessage.value = '';
        const response = await getTaskComments(props.task.id, 0, 50);
        comments.value = response.content;
    }
    catch (error) {
        const message = extractErrorMessage(error, '댓글을 불러오지 못했습니다.');
        commentErrorMessage.value = message;
        emit('error', message);
    }
    finally {
        loadingComments.value = false;
    }
};
const refreshTaskDetail = async () => {
    if (!props.task) {
        return;
    }
    const detail = await getTaskById(props.task.id);
    emit('updated', detail);
};
const saveTask = async () => {
    if (!props.task) {
        return;
    }
    if (!form.title.trim()) {
        formErrorMessage.value = '제목은 필수입니다.';
        return;
    }
    try {
        formSubmitting.value = true;
        formErrorMessage.value = '';
        const updated = await patchTask(props.task.id, {
            title: form.title.trim(),
            description: form.description.trim() ? form.description.trim() : null,
            status: form.status,
            priority: form.priority,
            dueDate: form.dueDate || null,
            assigneeUserId: form.assigneeUserId.trim() ? form.assigneeUserId.trim() : null,
        });
        emit('updated', updated);
    }
    catch (error) {
        const message = extractErrorMessage(error, '태스크 수정에 실패했습니다.');
        formErrorMessage.value = message;
        emit('error', message);
    }
    finally {
        formSubmitting.value = false;
    }
};
const addTag = async () => {
    if (!props.task || !tagInput.value.trim()) {
        return;
    }
    try {
        tagSubmitting.value = true;
        const name = tagInput.value.trim();
        const existing = await getTags(name);
        const tag = existing.find((item) => item.name.trim().toLowerCase() === name.toLowerCase()) ?? (await createTag(name));
        await attachTagToTask(props.task.id, tag.id);
        tagInput.value = '';
        await refreshTaskDetail();
    }
    catch (error) {
        emit('error', extractErrorMessage(error, '태그 추가에 실패했습니다.'));
    }
    finally {
        tagSubmitting.value = false;
    }
};
const removeTag = async (tagId) => {
    if (!props.task) {
        return;
    }
    try {
        tagSubmitting.value = true;
        await detachTagFromTask(props.task.id, tagId);
        await refreshTaskDetail();
    }
    catch (error) {
        emit('error', extractErrorMessage(error, '태그 제거에 실패했습니다.'));
    }
    finally {
        tagSubmitting.value = false;
    }
};
const submitComment = async () => {
    if (!props.task || !commentInput.value.trim()) {
        return;
    }
    try {
        commentSubmitting.value = true;
        await createTaskComment(props.task.id, commentInput.value.trim());
        commentInput.value = '';
        await loadComments();
        emit('commented');
    }
    catch (error) {
        emit('error', extractErrorMessage(error, '댓글 작성에 실패했습니다.'));
    }
    finally {
        commentSubmitting.value = false;
    }
};
const canDeleteComment = (comment) => authStore.user?.userId === comment.authorUserId;
const removeComment = async (commentId) => {
    try {
        deletingCommentId.value = commentId;
        await deleteComment(commentId);
        await loadComments();
    }
    catch (error) {
        emit('error', extractErrorMessage(error, '댓글 삭제에 실패했습니다.'));
    }
    finally {
        deletingCommentId.value = null;
    }
};
watch(() => [props.open, props.task?.id], async () => {
    formErrorMessage.value = '';
    commentErrorMessage.value = '';
    syncFormFromTask();
    if (props.open && props.task?.id) {
        await loadComments();
    }
}, { immediate: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['edit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-item']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-controls']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open && !!__VLS_ctx.task),
    maxWidth: "920",
    scrollable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open && !!__VLS_ctx.task),
    maxWidth: "920",
    scrollable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    'onUpdate:modelValue': (__VLS_ctx.onDialogToggle)
};
var __VLS_8 = {};
__VLS_3.slots.default;
if (__VLS_ctx.task) {
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
        ...{ class: "d-flex align-center justify-space-between pt-5 px-5" },
    }));
    const __VLS_15 = __VLS_14({
        ...{ class: "d-flex align-center justify-space-between pt-5 px-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_16.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "modal-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "modal-sub" },
    });
    (__VLS_ctx.task.id);
    const __VLS_17 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
        ...{ 'onClick': {} },
        variant: "text",
        icon: "mdi-close",
    }));
    const __VLS_19 = __VLS_18({
        ...{ 'onClick': {} },
        variant: "text",
        icon: "mdi-close",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    let __VLS_21;
    let __VLS_22;
    let __VLS_23;
    const __VLS_24 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.task))
                return;
            __VLS_ctx.$emit('close');
        }
    };
    var __VLS_20;
    var __VLS_16;
    const __VLS_25 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
        ...{ class: "px-5 pb-2" },
    }));
    const __VLS_27 = __VLS_26({
        ...{ class: "px-5 pb-2" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    if (__VLS_ctx.formErrorMessage) {
        const __VLS_29 = {}.VAlert;
        /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
        // @ts-ignore
        const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
            type: "error",
            variant: "tonal",
            ...{ class: "mb-3" },
        }));
        const __VLS_31 = __VLS_30({
            type: "error",
            variant: "tonal",
            ...{ class: "mb-3" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_30));
        __VLS_32.slots.default;
        (__VLS_ctx.formErrorMessage);
        var __VLS_32;
    }
    if (__VLS_ctx.commentErrorMessage) {
        const __VLS_33 = {}.VAlert;
        /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
            type: "error",
            variant: "tonal",
            ...{ class: "mb-3" },
        }));
        const __VLS_35 = __VLS_34({
            type: "error",
            variant: "tonal",
            ...{ class: "mb-3" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        __VLS_36.slots.default;
        (__VLS_ctx.commentErrorMessage);
        var __VLS_36;
    }
    const __VLS_37 = {}.VForm;
    /** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        ...{ 'onSubmit': {} },
        ...{ class: "edit-grid" },
    }));
    const __VLS_39 = __VLS_38({
        ...{ 'onSubmit': {} },
        ...{ class: "edit-grid" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_41;
    let __VLS_42;
    let __VLS_43;
    const __VLS_44 = {
        onSubmit: (__VLS_ctx.saveTask)
    };
    __VLS_40.slots.default;
    const __VLS_45 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        modelValue: (__VLS_ctx.form.title),
        label: "제목",
        rules: (__VLS_ctx.titleRules),
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }));
    const __VLS_47 = __VLS_46({
        modelValue: (__VLS_ctx.form.title),
        label: "제목",
        rules: (__VLS_ctx.titleRules),
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    const __VLS_49 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        modelValue: (__VLS_ctx.form.status),
        label: "상태",
        items: (__VLS_ctx.statusItems),
        itemTitle: "label",
        itemValue: "value",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }));
    const __VLS_51 = __VLS_50({
        modelValue: (__VLS_ctx.form.status),
        label: "상태",
        items: (__VLS_ctx.statusItems),
        itemTitle: "label",
        itemValue: "value",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    const __VLS_53 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        modelValue: (__VLS_ctx.form.priority),
        label: "우선순위",
        items: (__VLS_ctx.priorityItems),
        itemTitle: "label",
        itemValue: "value",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }));
    const __VLS_55 = __VLS_54({
        modelValue: (__VLS_ctx.form.priority),
        label: "우선순위",
        items: (__VLS_ctx.priorityItems),
        itemTitle: "label",
        itemValue: "value",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const __VLS_57 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        modelValue: (__VLS_ctx.form.dueDate),
        label: "마감일",
        type: "date",
        placeholder: "YYYY-MM-DD",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }));
    const __VLS_59 = __VLS_58({
        modelValue: (__VLS_ctx.form.dueDate),
        label: "마감일",
        type: "date",
        placeholder: "YYYY-MM-DD",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const __VLS_61 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        modelValue: (__VLS_ctx.form.assigneeUserId),
        label: "담당자 사용자 ID(UUID)",
        placeholder: "비우면 기존값 유지",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }));
    const __VLS_63 = __VLS_62({
        modelValue: (__VLS_ctx.form.assigneeUserId),
        label: "담당자 사용자 ID(UUID)",
        placeholder: "비우면 기존값 유지",
        disabled: (__VLS_ctx.formSubmitting),
        density: "comfortable",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const __VLS_65 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        modelValue: (__VLS_ctx.form.description),
        label: "설명",
        rows: "3",
        autoGrow: true,
        disabled: (__VLS_ctx.formSubmitting),
    }));
    const __VLS_67 = __VLS_66({
        modelValue: (__VLS_ctx.form.description),
        label: "설명",
        rows: "3",
        autoGrow: true,
        disabled: (__VLS_ctx.formSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-actions" },
    });
    const __VLS_69 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        type: "submit",
        color: "primary",
        loading: (__VLS_ctx.formSubmitting),
        disabled: (__VLS_ctx.formSubmitting),
    }));
    const __VLS_71 = __VLS_70({
        type: "submit",
        color: "primary",
        loading: (__VLS_ctx.formSubmitting),
        disabled: (__VLS_ctx.formSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    __VLS_72.slots.default;
    var __VLS_72;
    var __VLS_40;
    const __VLS_73 = {}.VDivider;
    /** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        ...{ class: "my-4" },
    }));
    const __VLS_75 = __VLS_74({
        ...{ class: "my-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "tags-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-controls" },
    });
    const __VLS_77 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.tagInput),
        label: "태그명",
        density: "compact",
        hideDetails: true,
        disabled: (__VLS_ctx.tagSubmitting),
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.tagInput),
        label: "태그명",
        density: "compact",
        hideDetails: true,
        disabled: (__VLS_ctx.tagSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_81;
    let __VLS_82;
    let __VLS_83;
    const __VLS_84 = {
        onKeyup: (__VLS_ctx.addTag)
    };
    var __VLS_80;
    const __VLS_85 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "tonal",
        loading: (__VLS_ctx.tagSubmitting),
        disabled: (__VLS_ctx.tagSubmitting),
    }));
    const __VLS_87 = __VLS_86({
        ...{ 'onClick': {} },
        color: "primary",
        variant: "tonal",
        loading: (__VLS_ctx.tagSubmitting),
        disabled: (__VLS_ctx.tagSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_86));
    let __VLS_89;
    let __VLS_90;
    let __VLS_91;
    const __VLS_92 = {
        onClick: (__VLS_ctx.addTag)
    };
    __VLS_88.slots.default;
    var __VLS_88;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-list" },
    });
    for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.task.tags))) {
        const __VLS_93 = {}.VChip;
        /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
            ...{ 'onClick:close': {} },
            key: (tag.id),
            size: "small",
            ...{ class: "mr-2 mb-2" },
            closable: true,
        }));
        const __VLS_95 = __VLS_94({
            ...{ 'onClick:close': {} },
            key: (tag.id),
            size: "small",
            ...{ class: "mr-2 mb-2" },
            closable: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        let __VLS_97;
        let __VLS_98;
        let __VLS_99;
        const __VLS_100 = {
            'onClick:close': (...[$event]) => {
                if (!(__VLS_ctx.task))
                    return;
                __VLS_ctx.removeTag(tag.id);
            }
        };
        __VLS_96.slots.default;
        (tag.name);
        var __VLS_96;
    }
    if (__VLS_ctx.task.tags.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted" },
        });
    }
    const __VLS_101 = {}.VDivider;
    /** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        ...{ class: "my-4" },
    }));
    const __VLS_103 = __VLS_102({
        ...{ class: "my-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "comments" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comments-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    const __VLS_105 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        ...{ 'onClick': {} },
        size: "small",
        variant: "text",
        prependIcon: "mdi-refresh",
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onClick': {} },
        size: "small",
        variant: "text",
        prependIcon: "mdi-refresh",
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_109;
    let __VLS_110;
    let __VLS_111;
    const __VLS_112 = {
        onClick: (__VLS_ctx.loadComments)
    };
    __VLS_108.slots.default;
    var __VLS_108;
    if (__VLS_ctx.loadingComments) {
        const __VLS_113 = {}.VSkeletonLoader;
        /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
            type: "list-item-three-line@3",
        }));
        const __VLS_115 = __VLS_114({
            type: "list-item-three-line@3",
        }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    }
    else if (__VLS_ctx.comments.length > 0) {
        const __VLS_117 = {}.VList;
        /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
            lines: "two",
            ...{ class: "comment-list" },
        }));
        const __VLS_119 = __VLS_118({
            lines: "two",
            ...{ class: "comment-list" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_118));
        __VLS_120.slots.default;
        for (const [comment] of __VLS_getVForSourceType((__VLS_ctx.comments))) {
            const __VLS_121 = {}.VListItem;
            /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
            // @ts-ignore
            const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
                key: (comment.id),
                ...{ class: "comment-item" },
            }));
            const __VLS_123 = __VLS_122({
                key: (comment.id),
                ...{ class: "comment-item" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_122));
            __VLS_124.slots.default;
            {
                const { title: __VLS_thisSlot } = __VLS_124.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "comment-head" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (comment.authorName || 'Unknown');
                if (__VLS_ctx.canDeleteComment(comment)) {
                    const __VLS_125 = {}.VBtn;
                    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                    // @ts-ignore
                    const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
                        ...{ 'onClick': {} },
                        size: "x-small",
                        color: "error",
                        variant: "text",
                        loading: (__VLS_ctx.deletingCommentId === comment.id),
                    }));
                    const __VLS_127 = __VLS_126({
                        ...{ 'onClick': {} },
                        size: "x-small",
                        color: "error",
                        variant: "text",
                        loading: (__VLS_ctx.deletingCommentId === comment.id),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
                    let __VLS_129;
                    let __VLS_130;
                    let __VLS_131;
                    const __VLS_132 = {
                        onClick: (...[$event]) => {
                            if (!(__VLS_ctx.task))
                                return;
                            if (!!(__VLS_ctx.loadingComments))
                                return;
                            if (!(__VLS_ctx.comments.length > 0))
                                return;
                            if (!(__VLS_ctx.canDeleteComment(comment)))
                                return;
                            __VLS_ctx.removeComment(comment.id);
                        }
                    };
                    __VLS_128.slots.default;
                    var __VLS_128;
                }
            }
            {
                const { subtitle: __VLS_thisSlot } = __VLS_124.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "comment-content" },
                });
                (comment.content);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                (new Date(comment.createdAt).toLocaleString());
            }
            var __VLS_124;
        }
        var __VLS_120;
    }
    else {
        const __VLS_133 = {}.VAlert;
        /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            type: "info",
            variant: "tonal",
        }));
        const __VLS_135 = __VLS_134({
            type: "info",
            variant: "tonal",
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        __VLS_136.slots.default;
        var __VLS_136;
    }
    const __VLS_137 = {}.VForm;
    /** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
        ...{ 'onSubmit': {} },
        ...{ class: "comment-form" },
    }));
    const __VLS_139 = __VLS_138({
        ...{ 'onSubmit': {} },
        ...{ class: "comment-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    let __VLS_141;
    let __VLS_142;
    let __VLS_143;
    const __VLS_144 = {
        onSubmit: (__VLS_ctx.submitComment)
    };
    __VLS_140.slots.default;
    const __VLS_145 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
        modelValue: (__VLS_ctx.commentInput),
        rows: "3",
        autoGrow: true,
        label: "댓글 작성",
        rules: (__VLS_ctx.commentRules),
        disabled: (__VLS_ctx.commentSubmitting),
    }));
    const __VLS_147 = __VLS_146({
        modelValue: (__VLS_ctx.commentInput),
        rows: "3",
        autoGrow: true,
        label: "댓글 작성",
        rules: (__VLS_ctx.commentRules),
        disabled: (__VLS_ctx.commentSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comment-actions" },
    });
    const __VLS_149 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        type: "submit",
        color: "primary",
        loading: (__VLS_ctx.commentSubmitting),
        disabled: (__VLS_ctx.commentSubmitting),
    }));
    const __VLS_151 = __VLS_150({
        type: "submit",
        color: "primary",
        loading: (__VLS_ctx.commentSubmitting),
        disabled: (__VLS_ctx.commentSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    __VLS_152.slots.default;
    var __VLS_152;
    var __VLS_140;
    var __VLS_28;
    var __VLS_12;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['my-4']} */ ;
/** @type {__VLS_StyleScopedClasses['tags-section']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['my-4']} */ ;
/** @type {__VLS_StyleScopedClasses['comments']} */ ;
/** @type {__VLS_StyleScopedClasses['comments-head']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-list']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-item']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-head']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-form']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            comments: comments,
            loadingComments: loadingComments,
            commentInput: commentInput,
            commentSubmitting: commentSubmitting,
            deletingCommentId: deletingCommentId,
            commentErrorMessage: commentErrorMessage,
            formSubmitting: formSubmitting,
            formErrorMessage: formErrorMessage,
            tagInput: tagInput,
            tagSubmitting: tagSubmitting,
            form: form,
            statusItems: statusItems,
            priorityItems: priorityItems,
            titleRules: titleRules,
            commentRules: commentRules,
            onDialogToggle: onDialogToggle,
            loadComments: loadComments,
            saveTask: saveTask,
            addTag: addTag,
            removeTag: removeTag,
            submitComment: submitComment,
            canDeleteComment: canDeleteComment,
            removeComment: removeComment,
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
