import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProjectById, getProjects } from '../../api/projects';
import { getTaskById } from '../../api/tasks';
import AppToast from '../../components/common/AppToast.vue';
import EmptyState from '../../components/common/EmptyState.vue';
import SkeletonList from '../../components/common/SkeletonList.vue';
import TaskDetailModal from '../../components/board/TaskDetailModal.vue';
import { useToast } from '../../composables/useToast';
import { useAuthStore } from '../../stores/auth';
import { useTasksListStore } from '../../stores/tasksList';
import { taskPriorityColors, taskStatusColors } from '../../utils/taskVisuals';
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const tasksStore = useTasksListStore();
const { toast, openToast } = useToast();
const projectOptions = ref([]);
const projectNameMap = ref(new Map());
const taskModalOpen = ref(false);
const selectedTask = ref(null);
const syncFromRoute = ref(false);
const projectModel = ref(null);
const statusModel = ref(null);
const priorityModel = ref(null);
const assigneeScope = ref('ALL');
const dueFromModel = ref(null);
const dueToModel = ref(null);
const keywordModel = ref('');
const sortModel = ref('updatedAt,desc');
const activeQuickFilter = ref('ALL');
const headers = [
    { title: '제목', key: 'title', sortable: false },
    { title: '프로젝트', key: 'projectId', sortable: false },
    { title: '상태', key: 'status', sortable: false },
    { title: '우선순위', key: 'priority', sortable: false },
    { title: '담당자', key: 'assigneeUserId', sortable: false },
    { title: '마감일', key: 'dueDate', sortable: false },
    { title: '수정일', key: 'updatedAt', sortable: false },
    { title: '', key: 'actions', sortable: false, width: 120 },
];
const statusOptions = [
    { title: '전체', value: null },
    { title: 'TODO', value: 'TODO' },
    { title: 'IN_PROGRESS', value: 'IN_PROGRESS' },
    { title: 'DONE', value: 'DONE' },
];
const priorityOptions = [
    { title: '전체', value: null },
    { title: 'LOW', value: 'LOW' },
    { title: 'MEDIUM', value: 'MEDIUM' },
    { title: 'HIGH', value: 'HIGH' },
];
const assigneeOptions = [
    { title: '전체', value: 'ALL' },
    { title: '내 담당', value: 'ME' },
];
const sortOptions = [
    { title: '업데이트 최신순', value: 'updatedAt,desc' },
    { title: '업데이트 오래된순', value: 'updatedAt,asc' },
    { title: '마감일 빠른순', value: 'dueDate,asc' },
    { title: '마감일 늦은순', value: 'dueDate,desc' },
    { title: '우선순위 높은순', value: 'priority,desc' },
    { title: '우선순위 낮은순', value: 'priority,asc' },
];
const priorityColor = (priority) => taskPriorityColors[priority];
const statusColor = (status) => taskStatusColors[status];
const formatDate = (value) => new Date(value).toLocaleString();
const formatDateOnly = (value) => value.toISOString().slice(0, 10);
const loadProjectOptions = async () => {
    const page = await getProjects({ page: 0, size: 200, sort: 'name,asc' });
    projectOptions.value = [{ title: '전체', value: '' }, ...page.content.map((project) => ({ title: project.name, value: project.id }))];
    projectNameMap.value = new Map(page.content.map((project) => [project.id, project.name]));
};
const parseRouteQuery = async () => {
    const q = route.query;
    projectModel.value = typeof q.projectId === 'string' && q.projectId ? q.projectId : null;
    statusModel.value = typeof q.status === 'string' ? q.status : null;
    priorityModel.value = typeof q.priority === 'string' ? q.priority : null;
    dueFromModel.value = typeof q.dueFrom === 'string' ? q.dueFrom : null;
    dueToModel.value = typeof q.dueTo === 'string' ? q.dueTo : null;
    keywordModel.value = typeof q.keyword === 'string' ? q.keyword : '';
    sortModel.value = typeof q.sort === 'string' ? q.sort : 'updatedAt,desc';
    assigneeScope.value = q.assignee === 'ME' ? 'ME' : 'ALL';
    const page = typeof q.page === 'string' ? Number(q.page) : 0;
    tasksStore.page = Number.isFinite(page) && page >= 0 ? page : 0;
};
const syncRouteQuery = async () => {
    const query = {};
    if (projectModel.value)
        query.projectId = projectModel.value;
    if (statusModel.value)
        query.status = statusModel.value;
    if (priorityModel.value)
        query.priority = priorityModel.value;
    if (dueFromModel.value)
        query.dueFrom = dueFromModel.value;
    if (dueToModel.value)
        query.dueTo = dueToModel.value;
    if (keywordModel.value.trim())
        query.keyword = keywordModel.value.trim();
    if (assigneeScope.value === 'ME')
        query.assignee = 'ME';
    if (sortModel.value !== 'updatedAt,desc')
        query.sort = sortModel.value;
    if (tasksStore.page > 0)
        query.page = String(tasksStore.page);
    await router.replace({ query });
};
const applyFilters = async () => {
    const [field, dir] = sortModel.value.split(',');
    tasksStore.sortField = field ?? 'updatedAt';
    tasksStore.sortDir = dir ?? 'desc';
    await tasksStore.applyFilters({
        projectId: projectModel.value,
        status: statusModel.value,
        priority: priorityModel.value,
        assigneeUserId: assigneeScope.value === 'ME' ? authStore.user?.userId ?? null : null,
        dueFrom: dueFromModel.value,
        dueTo: dueToModel.value,
        keyword: keywordModel.value,
    });
    await tasksStore.fetchSummary();
    await syncRouteQuery();
};
const resetFilters = async () => {
    projectModel.value = null;
    statusModel.value = null;
    priorityModel.value = null;
    assigneeScope.value = 'ALL';
    dueFromModel.value = null;
    dueToModel.value = null;
    keywordModel.value = '';
    sortModel.value = 'updatedAt,desc';
    tasksStore.sortField = 'updatedAt';
    tasksStore.sortDir = 'desc';
    activeQuickFilter.value = 'ALL';
    await tasksStore.resetFilters();
    await tasksStore.fetchSummary();
    await syncRouteQuery();
};
const applyQuickFilter = async (type) => {
    const today = new Date();
    const dueSoon = new Date(today);
    dueSoon.setDate(today.getDate() + 3);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    activeQuickFilter.value = type;
    if (type === 'ALL') {
        statusModel.value = null;
        dueFromModel.value = null;
        dueToModel.value = null;
    }
    else if (type === 'IN_PROGRESS') {
        statusModel.value = 'IN_PROGRESS';
        dueFromModel.value = null;
        dueToModel.value = null;
    }
    else if (type === 'DUE_SOON') {
        statusModel.value = null;
        dueFromModel.value = formatDateOnly(today);
        dueToModel.value = formatDateOnly(dueSoon);
    }
    else if (type === 'OVERDUE') {
        statusModel.value = null;
        dueFromModel.value = null;
        dueToModel.value = formatDateOnly(yesterday);
    }
    await applyFilters();
};
const onPageChange = async (next) => {
    await tasksStore.setPage(next - 1);
    await syncRouteQuery();
};
const onRowClick = async (_event, row) => {
    const candidate = row;
    const taskId = candidate.item?.raw?.id ?? candidate.item?.id;
    if (!taskId) {
        return;
    }
    try {
        selectedTask.value = await getTaskById(taskId);
        taskModalOpen.value = true;
    }
    catch {
        openToast('태스크 상세를 불러오지 못했습니다.', 'error');
    }
};
const onTaskUpdated = (task) => {
    selectedTask.value = task;
    void tasksStore.fetch();
};
const goBoard = async (projectId) => {
    if (!projectNameMap.value.has(projectId)) {
        try {
            const project = await getProjectById(projectId);
            projectNameMap.value.set(project.id, project.name);
        }
        catch {
            // no-op
        }
    }
    void router.push(`/app/projects/${projectId}/board`);
};
watch(keywordModel, (value) => {
    tasksStore.setKeywordDebounced(value);
    void syncRouteQuery();
});
watch(() => route.fullPath, async () => {
    if (syncFromRoute.value) {
        return;
    }
    syncFromRoute.value = true;
    await parseRouteQuery();
    await applyFilters();
    syncFromRoute.value = false;
});
onMounted(async () => {
    await loadProjectOptions();
    await parseRouteQuery();
    await applyFilters();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "card app-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
const __VLS_0 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
    loading: (__VLS_ctx.tasksStore.loading),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
    loading: (__VLS_ctx.tasksStore.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.tasksStore.fetch)
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "summary-grid" },
});
const __VLS_8 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'ALL' }) },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'ALL' }) },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.applyQuickFilter('ALL');
    }
};
__VLS_11.slots.default;
const __VLS_16 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.tasksStore.summary?.totalCount ?? 0);
var __VLS_19;
var __VLS_11;
const __VLS_20 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'IN_PROGRESS' }) },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'IN_PROGRESS' }) },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.applyQuickFilter('IN_PROGRESS');
    }
};
__VLS_23.slots.default;
const __VLS_28 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.tasksStore.summary?.inProgressCount ?? 0);
var __VLS_31;
var __VLS_23;
const __VLS_32 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'DUE_SOON' }) },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_34 = __VLS_33({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'DUE_SOON' }) },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onClick: (...[$event]) => {
        __VLS_ctx.applyQuickFilter('DUE_SOON');
    }
};
__VLS_35.slots.default;
const __VLS_40 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.tasksStore.summary?.dueSoonCount ?? 0);
var __VLS_43;
var __VLS_35;
const __VLS_44 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'OVERDUE' }) },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    ...{ class: "summary-card section-card" },
    ...{ class: ({ active: __VLS_ctx.activeQuickFilter === 'OVERDUE' }) },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (...[$event]) => {
        __VLS_ctx.applyQuickFilter('OVERDUE');
    }
};
__VLS_47.slots.default;
const __VLS_52 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "summary-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.tasksStore.summary?.overdueCount ?? 0);
var __VLS_55;
var __VLS_47;
const __VLS_56 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ class: "section-card filter-card" },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_58 = __VLS_57({
    ...{ class: "section-card filter-card" },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-grid" },
});
const __VLS_60 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.projectModel),
    items: (__VLS_ctx.projectOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "프로젝트",
    clearable: true,
    hideDetails: true,
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.projectModel),
    items: (__VLS_ctx.projectOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "프로젝트",
    clearable: true,
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const __VLS_64 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.statusModel),
    items: (__VLS_ctx.statusOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "상태",
    clearable: true,
    hideDetails: true,
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.statusModel),
    items: (__VLS_ctx.statusOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "상태",
    clearable: true,
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const __VLS_68 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.priorityModel),
    items: (__VLS_ctx.priorityOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "우선순위",
    clearable: true,
    hideDetails: true,
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.priorityModel),
    items: (__VLS_ctx.priorityOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "우선순위",
    clearable: true,
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_72 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    modelValue: (__VLS_ctx.assigneeScope),
    items: (__VLS_ctx.assigneeOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "담당자",
    hideDetails: true,
}));
const __VLS_74 = __VLS_73({
    modelValue: (__VLS_ctx.assigneeScope),
    items: (__VLS_ctx.assigneeOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "담당자",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.dueFromModel),
    type: "date",
    label: "마감 시작일",
    hideDetails: true,
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.dueFromModel),
    type: "date",
    label: "마감 시작일",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.dueToModel),
    type: "date",
    label: "마감 종료일",
    hideDetails: true,
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.dueToModel),
    type: "date",
    label: "마감 종료일",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.sortModel),
    items: (__VLS_ctx.sortOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "정렬",
    hideDetails: true,
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.sortModel),
    items: (__VLS_ctx.sortOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "정렬",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const __VLS_88 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.keywordModel),
    label: "키워드 검색",
    prependInnerIcon: "mdi-magnify",
    placeholder: "제목/설명",
    hideDetails: true,
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.keywordModel),
    label: "키워드 검색",
    prependInnerIcon: "mdi-magnify",
    placeholder: "제목/설명",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-actions" },
});
const __VLS_92 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    variant: "outlined",
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onClick: (__VLS_ctx.resetFilters)
};
__VLS_95.slots.default;
var __VLS_95;
const __VLS_100 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onClick': {} },
    color: "primary",
}));
const __VLS_102 = __VLS_101({
    ...{ 'onClick': {} },
    color: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    onClick: (__VLS_ctx.applyFilters)
};
__VLS_103.slots.default;
var __VLS_103;
var __VLS_59;
if (__VLS_ctx.tasksStore.errorMessage) {
    const __VLS_108 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        type: "error",
        ...{ class: "section-card" },
    }));
    const __VLS_110 = __VLS_109({
        type: "error",
        ...{ class: "section-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    (__VLS_ctx.tasksStore.errorMessage);
    var __VLS_111;
}
if (__VLS_ctx.tasksStore.loading) {
    /** @type {[typeof SkeletonList, ]} */ ;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent(SkeletonList, new SkeletonList({
        type: "table",
    }));
    const __VLS_113 = __VLS_112({
        type: "table",
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
}
else if (__VLS_ctx.tasksStore.items.length === 0) {
    /** @type {[typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        title: "태스크가 없습니다",
        description: "필터를 조정하거나 프로젝트를 확인해보세요.",
        icon: "mdi-format-list-bulleted-square",
        ...{ class: "section-card" },
    }));
    const __VLS_116 = __VLS_115({
        title: "태스크가 없습니다",
        description: "필터를 조정하거나 프로젝트를 확인해보세요.",
        icon: "mdi-format-list-bulleted-square",
        ...{ class: "section-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
}
else {
    const __VLS_118 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
        ...{ class: "section-card table-wrap" },
        rounded: "lg",
        elevation: "0",
    }));
    const __VLS_120 = __VLS_119({
        ...{ class: "section-card table-wrap" },
        rounded: "lg",
        elevation: "0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    __VLS_121.slots.default;
    const __VLS_122 = {}.VDataTable;
    /** @type {[typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, ]} */ ;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
        ...{ 'onClick:row': {} },
        headers: (__VLS_ctx.headers),
        items: (__VLS_ctx.tasksStore.items),
        itemKey: "id",
        hover: true,
    }));
    const __VLS_124 = __VLS_123({
        ...{ 'onClick:row': {} },
        headers: (__VLS_ctx.headers),
        items: (__VLS_ctx.tasksStore.items),
        itemKey: "id",
        hover: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    let __VLS_126;
    let __VLS_127;
    let __VLS_128;
    const __VLS_129 = {
        'onClick:row': (__VLS_ctx.onRowClick)
    };
    __VLS_125.slots.default;
    {
        const { 'item.title': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({
            ...{ class: "muted-text" },
        });
        (item.description || '설명 없음');
    }
    {
        const { 'item.projectId': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.projectNameMap.get(item.projectId) || '-');
    }
    {
        const { 'item.status': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_130 = {}.VChip;
        /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
            color: (__VLS_ctx.statusColor(item.status)),
            variant: "tonal",
        }));
        const __VLS_132 = __VLS_131({
            color: (__VLS_ctx.statusColor(item.status)),
            variant: "tonal",
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        __VLS_133.slots.default;
        (item.status);
        var __VLS_133;
    }
    {
        const { 'item.priority': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_134 = {}.VChip;
        /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
        // @ts-ignore
        const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
            color: (__VLS_ctx.priorityColor(item.priority)),
            variant: "tonal",
        }));
        const __VLS_136 = __VLS_135({
            color: (__VLS_ctx.priorityColor(item.priority)),
            variant: "tonal",
        }, ...__VLS_functionalComponentArgsRest(__VLS_135));
        __VLS_137.slots.default;
        (item.priority);
        var __VLS_137;
    }
    {
        const { 'item.assigneeUserId': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        (item.assigneeUserId || '-');
    }
    {
        const { 'item.dueDate': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        (item.dueDate || '-');
    }
    {
        const { 'item.updatedAt': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        (__VLS_ctx.formatDate(item.updatedAt));
    }
    {
        const { 'item.actions': __VLS_thisSlot } = __VLS_125.slots;
        const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_138 = {}.VBtn;
        /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
        // @ts-ignore
        const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
            ...{ 'onClick': {} },
            size: "small",
            variant: "text",
            prependIcon: "mdi-view-kanban-outline",
        }));
        const __VLS_140 = __VLS_139({
            ...{ 'onClick': {} },
            size: "small",
            variant: "text",
            prependIcon: "mdi-view-kanban-outline",
        }, ...__VLS_functionalComponentArgsRest(__VLS_139));
        let __VLS_142;
        let __VLS_143;
        let __VLS_144;
        const __VLS_145 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.tasksStore.loading))
                    return;
                if (!!(__VLS_ctx.tasksStore.items.length === 0))
                    return;
                __VLS_ctx.goBoard(item.projectId);
            }
        };
        __VLS_141.slots.default;
        var __VLS_141;
    }
    var __VLS_125;
    var __VLS_121;
}
if (__VLS_ctx.tasksStore.totalPages > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: "pager" },
    });
    const __VLS_146 = {}.VPagination;
    /** @type {[typeof __VLS_components.VPagination, typeof __VLS_components.vPagination, ]} */ ;
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.tasksStore.page + 1),
        length: (__VLS_ctx.tasksStore.totalPages),
        totalVisible: (7),
    }));
    const __VLS_148 = __VLS_147({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.tasksStore.page + 1),
        length: (__VLS_ctx.tasksStore.totalPages),
        totalVisible: (7),
    }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    let __VLS_150;
    let __VLS_151;
    let __VLS_152;
    const __VLS_153 = {
        'onUpdate:modelValue': (__VLS_ctx.onPageChange)
    };
    var __VLS_149;
}
/** @type {[typeof TaskDetailModal, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(TaskDetailModal, new TaskDetailModal({
    ...{ 'onClose': {} },
    ...{ 'onUpdated': {} },
    ...{ 'onError': {} },
    open: (__VLS_ctx.taskModalOpen),
    task: (__VLS_ctx.selectedTask),
}));
const __VLS_155 = __VLS_154({
    ...{ 'onClose': {} },
    ...{ 'onUpdated': {} },
    ...{ 'onError': {} },
    open: (__VLS_ctx.taskModalOpen),
    task: (__VLS_ctx.selectedTask),
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
let __VLS_157;
let __VLS_158;
let __VLS_159;
const __VLS_160 = {
    onClose: (...[$event]) => {
        __VLS_ctx.taskModalOpen = false;
    }
};
const __VLS_161 = {
    onUpdated: (__VLS_ctx.onTaskUpdated)
};
const __VLS_162 = {
    onError: (...[$event]) => {
        __VLS_ctx.openToast($event, 'error');
    }
};
var __VLS_156;
/** @type {[typeof AppToast, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(AppToast, new AppToast({
    show: (__VLS_ctx.toast.show),
    message: (__VLS_ctx.toast.message),
    color: (__VLS_ctx.toast.color),
}));
const __VLS_164 = __VLS_163({
    show: (__VLS_ctx.toast.show),
    message: (__VLS_ctx.toast.message),
    color: (__VLS_ctx.toast.color),
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['title-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['muted-text']} */ ;
/** @type {__VLS_StyleScopedClasses['pager']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppToast: AppToast,
            EmptyState: EmptyState,
            SkeletonList: SkeletonList,
            TaskDetailModal: TaskDetailModal,
            tasksStore: tasksStore,
            toast: toast,
            openToast: openToast,
            projectOptions: projectOptions,
            projectNameMap: projectNameMap,
            taskModalOpen: taskModalOpen,
            selectedTask: selectedTask,
            projectModel: projectModel,
            statusModel: statusModel,
            priorityModel: priorityModel,
            assigneeScope: assigneeScope,
            dueFromModel: dueFromModel,
            dueToModel: dueToModel,
            keywordModel: keywordModel,
            sortModel: sortModel,
            activeQuickFilter: activeQuickFilter,
            headers: headers,
            statusOptions: statusOptions,
            priorityOptions: priorityOptions,
            assigneeOptions: assigneeOptions,
            sortOptions: sortOptions,
            priorityColor: priorityColor,
            statusColor: statusColor,
            formatDate: formatDate,
            applyFilters: applyFilters,
            resetFilters: resetFilters,
            applyQuickFilter: applyQuickFilter,
            onPageChange: onPageChange,
            onRowClick: onRowClick,
            onTaskUpdated: onTaskUpdated,
            goBoard: goBoard,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
