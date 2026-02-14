import { computed, onMounted, reactive, ref } from 'vue';
import { extractErrorMessage } from '../../api/apiClient';
import { createTaskTemplate, createTaskTemplateItem, deleteTaskTemplate, deleteTaskTemplateItem, getTaskTemplateById, getTaskTemplates, updateTaskTemplate, updateTaskTemplateItem, } from '../../api/taskTemplates';
import EmptyState from '../../components/common/EmptyState.vue';
const templates = ref([]);
const selectedTemplateId = ref(null);
const loading = ref(false);
const loadingDetail = ref(false);
const errorMessage = ref('');
const deletingItemId = ref(null);
const reordering = ref(false);
const page = ref(0);
const size = ref(10);
const totalPages = ref(1);
const templateDialogOpen = ref(false);
const templateDialogMode = ref('create');
const templateSubmitting = ref(false);
const templateFormError = ref('');
const templateForm = reactive({
    name: '',
    description: '',
});
const itemDialogOpen = ref(false);
const itemSubmitting = ref(false);
const itemFormError = ref('');
const itemForm = reactive({
    title: '',
    description: '',
    defaultStatus: 'TODO',
    defaultPriority: 'MEDIUM',
    defaultAssignee: 'UNASSIGNED',
    dueOffsetDays: null,
});
const deleteTemplateDialogOpen = ref(false);
const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
});
const statusOptions = ['TODO', 'IN_PROGRESS', 'DONE'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];
const assigneeOptions = ['ME', 'UNASSIGNED'];
const selectedTemplate = computed(() => templates.value.find((template) => template.id === selectedTemplateId.value) ?? null);
const showSnackbar = (message, color = 'success') => {
    snackbar.show = false;
    snackbar.message = message;
    snackbar.color = color;
    setTimeout(() => {
        snackbar.show = true;
    }, 10);
};
const loadTemplates = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        const response = await getTaskTemplates({
            page: page.value,
            size: size.value,
            sort: 'updatedAt,desc',
        });
        templates.value = response.data;
        totalPages.value = response.meta?.totalPages ?? 1;
        if (!selectedTemplateId.value && response.data.length > 0) {
            selectedTemplateId.value = response.data[0].id;
        }
        if (selectedTemplateId.value) {
            await reloadSelectedTemplate();
        }
    }
    catch (error) {
        errorMessage.value = extractErrorMessage(error, '템플릿 목록을 불러오지 못했습니다.');
    }
    finally {
        loading.value = false;
    }
};
const reloadSelectedTemplate = async () => {
    if (!selectedTemplateId.value) {
        return;
    }
    try {
        loadingDetail.value = true;
        const detail = await getTaskTemplateById(selectedTemplateId.value);
        templates.value = templates.value.map((template) => template.id === detail.id ? detail : template);
    }
    finally {
        loadingDetail.value = false;
    }
};
const selectTemplate = async (templateId) => {
    selectedTemplateId.value = templateId;
    await reloadSelectedTemplate();
};
const openCreateTemplateDialog = () => {
    templateDialogMode.value = 'create';
    templateForm.name = '';
    templateForm.description = '';
    templateFormError.value = '';
    templateDialogOpen.value = true;
};
const openEditTemplateDialog = () => {
    if (!selectedTemplate.value) {
        return;
    }
    templateDialogMode.value = 'edit';
    templateForm.name = selectedTemplate.value.name;
    templateForm.description = selectedTemplate.value.description ?? '';
    templateFormError.value = '';
    templateDialogOpen.value = true;
};
const submitTemplateForm = async () => {
    if (!templateForm.name.trim()) {
        templateFormError.value = '템플릿 이름은 필수입니다.';
        return;
    }
    try {
        templateSubmitting.value = true;
        templateFormError.value = '';
        if (templateDialogMode.value === 'create') {
            const created = await createTaskTemplate({
                name: templateForm.name.trim(),
                description: templateForm.description.trim() || undefined,
                items: [],
            });
            selectedTemplateId.value = created.id;
            showSnackbar('템플릿이 생성되었습니다.');
        }
        else if (selectedTemplate.value) {
            await updateTaskTemplate(selectedTemplate.value.id, {
                name: templateForm.name.trim(),
                description: templateForm.description.trim() || '',
            });
            showSnackbar('템플릿이 수정되었습니다.');
        }
        templateDialogOpen.value = false;
        await loadTemplates();
    }
    catch (error) {
        templateFormError.value = extractErrorMessage(error, '템플릿 저장에 실패했습니다.');
    }
    finally {
        templateSubmitting.value = false;
    }
};
const openDeleteTemplateDialog = () => {
    deleteTemplateDialogOpen.value = true;
};
const confirmDeleteTemplate = async () => {
    if (!selectedTemplate.value) {
        return;
    }
    try {
        templateSubmitting.value = true;
        await deleteTaskTemplate(selectedTemplate.value.id);
        deleteTemplateDialogOpen.value = false;
        selectedTemplateId.value = null;
        showSnackbar('템플릿이 삭제되었습니다.');
        await loadTemplates();
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, '템플릿 삭제에 실패했습니다.'), 'error');
    }
    finally {
        templateSubmitting.value = false;
    }
};
const openCreateItemDialog = () => {
    itemForm.title = '';
    itemForm.description = '';
    itemForm.defaultStatus = 'TODO';
    itemForm.defaultPriority = 'MEDIUM';
    itemForm.defaultAssignee = 'UNASSIGNED';
    itemForm.dueOffsetDays = null;
    itemFormError.value = '';
    itemDialogOpen.value = true;
};
const submitItemForm = async () => {
    if (!selectedTemplate.value) {
        return;
    }
    if (!itemForm.title.trim()) {
        itemFormError.value = '아이템 제목은 필수입니다.';
        return;
    }
    try {
        itemSubmitting.value = true;
        await createTaskTemplateItem(selectedTemplate.value.id, {
            title: itemForm.title.trim(),
            description: itemForm.description.trim() || undefined,
            defaultStatus: itemForm.defaultStatus,
            defaultPriority: itemForm.defaultPriority,
            defaultAssignee: itemForm.defaultAssignee,
            dueOffsetDays: itemForm.dueOffsetDays,
            sortOrder: selectedTemplate.value.items.length,
        });
        itemDialogOpen.value = false;
        showSnackbar('템플릿 아이템이 추가되었습니다.');
        await reloadSelectedTemplate();
    }
    catch (error) {
        itemFormError.value = extractErrorMessage(error, '아이템 추가에 실패했습니다.');
    }
    finally {
        itemSubmitting.value = false;
    }
};
const removeItem = async (itemId) => {
    if (!selectedTemplate.value) {
        return;
    }
    try {
        deletingItemId.value = itemId;
        await deleteTaskTemplateItem(itemId);
        showSnackbar('템플릿 아이템이 삭제되었습니다.');
        await reloadSelectedTemplate();
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, '아이템 삭제에 실패했습니다.'), 'error');
    }
    finally {
        deletingItemId.value = null;
    }
};
const moveItem = async (fromIndex, delta) => {
    if (!selectedTemplate.value) {
        return;
    }
    const toIndex = fromIndex + delta;
    if (toIndex < 0 || toIndex >= selectedTemplate.value.items.length) {
        return;
    }
    const current = selectedTemplate.value.items[fromIndex];
    const target = selectedTemplate.value.items[toIndex];
    try {
        reordering.value = true;
        await Promise.all([
            updateTaskTemplateItem(current.id, { sortOrder: target.sortOrder }),
            updateTaskTemplateItem(target.id, { sortOrder: current.sortOrder }),
        ]);
        await reloadSelectedTemplate();
        showSnackbar('아이템 순서가 변경되었습니다.');
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, '아이템 순서 변경에 실패했습니다.'), 'error');
    }
    finally {
        reordering.value = false;
    }
};
const goPrevPage = async () => {
    if (page.value <= 0) {
        return;
    }
    page.value -= 1;
    await loadTemplates();
};
const goNextPage = async () => {
    if (page.value >= totalPages.value - 1) {
        return;
    }
    page.value += 1;
    await loadTemplates();
};
onMounted(loadTemplates);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['item-form-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "templates-view" },
});
const __VLS_0 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "header-card" },
    rounded: "lg",
    elevation: "1",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "header-card" },
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
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
    onClick: (__VLS_ctx.loadTemplates)
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-plus",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-plus",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.openCreateTemplateDialog)
};
__VLS_15.slots.default;
var __VLS_15;
var __VLS_3;
if (__VLS_ctx.errorMessage) {
    const __VLS_20 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        type: "error",
        variant: "tonal",
    }));
    const __VLS_22 = __VLS_21({
        type: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_23;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-grid" },
});
const __VLS_24 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    rounded: "lg",
    elevation: "1",
}));
const __VLS_26 = __VLS_25({
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
if (__VLS_ctx.loading) {
    const __VLS_28 = {}.VSkeletonLoader;
    /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        type: "list-item-two-line@5",
        ...{ class: "pa-3" },
    }));
    const __VLS_30 = __VLS_29({
        type: "list-item-two-line@5",
        ...{ class: "pa-3" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
else if (__VLS_ctx.templates.length === 0) {
    /** @type {[typeof EmptyState, typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        title: "템플릿이 없습니다",
        description: "새 템플릿을 만들어 반복 업무를 줄여보세요.",
        icon: "mdi-file-document-outline",
        ...{ class: "py-8" },
    }));
    const __VLS_33 = __VLS_32({
        title: "템플릿이 없습니다",
        description: "새 템플릿을 만들어 반복 업무를 줄여보세요.",
        icon: "mdi-file-document-outline",
        ...{ class: "py-8" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    __VLS_34.slots.default;
    const __VLS_35 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
        ...{ 'onClick': {} },
        color: "primary",
        ...{ class: "mt-4" },
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onClick': {} },
        color: "primary",
        ...{ class: "mt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onClick: (__VLS_ctx.openCreateTemplateDialog)
    };
    __VLS_38.slots.default;
    var __VLS_38;
    var __VLS_34;
}
else {
    const __VLS_43 = {}.VList;
    /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        nav: true,
    }));
    const __VLS_45 = __VLS_44({
        nav: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    __VLS_46.slots.default;
    for (const [template] of __VLS_getVForSourceType((__VLS_ctx.templates))) {
        const __VLS_47 = {}.VListItem;
        /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
            ...{ 'onClick': {} },
            key: (template.id),
            active: (__VLS_ctx.selectedTemplateId === template.id),
            rounded: "lg",
        }));
        const __VLS_49 = __VLS_48({
            ...{ 'onClick': {} },
            key: (template.id),
            active: (__VLS_ctx.selectedTemplateId === template.id),
            rounded: "lg",
        }, ...__VLS_functionalComponentArgsRest(__VLS_48));
        let __VLS_51;
        let __VLS_52;
        let __VLS_53;
        const __VLS_54 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.loading))
                    return;
                if (!!(__VLS_ctx.templates.length === 0))
                    return;
                __VLS_ctx.selectTemplate(template.id);
            }
        };
        __VLS_50.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_50.slots;
            (template.name);
        }
        {
            const { subtitle: __VLS_thisSlot } = __VLS_50.slots;
            (template.description || '설명 없음');
        }
        {
            const { append: __VLS_thisSlot } = __VLS_50.slots;
            const __VLS_55 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
                size: "small",
                variant: "tonal",
            }));
            const __VLS_57 = __VLS_56({
                size: "small",
                variant: "tonal",
            }, ...__VLS_functionalComponentArgsRest(__VLS_56));
            __VLS_58.slots.default;
            (template.items.length);
            var __VLS_58;
        }
        var __VLS_50;
    }
    var __VLS_46;
}
var __VLS_27;
const __VLS_59 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    rounded: "lg",
    elevation: "1",
}));
const __VLS_61 = __VLS_60({
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_62.slots.default;
if (__VLS_ctx.loadingDetail) {
    const __VLS_63 = {}.VSkeletonLoader;
    /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        type: "article, list-item-three-line@2",
        ...{ class: "pa-4" },
    }));
    const __VLS_65 = __VLS_64({
        type: "article, list-item-three-line@2",
        ...{ class: "pa-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
}
else if (!__VLS_ctx.selectedTemplate) {
    /** @type {[typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_67 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        title: "템플릿을 선택하세요",
        description: "왼쪽 목록에서 템플릿을 선택하면 상세를 편집할 수 있습니다.",
        icon: "mdi-file-tree-outline",
        ...{ class: "py-8" },
    }));
    const __VLS_68 = __VLS_67({
        title: "템플릿을 선택하세요",
        description: "왼쪽 목록에서 템플릿을 선택하면 상세를 편집할 수 있습니다.",
        icon: "mdi-file-tree-outline",
        ...{ class: "py-8" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_67));
}
else {
    const __VLS_70 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        ...{ class: "d-flex justify-space-between align-center py-4" },
    }));
    const __VLS_72 = __VLS_71({
        ...{ class: "d-flex justify-space-between align-center py-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_73.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-title" },
    });
    (__VLS_ctx.selectedTemplate.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-sub" },
    });
    (__VLS_ctx.selectedTemplate.description || '설명 없음');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "d-flex ga-2" },
    });
    const __VLS_74 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        ...{ 'onClick': {} },
        size: "small",
        variant: "outlined",
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onClick': {} },
        size: "small",
        variant: "outlined",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_78;
    let __VLS_79;
    let __VLS_80;
    const __VLS_81 = {
        onClick: (__VLS_ctx.openEditTemplateDialog)
    };
    __VLS_77.slots.default;
    var __VLS_77;
    const __VLS_82 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
        ...{ 'onClick': {} },
        size: "small",
        color: "error",
        variant: "tonal",
    }));
    const __VLS_84 = __VLS_83({
        ...{ 'onClick': {} },
        size: "small",
        color: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_83));
    let __VLS_86;
    let __VLS_87;
    let __VLS_88;
    const __VLS_89 = {
        onClick: (__VLS_ctx.openDeleteTemplateDialog)
    };
    __VLS_85.slots.default;
    var __VLS_85;
    var __VLS_73;
    const __VLS_90 = {}.VDivider;
    /** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({}));
    const __VLS_92 = __VLS_91({}, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const __VLS_94 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
        ...{ class: "pt-4" },
    }));
    const __VLS_96 = __VLS_95({
        ...{ class: "pt-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_95));
    __VLS_97.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "item-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_98 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
        ...{ 'onClick': {} },
        size: "small",
        color: "primary",
        prependIcon: "mdi-plus",
    }));
    const __VLS_100 = __VLS_99({
        ...{ 'onClick': {} },
        size: "small",
        color: "primary",
        prependIcon: "mdi-plus",
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    let __VLS_102;
    let __VLS_103;
    let __VLS_104;
    const __VLS_105 = {
        onClick: (__VLS_ctx.openCreateItemDialog)
    };
    __VLS_101.slots.default;
    var __VLS_101;
    if (__VLS_ctx.selectedTemplate.items.length === 0) {
        /** @type {[typeof EmptyState, ]} */ ;
        // @ts-ignore
        const __VLS_106 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
            title: "아이템이 없습니다",
            description: "템플릿에 기본 태스크를 추가해보세요.",
            icon: "mdi-format-list-bulleted",
            ...{ class: "py-6" },
        }));
        const __VLS_107 = __VLS_106({
            title: "아이템이 없습니다",
            description: "템플릿에 기본 태스크를 추가해보세요.",
            icon: "mdi-format-list-bulleted",
            ...{ class: "py-6" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    }
    else {
        const __VLS_109 = {}.VList;
        /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
            lines: "two",
        }));
        const __VLS_111 = __VLS_110({
            lines: "two",
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        __VLS_112.slots.default;
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.selectedTemplate.items))) {
            const __VLS_113 = {}.VListItem;
            /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
            // @ts-ignore
            const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
                key: (item.id),
                rounded: "lg",
                ...{ class: "item-row" },
            }));
            const __VLS_115 = __VLS_114({
                key: (item.id),
                rounded: "lg",
                ...{ class: "item-row" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_114));
            __VLS_116.slots.default;
            {
                const { title: __VLS_thisSlot } = __VLS_116.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-title-row" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (item.title);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chips" },
                });
                const __VLS_117 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({
                    size: "small",
                    variant: "outlined",
                }));
                const __VLS_119 = __VLS_118({
                    size: "small",
                    variant: "outlined",
                }, ...__VLS_functionalComponentArgsRest(__VLS_118));
                __VLS_120.slots.default;
                (item.defaultStatus);
                var __VLS_120;
                const __VLS_121 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
                    size: "small",
                    variant: "tonal",
                }));
                const __VLS_123 = __VLS_122({
                    size: "small",
                    variant: "tonal",
                }, ...__VLS_functionalComponentArgsRest(__VLS_122));
                __VLS_124.slots.default;
                (item.defaultPriority);
                var __VLS_124;
                const __VLS_125 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({
                    size: "small",
                    variant: "tonal",
                }));
                const __VLS_127 = __VLS_126({
                    size: "small",
                    variant: "tonal",
                }, ...__VLS_functionalComponentArgsRest(__VLS_126));
                __VLS_128.slots.default;
                (item.defaultAssignee);
                var __VLS_128;
                const __VLS_129 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
                    size: "small",
                    prependIcon: "mdi-calendar-month-outline",
                    variant: "outlined",
                }));
                const __VLS_131 = __VLS_130({
                    size: "small",
                    prependIcon: "mdi-calendar-month-outline",
                    variant: "outlined",
                }, ...__VLS_functionalComponentArgsRest(__VLS_130));
                __VLS_132.slots.default;
                (item.dueOffsetDays == null ? '마감 오프셋 없음' : `D+${item.dueOffsetDays}`);
                var __VLS_132;
            }
            {
                const { subtitle: __VLS_thisSlot } = __VLS_116.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "item-description" },
                });
                (item.description || '설명 없음');
            }
            {
                const { append: __VLS_thisSlot } = __VLS_116.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-actions" },
                });
                const __VLS_133 = {}.VBtn;
                /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                // @ts-ignore
                const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
                    ...{ 'onClick': {} },
                    icon: "mdi-arrow-up",
                    size: "small",
                    variant: "text",
                    disabled: (index === 0 || __VLS_ctx.reordering),
                }));
                const __VLS_135 = __VLS_134({
                    ...{ 'onClick': {} },
                    icon: "mdi-arrow-up",
                    size: "small",
                    variant: "text",
                    disabled: (index === 0 || __VLS_ctx.reordering),
                }, ...__VLS_functionalComponentArgsRest(__VLS_134));
                let __VLS_137;
                let __VLS_138;
                let __VLS_139;
                const __VLS_140 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loadingDetail))
                            return;
                        if (!!(!__VLS_ctx.selectedTemplate))
                            return;
                        if (!!(__VLS_ctx.selectedTemplate.items.length === 0))
                            return;
                        __VLS_ctx.moveItem(index, -1);
                    }
                };
                var __VLS_136;
                const __VLS_141 = {}.VBtn;
                /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                // @ts-ignore
                const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
                    ...{ 'onClick': {} },
                    icon: "mdi-arrow-down",
                    size: "small",
                    variant: "text",
                    disabled: (index === __VLS_ctx.selectedTemplate.items.length - 1 || __VLS_ctx.reordering),
                }));
                const __VLS_143 = __VLS_142({
                    ...{ 'onClick': {} },
                    icon: "mdi-arrow-down",
                    size: "small",
                    variant: "text",
                    disabled: (index === __VLS_ctx.selectedTemplate.items.length - 1 || __VLS_ctx.reordering),
                }, ...__VLS_functionalComponentArgsRest(__VLS_142));
                let __VLS_145;
                let __VLS_146;
                let __VLS_147;
                const __VLS_148 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loadingDetail))
                            return;
                        if (!!(!__VLS_ctx.selectedTemplate))
                            return;
                        if (!!(__VLS_ctx.selectedTemplate.items.length === 0))
                            return;
                        __VLS_ctx.moveItem(index, 1);
                    }
                };
                var __VLS_144;
                const __VLS_149 = {}.VBtn;
                /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
                // @ts-ignore
                const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
                    ...{ 'onClick': {} },
                    icon: "mdi-delete-outline",
                    size: "small",
                    color: "error",
                    variant: "text",
                    loading: (__VLS_ctx.deletingItemId === item.id),
                }));
                const __VLS_151 = __VLS_150({
                    ...{ 'onClick': {} },
                    icon: "mdi-delete-outline",
                    size: "small",
                    color: "error",
                    variant: "text",
                    loading: (__VLS_ctx.deletingItemId === item.id),
                }, ...__VLS_functionalComponentArgsRest(__VLS_150));
                let __VLS_153;
                let __VLS_154;
                let __VLS_155;
                const __VLS_156 = {
                    onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loadingDetail))
                            return;
                        if (!!(!__VLS_ctx.selectedTemplate))
                            return;
                        if (!!(__VLS_ctx.selectedTemplate.items.length === 0))
                            return;
                        __VLS_ctx.removeItem(item.id);
                    }
                };
                var __VLS_152;
            }
            var __VLS_116;
        }
        var __VLS_112;
    }
    var __VLS_97;
}
var __VLS_62;
if (__VLS_ctx.totalPages > 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: "pager" },
    });
    const __VLS_157 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page <= 0),
    }));
    const __VLS_159 = __VLS_158({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page <= 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    let __VLS_161;
    let __VLS_162;
    let __VLS_163;
    const __VLS_164 = {
        onClick: (__VLS_ctx.goPrevPage)
    };
    __VLS_160.slots.default;
    var __VLS_160;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.page + 1);
    (__VLS_ctx.totalPages);
    const __VLS_165 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page >= __VLS_ctx.totalPages - 1),
    }));
    const __VLS_167 = __VLS_166({
        ...{ 'onClick': {} },
        variant: "outlined",
        disabled: (__VLS_ctx.page >= __VLS_ctx.totalPages - 1),
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    let __VLS_169;
    let __VLS_170;
    let __VLS_171;
    const __VLS_172 = {
        onClick: (__VLS_ctx.goNextPage)
    };
    __VLS_168.slots.default;
    var __VLS_168;
}
const __VLS_173 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    modelValue: (__VLS_ctx.templateDialogOpen),
    maxWidth: "560",
}));
const __VLS_175 = __VLS_174({
    modelValue: (__VLS_ctx.templateDialogOpen),
    maxWidth: "560",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({}));
const __VLS_179 = __VLS_178({}, ...__VLS_functionalComponentArgsRest(__VLS_178));
__VLS_180.slots.default;
const __VLS_181 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
    ...{ class: "pt-5 px-5" },
}));
const __VLS_183 = __VLS_182({
    ...{ class: "pt-5 px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
__VLS_184.slots.default;
(__VLS_ctx.templateDialogMode === 'create' ? '새 템플릿' : '템플릿 수정');
var __VLS_184;
const __VLS_185 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
    ...{ class: "px-5 pb-2" },
}));
const __VLS_187 = __VLS_186({
    ...{ class: "px-5 pb-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_186));
__VLS_188.slots.default;
const __VLS_189 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    modelValue: (__VLS_ctx.templateForm.name),
    label: "이름",
    variant: "outlined",
    density: "comfortable",
    errorMessages: (__VLS_ctx.templateFormError ? [__VLS_ctx.templateFormError] : []),
}));
const __VLS_191 = __VLS_190({
    modelValue: (__VLS_ctx.templateForm.name),
    label: "이름",
    variant: "outlined",
    density: "comfortable",
    errorMessages: (__VLS_ctx.templateFormError ? [__VLS_ctx.templateFormError] : []),
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
const __VLS_193 = {}.VTextarea;
/** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    modelValue: (__VLS_ctx.templateForm.description),
    label: "설명",
    variant: "outlined",
    density: "comfortable",
    rows: "3",
    autoGrow: true,
}));
const __VLS_195 = __VLS_194({
    modelValue: (__VLS_ctx.templateForm.description),
    label: "설명",
    variant: "outlined",
    density: "comfortable",
    rows: "3",
    autoGrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
var __VLS_188;
const __VLS_197 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_199 = __VLS_198({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_198));
__VLS_200.slots.default;
const __VLS_201 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({}));
const __VLS_203 = __VLS_202({}, ...__VLS_functionalComponentArgsRest(__VLS_202));
const __VLS_205 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.templateSubmitting),
}));
const __VLS_207 = __VLS_206({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.templateSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
let __VLS_209;
let __VLS_210;
let __VLS_211;
const __VLS_212 = {
    onClick: (...[$event]) => {
        __VLS_ctx.templateDialogOpen = false;
    }
};
__VLS_208.slots.default;
var __VLS_208;
const __VLS_213 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.templateSubmitting),
}));
const __VLS_215 = __VLS_214({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.templateSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
let __VLS_217;
let __VLS_218;
let __VLS_219;
const __VLS_220 = {
    onClick: (__VLS_ctx.submitTemplateForm)
};
__VLS_216.slots.default;
var __VLS_216;
var __VLS_200;
var __VLS_180;
var __VLS_176;
const __VLS_221 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    modelValue: (__VLS_ctx.itemDialogOpen),
    maxWidth: "620",
}));
const __VLS_223 = __VLS_222({
    modelValue: (__VLS_ctx.itemDialogOpen),
    maxWidth: "620",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
__VLS_224.slots.default;
const __VLS_225 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({}));
const __VLS_227 = __VLS_226({}, ...__VLS_functionalComponentArgsRest(__VLS_226));
__VLS_228.slots.default;
const __VLS_229 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    ...{ class: "pt-5 px-5" },
}));
const __VLS_231 = __VLS_230({
    ...{ class: "pt-5 px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
__VLS_232.slots.default;
var __VLS_232;
const __VLS_233 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
    ...{ class: "px-5 pb-2" },
}));
const __VLS_235 = __VLS_234({
    ...{ class: "px-5 pb-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
__VLS_236.slots.default;
const __VLS_237 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    modelValue: (__VLS_ctx.itemForm.title),
    label: "제목",
    variant: "outlined",
    density: "comfortable",
    errorMessages: (__VLS_ctx.itemFormError ? [__VLS_ctx.itemFormError] : []),
}));
const __VLS_239 = __VLS_238({
    modelValue: (__VLS_ctx.itemForm.title),
    label: "제목",
    variant: "outlined",
    density: "comfortable",
    errorMessages: (__VLS_ctx.itemFormError ? [__VLS_ctx.itemFormError] : []),
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
const __VLS_241 = {}.VTextarea;
/** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
    modelValue: (__VLS_ctx.itemForm.description),
    label: "설명",
    variant: "outlined",
    density: "comfortable",
    rows: "3",
    autoGrow: true,
}));
const __VLS_243 = __VLS_242({
    modelValue: (__VLS_ctx.itemForm.description),
    label: "설명",
    variant: "outlined",
    density: "comfortable",
    rows: "3",
    autoGrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_242));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-form-grid" },
});
const __VLS_245 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
    modelValue: (__VLS_ctx.itemForm.defaultStatus),
    items: (__VLS_ctx.statusOptions),
    label: "기본 상태",
    variant: "outlined",
    density: "comfortable",
}));
const __VLS_247 = __VLS_246({
    modelValue: (__VLS_ctx.itemForm.defaultStatus),
    items: (__VLS_ctx.statusOptions),
    label: "기본 상태",
    variant: "outlined",
    density: "comfortable",
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
const __VLS_249 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
    modelValue: (__VLS_ctx.itemForm.defaultPriority),
    items: (__VLS_ctx.priorityOptions),
    label: "기본 우선순위",
    variant: "outlined",
    density: "comfortable",
}));
const __VLS_251 = __VLS_250({
    modelValue: (__VLS_ctx.itemForm.defaultPriority),
    items: (__VLS_ctx.priorityOptions),
    label: "기본 우선순위",
    variant: "outlined",
    density: "comfortable",
}, ...__VLS_functionalComponentArgsRest(__VLS_250));
const __VLS_253 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
    modelValue: (__VLS_ctx.itemForm.defaultAssignee),
    items: (__VLS_ctx.assigneeOptions),
    label: "기본 담당자",
    variant: "outlined",
    density: "comfortable",
}));
const __VLS_255 = __VLS_254({
    modelValue: (__VLS_ctx.itemForm.defaultAssignee),
    items: (__VLS_ctx.assigneeOptions),
    label: "기본 담당자",
    variant: "outlined",
    density: "comfortable",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
const __VLS_257 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
    modelValue: (__VLS_ctx.itemForm.dueOffsetDays),
    modelModifiers: { number: true, },
    type: "number",
    label: "마감 오프셋(D+N)",
    variant: "outlined",
    density: "comfortable",
}));
const __VLS_259 = __VLS_258({
    modelValue: (__VLS_ctx.itemForm.dueOffsetDays),
    modelModifiers: { number: true, },
    type: "number",
    label: "마감 오프셋(D+N)",
    variant: "outlined",
    density: "comfortable",
}, ...__VLS_functionalComponentArgsRest(__VLS_258));
var __VLS_236;
const __VLS_261 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_263 = __VLS_262({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
__VLS_264.slots.default;
const __VLS_265 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({}));
const __VLS_267 = __VLS_266({}, ...__VLS_functionalComponentArgsRest(__VLS_266));
const __VLS_269 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.itemSubmitting),
}));
const __VLS_271 = __VLS_270({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.itemSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_270));
let __VLS_273;
let __VLS_274;
let __VLS_275;
const __VLS_276 = {
    onClick: (...[$event]) => {
        __VLS_ctx.itemDialogOpen = false;
    }
};
__VLS_272.slots.default;
var __VLS_272;
const __VLS_277 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_278 = __VLS_asFunctionalComponent(__VLS_277, new __VLS_277({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.itemSubmitting),
}));
const __VLS_279 = __VLS_278({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.itemSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_278));
let __VLS_281;
let __VLS_282;
let __VLS_283;
const __VLS_284 = {
    onClick: (__VLS_ctx.submitItemForm)
};
__VLS_280.slots.default;
var __VLS_280;
var __VLS_264;
var __VLS_228;
var __VLS_224;
const __VLS_285 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_286 = __VLS_asFunctionalComponent(__VLS_285, new __VLS_285({
    modelValue: (__VLS_ctx.deleteTemplateDialogOpen),
    maxWidth: "420",
}));
const __VLS_287 = __VLS_286({
    modelValue: (__VLS_ctx.deleteTemplateDialogOpen),
    maxWidth: "420",
}, ...__VLS_functionalComponentArgsRest(__VLS_286));
__VLS_288.slots.default;
const __VLS_289 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_290 = __VLS_asFunctionalComponent(__VLS_289, new __VLS_289({}));
const __VLS_291 = __VLS_290({}, ...__VLS_functionalComponentArgsRest(__VLS_290));
__VLS_292.slots.default;
const __VLS_293 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_294 = __VLS_asFunctionalComponent(__VLS_293, new __VLS_293({
    ...{ class: "pt-5 px-5" },
}));
const __VLS_295 = __VLS_294({
    ...{ class: "pt-5 px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_294));
__VLS_296.slots.default;
var __VLS_296;
const __VLS_297 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_298 = __VLS_asFunctionalComponent(__VLS_297, new __VLS_297({
    ...{ class: "px-5 pb-2" },
}));
const __VLS_299 = __VLS_298({
    ...{ class: "px-5 pb-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_298));
__VLS_300.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.selectedTemplate?.name);
var __VLS_300;
const __VLS_301 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_302 = __VLS_asFunctionalComponent(__VLS_301, new __VLS_301({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_303 = __VLS_302({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_302));
__VLS_304.slots.default;
const __VLS_305 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_306 = __VLS_asFunctionalComponent(__VLS_305, new __VLS_305({}));
const __VLS_307 = __VLS_306({}, ...__VLS_functionalComponentArgsRest(__VLS_306));
const __VLS_309 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_310 = __VLS_asFunctionalComponent(__VLS_309, new __VLS_309({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.templateSubmitting),
}));
const __VLS_311 = __VLS_310({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.templateSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_310));
let __VLS_313;
let __VLS_314;
let __VLS_315;
const __VLS_316 = {
    onClick: (...[$event]) => {
        __VLS_ctx.deleteTemplateDialogOpen = false;
    }
};
__VLS_312.slots.default;
var __VLS_312;
const __VLS_317 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_318 = __VLS_asFunctionalComponent(__VLS_317, new __VLS_317({
    ...{ 'onClick': {} },
    color: "error",
    loading: (__VLS_ctx.templateSubmitting),
}));
const __VLS_319 = __VLS_318({
    ...{ 'onClick': {} },
    color: "error",
    loading: (__VLS_ctx.templateSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_318));
let __VLS_321;
let __VLS_322;
let __VLS_323;
const __VLS_324 = {
    onClick: (__VLS_ctx.confirmDeleteTemplate)
};
__VLS_320.slots.default;
var __VLS_320;
var __VLS_304;
var __VLS_292;
var __VLS_288;
const __VLS_325 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_326 = __VLS_asFunctionalComponent(__VLS_325, new __VLS_325({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    location: "bottom right",
    timeout: "2600",
}));
const __VLS_327 = __VLS_326({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    location: "bottom right",
    timeout: "2600",
}, ...__VLS_functionalComponentArgsRest(__VLS_326));
__VLS_328.slots.default;
(__VLS_ctx.snackbar.message);
var __VLS_328;
/** @type {__VLS_StyleScopedClasses['templates-view']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['pa-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-space-between']} */ ;
/** @type {__VLS_StyleScopedClasses['align-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-title']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['ga-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['item-header']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['item-row']} */ ;
/** @type {__VLS_StyleScopedClasses['item-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chips']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pager']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['item-form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            EmptyState: EmptyState,
            templates: templates,
            selectedTemplateId: selectedTemplateId,
            loading: loading,
            loadingDetail: loadingDetail,
            errorMessage: errorMessage,
            deletingItemId: deletingItemId,
            reordering: reordering,
            page: page,
            totalPages: totalPages,
            templateDialogOpen: templateDialogOpen,
            templateDialogMode: templateDialogMode,
            templateSubmitting: templateSubmitting,
            templateFormError: templateFormError,
            templateForm: templateForm,
            itemDialogOpen: itemDialogOpen,
            itemSubmitting: itemSubmitting,
            itemFormError: itemFormError,
            itemForm: itemForm,
            deleteTemplateDialogOpen: deleteTemplateDialogOpen,
            snackbar: snackbar,
            statusOptions: statusOptions,
            priorityOptions: priorityOptions,
            assigneeOptions: assigneeOptions,
            selectedTemplate: selectedTemplate,
            loadTemplates: loadTemplates,
            selectTemplate: selectTemplate,
            openCreateTemplateDialog: openCreateTemplateDialog,
            openEditTemplateDialog: openEditTemplateDialog,
            submitTemplateForm: submitTemplateForm,
            openDeleteTemplateDialog: openDeleteTemplateDialog,
            confirmDeleteTemplate: confirmDeleteTemplate,
            openCreateItemDialog: openCreateItemDialog,
            submitItemForm: submitItemForm,
            removeItem: removeItem,
            moveItem: moveItem,
            goPrevPage: goPrevPage,
            goNextPage: goNextPage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
