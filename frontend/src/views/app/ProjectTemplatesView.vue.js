import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { extractErrorMessage } from '../../api/apiClient';
import { getProjectById } from '../../api/projects';
import { applyTaskTemplateToProject, getTaskTemplateById, getTaskTemplates, } from '../../api/taskTemplates';
const route = useRoute();
const projectId = route.params.id;
const loading = ref(false);
const applying = ref(false);
const errorMessage = ref('');
const project = ref(null);
const templates = ref([]);
const selectedTemplateId = ref(null);
const selectedTemplate = ref(null);
const baseDate = ref(new Date().toISOString().slice(0, 10));
const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
});
const templateOptions = computed(() => templates.value.map((template) => ({
    title: template.name,
    value: template.id,
})));
const showSnackbar = (message, color = 'success') => {
    snackbar.show = false;
    snackbar.message = message;
    snackbar.color = color;
    setTimeout(() => {
        snackbar.show = true;
    }, 10);
};
const loadData = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        const [projectData, templatePage] = await Promise.all([
            getProjectById(projectId),
            getTaskTemplates({ page: 0, size: 100, sort: 'updatedAt,desc' }),
        ]);
        project.value = projectData;
        templates.value = templatePage.data;
        if (!selectedTemplateId.value && templatePage.data.length > 0) {
            selectedTemplateId.value = templatePage.data[0].id;
        }
    }
    catch (error) {
        errorMessage.value = extractErrorMessage(error, '템플릿 적용 데이터를 불러오지 못했습니다.');
    }
    finally {
        loading.value = false;
    }
};
const loadSelectedTemplateDetail = async () => {
    if (!selectedTemplateId.value) {
        selectedTemplate.value = null;
        return;
    }
    try {
        selectedTemplate.value = await getTaskTemplateById(selectedTemplateId.value);
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, '템플릿 상세를 불러오지 못했습니다.'), 'error');
    }
};
const applyTemplate = async () => {
    if (!selectedTemplateId.value) {
        return;
    }
    try {
        applying.value = true;
        const result = await applyTaskTemplateToProject(projectId, selectedTemplateId.value, {
            baseDate: baseDate.value || undefined,
        });
        showSnackbar(`템플릿 적용 완료: ${result.createdCount}개 태스크 생성`);
    }
    catch (error) {
        showSnackbar(extractErrorMessage(error, '템플릿 적용에 실패했습니다.'), 'error');
    }
    finally {
        applying.value = false;
    }
};
watch(selectedTemplateId, async () => {
    await loadSelectedTemplateDetail();
});
onMounted(async () => {
    await loadData();
    await loadSelectedTemplateDetail();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "project-templates-view" },
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
(__VLS_ctx.project?.name || '프로젝트 로딩 중...');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_4 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}`),
}));
const __VLS_6 = __VLS_5({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}`),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
const __VLS_8 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/board`),
}));
const __VLS_10 = __VLS_9({
    variant: "outlined",
    to: (`/app/projects/${__VLS_ctx.projectId}/board`),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
var __VLS_3;
if (__VLS_ctx.errorMessage) {
    const __VLS_12 = {}.VAlert;
    /** @type {[typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, typeof __VLS_components.VAlert, typeof __VLS_components.vAlert, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        type: "error",
        variant: "tonal",
    }));
    const __VLS_14 = __VLS_13({
        type: "error",
        variant: "tonal",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    (__VLS_ctx.errorMessage);
    var __VLS_15;
}
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
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ class: "pt-5" },
}));
const __VLS_22 = __VLS_21({
    ...{ class: "pt-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
if (__VLS_ctx.loading) {
    const __VLS_24 = {}.VSkeletonLoader;
    /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        type: "article, list-item-two-line@3",
    }));
    const __VLS_26 = __VLS_25({
        type: "article, list-item-two-line@3",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    const __VLS_28 = {}.VSelect;
    /** @type {[typeof __VLS_components.VSelect, typeof __VLS_components.vSelect, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        modelValue: (__VLS_ctx.selectedTemplateId),
        items: (__VLS_ctx.templateOptions),
        itemTitle: "title",
        itemValue: "value",
        label: "템플릿 선택",
        variant: "outlined",
        density: "comfortable",
        disabled: (__VLS_ctx.applying),
    }));
    const __VLS_30 = __VLS_29({
        modelValue: (__VLS_ctx.selectedTemplateId),
        items: (__VLS_ctx.templateOptions),
        itemTitle: "title",
        itemValue: "value",
        label: "템플릿 선택",
        variant: "outlined",
        density: "comfortable",
        disabled: (__VLS_ctx.applying),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_32 = {}.VTextField;
    /** @type {[typeof __VLS_components.VTextField, typeof __VLS_components.vTextField, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        modelValue: (__VLS_ctx.baseDate),
        type: "date",
        label: "기준일(baseDate)",
        variant: "outlined",
        density: "comfortable",
        disabled: (__VLS_ctx.applying),
    }));
    const __VLS_34 = __VLS_33({
        modelValue: (__VLS_ctx.baseDate),
        type: "date",
        label: "기준일(baseDate)",
        variant: "outlined",
        density: "comfortable",
        disabled: (__VLS_ctx.applying),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "apply-actions" },
    });
    const __VLS_36 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        color: "primary",
        prependIcon: "mdi-playlist-plus",
        loading: (__VLS_ctx.applying),
        disabled: (!__VLS_ctx.selectedTemplateId || __VLS_ctx.applying),
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        color: "primary",
        prependIcon: "mdi-playlist-plus",
        loading: (__VLS_ctx.applying),
        disabled: (!__VLS_ctx.selectedTemplateId || __VLS_ctx.applying),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (__VLS_ctx.applyTemplate)
    };
    __VLS_39.slots.default;
    var __VLS_39;
    const __VLS_44 = {}.VDivider;
    /** @type {[typeof __VLS_components.VDivider, typeof __VLS_components.vDivider, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ class: "my-4" },
    }));
    const __VLS_46 = __VLS_45({
        ...{ class: "my-4" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    if (__VLS_ctx.selectedTemplate) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "preview" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "preview-desc" },
        });
        (__VLS_ctx.selectedTemplate.description || '설명 없음');
        const __VLS_48 = {}.VList;
        /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            lines: "two",
        }));
        const __VLS_50 = __VLS_49({
            lines: "two",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.selectedTemplate.items))) {
            const __VLS_52 = {}.VListItem;
            /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                key: (item.id),
                rounded: "lg",
                ...{ class: "preview-item" },
            }));
            const __VLS_54 = __VLS_53({
                key: (item.id),
                rounded: "lg",
                ...{ class: "preview-item" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            __VLS_55.slots.default;
            {
                const { title: __VLS_thisSlot } = __VLS_55.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-title-row" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (item.title);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chips" },
                });
                const __VLS_56 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                    size: "small",
                    variant: "outlined",
                }));
                const __VLS_58 = __VLS_57({
                    size: "small",
                    variant: "outlined",
                }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                __VLS_59.slots.default;
                (item.defaultStatus);
                var __VLS_59;
                const __VLS_60 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                    size: "small",
                    variant: "tonal",
                }));
                const __VLS_62 = __VLS_61({
                    size: "small",
                    variant: "tonal",
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                __VLS_63.slots.default;
                (item.defaultPriority);
                var __VLS_63;
                const __VLS_64 = {}.VChip;
                /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                    size: "small",
                    variant: "tonal",
                }));
                const __VLS_66 = __VLS_65({
                    size: "small",
                    variant: "tonal",
                }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                __VLS_67.slots.default;
                (item.defaultAssignee);
                var __VLS_67;
            }
            {
                const { subtitle: __VLS_thisSlot } = __VLS_55.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "item-subtitle" },
                });
                (item.description || '설명 없음');
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "offset" },
                });
                (item.dueOffsetDays == null ? 'D+N 없음' : `D+${item.dueOffsetDays}`);
            }
            var __VLS_55;
        }
        var __VLS_51;
    }
}
var __VLS_23;
var __VLS_19;
const __VLS_68 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    location: "bottom right",
    timeout: "3000",
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.snackbar.show),
    color: (__VLS_ctx.snackbar.color),
    location: "bottom right",
    timeout: "3000",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
(__VLS_ctx.snackbar.message);
var __VLS_71;
/** @type {__VLS_StyleScopedClasses['project-templates-view']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['apply-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['my-4']} */ ;
/** @type {__VLS_StyleScopedClasses['preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chips']} */ ;
/** @type {__VLS_StyleScopedClasses['item-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['offset']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            projectId: projectId,
            loading: loading,
            applying: applying,
            errorMessage: errorMessage,
            project: project,
            selectedTemplateId: selectedTemplateId,
            selectedTemplate: selectedTemplate,
            baseDate: baseDate,
            snackbar: snackbar,
            templateOptions: templateOptions,
            applyTemplate: applyTemplate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
