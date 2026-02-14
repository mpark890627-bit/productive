import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { VueDraggable } from 'vue-draggable-plus';
import { extractErrorMessage } from '../../api/apiClient';
import { getProjectById } from '../../api/projects';
import { createTaskInProject, getProjectTasks, getTaskById, patchTask } from '../../api/tasks';
import EmptyState from '../../components/common/EmptyState.vue';
import KanbanTaskCard from '../../components/board/KanbanTaskCard.vue';
import TaskCreateModal from '../../components/board/TaskCreateModal.vue';
import TaskDetailModal from '../../components/board/TaskDetailModal.vue';
import { taskStatusColors, taskStatusLabels } from '../../utils/taskVisuals';
const route = useRoute();
const projectId = route.params.id;
const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
const statusLabels = taskStatusLabels;
const statusColors = taskStatusColors;
const columns = reactive({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
});
const loading = ref(false);
const errorMessage = ref('');
const projectName = ref('');
const taskModalOpen = ref(false);
const selectedTask = ref(null);
const taskCreateModalOpen = ref(false);
const taskCreateSubmitting = ref(false);
const taskCreateErrorMessage = ref('');
const dragSnapshot = ref(null);
const statusUpdatePending = ref(false);
const isDragging = ref(false);
const dragOverStatus = ref(null);
const processedDragTaskIds = ref(new Set());
const toast = reactive({
    show: false,
    message: '',
    type: 'success',
});
const cloneColumns = (source) => ({
    TODO: source.TODO.map((task) => ({ ...task, tags: [...task.tags] })),
    IN_PROGRESS: source.IN_PROGRESS.map((task) => ({ ...task, tags: [...task.tags] })),
    DONE: source.DONE.map((task) => ({ ...task, tags: [...task.tags] })),
});
const setColumnsFromTasks = (tasks) => {
    const normalized = tasks.map((task) => ({
        ...task,
        title: task.title ?? '',
        description: task.description ?? null,
        priority: task.priority ?? 'MEDIUM',
        tags: task.tags ?? [],
    }));
    columns.TODO = normalized.filter((task) => task.status === 'TODO');
    columns.IN_PROGRESS = normalized.filter((task) => task.status === 'IN_PROGRESS');
    columns.DONE = normalized.filter((task) => task.status === 'DONE');
};
const loadBoard = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        const [project, tasksPage] = await Promise.all([
            getProjectById(projectId),
            getProjectTasks(projectId, { page: 0, size: 200, sort: 'updatedAt,desc' }),
        ]);
        projectName.value = project.name;
        setColumnsFromTasks(tasksPage.content);
    }
    catch {
        errorMessage.value = '보드 데이터를 불러오지 못했습니다.';
    }
    finally {
        loading.value = false;
    }
};
const showToast = (message, type = 'success') => {
    toast.show = false;
    toast.message = message;
    toast.type = type;
    setTimeout(() => {
        toast.show = true;
    }, 10);
};
const onDragStart = () => {
    isDragging.value = true;
    dragSnapshot.value = cloneColumns(columns);
    processedDragTaskIds.value = new Set();
};
const onDragEnd = () => {
    isDragging.value = false;
    dragOverStatus.value = null;
    if (!statusUpdatePending.value) {
        dragSnapshot.value = null;
    }
};
const onDragEnter = (status) => {
    dragOverStatus.value = status;
};
const clearDragOver = () => {
    if (!isDragging.value) {
        dragOverStatus.value = null;
    }
};
const rollbackDragSnapshot = () => {
    if (!dragSnapshot.value) {
        return;
    }
    const restored = cloneColumns(dragSnapshot.value);
    columns.TODO = restored.TODO;
    columns.IN_PROGRESS = restored.IN_PROGRESS;
    columns.DONE = restored.DONE;
};
const commitStatusChange = async (taskId, targetStatus) => {
    if (processedDragTaskIds.value.has(taskId)) {
        return;
    }
    processedDragTaskIds.value.add(taskId);
    const movedTask = columns[targetStatus].find((task) => task.id === taskId);
    if (!movedTask) {
        return;
    }
    const previousStatus = dragSnapshot.value
        ? (statuses.find((status) => dragSnapshot.value?.[status].some((task) => task.id === taskId)) ?? movedTask.status)
        : movedTask.status;
    movedTask.status = targetStatus;
    if (selectedTask.value?.id === taskId) {
        selectedTask.value.status = targetStatus;
    }
    try {
        statusUpdatePending.value = true;
        await patchTask(taskId, { status: targetStatus });
        showToast('상태가 변경되었습니다.', 'success');
    }
    catch {
        rollbackDragSnapshot();
        if (selectedTask.value?.id === taskId) {
            selectedTask.value.status = previousStatus;
        }
        showToast('상태 변경에 실패하여 롤백했습니다.', 'error');
    }
    finally {
        statusUpdatePending.value = false;
    }
};
const onColumnChange = async (targetStatus, event) => {
    if (!event?.added) {
        return;
    }
    const movedTask = event.added.element;
    if (!movedTask || movedTask.id == null) {
        return;
    }
    await commitStatusChange(movedTask.id, targetStatus);
};
const onColumnAdd = async (targetStatus, event) => {
    const domTaskId = event?.item?.dataset?.taskId;
    if (typeof domTaskId !== 'string' || domTaskId.length === 0) {
        return;
    }
    await commitStatusChange(domTaskId, targetStatus);
};
const onCardStatusChange = async (task, targetStatus) => {
    const previousStatus = task.status;
    if (previousStatus === targetStatus) {
        return;
    }
    const snapshot = cloneColumns(columns);
    const sourceIndex = columns[previousStatus].findIndex((item) => item.id === task.id);
    if (sourceIndex >= 0) {
        const [moved] = columns[previousStatus].splice(sourceIndex, 1);
        moved.status = targetStatus;
        columns[targetStatus].unshift(moved);
    }
    if (selectedTask.value?.id === task.id) {
        selectedTask.value.status = targetStatus;
    }
    try {
        await patchTask(task.id, { status: targetStatus });
        showToast('상태가 변경되었습니다.', 'success');
    }
    catch {
        const restored = cloneColumns(snapshot);
        columns.TODO = restored.TODO;
        columns.IN_PROGRESS = restored.IN_PROGRESS;
        columns.DONE = restored.DONE;
        if (selectedTask.value?.id === task.id) {
            selectedTask.value.status = previousStatus;
        }
        showToast('상태 변경에 실패했습니다.', 'error');
    }
};
const openTaskDetail = async (task) => {
    try {
        const detail = await getTaskById(task.id);
        selectedTask.value = detail;
        taskModalOpen.value = true;
    }
    catch (error) {
        showToast(extractErrorMessage(error, '태스크 상세를 불러오지 못했습니다.'), 'error');
    }
};
const onTaskUpdated = (updated) => {
    selectedTask.value = updated;
    const applyUpdated = (status) => {
        const index = columns[status].findIndex((task) => task.id === updated.id);
        if (index === -1) {
            return false;
        }
        if (status !== updated.status) {
            const [moved] = columns[status].splice(index, 1);
            columns[updated.status].unshift({ ...moved, ...updated });
        }
        else {
            columns[status][index] = { ...columns[status][index], ...updated };
        }
        return true;
    };
    for (const status of statuses) {
        if (applyUpdated(status)) {
            break;
        }
    }
    showToast('태스크가 업데이트되었습니다.', 'success');
};
const createTask = async (payload) => {
    if (!payload.title.trim()) {
        taskCreateErrorMessage.value = '제목은 필수입니다.';
        return;
    }
    try {
        taskCreateSubmitting.value = true;
        taskCreateErrorMessage.value = '';
        await createTaskInProject(projectId, {
            title: payload.title.trim(),
            description: payload.description,
            status: payload.status,
            priority: payload.priority,
            dueDate: payload.dueDate,
            assigneeUserId: null,
        });
        taskCreateModalOpen.value = false;
        showToast('태스크가 생성되었습니다.', 'success');
        await loadBoard();
    }
    catch (error) {
        taskCreateErrorMessage.value = extractErrorMessage(error, '태스크 생성에 실패했습니다.');
    }
    finally {
        taskCreateSubmitting.value = false;
    }
};
void loadBoard();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['board-header']} */ ;
/** @type {__VLS_StyleScopedClasses['board-header']} */ ;
/** @type {__VLS_StyleScopedClasses['column-head']} */ ;
/** @type {__VLS_StyleScopedClasses['column-body']} */ ;
/** @type {__VLS_StyleScopedClasses['kanban-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['board-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "board-view" },
});
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "board-header" },
    rounded: "lg",
    elevation: "1",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "board-header" },
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.projectName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_4 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-plus",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-plus",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.taskCreateModalOpen = true;
    }
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.loadBoard)
};
__VLS_15.slots.default;
var __VLS_15;
const __VLS_20 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/risks`),
}));
const __VLS_22 = __VLS_21({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/risks`),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
const __VLS_24 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    variant: "text",
    to: (`/app/projects/${__VLS_ctx.projectId}`),
}));
const __VLS_26 = __VLS_25({
    variant: "text",
    to: (`/app/projects/${__VLS_ctx.projectId}`),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
var __VLS_3;
if (__VLS_ctx.errorMessage) {
    const __VLS_28 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        type: "error",
        variant: "tonal",
    }));
    const __VLS_30 = __VLS_29({
        type: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_31;
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "kanban-grid" },
    });
    for (const [status] of __VLS_getVForSourceType((__VLS_ctx.statuses))) {
        const __VLS_32 = {}.VCard;
        /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            key: (status),
            ...{ class: "column" },
            rounded: "lg",
            elevation: "1",
        }));
        const __VLS_34 = __VLS_33({
            key: (status),
            ...{ class: "column" },
            rounded: "lg",
            elevation: "1",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        const __VLS_36 = {}.VSkeletonLoader;
        /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            type: "heading, article@3",
        }));
        const __VLS_38 = __VLS_37({
            type: "heading, article@3",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        var __VLS_35;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "kanban-grid" },
    });
    for (const [status] of __VLS_getVForSourceType((__VLS_ctx.statuses))) {
        const __VLS_40 = {}.VCard;
        /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            key: (status),
            ...{ class: "column" },
            rounded: "lg",
            elevation: "1",
        }));
        const __VLS_42 = __VLS_41({
            key: (status),
            ...{ class: "column" },
            rounded: "lg",
            elevation: "1",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
            ...{ class: "column-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (__VLS_ctx.statusLabels[status]);
        const __VLS_44 = {}.VChip;
        /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            color: (__VLS_ctx.statusColors[status]),
            variant: "tonal",
            size: "small",
        }));
        const __VLS_46 = __VLS_45({
            color: (__VLS_ctx.statusColors[status]),
            variant: "tonal",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        __VLS_47.slots.default;
        (__VLS_ctx.columns[status].length);
        var __VLS_47;
        const __VLS_48 = {}.VueDraggable;
        /** @type {[typeof __VLS_components.VueDraggable, typeof __VLS_components.VueDraggable, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onStart': {} },
            ...{ 'onChange': {} },
            ...{ 'onAdd': {} },
            ...{ 'onEnd': {} },
            ...{ 'onRemove': {} },
            ...{ 'onEnter': {} },
            modelValue: (__VLS_ctx.columns[status]),
            group: "tasks",
            ...{ class: "column-body" },
            ...{ class: ({ 'drop-active': __VLS_ctx.dragOverStatus === status && __VLS_ctx.isDragging }) },
            animation: (150),
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onStart': {} },
            ...{ 'onChange': {} },
            ...{ 'onAdd': {} },
            ...{ 'onEnd': {} },
            ...{ 'onRemove': {} },
            ...{ 'onEnter': {} },
            modelValue: (__VLS_ctx.columns[status]),
            group: "tasks",
            ...{ class: "column-body" },
            ...{ class: ({ 'drop-active': __VLS_ctx.dragOverStatus === status && __VLS_ctx.isDragging }) },
            animation: (150),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onStart: (__VLS_ctx.onDragStart)
        };
        const __VLS_56 = {
            onChange: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                __VLS_ctx.onColumnChange(status, $event);
            }
        };
        const __VLS_57 = {
            onAdd: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                __VLS_ctx.onColumnAdd(status, $event);
            }
        };
        const __VLS_58 = {
            onEnd: (__VLS_ctx.onDragEnd)
        };
        const __VLS_59 = {
            onRemove: (__VLS_ctx.clearDragOver)
        };
        const __VLS_60 = {
            onEnter: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                __VLS_ctx.onDragEnter(status);
            }
        };
        __VLS_51.slots.default;
        for (const [element] of __VLS_getVForSourceType((__VLS_ctx.columns[status]))) {
            /** @type {[typeof KanbanTaskCard, ]} */ ;
            // @ts-ignore
            const __VLS_61 = __VLS_asFunctionalComponent(KanbanTaskCard, new KanbanTaskCard({
                ...{ 'onOpen': {} },
                ...{ 'onStatusChange': {} },
                key: (element.id),
                dataTaskId: (element.id),
                task: (element),
            }));
            const __VLS_62 = __VLS_61({
                ...{ 'onOpen': {} },
                ...{ 'onStatusChange': {} },
                key: (element.id),
                dataTaskId: (element.id),
                task: (element),
            }, ...__VLS_functionalComponentArgsRest(__VLS_61));
            let __VLS_64;
            let __VLS_65;
            let __VLS_66;
            const __VLS_67 = {
                onOpen: (__VLS_ctx.openTaskDetail)
            };
            const __VLS_68 = {
                onStatusChange: (__VLS_ctx.onCardStatusChange)
            };
            var __VLS_63;
        }
        if (__VLS_ctx.columns[status].length === 0) {
            /** @type {[typeof EmptyState, ]} */ ;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
                title: "태스크 없음",
                description: "새 태스크를 추가하거나 다른 컬럼에서 이동하세요.",
                icon: "mdi-format-list-bulleted-square",
            }));
            const __VLS_70 = __VLS_69({
                title: "태스크 없음",
                description: "새 태스크를 추가하거나 다른 컬럼에서 이동하세요.",
                icon: "mdi-format-list-bulleted-square",
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        }
        var __VLS_51;
        var __VLS_43;
    }
}
/** @type {[typeof TaskDetailModal, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(TaskDetailModal, new TaskDetailModal({
    ...{ 'onClose': {} },
    ...{ 'onError': {} },
    ...{ 'onUpdated': {} },
    open: (__VLS_ctx.taskModalOpen),
    task: (__VLS_ctx.selectedTask),
}));
const __VLS_73 = __VLS_72({
    ...{ 'onClose': {} },
    ...{ 'onError': {} },
    ...{ 'onUpdated': {} },
    open: (__VLS_ctx.taskModalOpen),
    task: (__VLS_ctx.selectedTask),
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_75;
let __VLS_76;
let __VLS_77;
const __VLS_78 = {
    onClose: (...[$event]) => {
        __VLS_ctx.taskModalOpen = false;
    }
};
const __VLS_79 = {
    onError: (...[$event]) => {
        __VLS_ctx.showToast($event, 'error');
    }
};
const __VLS_80 = {
    onUpdated: (__VLS_ctx.onTaskUpdated)
};
var __VLS_74;
/** @type {[typeof TaskCreateModal, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(TaskCreateModal, new TaskCreateModal({
    ...{ 'onClose': {} },
    ...{ 'onSubmit': {} },
    open: (__VLS_ctx.taskCreateModalOpen),
    submitting: (__VLS_ctx.taskCreateSubmitting),
    errorMessage: (__VLS_ctx.taskCreateErrorMessage),
}));
const __VLS_82 = __VLS_81({
    ...{ 'onClose': {} },
    ...{ 'onSubmit': {} },
    open: (__VLS_ctx.taskCreateModalOpen),
    submitting: (__VLS_ctx.taskCreateSubmitting),
    errorMessage: (__VLS_ctx.taskCreateErrorMessage),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onClose: (...[$event]) => {
        __VLS_ctx.taskCreateModalOpen = false;
    }
};
const __VLS_88 = {
    onSubmit: (__VLS_ctx.createTask)
};
var __VLS_83;
const __VLS_89 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
    modelValue: (__VLS_ctx.toast.show),
    color: (__VLS_ctx.toast.type === 'success' ? 'success' : 'error'),
    location: "bottom right",
    timeout: "2400",
}));
const __VLS_91 = __VLS_90({
    modelValue: (__VLS_ctx.toast.show),
    color: (__VLS_ctx.toast.type === 'success' ? 'success' : 'error'),
    location: "bottom right",
    timeout: "2400",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
__VLS_92.slots.default;
(__VLS_ctx.toast.message);
var __VLS_92;
/** @type {__VLS_StyleScopedClasses['board-view']} */ ;
/** @type {__VLS_StyleScopedClasses['board-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['kanban-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['column']} */ ;
/** @type {__VLS_StyleScopedClasses['kanban-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['column']} */ ;
/** @type {__VLS_StyleScopedClasses['column-head']} */ ;
/** @type {__VLS_StyleScopedClasses['column-body']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            VueDraggable: VueDraggable,
            EmptyState: EmptyState,
            KanbanTaskCard: KanbanTaskCard,
            TaskCreateModal: TaskCreateModal,
            TaskDetailModal: TaskDetailModal,
            projectId: projectId,
            statuses: statuses,
            statusLabels: statusLabels,
            statusColors: statusColors,
            columns: columns,
            loading: loading,
            errorMessage: errorMessage,
            projectName: projectName,
            taskModalOpen: taskModalOpen,
            selectedTask: selectedTask,
            taskCreateModalOpen: taskCreateModalOpen,
            taskCreateSubmitting: taskCreateSubmitting,
            taskCreateErrorMessage: taskCreateErrorMessage,
            isDragging: isDragging,
            dragOverStatus: dragOverStatus,
            toast: toast,
            loadBoard: loadBoard,
            showToast: showToast,
            onDragStart: onDragStart,
            onDragEnd: onDragEnd,
            onDragEnter: onDragEnter,
            clearDragOver: clearDragOver,
            onColumnChange: onColumnChange,
            onColumnAdd: onColumnAdd,
            onCardStatusChange: onCardStatusChange,
            openTaskDetail: openTaskDetail,
            onTaskUpdated: onTaskUpdated,
            createTask: createTask,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
