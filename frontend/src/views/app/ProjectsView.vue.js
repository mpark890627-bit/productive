import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ProjectList from '../../components/projects/ProjectList.vue';
import ProjectFormModal from '../../components/projects/ProjectFormModal.vue';
import SkeletonList from '../../components/common/SkeletonList.vue';
import EmptyState from '../../components/common/EmptyState.vue';
import ConfirmDialog from '../../components/common/ConfirmDialog.vue';
import AppToast from '../../components/common/AppToast.vue';
import { createProject, deleteProject, getProjects, updateProject } from '../../api/projects';
import { useToast } from '../../composables/useToast';
const router = useRouter();
const projects = ref([]);
const page = ref(0);
const size = ref(10);
const totalPages = ref(0);
const loading = ref(false);
const errorMessage = ref('');
const keyword = ref('');
const modalOpen = ref(false);
const modalMode = ref('create');
const modalSubmitting = ref(false);
const modalErrorMessage = ref('');
const selectedProject = ref(null);
const deleteDialogOpen = ref(false);
const deleteSubmitting = ref(false);
const projectToDelete = ref(null);
const { toast, openToast } = useToast();
const filteredProjects = computed(() => {
    const q = keyword.value.trim().toLowerCase();
    if (!q) {
        return projects.value;
    }
    return projects.value.filter((project) => {
        const name = project.name.toLowerCase();
        const description = (project.description ?? '').toLowerCase();
        return name.includes(q) || description.includes(q);
    });
});
const loadProjects = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        const response = await getProjects({ page: page.value, size: size.value, sort: 'createdAt,desc' });
        projects.value = response.content;
        totalPages.value = response.totalPages;
    }
    catch {
        errorMessage.value = '프로젝트 목록을 불러오지 못했습니다.';
    }
    finally {
        loading.value = false;
    }
};
const goPrev = async () => {
    if (page.value > 0) {
        page.value -= 1;
        await loadProjects();
    }
};
const goNext = async () => {
    if (page.value < totalPages.value - 1) {
        page.value += 1;
        await loadProjects();
    }
};
const openCreateModal = () => {
    modalMode.value = 'create';
    selectedProject.value = null;
    modalErrorMessage.value = '';
    modalOpen.value = true;
};
const handleOpen = (project) => {
    router.push(`/app/projects/${project.id}`);
};
const handleEdit = (project) => {
    modalMode.value = 'edit';
    selectedProject.value = project;
    modalErrorMessage.value = '';
    modalOpen.value = true;
};
const openDeleteDialog = (project) => {
    projectToDelete.value = project;
    deleteDialogOpen.value = true;
};
const closeDeleteDialog = () => {
    deleteDialogOpen.value = false;
    deleteSubmitting.value = false;
    projectToDelete.value = null;
};
const confirmDelete = async () => {
    if (!projectToDelete.value) {
        return;
    }
    try {
        deleteSubmitting.value = true;
        await deleteProject(projectToDelete.value.id);
        if (projects.value.length === 1 && page.value > 0) {
            page.value -= 1;
        }
        await loadProjects();
        closeDeleteDialog();
        openToast('프로젝트가 삭제되었습니다.', 'success');
    }
    catch {
        openToast('프로젝트 삭제에 실패했습니다.', 'error');
    }
    finally {
        deleteSubmitting.value = false;
    }
};
const closeModal = () => {
    modalOpen.value = false;
    modalSubmitting.value = false;
    modalErrorMessage.value = '';
};
const handleModalSubmit = async (payload) => {
    if (!payload.name) {
        modalErrorMessage.value = '프로젝트 이름은 필수입니다.';
        return;
    }
    try {
        modalSubmitting.value = true;
        modalErrorMessage.value = '';
        if (modalMode.value === 'create') {
            await createProject({ name: payload.name, description: payload.description });
            page.value = 0;
            openToast('프로젝트가 생성되었습니다.', 'success');
        }
        else if (selectedProject.value) {
            await updateProject(selectedProject.value.id, {
                name: payload.name,
                description: payload.description,
            });
            openToast('프로젝트가 수정되었습니다.', 'success');
        }
        closeModal();
        await loadProjects();
    }
    catch {
        modalErrorMessage.value = modalMode.value === 'create' ? '프로젝트 생성 실패' : '프로젝트 수정 실패';
        openToast(modalErrorMessage.value, 'error');
    }
    finally {
        modalSubmitting.value = false;
    }
};
onMounted(loadProjects);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['keyword-field']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "card app-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "projects-header page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
const __VLS_0 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.keyword),
    prependInnerIcon: "mdi-magnify",
    placeholder: "프로젝트 검색 (이름/설명)",
    density: "compact",
    variant: "solo-filled",
    flat: true,
    hideDetails: true,
    ...{ class: "keyword-field" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.keyword),
    prependInnerIcon: "mdi-magnify",
    placeholder: "프로젝트 검색 (이름/설명)",
    density: "compact",
    variant: "solo-filled",
    flat: true,
    hideDetails: true,
    ...{ class: "keyword-field" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_4 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    variant: "outlined",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.loadProjects)
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    color: "primary",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    color: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.openCreateModal)
};
__VLS_15.slots.default;
var __VLS_15;
if (__VLS_ctx.loading) {
    /** @type {[typeof SkeletonList, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(SkeletonList, new SkeletonList({
        type: "table",
    }));
    const __VLS_21 = __VLS_20({
        type: "table",
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
}
else if (__VLS_ctx.errorMessage) {
    const __VLS_23 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-4" },
    }));
    const __VLS_25 = __VLS_24({
        type: "error",
        variant: "tonal",
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    __VLS_26.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_26;
}
else if (__VLS_ctx.projects.length === 0) {
    /** @type {[typeof EmptyState, typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        title: "프로젝트가 없습니다",
        description: "첫 프로젝트를 생성해서 보드를 시작하세요.",
        icon: "mdi-folder-outline",
        ...{ class: "mt-4" },
    }));
    const __VLS_28 = __VLS_27({
        title: "프로젝트가 없습니다",
        description: "첫 프로젝트를 생성해서 보드를 시작하세요.",
        icon: "mdi-folder-outline",
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    __VLS_29.slots.default;
    const __VLS_30 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
        ...{ 'onClick': {} },
        color: "primary",
        ...{ class: "mt-4" },
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClick': {} },
        color: "primary",
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_34;
    let __VLS_35;
    let __VLS_36;
    const __VLS_37 = {
        onClick: (__VLS_ctx.openCreateModal)
    };
    __VLS_33.slots.default;
    var __VLS_33;
    var __VLS_29;
}
else if (__VLS_ctx.filteredProjects.length > 0) {
    /** @type {[typeof ProjectList, ]} */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(ProjectList, new ProjectList({
        ...{ 'onOpen': {} },
        ...{ 'onEdit': {} },
        ...{ 'onDelete': {} },
        projects: (__VLS_ctx.filteredProjects),
    }));
    const __VLS_39 = __VLS_38({
        ...{ 'onOpen': {} },
        ...{ 'onEdit': {} },
        ...{ 'onDelete': {} },
        projects: (__VLS_ctx.filteredProjects),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_41;
    let __VLS_42;
    let __VLS_43;
    const __VLS_44 = {
        onOpen: (__VLS_ctx.handleOpen)
    };
    const __VLS_45 = {
        onEdit: (__VLS_ctx.handleEdit)
    };
    const __VLS_46 = {
        onDelete: (__VLS_ctx.openDeleteDialog)
    };
    var __VLS_40;
}
else if (__VLS_ctx.projects.length > 0 && __VLS_ctx.filteredProjects.length === 0) {
    /** @type {[typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_47 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        title: "검색 결과가 없습니다",
        description: "다른 키워드로 다시 검색해보세요.",
        icon: "mdi-magnify-close",
        ...{ class: "mt-4" },
    }));
    const __VLS_48 = __VLS_47({
        title: "검색 결과가 없습니다",
        description: "다른 키워드로 다시 검색해보세요.",
        icon: "mdi-magnify-close",
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_47));
}
if (!__VLS_ctx.loading && !__VLS_ctx.errorMessage && __VLS_ctx.projects.length > 0 && __VLS_ctx.filteredProjects.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: "pager" },
    });
    const __VLS_50 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page <= 0),
    }));
    const __VLS_52 = __VLS_51({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page <= 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_54;
    let __VLS_55;
    let __VLS_56;
    const __VLS_57 = {
        onClick: (__VLS_ctx.goPrev)
    };
    __VLS_53.slots.default;
    var __VLS_53;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.page + 1);
    (__VLS_ctx.totalPages || 1);
    const __VLS_58 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page >= __VLS_ctx.totalPages - 1),
    }));
    const __VLS_60 = __VLS_59({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page >= __VLS_ctx.totalPages - 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    let __VLS_62;
    let __VLS_63;
    let __VLS_64;
    const __VLS_65 = {
        onClick: (__VLS_ctx.goNext)
    };
    __VLS_61.slots.default;
    var __VLS_61;
}
/** @type {[typeof ProjectFormModal, ]} */ ;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent(ProjectFormModal, new ProjectFormModal({
    ...{ 'onClose': {} },
    ...{ 'onSubmit': {} },
    open: (__VLS_ctx.modalOpen),
    mode: (__VLS_ctx.modalMode),
    initialProject: (__VLS_ctx.selectedProject),
    submitting: (__VLS_ctx.modalSubmitting),
    errorMessage: (__VLS_ctx.modalErrorMessage),
}));
const __VLS_67 = __VLS_66({
    ...{ 'onClose': {} },
    ...{ 'onSubmit': {} },
    open: (__VLS_ctx.modalOpen),
    mode: (__VLS_ctx.modalMode),
    initialProject: (__VLS_ctx.selectedProject),
    submitting: (__VLS_ctx.modalSubmitting),
    errorMessage: (__VLS_ctx.modalErrorMessage),
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_69;
let __VLS_70;
let __VLS_71;
const __VLS_72 = {
    onClose: (__VLS_ctx.closeModal)
};
const __VLS_73 = {
    onSubmit: (__VLS_ctx.handleModalSubmit)
};
var __VLS_68;
/** @type {[typeof ConfirmDialog, ]} */ ;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent(ConfirmDialog, new ConfirmDialog({
    ...{ 'onUpdate:open': {} },
    ...{ 'onCancel': {} },
    ...{ 'onConfirm': {} },
    open: (__VLS_ctx.deleteDialogOpen),
    title: "프로젝트 삭제",
    message: (`${__VLS_ctx.projectToDelete?.name ?? ''} 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`),
    confirmText: "삭제",
    confirmColor: "error",
    loading: (__VLS_ctx.deleteSubmitting),
}));
const __VLS_75 = __VLS_74({
    ...{ 'onUpdate:open': {} },
    ...{ 'onCancel': {} },
    ...{ 'onConfirm': {} },
    open: (__VLS_ctx.deleteDialogOpen),
    title: "프로젝트 삭제",
    message: (`${__VLS_ctx.projectToDelete?.name ?? ''} 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`),
    confirmText: "삭제",
    confirmColor: "error",
    loading: (__VLS_ctx.deleteSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
let __VLS_77;
let __VLS_78;
let __VLS_79;
const __VLS_80 = {
    'onUpdate:open': (...[$event]) => {
        __VLS_ctx.deleteDialogOpen = $event;
    }
};
const __VLS_81 = {
    onCancel: (__VLS_ctx.closeDeleteDialog)
};
const __VLS_82 = {
    onConfirm: (__VLS_ctx.confirmDelete)
};
var __VLS_76;
/** @type {[typeof AppToast, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(AppToast, new AppToast({
    show: (__VLS_ctx.toast.show),
    message: (__VLS_ctx.toast.message),
    color: (__VLS_ctx.toast.color),
}));
const __VLS_84 = __VLS_83({
    show: (__VLS_ctx.toast.show),
    message: (__VLS_ctx.toast.message),
    color: (__VLS_ctx.toast.color),
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['app-page']} */ ;
/** @type {__VLS_StyleScopedClasses['projects-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['keyword-field']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pager']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ProjectList: ProjectList,
            ProjectFormModal: ProjectFormModal,
            SkeletonList: SkeletonList,
            EmptyState: EmptyState,
            ConfirmDialog: ConfirmDialog,
            AppToast: AppToast,
            projects: projects,
            page: page,
            totalPages: totalPages,
            loading: loading,
            errorMessage: errorMessage,
            keyword: keyword,
            modalOpen: modalOpen,
            modalMode: modalMode,
            modalSubmitting: modalSubmitting,
            modalErrorMessage: modalErrorMessage,
            selectedProject: selectedProject,
            deleteDialogOpen: deleteDialogOpen,
            deleteSubmitting: deleteSubmitting,
            projectToDelete: projectToDelete,
            toast: toast,
            filteredProjects: filteredProjects,
            loadProjects: loadProjects,
            goPrev: goPrev,
            goNext: goNext,
            openCreateModal: openCreateModal,
            handleOpen: handleOpen,
            handleEdit: handleEdit,
            openDeleteDialog: openDeleteDialog,
            closeDeleteDialog: closeDeleteDialog,
            confirmDelete: confirmDelete,
            closeModal: closeModal,
            handleModalSubmit: handleModalSubmit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
