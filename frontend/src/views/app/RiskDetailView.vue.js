import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTags } from '../../api/tags';
import { getProjectTasks } from '../../api/tasks';
import { addRiskTag, closeRisk, createRiskAction, createRiskComment, getRisk, linkTaskToRisk, listRiskActions, listRiskActivities, listRiskComments, listRiskLinkedTasks, listRiskTags, removeRiskTag, unlinkTaskFromRisk, updateRisk, updateRiskAction, deleteRiskAction, deleteRiskComment, } from '../../api/risks';
import EmptyState from '../../components/common/EmptyState.vue';
const route = useRoute();
const router = useRouter();
const projectId = route.params.projectId;
const riskId = route.params.riskId;
const tab = ref('overview');
const loading = ref(false);
const saving = ref(false);
const closing = ref(false);
const actionsLoading = ref(false);
const errorMessage = ref('');
const editMode = ref(false);
const risk = ref(null);
const riskActions = ref([]);
const linkedTasks = ref([]);
const riskTags = ref([]);
const riskComments = ref([]);
const activities = ref([]);
const projectTasks = ref([]);
const tagKeyword = ref('');
const selectedTagId = ref(null);
const tagOptions = ref([]);
const manualTaskId = ref('');
const selectedTaskId = ref(null);
const taskOptions = computed(() => projectTasks.value.map((task) => ({ title: task.title, value: task.id })));
const newComment = ref('');
const newAction = reactive({
    title: '',
    status: 'OPEN',
    dueDate: '',
});
const actionDrafts = reactive({});
const form = reactive({
    title: '',
    description: '',
    category: '',
    status: 'IDENTIFIED',
    probability: 3,
    impact: 3,
    nextReviewDate: '',
    mitigationPlan: '',
    contingencyPlan: '',
    triggers: '',
});
const statusOptions = ['IDENTIFIED', 'ASSESSING', 'MITIGATING', 'MONITORING', 'CLOSED'];
const scoreOptions = [1, 2, 3, 4, 5];
const actionStatusOptions = ['OPEN', 'IN_PROGRESS', 'DONE'];
const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
});
const computedLevelScore = computed(() => Number(form.probability) * Number(form.impact));
const computedLevelBucket = computed(() => {
    const score = computedLevelScore.value;
    if (score >= 16)
        return 'CRITICAL';
    if (score >= 10)
        return 'HIGH';
    if (score >= 5)
        return 'MEDIUM';
    return 'LOW';
});
const showToast = (message, color = 'success') => {
    snackbar.show = false;
    snackbar.message = message;
    snackbar.color = color;
    setTimeout(() => {
        snackbar.show = true;
    }, 10);
};
const levelColor = (bucket) => {
    if (bucket === 'CRITICAL')
        return 'error';
    if (bucket === 'HIGH')
        return 'warning';
    if (bucket === 'MEDIUM')
        return 'primary';
    return 'success';
};
const syncForm = (item) => {
    form.title = item.title;
    form.description = item.description ?? '';
    form.category = item.category ?? '';
    form.status = item.status;
    form.probability = item.probability;
    form.impact = item.impact;
    form.nextReviewDate = item.nextReviewDate ?? '';
    form.mitigationPlan = item.mitigationPlan ?? '';
    form.contingencyPlan = item.contingencyPlan ?? '';
    form.triggers = item.triggers ?? '';
};
const loadRisk = async () => {
    const item = await getRisk(riskId);
    risk.value = item;
    syncForm(item);
};
const loadActions = async () => {
    const page = await listRiskActions(riskId, { page: 0, size: 100, sort: 'updatedAt,desc' });
    riskActions.value = page.content;
    riskActions.value.forEach((action) => {
        actionDrafts[action.id] = {
            title: action.title,
            status: action.status,
            dueDate: action.dueDate ?? '',
        };
    });
};
const loadLinkedTasks = async () => {
    linkedTasks.value = await listRiskLinkedTasks(riskId);
};
const loadRiskTags = async () => {
    riskTags.value = await listRiskTags(riskId);
};
const loadComments = async () => {
    const page = await listRiskComments(riskId, { page: 0, size: 100, sort: 'createdAt,desc' });
    riskComments.value = page.content;
};
const loadActivity = async () => {
    const page = await listRiskActivities(riskId, { page: 0, size: 50, sort: 'createdAt,desc' });
    activities.value = page.content;
};
const loadProjectTaskCandidates = async () => {
    const page = await getProjectTasks(projectId, { page: 0, size: 100, sort: 'updatedAt,desc' });
    projectTasks.value = page.content;
};
const loadAll = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        await Promise.all([
            loadRisk(),
            loadActions(),
            loadLinkedTasks(),
            loadRiskTags(),
            loadComments(),
            loadActivity(),
            loadProjectTaskCandidates(),
        ]);
    }
    catch {
        errorMessage.value = '리스크 상세 데이터를 불러오지 못했습니다.';
    }
    finally {
        loading.value = false;
    }
};
const toggleEdit = () => {
    if (!risk.value)
        return;
    if (editMode.value) {
        syncForm(risk.value);
    }
    editMode.value = !editMode.value;
};
const saveRisk = async () => {
    if (!risk.value)
        return;
    const title = form.title.trim();
    if (!title) {
        showToast('제목은 필수입니다.', 'error');
        return;
    }
    try {
        saving.value = true;
        const updated = await updateRisk(risk.value.id, {
            title,
            description: form.description.trim() || undefined,
            category: form.category.trim() || undefined,
            status: form.status,
            probability: form.probability,
            impact: form.impact,
            nextReviewDate: form.nextReviewDate || undefined,
            mitigationPlan: form.mitigationPlan.trim() || undefined,
            contingencyPlan: form.contingencyPlan.trim() || undefined,
            triggers: form.triggers.trim() || undefined,
        });
        risk.value = updated;
        syncForm(updated);
        editMode.value = false;
        showToast('리스크가 저장되었습니다.');
        await loadActivity();
    }
    catch {
        showToast('리스크 저장에 실패했습니다.', 'error');
    }
    finally {
        saving.value = false;
    }
};
const closeCurrentRisk = async () => {
    if (!risk.value)
        return;
    try {
        closing.value = true;
        const closed = await closeRisk(risk.value.id);
        risk.value = closed;
        syncForm(closed);
        showToast('리스크가 CLOSED 처리되었습니다.');
        await loadActivity();
    }
    catch {
        showToast('리스크 종료에 실패했습니다.', 'error');
    }
    finally {
        closing.value = false;
    }
};
const createAction = async () => {
    const title = newAction.title.trim();
    if (!title) {
        showToast('액션 제목을 입력하세요.', 'error');
        return;
    }
    try {
        actionsLoading.value = true;
        await createRiskAction(riskId, {
            title,
            status: newAction.status,
            dueDate: newAction.dueDate || undefined,
        });
        newAction.title = '';
        newAction.status = 'OPEN';
        newAction.dueDate = '';
        await loadActions();
        await loadActivity();
        showToast('액션이 추가되었습니다.');
    }
    catch {
        showToast('액션 추가에 실패했습니다.', 'error');
    }
    finally {
        actionsLoading.value = false;
    }
};
const saveAction = async (actionId) => {
    try {
        const draft = actionDrafts[actionId];
        await updateRiskAction(actionId, {
            title: draft.title.trim(),
            status: draft.status,
            dueDate: draft.dueDate || undefined,
        });
        await loadActions();
        await loadActivity();
        showToast('액션이 저장되었습니다.');
    }
    catch {
        showToast('액션 저장에 실패했습니다.', 'error');
    }
};
const deleteAction = async (actionId) => {
    try {
        await deleteRiskAction(actionId);
        await loadActions();
        await loadActivity();
        showToast('액션이 삭제되었습니다.');
    }
    catch {
        showToast('액션 삭제에 실패했습니다.', 'error');
    }
};
const linkTask = async () => {
    const taskId = manualTaskId.value.trim() || selectedTaskId.value;
    if (!taskId) {
        showToast('연결할 taskId를 입력하거나 선택하세요.', 'error');
        return;
    }
    try {
        await linkTaskToRisk(riskId, taskId);
        manualTaskId.value = '';
        selectedTaskId.value = null;
        await loadLinkedTasks();
        showToast('태스크가 연결되었습니다.');
    }
    catch {
        showToast('태스크 연결에 실패했습니다.', 'error');
    }
};
const unlinkTask = async (taskId) => {
    try {
        await unlinkTaskFromRisk(riskId, taskId);
        await loadLinkedTasks();
        showToast('태스크 연결이 해제되었습니다.');
    }
    catch {
        showToast('태스크 연결 해제에 실패했습니다.', 'error');
    }
};
const searchTags = async () => {
    const list = await getTags(tagKeyword.value.trim() || undefined);
    tagOptions.value = list.map((tag) => ({ title: tag.name, value: tag.id }));
};
const addTagToRisk = async () => {
    if (!selectedTagId.value)
        return;
    try {
        await addRiskTag(riskId, selectedTagId.value);
        selectedTagId.value = null;
        await loadRiskTags();
        showToast('태그가 추가되었습니다.');
    }
    catch {
        showToast('태그 추가에 실패했습니다.', 'error');
    }
};
const removeTagFromRisk = async (tagId) => {
    try {
        await removeRiskTag(riskId, tagId);
        await loadRiskTags();
        showToast('태그가 제거되었습니다.');
    }
    catch {
        showToast('태그 제거에 실패했습니다.', 'error');
    }
};
const createComment = async () => {
    const content = newComment.value.trim();
    if (!content)
        return;
    try {
        await createRiskComment(riskId, content);
        newComment.value = '';
        await loadComments();
        showToast('댓글이 추가되었습니다.');
    }
    catch {
        showToast('댓글 추가에 실패했습니다.', 'error');
    }
};
const removeComment = async (commentId) => {
    try {
        await deleteRiskComment(commentId);
        await loadComments();
        showToast('댓글이 삭제되었습니다.');
    }
    catch {
        showToast('댓글 삭제에 실패했습니다.', 'error');
    }
};
const stringifyMeta = (meta) => JSON.stringify(meta);
const formatDate = (value) => new Date(value).toLocaleString();
watch(tab, async (nextTab) => {
    if (nextTab === 'activity') {
        await loadActivity();
    }
});
onMounted(async () => {
    await searchTags();
    await loadAll();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-header']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['action-create']} */ ;
/** @type {__VLS_StyleScopedClasses['action-row']} */ ;
/** @type {__VLS_StyleScopedClasses['task-link-create']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-keyword']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-select']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "risk-detail" },
});
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    rounded: "lg",
    elevation: "1",
    ...{ class: "header-card" },
}));
const __VLS_2 = __VLS_1({
    rounded: "lg",
    elevation: "1",
    ...{ class: "header-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.risk?.title || 'Risk Detail');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-meta" },
});
const __VLS_4 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    size: "small",
    variant: "tonal",
}));
const __VLS_6 = __VLS_5({
    size: "small",
    variant: "tonal",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
(__VLS_ctx.risk?.status || '-');
var __VLS_7;
if (__VLS_ctx.risk) {
    const __VLS_8 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        size: "small",
        color: (__VLS_ctx.levelColor(__VLS_ctx.risk.levelBucket)),
        variant: "tonal",
    }));
    const __VLS_10 = __VLS_9({
        size: "small",
        color: (__VLS_ctx.levelColor(__VLS_ctx.risk.levelBucket)),
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    (__VLS_ctx.risk.levelBucket);
    (__VLS_ctx.risk.levelScore);
    var __VLS_11;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_12 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/risks`),
}));
const __VLS_14 = __VLS_13({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/risks`),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
var __VLS_15;
const __VLS_16 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (__VLS_ctx.loading || !__VLS_ctx.risk),
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (__VLS_ctx.loading || !__VLS_ctx.risk),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.toggleEdit)
};
__VLS_19.slots.default;
(__VLS_ctx.editMode ? 'Cancel' : 'Edit');
var __VLS_19;
if (__VLS_ctx.editMode) {
    const __VLS_24 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        color: "primary",
        loading: (__VLS_ctx.saving),
        disabled: (__VLS_ctx.saving || !__VLS_ctx.risk),
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        color: "primary",
        loading: (__VLS_ctx.saving),
        disabled: (__VLS_ctx.saving || !__VLS_ctx.risk),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.saveRisk)
    };
    __VLS_27.slots.default;
    var __VLS_27;
}
const __VLS_32 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    color: "error",
    variant: "tonal",
    loading: (__VLS_ctx.closing),
    disabled: (!__VLS_ctx.risk || __VLS_ctx.risk.status === 'CLOSED'),
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    color: "error",
    variant: "tonal",
    loading: (__VLS_ctx.closing),
    disabled: (!__VLS_ctx.risk || __VLS_ctx.risk.status === 'CLOSED'),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (__VLS_ctx.closeCurrentRisk)
};
__VLS_35.slots.default;
var __VLS_35;
var __VLS_3;
if (__VLS_ctx.errorMessage) {
    const __VLS_40 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        type: "error",
        variant: "tonal",
    }));
    const __VLS_42 = __VLS_41({
        type: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_43;
}
if (__VLS_ctx.loading) {
    const __VLS_44 = {}.VSkeletonLoader;
    /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        type: "article, table-row@4",
    }));
    const __VLS_46 = __VLS_45({
        type: "article, table-row@4",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
}
else if (__VLS_ctx.risk) {
    const __VLS_48 = {}.VTabs;
    /** @type {[typeof __VLS_components.VTabs, typeof __VLS_components.vTabs, typeof __VLS_components.VTabs, typeof __VLS_components.vTabs, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        modelValue: (__VLS_ctx.tab),
        color: "primary",
    }));
    const __VLS_50 = __VLS_49({
        modelValue: (__VLS_ctx.tab),
        color: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    const __VLS_52 = {}.VTab;
    /** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        value: "overview",
    }));
    const __VLS_54 = __VLS_53({
        value: "overview",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    var __VLS_55;
    const __VLS_56 = {}.VTab;
    /** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        value: "assessment",
    }));
    const __VLS_58 = __VLS_57({
        value: "assessment",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    var __VLS_59;
    const __VLS_60 = {}.VTab;
    /** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        value: "actions",
    }));
    const __VLS_62 = __VLS_61({
        value: "actions",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    var __VLS_63;
    const __VLS_64 = {}.VTab;
    /** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        value: "tasks",
    }));
    const __VLS_66 = __VLS_65({
        value: "tasks",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    var __VLS_67;
    const __VLS_68 = {}.VTab;
    /** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        value: "comments",
    }));
    const __VLS_70 = __VLS_69({
        value: "comments",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    var __VLS_71;
    const __VLS_72 = {}.VTab;
    /** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        value: "activity",
    }));
    const __VLS_74 = __VLS_73({
        value: "activity",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    var __VLS_75;
    var __VLS_51;
    const __VLS_76 = {}.VWindow;
    /** @type {[typeof __VLS_components.VWindow, typeof __VLS_components.vWindow, typeof __VLS_components.VWindow, typeof __VLS_components.vWindow, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        modelValue: (__VLS_ctx.tab),
    }));
    const __VLS_78 = __VLS_77({
        modelValue: (__VLS_ctx.tab),
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    const __VLS_80 = {}.VWindowItem;
    /** @type {[typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        value: "overview",
    }));
    const __VLS_82 = __VLS_81({
        value: "overview",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    const __VLS_84 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        rounded: "lg",
        elevation: "1",
    }));
    const __VLS_86 = __VLS_85({
        rounded: "lg",
        elevation: "1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        ...{ class: "section-grid" },
    }));
    const __VLS_90 = __VLS_89({
        ...{ class: "section-grid" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    const __VLS_92 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        modelValue: (__VLS_ctx.form.title),
        label: "Title",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_94 = __VLS_93({
        modelValue: (__VLS_ctx.form.title),
        label: "Title",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    const __VLS_96 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        modelValue: (__VLS_ctx.form.category),
        label: "Category",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_98 = __VLS_97({
        modelValue: (__VLS_ctx.form.category),
        label: "Category",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    const __VLS_100 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        modelValue: (__VLS_ctx.form.status),
        items: (__VLS_ctx.statusOptions),
        label: "Status",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_102 = __VLS_101({
        modelValue: (__VLS_ctx.form.status),
        items: (__VLS_ctx.statusOptions),
        label: "Status",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_104 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        modelValue: (__VLS_ctx.form.nextReviewDate),
        type: "date",
        label: "Next review",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_106 = __VLS_105({
        modelValue: (__VLS_ctx.form.nextReviewDate),
        type: "date",
        label: "Next review",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    const __VLS_108 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        modelValue: (__VLS_ctx.form.description),
        label: "Description",
        rows: "3",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_110 = __VLS_109({
        modelValue: (__VLS_ctx.form.description),
        label: "Description",
        rows: "3",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    const __VLS_112 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        modelValue: (__VLS_ctx.form.mitigationPlan),
        label: "Mitigation plan",
        rows: "3",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_114 = __VLS_113({
        modelValue: (__VLS_ctx.form.mitigationPlan),
        label: "Mitigation plan",
        rows: "3",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    const __VLS_116 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        modelValue: (__VLS_ctx.form.contingencyPlan),
        label: "Contingency plan",
        rows: "3",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_118 = __VLS_117({
        modelValue: (__VLS_ctx.form.contingencyPlan),
        label: "Contingency plan",
        rows: "3",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    const __VLS_120 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        modelValue: (__VLS_ctx.form.triggers),
        label: "Triggers",
        rows: "2",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_122 = __VLS_121({
        modelValue: (__VLS_ctx.form.triggers),
        label: "Triggers",
        rows: "2",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    const __VLS_124 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        modelValue: (__VLS_ctx.risk.ownerUserName || '미지정'),
        label: "Owner",
        variant: "outlined",
        disabled: true,
    }));
    const __VLS_126 = __VLS_125({
        modelValue: (__VLS_ctx.risk.ownerUserName || '미지정'),
        label: "Owner",
        variant: "outlined",
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    var __VLS_91;
    const __VLS_128 = {}.VDivider;
    /** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({}));
    const __VLS_130 = __VLS_129({}, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const __VLS_132 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
    const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tag-actions" },
    });
    const __VLS_136 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.tagKeyword),
        label: "Tag keyword",
        variant: "outlined",
        density: "compact",
        hideDetails: true,
        ...{ class: "tag-keyword" },
    }));
    const __VLS_138 = __VLS_137({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.tagKeyword),
        label: "Tag keyword",
        variant: "outlined",
        density: "compact",
        hideDetails: true,
        ...{ class: "tag-keyword" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    let __VLS_140;
    let __VLS_141;
    let __VLS_142;
    const __VLS_143 = {
        'onUpdate:modelValue': (__VLS_ctx.searchTags)
    };
    var __VLS_139;
    const __VLS_144 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        modelValue: (__VLS_ctx.selectedTagId),
        items: (__VLS_ctx.tagOptions),
        label: "Select tag",
        itemTitle: "title",
        itemValue: "value",
        variant: "outlined",
        density: "compact",
        hideDetails: true,
        ...{ class: "tag-select" },
    }));
    const __VLS_146 = __VLS_145({
        modelValue: (__VLS_ctx.selectedTagId),
        items: (__VLS_ctx.tagOptions),
        label: "Select tag",
        itemTitle: "title",
        itemValue: "value",
        variant: "outlined",
        density: "compact",
        hideDetails: true,
        ...{ class: "tag-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    const __VLS_148 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (!__VLS_ctx.selectedTagId),
    }));
    const __VLS_150 = __VLS_149({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (!__VLS_ctx.selectedTagId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    let __VLS_152;
    let __VLS_153;
    let __VLS_154;
    const __VLS_155 = {
        onClick: (__VLS_ctx.addTagToRisk)
    };
    __VLS_151.slots.default;
    var __VLS_151;
    if (__VLS_ctx.riskTags.length === 0) {
        /** @type {[typeof EmptyState, ]} */ ;
        // @ts-ignore
        const __VLS_156 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
            title: "태그가 없습니다",
            description: "리스크 태그를 추가해 분류하세요.",
            icon: "mdi-tag-outline",
        }));
        const __VLS_157 = __VLS_156({
            title: "태그가 없습니다",
            description: "리스크 태그를 추가해 분류하세요.",
            icon: "mdi-tag-outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_156));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-list" },
        });
        for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.riskTags))) {
            const __VLS_159 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
                ...{ 'onClick:close': {} },
                key: (tag.id),
                closable: true,
            }));
            const __VLS_161 = __VLS_160({
                ...{ 'onClick:close': {} },
                key: (tag.id),
                closable: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_160));
            let __VLS_163;
            let __VLS_164;
            let __VLS_165;
            const __VLS_166 = {
                'onClick:close': (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.risk))
                        return;
                    if (!!(__VLS_ctx.riskTags.length === 0))
                        return;
                    __VLS_ctx.removeTagFromRisk(tag.id);
                }
            };
            __VLS_162.slots.default;
            (tag.name);
            var __VLS_162;
        }
    }
    var __VLS_135;
    var __VLS_87;
    var __VLS_83;
    const __VLS_167 = {}.VWindowItem;
    /** @type {[typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, ]} */ ;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
        value: "assessment",
    }));
    const __VLS_169 = __VLS_168({
        value: "assessment",
    }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    __VLS_170.slots.default;
    const __VLS_171 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
        rounded: "lg",
        elevation: "1",
    }));
    const __VLS_173 = __VLS_172({
        rounded: "lg",
        elevation: "1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    __VLS_174.slots.default;
    const __VLS_175 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
        ...{ class: "assessment-grid" },
    }));
    const __VLS_177 = __VLS_176({
        ...{ class: "assessment-grid" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_176));
    __VLS_178.slots.default;
    const __VLS_179 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        modelValue: (__VLS_ctx.form.probability),
        items: (__VLS_ctx.scoreOptions),
        label: "Probability (1~5)",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_181 = __VLS_180({
        modelValue: (__VLS_ctx.form.probability),
        items: (__VLS_ctx.scoreOptions),
        label: "Probability (1~5)",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    const __VLS_183 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
        modelValue: (__VLS_ctx.form.impact),
        items: (__VLS_ctx.scoreOptions),
        label: "Impact (1~5)",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }));
    const __VLS_185 = __VLS_184({
        modelValue: (__VLS_ctx.form.impact),
        items: (__VLS_ctx.scoreOptions),
        label: "Impact (1~5)",
        variant: "outlined",
        disabled: (!__VLS_ctx.editMode),
    }, ...__VLS_functionalComponentArgsRest(__VLS_184));
    const __VLS_187 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
        modelValue: (String(__VLS_ctx.computedLevelScore)),
        label: "Level Score",
        variant: "outlined",
        disabled: true,
    }));
    const __VLS_189 = __VLS_188({
        modelValue: (String(__VLS_ctx.computedLevelScore)),
        label: "Level Score",
        variant: "outlined",
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    const __VLS_191 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
        modelValue: (__VLS_ctx.computedLevelBucket),
        label: "Level Bucket",
        variant: "outlined",
        disabled: true,
    }));
    const __VLS_193 = __VLS_192({
        modelValue: (__VLS_ctx.computedLevelBucket),
        label: "Level Bucket",
        variant: "outlined",
        disabled: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    var __VLS_178;
    var __VLS_174;
    var __VLS_170;
    const __VLS_195 = {}.VWindowItem;
    /** @type {[typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, ]} */ ;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent(__VLS_195, new __VLS_195({
        value: "actions",
    }));
    const __VLS_197 = __VLS_196({
        value: "actions",
    }, ...__VLS_functionalComponentArgsRest(__VLS_196));
    __VLS_198.slots.default;
    const __VLS_199 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
        rounded: "lg",
        elevation: "1",
    }));
    const __VLS_201 = __VLS_200({
        rounded: "lg",
        elevation: "1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_200));
    __VLS_202.slots.default;
    const __VLS_203 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_204 = __VLS_asFunctionalComponent(__VLS_203, new __VLS_203({
        ...{ class: "section-title" },
    }));
    const __VLS_205 = __VLS_204({
        ...{ class: "section-title" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_204));
    __VLS_206.slots.default;
    var __VLS_206;
    const __VLS_207 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_208 = __VLS_asFunctionalComponent(__VLS_207, new __VLS_207({}));
    const __VLS_209 = __VLS_208({}, ...__VLS_functionalComponentArgsRest(__VLS_208));
    __VLS_210.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-create" },
    });
    const __VLS_211 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_212 = __VLS_asFunctionalComponent(__VLS_211, new __VLS_211({
        modelValue: (__VLS_ctx.newAction.title),
        label: "Action title",
        variant: "outlined",
    }));
    const __VLS_213 = __VLS_212({
        modelValue: (__VLS_ctx.newAction.title),
        label: "Action title",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_212));
    const __VLS_215 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_216 = __VLS_asFunctionalComponent(__VLS_215, new __VLS_215({
        modelValue: (__VLS_ctx.newAction.status),
        items: (__VLS_ctx.actionStatusOptions),
        label: "Status",
        variant: "outlined",
    }));
    const __VLS_217 = __VLS_216({
        modelValue: (__VLS_ctx.newAction.status),
        items: (__VLS_ctx.actionStatusOptions),
        label: "Status",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_216));
    const __VLS_219 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_220 = __VLS_asFunctionalComponent(__VLS_219, new __VLS_219({
        modelValue: (__VLS_ctx.newAction.dueDate),
        type: "date",
        label: "Due date",
        variant: "outlined",
    }));
    const __VLS_221 = __VLS_220({
        modelValue: (__VLS_ctx.newAction.dueDate),
        type: "date",
        label: "Due date",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_220));
    const __VLS_223 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent(__VLS_223, new __VLS_223({
        ...{ 'onClick': {} },
        color: "primary",
        loading: (__VLS_ctx.actionsLoading),
    }));
    const __VLS_225 = __VLS_224({
        ...{ 'onClick': {} },
        color: "primary",
        loading: (__VLS_ctx.actionsLoading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_224));
    let __VLS_227;
    let __VLS_228;
    let __VLS_229;
    const __VLS_230 = {
        onClick: (__VLS_ctx.createAction)
    };
    __VLS_226.slots.default;
    var __VLS_226;
    if (__VLS_ctx.riskActions.length === 0) {
        /** @type {[typeof EmptyState, ]} */ ;
        // @ts-ignore
        const __VLS_231 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
            title: "액션이 없습니다",
            description: "대응 액션을 추가해 실행 상태를 관리하세요.",
            icon: "mdi-format-list-checks",
        }));
        const __VLS_232 = __VLS_231({
            title: "액션이 없습니다",
            description: "대응 액션을 추가해 실행 상태를 관리하세요.",
            icon: "mdi-format-list-checks",
        }, ...__VLS_functionalComponentArgsRest(__VLS_231));
    }
    else {
        const __VLS_234 = {}.VList;
        /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
        // @ts-ignore
        const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
            lines: "two",
        }));
        const __VLS_236 = __VLS_235({
            lines: "two",
        }, ...__VLS_functionalComponentArgsRest(__VLS_235));
        __VLS_237.slots.default;
        for (const [action] of __VLS_getVForSourceType((__VLS_ctx.riskActions))) {
            const __VLS_238 = {}.VListItem;
            /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
            // @ts-ignore
            const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
                key: (action.id),
                ...{ class: "action-item" },
            }));
            const __VLS_240 = __VLS_239({
                key: (action.id),
                ...{ class: "action-item" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_239));
            __VLS_241.slots.default;
            {
                const { title: __VLS_thisSlot } = __VLS_241.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "action-row" },
                });
                const __VLS_242 = {}.VTextField;
                /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
                // @ts-ignore
                const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
                    modelValue: (__VLS_ctx.actionDrafts[action.id].title),
                    density: "compact",
                    variant: "outlined",
                    hideDetails: true,
                }));
                const __VLS_244 = __VLS_243({
                    modelValue: (__VLS_ctx.actionDrafts[action.id].title),
                    density: "compact",
                    variant: "outlined",
                    hideDetails: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_243));
                const __VLS_246 = {}.VSelect;
                /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
                // @ts-ignore
                const __VLS_247 = __VLS_asFunctionalComponent(__VLS_246, new __VLS_246({
                    modelValue: (__VLS_ctx.actionDrafts[action.id].status),
                    items: (__VLS_ctx.actionStatusOptions),
                    density: "compact",
                    variant: "outlined",
                    hideDetails: true,
                }));
                const __VLS_248 = __VLS_247({
                    modelValue: (__VLS_ctx.actionDrafts[action.id].status),
                    items: (__VLS_ctx.actionStatusOptions),
                    density: "compact",
                    variant: "outlined",
                    hideDetails: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_247));
                const __VLS_250 = {}.VTextField;
                /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
                // @ts-ignore
                const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({
                    modelValue: (__VLS_ctx.actionDrafts[action.id].dueDate),
                    type: "date",
                    density: "compact",
                    variant: "outlined",
                    hideDetails: true,
                }));
                const __VLS_252 = __VLS_251({
                    modelValue: (__VLS_ctx.actionDrafts[action.id].dueDate),
                    type: "date",
                    density: "compact",
                    variant: "outlined",
                    hideDetails: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_251));
                const __VLS_254 = {}.VBtn;
                /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                // @ts-ignore
                const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
                    ...{ 'onClick': {} },
                    size: "small",
                    variant: "outlined",
                }));
                const __VLS_256 = __VLS_255({
                    ...{ 'onClick': {} },
                    size: "small",
                    variant: "outlined",
                }, ...__VLS_functionalComponentArgsRest(__VLS_255));
                let __VLS_258;
                let __VLS_259;
                let __VLS_260;
                const __VLS_261 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.risk))
                            return;
                        if (!!(__VLS_ctx.riskActions.length === 0))
                            return;
                        __VLS_ctx.saveAction(action.id);
                    }
                };
                __VLS_257.slots.default;
                var __VLS_257;
                const __VLS_262 = {}.VBtn;
                /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                // @ts-ignore
                const __VLS_263 = __VLS_asFunctionalComponent(__VLS_262, new __VLS_262({
                    ...{ 'onClick': {} },
                    size: "small",
                    color: "error",
                    variant: "text",
                }));
                const __VLS_264 = __VLS_263({
                    ...{ 'onClick': {} },
                    size: "small",
                    color: "error",
                    variant: "text",
                }, ...__VLS_functionalComponentArgsRest(__VLS_263));
                let __VLS_266;
                let __VLS_267;
                let __VLS_268;
                const __VLS_269 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.risk))
                            return;
                        if (!!(__VLS_ctx.riskActions.length === 0))
                            return;
                        __VLS_ctx.deleteAction(action.id);
                    }
                };
                __VLS_265.slots.default;
                var __VLS_265;
            }
            {
                const { subtitle: __VLS_thisSlot } = __VLS_241.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                (action.assigneeUserName || '-');
                (__VLS_ctx.formatDate(action.updatedAt));
            }
            var __VLS_241;
        }
        var __VLS_237;
    }
    var __VLS_210;
    var __VLS_202;
    var __VLS_198;
    const __VLS_270 = {}.VWindowItem;
    /** @type {[typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, ]} */ ;
    // @ts-ignore
    const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
        value: "tasks",
    }));
    const __VLS_272 = __VLS_271({
        value: "tasks",
    }, ...__VLS_functionalComponentArgsRest(__VLS_271));
    __VLS_273.slots.default;
    const __VLS_274 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
        rounded: "lg",
        elevation: "1",
    }));
    const __VLS_276 = __VLS_275({
        rounded: "lg",
        elevation: "1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    __VLS_277.slots.default;
    const __VLS_278 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
        ...{ class: "section-title" },
    }));
    const __VLS_280 = __VLS_279({
        ...{ class: "section-title" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_279));
    __VLS_281.slots.default;
    var __VLS_281;
    const __VLS_282 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({}));
    const __VLS_284 = __VLS_283({}, ...__VLS_functionalComponentArgsRest(__VLS_283));
    __VLS_285.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "task-link-create" },
    });
    const __VLS_286 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
        modelValue: (__VLS_ctx.manualTaskId),
        label: "Task ID",
        variant: "outlined",
    }));
    const __VLS_288 = __VLS_287({
        modelValue: (__VLS_ctx.manualTaskId),
        label: "Task ID",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_287));
    const __VLS_290 = {}.VAutocomplete;
    /** @type {[typeof __VLS_components.VAutocomplete, typeof __VLS_components.vAutocomplete, ]} */ ;
    // @ts-ignore
    const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
        modelValue: (__VLS_ctx.selectedTaskId),
        items: (__VLS_ctx.taskOptions),
        label: "or select task",
        itemTitle: "title",
        itemValue: "value",
        variant: "outlined",
    }));
    const __VLS_292 = __VLS_291({
        modelValue: (__VLS_ctx.selectedTaskId),
        items: (__VLS_ctx.taskOptions),
        label: "or select task",
        itemTitle: "title",
        itemValue: "value",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_291));
    const __VLS_294 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
        ...{ 'onClick': {} },
        color: "primary",
    }));
    const __VLS_296 = __VLS_295({
        ...{ 'onClick': {} },
        color: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_295));
    let __VLS_298;
    let __VLS_299;
    let __VLS_300;
    const __VLS_301 = {
        onClick: (__VLS_ctx.linkTask)
    };
    __VLS_297.slots.default;
    var __VLS_297;
    if (__VLS_ctx.linkedTasks.length === 0) {
        /** @type {[typeof EmptyState, ]} */ ;
        // @ts-ignore
        const __VLS_302 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
            title: "연결된 태스크가 없습니다",
            description: "Task ID 입력 또는 태스크 선택으로 연결하세요.",
            icon: "mdi-link-variant",
        }));
        const __VLS_303 = __VLS_302({
            title: "연결된 태스크가 없습니다",
            description: "Task ID 입력 또는 태스크 선택으로 연결하세요.",
            icon: "mdi-link-variant",
        }, ...__VLS_functionalComponentArgsRest(__VLS_302));
    }
    else {
        const __VLS_305 = {}.VList;
        /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
        // @ts-ignore
        const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({}));
        const __VLS_307 = __VLS_306({}, ...__VLS_functionalComponentArgsRest(__VLS_306));
        __VLS_308.slots.default;
        for (const [task] of __VLS_getVForSourceType((__VLS_ctx.linkedTasks))) {
            const __VLS_309 = {}.VListItem;
            /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
            // @ts-ignore
            const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
                key: (task.id),
                ...{ class: "linked-task-row" },
            }));
            const __VLS_311 = __VLS_310({
                key: (task.id),
                ...{ class: "linked-task-row" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_310));
            __VLS_312.slots.default;
            {
                const { title: __VLS_thisSlot } = __VLS_312.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "linked-task-title" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (task.title);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chips" },
                });
                const __VLS_313 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_314 = __VLS_asFunctionalComponent(__VLS_313, new __VLS_313({
                    size: "x-small",
                    variant: "tonal",
                }));
                const __VLS_315 = __VLS_314({
                    size: "x-small",
                    variant: "tonal",
                }, ...__VLS_functionalComponentArgsRest(__VLS_314));
                __VLS_316.slots.default;
                (task.status);
                var __VLS_316;
                const __VLS_317 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
                    size: "x-small",
                    variant: "outlined",
                }));
                const __VLS_319 = __VLS_318({
                    size: "x-small",
                    variant: "outlined",
                }, ...__VLS_functionalComponentArgsRest(__VLS_318));
                __VLS_320.slots.default;
                (task.priority);
                var __VLS_320;
            }
            {
                const { subtitle: __VLS_thisSlot } = __VLS_312.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                (task.dueDate || '-');
            }
            {
                const { append: __VLS_thisSlot } = __VLS_312.slots;
                const __VLS_321 = {}.VBtn;
                /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                // @ts-ignore
                const __VLS_322 = __VLS_asFunctionalComponent(__VLS_321, new __VLS_321({
                    ...{ 'onClick': {} },
                    size: "small",
                    color: "error",
                    variant: "text",
                }));
                const __VLS_323 = __VLS_322({
                    ...{ 'onClick': {} },
                    size: "small",
                    color: "error",
                    variant: "text",
                }, ...__VLS_functionalComponentArgsRest(__VLS_322));
                let __VLS_325;
                let __VLS_326;
                let __VLS_327;
                const __VLS_328 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.risk))
                            return;
                        if (!!(__VLS_ctx.linkedTasks.length === 0))
                            return;
                        __VLS_ctx.unlinkTask(task.id);
                    }
                };
                __VLS_324.slots.default;
                var __VLS_324;
            }
            var __VLS_312;
        }
        var __VLS_308;
    }
    var __VLS_285;
    var __VLS_277;
    var __VLS_273;
    const __VLS_329 = {}.VWindowItem;
    /** @type {[typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, ]} */ ;
    // @ts-ignore
    const __VLS_330 = __VLS_asFunctionalComponent(__VLS_329, new __VLS_329({
        value: "comments",
    }));
    const __VLS_331 = __VLS_330({
        value: "comments",
    }, ...__VLS_functionalComponentArgsRest(__VLS_330));
    __VLS_332.slots.default;
    const __VLS_333 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_334 = __VLS_asFunctionalComponent(__VLS_333, new __VLS_333({
        rounded: "lg",
        elevation: "1",
    }));
    const __VLS_335 = __VLS_334({
        rounded: "lg",
        elevation: "1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_334));
    __VLS_336.slots.default;
    const __VLS_337 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_338 = __VLS_asFunctionalComponent(__VLS_337, new __VLS_337({
        ...{ class: "section-title" },
    }));
    const __VLS_339 = __VLS_338({
        ...{ class: "section-title" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_338));
    __VLS_340.slots.default;
    var __VLS_340;
    const __VLS_341 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_342 = __VLS_asFunctionalComponent(__VLS_341, new __VLS_341({}));
    const __VLS_343 = __VLS_342({}, ...__VLS_functionalComponentArgsRest(__VLS_342));
    __VLS_344.slots.default;
    const __VLS_345 = {}.VTextarea;
    /** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
    // @ts-ignore
    const __VLS_346 = __VLS_asFunctionalComponent(__VLS_345, new __VLS_345({
        modelValue: (__VLS_ctx.newComment),
        label: "Write comment",
        rows: "3",
        variant: "outlined",
    }));
    const __VLS_347 = __VLS_346({
        modelValue: (__VLS_ctx.newComment),
        label: "Write comment",
        rows: "3",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_346));
    const __VLS_349 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_350 = __VLS_asFunctionalComponent(__VLS_349, new __VLS_349({
        ...{ 'onClick': {} },
        color: "primary",
        disabled: (__VLS_ctx.newComment.trim().length === 0),
    }));
    const __VLS_351 = __VLS_350({
        ...{ 'onClick': {} },
        color: "primary",
        disabled: (__VLS_ctx.newComment.trim().length === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_350));
    let __VLS_353;
    let __VLS_354;
    let __VLS_355;
    const __VLS_356 = {
        onClick: (__VLS_ctx.createComment)
    };
    __VLS_352.slots.default;
    var __VLS_352;
    if (__VLS_ctx.riskComments.length === 0) {
        /** @type {[typeof EmptyState, ]} */ ;
        // @ts-ignore
        const __VLS_357 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
            title: "댓글이 없습니다",
            description: "리스크 관련 의사결정을 기록하세요.",
            icon: "mdi-comment-text-outline",
            ...{ class: "mt-3" },
        }));
        const __VLS_358 = __VLS_357({
            title: "댓글이 없습니다",
            description: "리스크 관련 의사결정을 기록하세요.",
            icon: "mdi-comment-text-outline",
            ...{ class: "mt-3" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_357));
    }
    else {
        const __VLS_360 = {}.VList;
        /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
        // @ts-ignore
        const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
            lines: "three",
            ...{ class: "mt-2" },
        }));
        const __VLS_362 = __VLS_361({
            lines: "three",
            ...{ class: "mt-2" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_361));
        __VLS_363.slots.default;
        for (const [comment] of __VLS_getVForSourceType((__VLS_ctx.riskComments))) {
            const __VLS_364 = {}.VListItem;
            /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
            // @ts-ignore
            const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
                key: (comment.id),
                ...{ class: "comment-row" },
            }));
            const __VLS_366 = __VLS_365({
                key: (comment.id),
                ...{ class: "comment-row" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_365));
            __VLS_367.slots.default;
            {
                const { title: __VLS_thisSlot } = __VLS_367.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "comment-title" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (comment.authorUserName);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
                (__VLS_ctx.formatDate(comment.createdAt));
            }
            {
                const { subtitle: __VLS_thisSlot } = __VLS_367.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "comment-content" },
                });
                (comment.content);
            }
            {
                const { append: __VLS_thisSlot } = __VLS_367.slots;
                const __VLS_368 = {}.VBtn;
                /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                // @ts-ignore
                const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
                    ...{ 'onClick': {} },
                    size: "small",
                    color: "error",
                    variant: "text",
                }));
                const __VLS_370 = __VLS_369({
                    ...{ 'onClick': {} },
                    size: "small",
                    color: "error",
                    variant: "text",
                }, ...__VLS_functionalComponentArgsRest(__VLS_369));
                let __VLS_372;
                let __VLS_373;
                let __VLS_374;
                const __VLS_375 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            return;
                        if (!(__VLS_ctx.risk))
                            return;
                        if (!!(__VLS_ctx.riskComments.length === 0))
                            return;
                        __VLS_ctx.removeComment(comment.id);
                    }
                };
                __VLS_371.slots.default;
                var __VLS_371;
            }
            var __VLS_367;
        }
        var __VLS_363;
    }
    var __VLS_344;
    var __VLS_336;
    var __VLS_332;
    const __VLS_376 = {}.VWindowItem;
    /** @type {[typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, typeof __VLS_components.VWindowItem, typeof __VLS_components.vWindowItem, ]} */ ;
    // @ts-ignore
    const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
        value: "activity",
    }));
    const __VLS_378 = __VLS_377({
        value: "activity",
    }, ...__VLS_functionalComponentArgsRest(__VLS_377));
    __VLS_379.slots.default;
    const __VLS_380 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
        rounded: "lg",
        elevation: "1",
    }));
    const __VLS_382 = __VLS_381({
        rounded: "lg",
        elevation: "1",
    }, ...__VLS_functionalComponentArgsRest(__VLS_381));
    __VLS_383.slots.default;
    const __VLS_384 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
        ...{ class: "section-title" },
    }));
    const __VLS_386 = __VLS_385({
        ...{ class: "section-title" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    __VLS_387.slots.default;
    var __VLS_387;
    const __VLS_388 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({}));
    const __VLS_390 = __VLS_389({}, ...__VLS_functionalComponentArgsRest(__VLS_389));
    __VLS_391.slots.default;
    if (__VLS_ctx.activities.length === 0) {
        /** @type {[typeof EmptyState, ]} */ ;
        // @ts-ignore
        const __VLS_392 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
            title: "활동 로그가 없습니다",
            description: "리스크 변경 내역이 여기에 표시됩니다.",
            icon: "mdi-history",
        }));
        const __VLS_393 = __VLS_392({
            title: "활동 로그가 없습니다",
            description: "리스크 변경 내역이 여기에 표시됩니다.",
            icon: "mdi-history",
        }, ...__VLS_functionalComponentArgsRest(__VLS_392));
    }
    else {
        const __VLS_395 = {}.VTimeline;
        /** @type {[typeof __VLS_components.VTimeline, typeof __VLS_components.vTimeline, typeof __VLS_components.VTimeline, typeof __VLS_components.vTimeline, ]} */ ;
        // @ts-ignore
        const __VLS_396 = __VLS_asFunctionalComponent(__VLS_395, new __VLS_395({
            density: "compact",
            side: "end",
            align: "start",
        }));
        const __VLS_397 = __VLS_396({
            density: "compact",
            side: "end",
            align: "start",
        }, ...__VLS_functionalComponentArgsRest(__VLS_396));
        __VLS_398.slots.default;
        for (const [activity] of __VLS_getVForSourceType((__VLS_ctx.activities))) {
            const __VLS_399 = {}.VTimelineItem;
            /** @type {[typeof __VLS_components.VTimelineItem, typeof __VLS_components.vTimelineItem, typeof __VLS_components.VTimelineItem, typeof __VLS_components.vTimelineItem, ]} */ ;
            // @ts-ignore
            const __VLS_400 = __VLS_asFunctionalComponent(__VLS_399, new __VLS_399({
                key: (activity.id),
                dotColor: "primary",
                size: "small",
            }));
            const __VLS_401 = __VLS_400({
                key: (activity.id),
                dotColor: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_400));
            __VLS_402.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "activity-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (activity.action);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
            (__VLS_ctx.formatDate(activity.createdAt));
            if (activity.meta) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
                (__VLS_ctx.stringifyMeta(activity.meta));
            }
            var __VLS_402;
        }
        var __VLS_398;
    }
    var __VLS_391;
    var __VLS_383;
    var __VLS_379;
    var __VLS_79;
}
const __VLS_403 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_404 = __VLS_asFunctionalComponent(__VLS_403, new __VLS_403({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    timeout: "2400",
    location: "bottom right",
}));
const __VLS_405 = __VLS_404({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    timeout: "2400",
    location: "bottom right",
}, ...__VLS_functionalComponentArgsRest(__VLS_404));
__VLS_406.slots.default;
(__VLS_ctx.snackbar.message);
var __VLS_406;
/** @type {__VLS_StyleScopedClasses['risk-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-keyword']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-select']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['assessment-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['action-create']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-row']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-link-create']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-task-row']} */ ;
/** @type {__VLS_StyleScopedClasses['linked-task-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chips']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-row']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-title']} */ ;
/** @type {__VLS_StyleScopedClasses['comment-content']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['activity-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            EmptyState: EmptyState,
            projectId: projectId,
            tab: tab,
            loading: loading,
            saving: saving,
            closing: closing,
            actionsLoading: actionsLoading,
            errorMessage: errorMessage,
            editMode: editMode,
            risk: risk,
            riskActions: riskActions,
            linkedTasks: linkedTasks,
            riskTags: riskTags,
            riskComments: riskComments,
            activities: activities,
            tagKeyword: tagKeyword,
            selectedTagId: selectedTagId,
            tagOptions: tagOptions,
            manualTaskId: manualTaskId,
            selectedTaskId: selectedTaskId,
            taskOptions: taskOptions,
            newComment: newComment,
            newAction: newAction,
            actionDrafts: actionDrafts,
            form: form,
            statusOptions: statusOptions,
            scoreOptions: scoreOptions,
            actionStatusOptions: actionStatusOptions,
            snackbar: snackbar,
            computedLevelScore: computedLevelScore,
            computedLevelBucket: computedLevelBucket,
            levelColor: levelColor,
            toggleEdit: toggleEdit,
            saveRisk: saveRisk,
            closeCurrentRisk: closeCurrentRisk,
            createAction: createAction,
            saveAction: saveAction,
            deleteAction: deleteAction,
            linkTask: linkTask,
            unlinkTask: unlinkTask,
            searchTags: searchTags,
            addTagToRisk: addTagToRisk,
            removeTagFromRisk: removeTagFromRisk,
            createComment: createComment,
            removeComment: removeComment,
            stringifyMeta: stringifyMeta,
            formatDate: formatDate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
