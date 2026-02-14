import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { extractErrorMessage } from '../../api/apiClient';
import { getProjectById } from '../../api/projects';
import RiskMatrixSummary from '../../components/risks/RiskMatrixSummary.vue';
import { useRiskStore } from '../../stores/risk';
const route = useRoute();
const router = useRouter();
const riskStore = useRiskStore();
const projectId = route.params.projectId;
const projectName = ref('Project Risks');
const statusModel = ref(null);
const levelBucketModel = ref(null);
const probabilityModel = ref(null);
const impactModel = ref(null);
const ownerFilterModel = ref('ALL');
const keywordModel = ref('');
const createDialogOpen = ref(false);
const createSubmitting = ref(false);
const createErrorMessage = ref('');
const createForm = reactive({
    title: '',
    description: '',
    category: '',
    status: 'IDENTIFIED',
    probability: 3,
    impact: 3,
});
const headers = [
    { title: 'Title', key: 'title', sortable: false },
    { title: 'Status', key: 'status', sortable: false },
    { title: 'Level', key: 'levelBucket', sortable: false },
    { title: 'P/I', key: 'pi', sortable: false },
    { title: 'Owner', key: 'owner', sortable: false },
    { title: 'Next review', key: 'nextReviewDate', sortable: false },
    { title: 'Updated', key: 'updatedAt', sortable: false },
];
const statusOptions = [
    { label: 'All', value: null },
    { label: 'IDENTIFIED', value: 'IDENTIFIED' },
    { label: 'ASSESSING', value: 'ASSESSING' },
    { label: 'MITIGATING', value: 'MITIGATING' },
    { label: 'MONITORING', value: 'MONITORING' },
    { label: 'CLOSED', value: 'CLOSED' },
];
const levelBucketOptions = [
    { label: 'All', value: null },
    { label: 'LOW', value: 'LOW' },
    { label: 'MEDIUM', value: 'MEDIUM' },
    { label: 'HIGH', value: 'HIGH' },
    { label: 'CRITICAL', value: 'CRITICAL' },
];
const ownerOptions = [
    { label: '전체', value: 'ALL' },
    { label: '나', value: 'ME' },
    { label: '미지정', value: 'UNASSIGNED' },
];
const openRiskCount = computed(() => {
    const counts = riskStore.summary?.statusCounts ?? {};
    return (counts.IDENTIFIED ?? 0) + (counts.ASSESSING ?? 0) + (counts.MITIGATING ?? 0) + (counts.MONITORING ?? 0);
});
const highCriticalCount = computed(() => {
    const counts = riskStore.summary?.levelBucketCounts ?? {};
    return (counts.HIGH ?? 0) + (counts.CRITICAL ?? 0);
});
const levelColor = (bucket) => {
    if (bucket === 'CRITICAL')
        return 'error';
    if (bucket === 'HIGH')
        return 'warning';
    if (bucket === 'MEDIUM')
        return 'primary';
    return 'success';
};
const applyFilters = async () => {
    await riskStore.applyFilters({
        status: statusModel.value,
        levelBucket: levelBucketModel.value,
        probability: probabilityModel.value,
        impact: impactModel.value,
        ownerFilter: ownerFilterModel.value,
        keyword: keywordModel.value,
    });
};
const onMatrixCellSelect = async (payload) => {
    probabilityModel.value = payload.probability;
    impactModel.value = payload.impact;
    await applyFilters();
};
const clearMatrixFilter = async () => {
    probabilityModel.value = null;
    impactModel.value = null;
    await applyFilters();
};
const goPrev = async () => {
    if (riskStore.page > 0) {
        await riskStore.setPage(riskStore.page - 1);
    }
};
const goNext = async () => {
    if (riskStore.page < riskStore.totalPages - 1) {
        await riskStore.setPage(riskStore.page + 1);
    }
};
const onRowClick = (_event, row) => {
    const candidate = row;
    const riskId = candidate.item?.raw?.id ?? candidate.item?.id;
    if (!riskId) {
        return;
    }
    router.push(`/app/projects/${projectId}/risks/${riskId}`);
};
const openCreateDialog = () => {
    createErrorMessage.value = '';
    createForm.title = '';
    createForm.description = '';
    createForm.category = '';
    createForm.status = 'IDENTIFIED';
    createForm.probability = 3;
    createForm.impact = 3;
    createDialogOpen.value = true;
};
const closeCreateDialog = () => {
    createDialogOpen.value = false;
};
const submitCreate = async () => {
    const title = createForm.title.trim();
    if (!title) {
        createErrorMessage.value = 'Title is required.';
        return;
    }
    try {
        createSubmitting.value = true;
        createErrorMessage.value = '';
        await riskStore.addRisk({
            title,
            description: createForm.description.trim() || undefined,
            category: createForm.category.trim() || undefined,
            status: createForm.status,
            probability: createForm.probability,
            impact: createForm.impact,
        });
        closeCreateDialog();
    }
    catch (error) {
        createErrorMessage.value = extractErrorMessage(error, '리스크 생성에 실패했습니다.');
    }
    finally {
        createSubmitting.value = false;
    }
};
const formatDate = (value) => new Date(value).toLocaleString();
onMounted(async () => {
    riskStore.setProject(projectId);
    try {
        const project = await getProjectById(projectId);
        projectName.value = project.name;
    }
    catch {
        projectName.value = 'Project Risks';
    }
    await riskStore.reload();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['title-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
/** @type {__VLS_StyleScopedClasses['create-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "risk-register" },
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
(__VLS_ctx.projectName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_4 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/board`),
}));
const __VLS_6 = __VLS_5({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/board`),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
const __VLS_8 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-plus",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    color: "primary",
    prependIcon: "mdi-plus",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.openCreateDialog)
};
__VLS_11.slots.default;
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "summary-grid" },
});
const __VLS_16 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    rounded: "lg",
    elevation: "1",
}));
const __VLS_18 = __VLS_17({
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "summary-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.openRiskCount);
var __VLS_23;
var __VLS_19;
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
const __VLS_28 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "summary-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.highCriticalCount);
var __VLS_31;
var __VLS_27;
const __VLS_32 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    rounded: "lg",
    elevation: "1",
}));
const __VLS_34 = __VLS_33({
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "summary-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.riskStore.summary?.overdueActionsCount ?? 0);
var __VLS_39;
var __VLS_35;
/** @type {[typeof RiskMatrixSummary, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(RiskMatrixSummary, new RiskMatrixSummary({
    ...{ 'onSelect': {} },
    cells: (__VLS_ctx.riskStore.matrix),
    selectedProbability: (__VLS_ctx.probabilityModel),
    selectedImpact: (__VLS_ctx.impactModel),
}));
const __VLS_41 = __VLS_40({
    ...{ 'onSelect': {} },
    cells: (__VLS_ctx.riskStore.matrix),
    selectedProbability: (__VLS_ctx.probabilityModel),
    selectedImpact: (__VLS_ctx.impactModel),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_43;
let __VLS_44;
let __VLS_45;
const __VLS_46 = {
    onSelect: (__VLS_ctx.onMatrixCellSelect)
};
var __VLS_42;
if (__VLS_ctx.riskStore.summaryError) {
    const __VLS_47 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
        type: "warning",
        variant: "tonal",
    }));
    const __VLS_49 = __VLS_48({
        type: "warning",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    __VLS_50.slots.default;
    (__VLS_ctx.riskStore.summaryError);
    var __VLS_50;
}
if (__VLS_ctx.riskStore.listError) {
    const __VLS_51 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        type: "error",
        variant: "tonal",
    }));
    const __VLS_53 = __VLS_52({
        type: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    __VLS_54.slots.default;
    (__VLS_ctx.riskStore.listError);
    var __VLS_54;
}
const __VLS_55 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
    rounded: "lg",
    elevation: "1",
}));
const __VLS_57 = __VLS_56({
    rounded: "lg",
    elevation: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
__VLS_58.slots.default;
const __VLS_59 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    ...{ class: "filters" },
}));
const __VLS_61 = __VLS_60({
    ...{ class: "filters" },
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_62.slots.default;
const __VLS_63 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    modelValue: (__VLS_ctx.statusModel),
    items: (__VLS_ctx.statusOptions),
    label: "Status",
    itemTitle: "label",
    itemValue: "value",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}));
const __VLS_65 = __VLS_64({
    modelValue: (__VLS_ctx.statusModel),
    items: (__VLS_ctx.statusOptions),
    label: "Status",
    itemTitle: "label",
    itemValue: "value",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
const __VLS_67 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    modelValue: (__VLS_ctx.levelBucketModel),
    items: (__VLS_ctx.levelBucketOptions),
    label: "Level",
    itemTitle: "label",
    itemValue: "value",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}));
const __VLS_69 = __VLS_68({
    modelValue: (__VLS_ctx.levelBucketModel),
    items: (__VLS_ctx.levelBucketOptions),
    label: "Level",
    itemTitle: "label",
    itemValue: "value",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const __VLS_71 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    modelValue: (__VLS_ctx.ownerFilterModel),
    items: (__VLS_ctx.ownerOptions),
    label: "Owner",
    itemTitle: "label",
    itemValue: "value",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}));
const __VLS_73 = __VLS_72({
    modelValue: (__VLS_ctx.ownerFilterModel),
    items: (__VLS_ctx.ownerOptions),
    label: "Owner",
    itemTitle: "label",
    itemValue: "value",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
const __VLS_75 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywordModel),
    label: "Keyword",
    prependInnerIcon: "mdi-magnify",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}));
const __VLS_77 = __VLS_76({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.keywordModel),
    label: "Keyword",
    prependInnerIcon: "mdi-magnify",
    variant: "outlined",
    density: "comfortable",
    hideDetails: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
let __VLS_79;
let __VLS_80;
let __VLS_81;
const __VLS_82 = {
    onKeydown: (__VLS_ctx.applyFilters)
};
var __VLS_78;
if (__VLS_ctx.probabilityModel !== null || __VLS_ctx.impactModel !== null) {
    const __VLS_83 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
        ...{ 'onClick': {} },
        variant: "text",
        color: "primary",
    }));
    const __VLS_85 = __VLS_84({
        ...{ 'onClick': {} },
        variant: "text",
        color: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_84));
    let __VLS_87;
    let __VLS_88;
    let __VLS_89;
    const __VLS_90 = {
        onClick: (__VLS_ctx.clearMatrixFilter)
    };
    __VLS_86.slots.default;
    var __VLS_86;
}
const __VLS_91 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    ...{ 'onClick': {} },
    variant: "outlined",
    loading: (__VLS_ctx.riskStore.loadingList),
}));
const __VLS_93 = __VLS_92({
    ...{ 'onClick': {} },
    variant: "outlined",
    loading: (__VLS_ctx.riskStore.loadingList),
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_95;
let __VLS_96;
let __VLS_97;
const __VLS_98 = {
    onClick: (__VLS_ctx.applyFilters)
};
__VLS_94.slots.default;
var __VLS_94;
var __VLS_62;
const __VLS_99 = {}.VDivider;
/** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({}));
const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
const __VLS_103 = {}.VDataTable;
/** @type {[typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, typeof __VLS_components.VDataTable, typeof __VLS_components.vDataTable, ]} */ ;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({
    ...{ 'onClick:row': {} },
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.riskStore.visibleRisks),
    loading: (__VLS_ctx.riskStore.loadingList || __VLS_ctx.riskStore.loadingSummary),
    itemKey: "id",
    density: "comfortable",
    hover: true,
    ...{ class: "risk-table" },
}));
const __VLS_105 = __VLS_104({
    ...{ 'onClick:row': {} },
    headers: (__VLS_ctx.headers),
    items: (__VLS_ctx.riskStore.visibleRisks),
    loading: (__VLS_ctx.riskStore.loadingList || __VLS_ctx.riskStore.loadingSummary),
    itemKey: "id",
    density: "comfortable",
    hover: true,
    ...{ class: "risk-table" },
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
let __VLS_107;
let __VLS_108;
let __VLS_109;
const __VLS_110 = {
    'onClick:row': (__VLS_ctx.onRowClick)
};
__VLS_106.slots.default;
{
    const { 'item.title': __VLS_thisSlot } = __VLS_106.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.small, __VLS_intrinsicElements.small)({});
    (item.description || '-');
}
{
    const { 'item.status': __VLS_thisSlot } = __VLS_106.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_111 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
        size: "small",
        variant: "tonal",
    }));
    const __VLS_113 = __VLS_112({
        size: "small",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    __VLS_114.slots.default;
    (item.status);
    var __VLS_114;
}
{
    const { 'item.levelBucket': __VLS_thisSlot } = __VLS_106.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_115 = {}.VChip;
    /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
        size: "small",
        color: (__VLS_ctx.levelColor(item.levelBucket)),
        variant: "tonal",
    }));
    const __VLS_117 = __VLS_116({
        size: "small",
        color: (__VLS_ctx.levelColor(item.levelBucket)),
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    __VLS_118.slots.default;
    (item.levelBucket);
    var __VLS_118;
}
{
    const { 'item.pi': __VLS_thisSlot } = __VLS_106.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    (item.probability);
    (item.impact);
}
{
    const { 'item.owner': __VLS_thisSlot } = __VLS_106.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    (item.ownerUserName || '미지정');
}
{
    const { 'item.nextReviewDate': __VLS_thisSlot } = __VLS_106.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    (item.nextReviewDate || '-');
}
{
    const { 'item.updatedAt': __VLS_thisSlot } = __VLS_106.slots;
    const [{ item }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDate(item.updatedAt));
}
var __VLS_106;
const __VLS_119 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
    ...{ class: "pager" },
}));
const __VLS_121 = __VLS_120({
    ...{ class: "pager" },
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
__VLS_122.slots.default;
const __VLS_123 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (__VLS_ctx.riskStore.page <= 0 || __VLS_ctx.riskStore.loadingList),
}));
const __VLS_125 = __VLS_124({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (__VLS_ctx.riskStore.page <= 0 || __VLS_ctx.riskStore.loadingList),
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
let __VLS_127;
let __VLS_128;
let __VLS_129;
const __VLS_130 = {
    onClick: (__VLS_ctx.goPrev)
};
__VLS_126.slots.default;
var __VLS_126;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.riskStore.page + 1);
(__VLS_ctx.riskStore.totalPages || 1);
const __VLS_131 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (__VLS_ctx.riskStore.page >= __VLS_ctx.riskStore.totalPages - 1 || __VLS_ctx.riskStore.loadingList),
}));
const __VLS_133 = __VLS_132({
    ...{ 'onClick': {} },
    variant: "outlined",
    disabled: (__VLS_ctx.riskStore.page >= __VLS_ctx.riskStore.totalPages - 1 || __VLS_ctx.riskStore.loadingList),
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
let __VLS_135;
let __VLS_136;
let __VLS_137;
const __VLS_138 = {
    onClick: (__VLS_ctx.goNext)
};
__VLS_134.slots.default;
var __VLS_134;
var __VLS_122;
var __VLS_58;
const __VLS_139 = {}.VDialog;
/** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent(__VLS_139, new __VLS_139({
    modelValue: (__VLS_ctx.createDialogOpen),
    maxWidth: "640",
}));
const __VLS_141 = __VLS_140({
    modelValue: (__VLS_ctx.createDialogOpen),
    maxWidth: "640",
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
__VLS_142.slots.default;
const __VLS_143 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143({}));
const __VLS_145 = __VLS_144({}, ...__VLS_functionalComponentArgsRest(__VLS_144));
__VLS_146.slots.default;
const __VLS_147 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
    ...{ class: "pt-5 px-5" },
}));
const __VLS_149 = __VLS_148({
    ...{ class: "pt-5 px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_148));
__VLS_150.slots.default;
var __VLS_150;
const __VLS_151 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({
    ...{ class: "px-5 pb-2" },
}));
const __VLS_153 = __VLS_152({
    ...{ class: "px-5 pb-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_152));
__VLS_154.slots.default;
const __VLS_155 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent(__VLS_155, new __VLS_155({
    modelValue: (__VLS_ctx.createForm.title),
    label: "Title *",
    variant: "outlined",
}));
const __VLS_157 = __VLS_156({
    modelValue: (__VLS_ctx.createForm.title),
    label: "Title *",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
const __VLS_159 = {}.VTextarea;
/** @type {[typeof __VLS_components.VTextarea, typeof __VLS_components.vTextarea, ]} */ ;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({
    modelValue: (__VLS_ctx.createForm.description),
    label: "Description",
    rows: "3",
    variant: "outlined",
}));
const __VLS_161 = __VLS_160({
    modelValue: (__VLS_ctx.createForm.description),
    label: "Description",
    rows: "3",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "create-grid" },
});
const __VLS_163 = {}.VSelect;
/** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
// @ts-ignore
const __VLS_164 = __VLS_asFunctionalComponent(__VLS_163, new __VLS_163({
    modelValue: (__VLS_ctx.createForm.status),
    items: (__VLS_ctx.statusOptions.filter((item) => item.value !== null)),
    itemTitle: "label",
    itemValue: "value",
    label: "Status",
    variant: "outlined",
}));
const __VLS_165 = __VLS_164({
    modelValue: (__VLS_ctx.createForm.status),
    items: (__VLS_ctx.statusOptions.filter((item) => item.value !== null)),
    itemTitle: "label",
    itemValue: "value",
    label: "Status",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_164));
const __VLS_167 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_168 = __VLS_asFunctionalComponent(__VLS_167, new __VLS_167({
    modelValue: (__VLS_ctx.createForm.category),
    label: "Category",
    variant: "outlined",
}));
const __VLS_169 = __VLS_168({
    modelValue: (__VLS_ctx.createForm.category),
    label: "Category",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_168));
const __VLS_171 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
    modelValue: (__VLS_ctx.createForm.probability),
    modelModifiers: { number: true, },
    type: "number",
    min: "1",
    max: "5",
    label: "Probability (1~5)",
    variant: "outlined",
}));
const __VLS_173 = __VLS_172({
    modelValue: (__VLS_ctx.createForm.probability),
    modelModifiers: { number: true, },
    type: "number",
    min: "1",
    max: "5",
    label: "Probability (1~5)",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_172));
const __VLS_175 = {}.VTextField;
/** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
// @ts-ignore
const __VLS_176 = __VLS_asFunctionalComponent(__VLS_175, new __VLS_175({
    modelValue: (__VLS_ctx.createForm.impact),
    modelModifiers: { number: true, },
    type: "number",
    min: "1",
    max: "5",
    label: "Impact (1~5)",
    variant: "outlined",
}));
const __VLS_177 = __VLS_176({
    modelValue: (__VLS_ctx.createForm.impact),
    modelModifiers: { number: true, },
    type: "number",
    min: "1",
    max: "5",
    label: "Impact (1~5)",
    variant: "outlined",
}, ...__VLS_functionalComponentArgsRest(__VLS_176));
if (__VLS_ctx.createErrorMessage) {
    const __VLS_179 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        type: "error",
        variant: "tonal",
    }));
    const __VLS_181 = __VLS_180({
        type: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    __VLS_182.slots.default;
    (__VLS_ctx.createErrorMessage);
    var __VLS_182;
}
var __VLS_154;
const __VLS_183 = {}.VCardActions;
/** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
// @ts-ignore
const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_185 = __VLS_184({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_184));
__VLS_186.slots.default;
const __VLS_187 = {}.VSpacer;
/** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
// @ts-ignore
const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({}));
const __VLS_189 = __VLS_188({}, ...__VLS_functionalComponentArgsRest(__VLS_188));
const __VLS_191 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.createSubmitting),
}));
const __VLS_193 = __VLS_192({
    ...{ 'onClick': {} },
    variant: "text",
    disabled: (__VLS_ctx.createSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_192));
let __VLS_195;
let __VLS_196;
let __VLS_197;
const __VLS_198 = {
    onClick: (__VLS_ctx.closeCreateDialog)
};
__VLS_194.slots.default;
var __VLS_194;
const __VLS_199 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_200 = __VLS_asFunctionalComponent(__VLS_199, new __VLS_199({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.createSubmitting),
    disabled: (__VLS_ctx.createSubmitting),
}));
const __VLS_201 = __VLS_200({
    ...{ 'onClick': {} },
    color: "primary",
    loading: (__VLS_ctx.createSubmitting),
    disabled: (__VLS_ctx.createSubmitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_200));
let __VLS_203;
let __VLS_204;
let __VLS_205;
const __VLS_206 = {
    onClick: (__VLS_ctx.submitCreate)
};
__VLS_202.slots.default;
var __VLS_202;
var __VLS_186;
var __VLS_146;
var __VLS_142;
/** @type {__VLS_StyleScopedClasses['risk-register']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-title']} */ ;
/** @type {__VLS_StyleScopedClasses['filters']} */ ;
/** @type {__VLS_StyleScopedClasses['risk-table']} */ ;
/** @type {__VLS_StyleScopedClasses['title-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['pager']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['create-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RiskMatrixSummary: RiskMatrixSummary,
            riskStore: riskStore,
            projectId: projectId,
            projectName: projectName,
            statusModel: statusModel,
            levelBucketModel: levelBucketModel,
            probabilityModel: probabilityModel,
            impactModel: impactModel,
            ownerFilterModel: ownerFilterModel,
            keywordModel: keywordModel,
            createDialogOpen: createDialogOpen,
            createSubmitting: createSubmitting,
            createErrorMessage: createErrorMessage,
            createForm: createForm,
            headers: headers,
            statusOptions: statusOptions,
            levelBucketOptions: levelBucketOptions,
            ownerOptions: ownerOptions,
            openRiskCount: openRiskCount,
            highCriticalCount: highCriticalCount,
            levelColor: levelColor,
            applyFilters: applyFilters,
            onMatrixCellSelect: onMatrixCellSelect,
            clearMatrixFilter: clearMatrixFilter,
            goPrev: goPrev,
            goNext: goNext,
            onRowClick: onRowClick,
            openCreateDialog: openCreateDialog,
            closeCreateDialog: closeCreateDialog,
            submitCreate: submitCreate,
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
