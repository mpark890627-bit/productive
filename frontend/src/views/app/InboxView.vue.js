import { computed, onMounted, reactive, ref } from 'vue';
import { extractErrorMessage } from '../../api/apiClient';
import { getProjects } from '../../api/projects';
import { getTaskById } from '../../api/tasks';
import EmptyState from '../../components/common/EmptyState.vue';
import TaskDetailModal from '../../components/board/TaskDetailModal.vue';
import { useInboxStore } from '../../stores/inbox';
import { taskPriorityColors } from '../../utils/taskVisuals';
const inboxStore = useInboxStore();
const statusModel = ref([]);
const projectModel = ref(null);
const keywordModel = ref('');
const projectOptions = ref([]);
const taskModalOpen = ref(false);
const selectedTask = ref(null);
const saveDialogOpen = ref(false);
const saveViewName = ref('');
const saveDialogError = ref('');
const savingView = ref(false);
const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
});
const statusOptions = [
    { title: 'TODO', value: 'TODO' },
    { title: 'IN_PROGRESS', value: 'IN_PROGRESS' },
    { title: 'DONE', value: 'DONE' },
];
const savedViewOptions = computed(() => inboxStore.savedViews.map((view) => ({
    title: view.name,
    value: view.id,
})));
const syncFilterInputs = () => {
    statusModel.value = [...inboxStore.filters.statuses];
    projectModel.value = inboxStore.filters.projectId;
    keywordModel.value = inboxStore.filters.keyword;
};
const priorityColor = (priority) => taskPriorityColors[priority];
const showSnackbar = (message, color) => {
    snackbar.show = false;
    snackbar.message = message;
    snackbar.color = color;
    setTimeout(() => {
        snackbar.show = true;
    }, 10);
};
const loadProjectOptions = async () => {
    const page = await getProjects({ page: 0, size: 200, sort: 'name,asc' });
    projectOptions.value = page.content.map((project) => ({
        title: project.name,
        value: project.id,
    }));
};
const reloadAll = async () => {
    try {
        await Promise.all([loadProjectOptions(), inboxStore.loadSavedViewList(), inboxStore.loadTasks()]);
        showSnackbar('인박스를 새로고침했습니다.', 'success');
    }
    catch {
        showSnackbar('새로고침 중 오류가 발생했습니다.', 'error');
    }
};
const onModeChange = async (mode) => {
    await inboxStore.setMode(mode);
    syncFilterInputs();
};
const applyFilters = async () => {
    await inboxStore.applyFilters({
        statuses: [...statusModel.value],
        projectId: projectModel.value,
        keyword: keywordModel.value.trim(),
    });
};
const onSavedViewChange = async (savedViewId) => {
    await inboxStore.applySavedView(savedViewId);
    syncFilterInputs();
};
const openSaveDialog = () => {
    saveDialogOpen.value = true;
    saveViewName.value = '';
    saveDialogError.value = '';
};
const closeSaveDialog = () => {
    saveDialogOpen.value = false;
    saveViewName.value = '';
    saveDialogError.value = '';
    savingView.value = false;
};
const submitSaveView = async () => {
    try {
        savingView.value = true;
        saveDialogError.value = '';
        await inboxStore.saveCurrentView(saveViewName.value);
        closeSaveDialog();
        showSnackbar('Saved View가 저장되었습니다.', 'success');
    }
    catch (error) {
        saveDialogError.value = extractErrorMessage(error, '저장된 뷰 저장에 실패했습니다.');
    }
    finally {
        savingView.value = false;
    }
};
const deleteSelectedSavedView = async () => {
    if (!inboxStore.selectedSavedViewId) {
        return;
    }
    try {
        await inboxStore.removeSavedView(inboxStore.selectedSavedViewId);
        showSnackbar('Saved View를 삭제했습니다.', 'success');
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, 'Saved View 삭제에 실패했습니다.'), 'error');
    }
};
const openTask = async (taskId) => {
    try {
        selectedTask.value = await getTaskById(taskId);
        taskModalOpen.value = true;
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, '태스크 상세를 불러오지 못했습니다.'), 'error');
    }
};
const toggleWatch = async (taskId) => {
    try {
        await inboxStore.toggleWatch(taskId);
        showSnackbar('Watch 상태가 변경되었습니다.', 'success');
        if (inboxStore.filters.mode === 'WATCHING') {
            await inboxStore.loadTasks();
        }
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, 'Watch 상태 변경에 실패했습니다.'), 'error');
    }
};
const onTaskUpdated = async (task) => {
    selectedTask.value = task;
    await inboxStore.loadTasks();
};
const onPrevPage = async () => {
    if (inboxStore.page > 0) {
        await inboxStore.setPage(inboxStore.page - 1);
    }
};
const onNextPage = async () => {
    if (inboxStore.page < inboxStore.totalPages - 1) {
        await inboxStore.setPage(inboxStore.page + 1);
    }
};
onMounted(async () => {
    syncFilterInputs();
    await Promise.all([loadProjectOptions(), inboxStore.loadSavedViewList(), inboxStore.loadTasks()]);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['task-row']} */ ;
/** @type {__VLS_StyleScopedClasses['inbox-header']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "inbox-view app-page" },
});
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "inbox-header section-card" },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "inbox-header section-card" },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_4 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.reloadAll)
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-content-save-plus-outline",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-content-save-plus-outline",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.openSaveDialog)
};
__VLS_15.slots.default;
var __VLS_15;
var __VLS_3;
const __VLS_20 = {}.VTabs;
/** @type {[typeof __VLS_components.VTabs, typeof __VLS_components.vTabs, typeof __VLS_components.VTabs, typeof __VLS_components.vTabs, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.inboxStore.filters.mode),
    color: "primary",
    density: "comfortable",
    ...{ class: "mode-tabs" },
}));
const __VLS_22 = __VLS_21({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.inboxStore.filters.mode),
    color: "primary",
    density: "comfortable",
    ...{ class: "mode-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    'onUpdate:modelValue': (__VLS_ctx.onModeChange)
};
__VLS_23.slots.default;
const __VLS_28 = {}.VTab;
/** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    value: "ASSIGNED",
}));
const __VLS_30 = __VLS_29({
    value: "ASSIGNED",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
var __VLS_31;
const __VLS_32 = {}.VTab;
/** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    value: "WATCHING",
}));
const __VLS_34 = __VLS_33({
    value: "WATCHING",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
var __VLS_35;
const __VLS_36 = {}.VTab;
/** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    value: "DUE_SOON",
}));
const __VLS_38 = __VLS_37({
    value: "DUE_SOON",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
var __VLS_39;
const __VLS_40 = {}.VTab;
/** @type {[typeof __VLS_components.VTab, typeof __VLS_components.vTab, typeof __VLS_components.VTab, typeof __VLS_components.vTab, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    value: "OVERDUE",
}));
const __VLS_42 = __VLS_41({
    value: "OVERDUE",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
var __VLS_43;
var __VLS_23;
const __VLS_44 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ class: "filter-card section-card" },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_46 = __VLS_45({
    ...{ class: "filter-card section-card" },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-grid" },
});
const __VLS_48 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.statusModel),
    items: (__VLS_ctx.statusOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "상태",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    multiple: true,
    chips: true,
    clearable: true,
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.statusModel),
    items: (__VLS_ctx.statusOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "상태",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    multiple: true,
    chips: true,
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.projectModel),
    items: (__VLS_ctx.projectOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "프로젝트",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    clearable: true,
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.projectModel),
    items: (__VLS_ctx.projectOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "프로젝트",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keywordModel),
    label: "키워드",
    placeholder: "제목/설명 검색",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    prependInnerIcon: "mdi-magnify",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keywordModel),
    label: "키워드",
    placeholder: "제목/설명 검색",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    prependInnerIcon: "mdi-magnify",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onKeyup: (__VLS_ctx.applyFilters)
};
var __VLS_59;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-actions" },
});
const __VLS_64 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.inboxStore.selectedSavedViewId),
    items: (__VLS_ctx.savedViewOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "Saved View",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    clearable: true,
    loading: (__VLS_ctx.inboxStore.loadingSavedViews),
}));
const __VLS_66 = __VLS_65({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.inboxStore.selectedSavedViewId),
    items: (__VLS_ctx.savedViewOptions),
    itemTitle: "title",
    itemValue: "value",
    label: "Saved View",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
    clearable: true,
    loading: (__VLS_ctx.inboxStore.loadingSavedViews),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    'onUpdate:modelValue': (__VLS_ctx.onSavedViewChange)
};
var __VLS_67;
const __VLS_72 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (!__VLS_ctx.inboxStore.selectedSavedViewId),
}));
const __VLS_74 = __VLS_73({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (!__VLS_ctx.inboxStore.selectedSavedViewId),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onClick: (__VLS_ctx.deleteSelectedSavedView)
};
__VLS_75.slots.default;
var __VLS_75;
const __VLS_80 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onClick': {} },
    color: "primary",
}));
const __VLS_82 = __VLS_81({
    ...{ 'onClick': {} },
    color: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onClick: (__VLS_ctx.applyFilters)
};
__VLS_83.slots.default;
var __VLS_83;
if (__VLS_ctx.inboxStore.savedViewError) {
    const __VLS_88 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        type: "warning",
        variant: "tonal",
        ...{ class: "mt-3" },
    }));
    const __VLS_90 = __VLS_89({
        type: "warning",
        variant: "tonal",
        ...{ class: "mt-3" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    (__VLS_ctx.inboxStore.savedViewError);
    var __VLS_91;
}
var __VLS_47;
if (__VLS_ctx.inboxStore.taskError) {
    const __VLS_92 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        type: "error",
        variant: "tonal",
    }));
    const __VLS_94 = __VLS_93({
        type: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    (__VLS_ctx.inboxStore.taskError);
    var __VLS_95;
}
const __VLS_96 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    ...{ class: "section-card" },
    rounded: "lg",
    elevation: "0",
}));
const __VLS_98 = __VLS_97({
    ...{ class: "section-card" },
    rounded: "lg",
    elevation: "0",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
if (__VLS_ctx.inboxStore.loadingTasks) {
    const __VLS_100 = {}.VSkeletonLoader;
    /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        type: "list-item-three-line@4",
        ...{ class: "pa-4" },
    }));
    const __VLS_102 = __VLS_101({
        type: "list-item-three-line@4",
        ...{ class: "pa-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
}
else if (__VLS_ctx.inboxStore.tasks.length === 0) {
    /** @type {[typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        title: "표시할 태스크가 없습니다",
        description: "필터를 조정하거나 다른 모드를 확인해보세요.",
        icon: "mdi-inbox-outline",
        ...{ class: "py-8" },
    }));
    const __VLS_105 = __VLS_104({
        title: "표시할 태스크가 없습니다",
        description: "필터를 조정하거나 다른 모드를 확인해보세요.",
        icon: "mdi-inbox-outline",
        ...{ class: "py-8" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
}
else {
    const __VLS_107 = {}.VList;
    /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
    // @ts-ignore
    const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
        lines: "two",
    }));
    const __VLS_109 = __VLS_108({
        lines: "two",
    }, ...__VLS_functionalComponentArgsRest(__VLS_108));
    __VLS_110.slots.default;
    for (const [task] of __VLS_getVForSourceType((__VLS_ctx.inboxStore.tasks))) {
        const __VLS_111 = {}.VListItem;
        /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
        // @ts-ignore
        const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
            ...{ 'onClick': {} },
            key: (task.id),
            ...{ class: "task-row" },
        }));
        const __VLS_113 = __VLS_112({
            ...{ 'onClick': {} },
            key: (task.id),
            ...{ class: "task-row" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_112));
        let __VLS_115;
        let __VLS_116;
        let __VLS_117;
        const __VLS_118 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.inboxStore.loadingTasks))
                    return;
                if (!!(__VLS_ctx.inboxStore.tasks.length === 0))
                    return;
                __VLS_ctx.openTask(task.id);
            }
        };
        __VLS_114.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_114.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "task-title-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "task-title" },
            });
            (task.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "task-meta" },
            });
            const __VLS_119 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
                size: "small",
                color: (__VLS_ctx.priorityColor(task.priority)),
                variant: "tonal",
            }));
            const __VLS_121 = __VLS_120({
                size: "small",
                color: (__VLS_ctx.priorityColor(task.priority)),
                variant: "tonal",
            }, ...__VLS_functionalComponentArgsRest(__VLS_120));
            __VLS_122.slots.default;
            (task.priority);
            var __VLS_122;
            const __VLS_123 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
                size: "small",
                variant: "outlined",
            }));
            const __VLS_125 = __VLS_124({
                size: "small",
                variant: "outlined",
            }, ...__VLS_functionalComponentArgsRest(__VLS_124));
            __VLS_126.slots.default;
            (task.status);
            var __VLS_126;
            const __VLS_127 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
                size: "small",
                prependIcon: "mdi-calendar-month-outline",
                variant: "tonal",
            }));
            const __VLS_129 = __VLS_128({
                size: "small",
                prependIcon: "mdi-calendar-month-outline",
                variant: "tonal",
            }, ...__VLS_functionalComponentArgsRest(__VLS_128));
            __VLS_130.slots.default;
            (task.dueDate || '마감 없음');
            var __VLS_130;
            const __VLS_131 = {}.VBtn;
            /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
            // @ts-ignore
            const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
                ...{ 'onClick': {} },
                size: "small",
                variant: "text",
                prependIcon: (__VLS_ctx.inboxStore.isWatched(task.id) ? 'mdi-eye' : 'mdi-eye-outline'),
            }));
            const __VLS_133 = __VLS_132({
                ...{ 'onClick': {} },
                size: "small",
                variant: "text",
                prependIcon: (__VLS_ctx.inboxStore.isWatched(task.id) ? 'mdi-eye' : 'mdi-eye-outline'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_132));
            let __VLS_135;
            let __VLS_136;
            let __VLS_137;
            const __VLS_138 = {
                onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.inboxStore.loadingTasks))
                        return;
                    if (!!(__VLS_ctx.inboxStore.tasks.length === 0))
                        return;
                    __VLS_ctx.toggleWatch(task.id);
                }
            };
            __VLS_134.slots.default;
            var __VLS_134;
        }
        {
            const { subtitle: __VLS_thisSlot } = __VLS_114.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "task-description" },
            });
            (task.description || '설명 없음');
        }
        var __VLS_114;
    }
    var __VLS_110;
}
var __VLS_99;
if (__VLS_ctx.inboxStore.totalPages > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: "pager" },
    });
    const __VLS_139 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.inboxStore.page <= 0),
    }));
    const __VLS_141 = __VLS_140({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.inboxStore.page <= 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_140));
    let __VLS_143;
    let __VLS_144;
    let __VLS_145;
    const __VLS_146 = {
        onClick: (__VLS_ctx.onPrevPage)
    };
    __VLS_142.slots.default;
    var __VLS_142;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.inboxStore.page + 1);
    (__VLS_ctx.inboxStore.totalPages);
    const __VLS_147 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.inboxStore.page >= __VLS_ctx.inboxStore.totalPages - 1),
    }));
    const __VLS_149 = __VLS_148({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.inboxStore.page >= __VLS_ctx.inboxStore.totalPages - 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    let __VLS_151;
    let __VLS_152;
    let __VLS_153;
    const __VLS_154 = {
        onClick: (__VLS_ctx.onNextPage)
    };
    __VLS_150.slots.default;
    var __VLS_150;
}
/** @type {[typeof TaskDetailModal, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(TaskDetailModal, new TaskDetailModal({
    ...{ 'onClose': {} },
    ...{ 'onError': {} },
    ...{ 'onUpdated': {} },
    open: (__VLS_ctx.taskModalOpen),
    task: (__VLS_ctx.selectedTask),
}));
const __VLS_156 = __VLS_155({
    ...{ 'onClose': {} },
    ...{ 'onError': {} },
    ...{ 'onUpdated': {} },
    open: (__VLS_ctx.taskModalOpen),
    task: (__VLS_ctx.selectedTask),
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
let __VLS_158;
let __VLS_159;
let __VLS_160;
const __VLS_161 = {
    onClose: (...[$event]) => {
        __VLS_ctx.taskModalOpen = false;
    }
};
const __VLS_162 = {
    onError: (...[$event]) => {
        __VLS_ctx.showSnackbar($event, 'error');
    }
};
const __VLS_163 = {
    onUpdated: (__VLS_ctx.onTaskUpdated)
};
var __VLS_157;
const __VLS_164 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.saveDialogOpen),
    maxWidth: "460",
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.saveDialogOpen),
    maxWidth: "460",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({}));
const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    ...{ class: "pt-5 px-5" },
}));
const __VLS_174 = __VLS_173({
    ...{ class: "pt-5 px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
var __VLS_175;
const __VLS_176 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    ...{ class: "px-5" },
}));
const __VLS_178 = __VLS_177({
    ...{ class: "px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.saveViewName),
    label: "뷰 이름",
    variant: "outlined",
    density: "comfortable",
    errorMessages: (__VLS_ctx.saveDialogError ? [__VLS_ctx.saveDialogError] : []),
}));
const __VLS_182 = __VLS_181({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.saveViewName),
    label: "뷰 이름",
    variant: "outlined",
    density: "comfortable",
    errorMessages: (__VLS_ctx.saveDialogError ? [__VLS_ctx.saveDialogError] : []),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
let __VLS_184;
let __VLS_185;
let __VLS_186;
const __VLS_187 = {
    onKeyup: (__VLS_ctx.submitSaveView)
};
var __VLS_183;
var __VLS_179;
const __VLS_188 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_190 = __VLS_189({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
const __VLS_196 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.savingView),
}));
const __VLS_198 = __VLS_197({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.savingView),
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
let __VLS_200;
let __VLS_201;
let __VLS_202;
const __VLS_203 = {
    onClick: (__VLS_ctx.closeSaveDialog)
};
__VLS_199.slots.default;
var __VLS_199;
const __VLS_204 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.savingView),
    disabled: (__VLS_ctx.savingView),
}));
const __VLS_206 = __VLS_205({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.savingView),
    disabled: (__VLS_ctx.savingView),
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
let __VLS_208;
let __VLS_209;
let __VLS_210;
const __VLS_211 = {
    onClick: (__VLS_ctx.submitSaveView)
};
__VLS_207.slots.default;
var __VLS_207;
var __VLS_191;
var __VLS_171;
var __VLS_167;
const __VLS_212 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    location: "bottom right",
    timeout: "2400",
}));
const __VLS_214 = __VLS_213({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    location: "bottom right",
    timeout: "2400",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
(__VLS_ctx.snackbar.message);
var __VLS_215;
/** @type {__VLS_StyleScopedClasses['inbox-view']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['inbox-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['task-row']} */ ;
/** @type {__VLS_StyleScopedClasses['task-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['task-title']} */ ;
/** @type {__VLS_StyleScopedClasses['task-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['task-description']} */ ;
/** @type {__VLS_StyleScopedClasses['pager']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            EmptyState: EmptyState,
            TaskDetailModal: TaskDetailModal,
            inboxStore: inboxStore,
            statusModel: statusModel,
            projectModel: projectModel,
            keywordModel: keywordModel,
            projectOptions: projectOptions,
            taskModalOpen: taskModalOpen,
            selectedTask: selectedTask,
            saveDialogOpen: saveDialogOpen,
            saveViewName: saveViewName,
            saveDialogError: saveDialogError,
            savingView: savingView,
            snackbar: snackbar,
            statusOptions: statusOptions,
            savedViewOptions: savedViewOptions,
            priorityColor: priorityColor,
            showSnackbar: showSnackbar,
            reloadAll: reloadAll,
            onModeChange: onModeChange,
            applyFilters: applyFilters,
            onSavedViewChange: onSavedViewChange,
            openSaveDialog: openSaveDialog,
            closeSaveDialog: closeSaveDialog,
            submitSaveView: submitSaveView,
            deleteSelectedSavedView: deleteSelectedSavedView,
            openTask: openTask,
            toggleWatch: toggleWatch,
            onTaskUpdated: onTaskUpdated,
            onPrevPage: onPrevPage,
            onNextPage: onNextPage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
