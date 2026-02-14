import { computed, ref, watch } from 'vue';
import { extractErrorMessage } from '../../api/apiClient';
import { createTaskComment, deleteComment, getTaskComments } from '../../api/comments';
import { patchTask } from '../../api/tasks';
import { useAuthStore } from '../../stores/auth';
import { taskPriorityColors } from '../../utils/taskVisuals';
const props = defineProps();
const emit = defineEmits();
const comments = ref([]);
const loadingComments = ref(false);
const commentInput = ref('');
const commentSubmitting = ref(false);
const deletingCommentId = ref(null);
const commentErrorMessage = ref('');
const priorityInput = ref('MEDIUM');
const prioritySubmitting = ref(false);
const authStore = useAuthStore();
const priorityItems = [
    { label: 'LOW', value: 'LOW' },
    { label: 'MEDIUM', value: 'MEDIUM' },
    { label: 'HIGH', value: 'HIGH' },
];
const commentRules = [(v) => !!v?.trim() || '댓글을 입력하세요.'];
const tagText = computed(() => {
    if (!props.task?.tags?.length) {
        return '없음';
    }
    return props.task.tags.map((tag) => tag.name).join(', ');
});
const priorityColor = computed(() => taskPriorityColors[priorityInput.value]);
const onDialogToggle = (value) => {
    if (!value) {
        emit('close');
    }
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
const updatePriority = async () => {
    if (!props.task) {
        return;
    }
    try {
        prioritySubmitting.value = true;
        const updated = await patchTask(props.task.id, { priority: priorityInput.value });
        emit('updated', updated);
    }
    catch (error) {
        emit('error', extractErrorMessage(error, '우선순위 변경에 실패했습니다.'));
    }
    finally {
        prioritySubmitting.value = false;
    }
};
watch(() => [props.open, props.task?.id, props.task?.priority], async () => {
    if (props.task?.priority) {
        priorityInput.value = props.task.priority;
    }
    if (props.open && props.task?.id) {
        await loadComments();
    }
}, { immediate: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['comments-head']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open && !!__VLS_ctx.task),
    maxWidth: "820",
    scrollable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.open && !!__VLS_ctx.task),
    maxWidth: "820",
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
    (__VLS_ctx.task.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "modal-sub" },
    });
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
        ...{ class: "px-5 pb-1" },
    }));
    const __VLS_27 = __VLS_26({
        ...{ class: "px-5 pb-1" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    __VLS_28.slots.default;
    if (__VLS_ctx.commentErrorMessage) {
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
        (__VLS_ctx.commentErrorMessage);
        var __VLS_32;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-grid" },
    });
    const __VLS_33 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        variant: "tonal",
        ...{ class: "meta-card" },
        color: "surface",
    }));
    const __VLS_35 = __VLS_34({
        variant: "tonal",
        ...{ class: "meta-card" },
        color: "surface",
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    __VLS_36.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.task.description || '없음');
    var __VLS_36;
    const __VLS_37 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        variant: "tonal",
        ...{ class: "meta-card" },
        color: "surface",
    }));
    const __VLS_39 = __VLS_38({
        variant: "tonal",
        ...{ class: "meta-card" },
        color: "surface",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    __VLS_40.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "priority-row" },
    });
    const __VLS_41 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
        modelValue: (__VLS_ctx.priorityInput),
        items: (__VLS_ctx.priorityItems),
        itemTitle: "label",
        itemValue: "value",
        density: "compact",
        hideDetails: true,
        disabled: (__VLS_ctx.prioritySubmitting),
    }));
    const __VLS_43 = __VLS_42({
        modelValue: (__VLS_ctx.priorityInput),
        items: (__VLS_ctx.priorityItems),
        itemTitle: "label",
        itemValue: "value",
        density: "compact",
        hideDetails: true,
        disabled: (__VLS_ctx.prioritySubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    const __VLS_45 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
        ...{ 'onClick': {} },
        size: "small",
        color: "primary",
        loading: (__VLS_ctx.prioritySubmitting),
    }));
    const __VLS_47 = __VLS_46({
        ...{ 'onClick': {} },
        size: "small",
        color: "primary",
        loading: (__VLS_ctx.prioritySubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    let __VLS_49;
    let __VLS_50;
    let __VLS_51;
    const __VLS_52 = {
        onClick: (__VLS_ctx.updatePriority)
    };
    __VLS_48.slots.default;
    var __VLS_48;
    var __VLS_40;
    const __VLS_53 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        variant: "tonal",
        ...{ class: "meta-card" },
        color: "surface",
    }));
    const __VLS_55 = __VLS_54({
        variant: "tonal",
        ...{ class: "meta-card" },
        color: "surface",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chips" },
    });
    const __VLS_57 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        size: "small",
        prependIcon: "mdi-calendar-month-outline",
    }));
    const __VLS_59 = __VLS_58({
        size: "small",
        prependIcon: "mdi-calendar-month-outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    __VLS_60.slots.default;
    (__VLS_ctx.task.dueDate || '마감 없음');
    var __VLS_60;
    const __VLS_61 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
        size: "small",
        prependIcon: "mdi-account-outline",
    }));
    const __VLS_63 = __VLS_62({
        size: "small",
        prependIcon: "mdi-account-outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    __VLS_64.slots.default;
    (__VLS_ctx.task.assigneeUserId || '담당자 없음');
    var __VLS_64;
    const __VLS_65 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        size: "small",
        color: (__VLS_ctx.priorityColor),
        variant: "tonal",
    }));
    const __VLS_67 = __VLS_66({
        size: "small",
        color: (__VLS_ctx.priorityColor),
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    __VLS_68.slots.default;
    (__VLS_ctx.priorityInput);
    var __VLS_68;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tag-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.tagText);
    var __VLS_56;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "comments" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comments-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    const __VLS_69 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        ...{ 'onClick': {} },
        size: "small",
        variant: "text",
        prependIcon: "mdi-refresh",
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onClick': {} },
        size: "small",
        variant: "text",
        prependIcon: "mdi-refresh",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        onClick: (__VLS_ctx.loadComments)
    };
    __VLS_72.slots.default;
    var __VLS_72;
    if (__VLS_ctx.loadingComments) {
        const __VLS_77 = {}.VSkeletonLoader;
        /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
        // @ts-ignore
        const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
            type: "list-item-three-line@3",
        }));
        const __VLS_79 = __VLS_78({
            type: "list-item-three-line@3",
        }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    }
    else if (__VLS_ctx.comments.length > 0) {
        const __VLS_81 = {}.VList;
        /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
        // @ts-ignore
        const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
            lines: "two",
            ...{ class: "comment-list" },
        }));
        const __VLS_83 = __VLS_82({
            lines: "two",
            ...{ class: "comment-list" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_82));
        __VLS_84.slots.default;
        for (const [comment] of __VLS_getVForSourceType((__VLS_ctx.comments))) {
            const __VLS_85 = {}.VListItem;
            /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
                key: (comment.id),
                ...{ class: "comment-item" },
            }));
            const __VLS_87 = __VLS_86({
                key: (comment.id),
                ...{ class: "comment-item" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            __VLS_88.slots.default;
            {
                const { title: __VLS_thisSlot } = __VLS_88.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "comment-head" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (comment.authorName || 'Unknown');
                if (__VLS_ctx.canDeleteComment(comment)) {
                    const __VLS_89 = {}.VBtn;
                    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                    // @ts-ignore
                    const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
                        ...{ 'onClick': {} },
                        size: "x-small",
                        color: "error",
                        variant: "text",
                        loading: (__VLS_ctx.deletingCommentId === comment.id),
                    }));
                    const __VLS_91 = __VLS_90({
                        ...{ 'onClick': {} },
                        size: "x-small",
                        color: "error",
                        variant: "text",
                        loading: (__VLS_ctx.deletingCommentId === comment.id),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
                    let __VLS_93;
                    let __VLS_94;
                    let __VLS_95;
                    const __VLS_96 = {
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
                    __VLS_92.slots.default;
                    var __VLS_92;
                }
            }
            {
                const { subtitle: __VLS_thisSlot } = __VLS_88.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "comment-content" },
                });
                (comment.content);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                (new Date(comment.createdAt).toLocaleString());
            }
            var __VLS_88;
        }
        var __VLS_84;
    }
    else {
        const __VLS_97 = {}.VAlert;
        /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
            type: "info",
            variant: "tonal",
        }));
        const __VLS_99 = __VLS_98({
            type: "info",
            variant: "tonal",
        }, ...__VLS_functionalComponentArgsRest(__VLS_98));
        __VLS_100.slots.default;
        var __VLS_100;
    }
    const __VLS_101 = {}.VForm;
    /** @type {[typeof __VLS_components.VForm, typeof __VLS_components.vForm, typeof __VLS_components.VForm, typeof __VLS_components.vForm, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        ...{ 'onSubmit': {} },
        ...{ class: "comment-form" },
    }));
    const __VLS_103 = __VLS_102({
        ...{ 'onSubmit': {} },
        ...{ class: "comment-form" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_105;
    let __VLS_106;
    let __VLS_107;
    const __VLS_108 = {
        onSubmit: (__VLS_ctx.submitComment)
    };
    __VLS_104.slots.default;
    const __VLS_109 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        modelValue: (__VLS_ctx.commentInput),
        rows: "3",
        autoGrow: true,
        label: "댓글 작성",
        rules: (__VLS_ctx.commentRules),
        disabled: (__VLS_ctx.commentSubmitting),
    }));
    const __VLS_111 = __VLS_110({
        modelValue: (__VLS_ctx.commentInput),
        rows: "3",
        autoGrow: true,
        label: "댓글 작성",
        rules: (__VLS_ctx.commentRules),
        disabled: (__VLS_ctx.commentSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "comment-actions" },
    });
    const __VLS_113 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
        type: "submit",
        color: "primary",
        loading: (__VLS_ctx.commentSubmitting),
        disabled: (__VLS_ctx.commentSubmitting),
    }));
    const __VLS_115 = __VLS_114({
        type: "submit",
        color: "primary",
        loading: (__VLS_ctx.commentSubmitting),
        disabled: (__VLS_ctx.commentSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    __VLS_116.slots.default;
    var __VLS_116;
    var __VLS_104;
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
/** @type {__VLS_StyleScopedClasses['pb-1']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['priority-row']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chips']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-text']} */ ;
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
            priorityInput: priorityInput,
            prioritySubmitting: prioritySubmitting,
            priorityItems: priorityItems,
            commentRules: commentRules,
            tagText: tagText,
            priorityColor: priorityColor,
            onDialogToggle: onDialogToggle,
            loadComments: loadComments,
            submitComment: submitComment,
            canDeleteComment: canDeleteComment,
            removeComment: removeComment,
            updatePriority: updatePriority,
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
