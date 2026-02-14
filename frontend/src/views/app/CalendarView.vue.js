import { computed, onMounted, ref } from 'vue';
import { extractErrorMessage } from '../../api/apiClient';
import { getProjects } from '../../api/projects';
import { getProjectTasks } from '../../api/tasks';
import EmptyState from '../../components/common/EmptyState.vue';
const loading = ref(false);
const errorMessage = ref('');
const events = ref([]);
const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const currentMonth = ref(new Date());
const selectedDate = ref(formatLocalDate(new Date()));
const monthStart = computed(() => {
    const d = new Date(currentMonth.value);
    d.setDate(1);
    return d;
});
const monthEnd = computed(() => {
    const d = new Date(currentMonth.value);
    d.setMonth(d.getMonth() + 1, 0);
    return d;
});
const monthLabel = computed(() => monthStart.value.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }));
const selectedDateEvents = computed(() => events.value
    .filter((event) => event.dueDate === selectedDate.value)
    .sort((a, b) => a.title.localeCompare(b.title)));
const eventDates = computed(() => [...new Set(events.value.map((event) => event.dueDate).filter(Boolean))]);
const overdueCount = computed(() => {
    const today = formatLocalDate(new Date());
    return events.value.filter((event) => event.dueDate && event.dueDate < today && event.status !== 'DONE').length;
});
const dueSoonCount = computed(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const plus3 = new Date(today);
    plus3.setDate(plus3.getDate() + 3);
    const from = formatLocalDate(today);
    const to = formatLocalDate(plus3);
    return events.value.filter((event) => event.dueDate && event.dueDate >= from && event.dueDate <= to).length;
});
const onDateChanged = (value) => {
    if (typeof value === 'string') {
        selectedDate.value = value;
        return;
    }
    if (value instanceof Date) {
        selectedDate.value = formatLocalDate(value);
    }
};
const loadCalendar = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        events.value = [];
        const projectsPage = await getProjects({ page: 0, size: 200, sort: 'name,asc' });
        const from = formatLocalDate(monthStart.value);
        const to = formatLocalDate(monthEnd.value);
        const projectTasks = await Promise.all(projectsPage.content.map(async (project) => {
            const page = await getProjectTasks(project.id, {
                page: 0,
                size: 300,
                sort: 'dueDate,asc',
                dueFrom: from,
                dueTo: to,
            });
            return page.content
                .filter((task) => task.dueDate)
                .map((task) => ({
                ...task,
                projectName: project.name,
            }));
        }));
        events.value = projectTasks.flat();
        if (!events.value.some((event) => event.dueDate === selectedDate.value)) {
            selectedDate.value = eventDates.value[0] ?? from;
        }
    }
    catch (error) {
        errorMessage.value = extractErrorMessage(error, '캘린더 데이터를 불러오지 못했습니다.');
    }
    finally {
        loading.value = false;
    }
};
const moveMonth = async (delta) => {
    const next = new Date(currentMonth.value);
    next.setMonth(next.getMonth() + delta, 1);
    currentMonth.value = next;
    selectedDate.value = formatLocalDate(monthStart.value);
    await loadCalendar();
};
onMounted(loadCalendar);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "calendar-view" },
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
    prependIcon: "mdi-chevron-left",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-chevron-left",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.moveMonth(-1);
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
    prependIcon: "mdi-chevron-right",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-chevron-right",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.moveMonth(1);
    }
};
__VLS_15.slots.default;
var __VLS_15;
const __VLS_20 = {}.VBtn;
/** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    variant: "outlined",
    prependIcon: "mdi-refresh",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (__VLS_ctx.loadCalendar)
};
__VLS_23.slots.default;
var __VLS_23;
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
const __VLS_32 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    rounded: "lg",
    elevation: "1",
    ...{ class: "month-summary" },
}));
const __VLS_34 = __VLS_33({
    rounded: "lg",
    elevation: "1",
    ...{ class: "month-summary" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.monthLabel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.events.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chips" },
});
const __VLS_36 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    color: "error",
    variant: "tonal",
}));
const __VLS_38 = __VLS_37({
    color: "error",
    variant: "tonal",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
(__VLS_ctx.overdueCount);
var __VLS_39;
const __VLS_40 = {}.VChip;
/** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    color: "warning",
    variant: "tonal",
}));
const __VLS_42 = __VLS_41({
    color: "warning",
    variant: "tonal",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
(__VLS_ctx.dueSoonCount);
var __VLS_43;
var __VLS_35;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "content-grid" },
});
const __VLS_44 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    rounded: "lg",
    elevation: "1",
    ...{ class: "date-card" },
}));
const __VLS_46 = __VLS_45({
    rounded: "lg",
    elevation: "1",
    ...{ class: "date-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.VDatePicker;
/** @type {[typeof __VLS_components.VDatePicker, typeof __VLS_components.vDatePicker, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.selectedDate),
    title: (__VLS_ctx.monthLabel),
    color: "primary",
    events: (__VLS_ctx.eventDates),
    eventColor: "primary",
}));
const __VLS_54 = __VLS_53({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.selectedDate),
    title: (__VLS_ctx.monthLabel),
    color: "primary",
    events: (__VLS_ctx.eventDates),
    eventColor: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_56;
let __VLS_57;
let __VLS_58;
const __VLS_59 = {
    'onUpdate:modelValue': (__VLS_ctx.onDateChanged)
};
var __VLS_55;
var __VLS_51;
var __VLS_47;
const __VLS_60 = {}.VCard;
/** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    rounded: "lg",
    elevation: "1",
    ...{ class: "schedule-card" },
}));
const __VLS_62 = __VLS_61({
    rounded: "lg",
    elevation: "1",
    ...{ class: "schedule-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.VCardTitle;
/** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ class: "pt-5 px-5" },
}));
const __VLS_66 = __VLS_65({
    ...{ class: "pt-5 px-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
(__VLS_ctx.selectedDate);
var __VLS_67;
const __VLS_68 = {}.VCardText;
/** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ class: "px-5 pb-5" },
}));
const __VLS_70 = __VLS_69({
    ...{ class: "px-5 pb-5" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
if (__VLS_ctx.loading) {
    const __VLS_72 = {}.VSkeletonLoader;
    /** @type {[typeof __VLS_components.VSkeletonLoader, typeof __VLS_components.vSkeletonLoader, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        type: "list-item-three-line@4",
    }));
    const __VLS_74 = __VLS_73({
        type: "list-item-three-line@4",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
else if (__VLS_ctx.selectedDateEvents.length === 0) {
    /** @type {[typeof EmptyState, ]} */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(EmptyState, new EmptyState({
        title: "일정이 없습니다",
        description: "선택한 날짜에는 마감 태스크가 없습니다.",
        icon: "mdi-calendar-blank-outline",
    }));
    const __VLS_77 = __VLS_76({
        title: "일정이 없습니다",
        description: "선택한 날짜에는 마감 태스크가 없습니다.",
        icon: "mdi-calendar-blank-outline",
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
}
else {
    const __VLS_79 = {}.VList;
    /** @type {[typeof __VLS_components.VList, typeof __VLS_components.vList, typeof __VLS_components.VList, typeof __VLS_components.vList, ]} */ ;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        lines: "two",
    }));
    const __VLS_81 = __VLS_80({
        lines: "two",
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    __VLS_82.slots.default;
    for (const [event] of __VLS_getVForSourceType((__VLS_ctx.selectedDateEvents))) {
        const __VLS_83 = {}.VListItem;
        /** @type {[typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, typeof __VLS_components.VListItem, typeof __VLS_components.vListItem, ]} */ ;
        // @ts-ignore
        const __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({
            key: (event.id),
            rounded: "lg",
            ...{ class: "event-item" },
        }));
        const __VLS_85 = __VLS_84({
            key: (event.id),
            rounded: "lg",
            ...{ class: "event-item" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_84));
        __VLS_86.slots.default;
        {
            const { title: __VLS_thisSlot } = __VLS_86.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "title-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (event.title);
            const __VLS_87 = {}.VChip;
            /** @type {[typeof __VLS_components.VChip, typeof __VLS_components.vChip, typeof __VLS_components.VChip, typeof __VLS_components.vChip, ]} */ ;
            // @ts-ignore
            const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
                size: "small",
                variant: "outlined",
            }));
            const __VLS_89 = __VLS_88({
                size: "small",
                variant: "outlined",
            }, ...__VLS_functionalComponentArgsRest(__VLS_88));
            __VLS_90.slots.default;
            (event.priority);
            var __VLS_90;
        }
        {
            const { subtitle: __VLS_thisSlot } = __VLS_86.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "subtitle" },
            });
            (event.projectName);
            (event.status);
        }
        var __VLS_86;
    }
    var __VLS_82;
}
var __VLS_71;
var __VLS_63;
/** @type {__VLS_StyleScopedClasses['calendar-view']} */ ;
/** @type {__VLS_StyleScopedClasses['header-card']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['month-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chips']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['date-card']} */ ;
/** @type {__VLS_StyleScopedClasses['schedule-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['event-item']} */ ;
/** @type {__VLS_StyleScopedClasses['title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            EmptyState: EmptyState,
            loading: loading,
            errorMessage: errorMessage,
            events: events,
            selectedDate: selectedDate,
            monthLabel: monthLabel,
            selectedDateEvents: selectedDateEvents,
            eventDates: eventDates,
            overdueCount: overdueCount,
            dueSoonCount: dueSoonCount,
            onDateChanged: onDateChanged,
            loadCalendar: loadCalendar,
            moveMonth: moveMonth,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
