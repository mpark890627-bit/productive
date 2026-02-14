import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { extractErrorMessage } from '../../api/apiClient';
import { createProjectContact, deleteProjectContact, getProjectContacts, updateProjectContact, } from '../../api/projectContacts';
import { getProjectById } from '../../api/projects';
const route = useRoute();
const router = useRouter();
const project = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const contacts = ref([]);
const contactsLoading = ref(false);
const contactsErrorMessage = ref('');
const createSubmitting = ref(false);
const createErrorMessage = ref('');
const createDialogOpen = ref(false);
const editingId = ref(null);
const editingSubmit = ref(false);
const createForm = reactive({
    name: '',
    role: '',
    email: '',
    phone: '',
    memo: '',
});
const editForm = reactive({
    name: '',
    role: '',
    email: '',
    phone: '',
    memo: '',
});
const projectId = route.params.id;
const optionalValue = (value) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
};
const loadProject = async () => {
    try {
        loading.value = true;
        errorMessage.value = '';
        project.value = await getProjectById(projectId);
    }
    catch {
        errorMessage.value = '프로젝트 정보를 불러오지 못했습니다.';
    }
    finally {
        loading.value = false;
    }
};
const loadContacts = async () => {
    try {
        contactsLoading.value = true;
        contactsErrorMessage.value = '';
        contacts.value = await getProjectContacts(projectId);
    }
    catch (error) {
        contactsErrorMessage.value = extractErrorMessage(error, '담당자 연락처를 불러오지 못했습니다.');
    }
    finally {
        contactsLoading.value = false;
    }
};
const resetCreateForm = () => {
    createForm.name = '';
    createForm.role = '';
    createForm.email = '';
    createForm.phone = '';
    createForm.memo = '';
};
const openCreateModal = () => {
    createErrorMessage.value = '';
    resetCreateForm();
    createDialogOpen.value = true;
};
const closeCreateModal = () => {
    if (createSubmitting.value) {
        return;
    }
    createDialogOpen.value = false;
};
const submitCreate = async () => {
    try {
        createSubmitting.value = true;
        createErrorMessage.value = '';
        const created = await createProjectContact(projectId, {
            name: createForm.name.trim(),
            role: optionalValue(createForm.role),
            email: optionalValue(createForm.email),
            phone: optionalValue(createForm.phone),
            memo: optionalValue(createForm.memo),
        });
        contacts.value = [created, ...contacts.value];
        resetCreateForm();
        createDialogOpen.value = false;
    }
    catch (error) {
        createErrorMessage.value = extractErrorMessage(error, '연락처 추가에 실패했습니다.');
    }
    finally {
        createSubmitting.value = false;
    }
};
const startEdit = (contactId) => {
    const target = contacts.value.find((contact) => contact.id === contactId);
    if (!target) {
        return;
    }
    editingId.value = contactId;
    editForm.name = target.name;
    editForm.role = target.role ?? '';
    editForm.email = target.email ?? '';
    editForm.phone = target.phone ?? '';
    editForm.memo = target.memo ?? '';
};
const cancelEdit = () => {
    editingId.value = null;
};
const submitEdit = async (contactId) => {
    try {
        editingSubmit.value = true;
        const updated = await updateProjectContact(projectId, contactId, {
            name: editForm.name.trim(),
            role: optionalValue(editForm.role),
            email: optionalValue(editForm.email),
            phone: optionalValue(editForm.phone),
            memo: optionalValue(editForm.memo),
        });
        contacts.value = contacts.value.map((contact) => contact.id === contactId ? updated : contact);
        editingId.value = null;
    }
    catch (error) {
        contactsErrorMessage.value = extractErrorMessage(error, '연락처 수정에 실패했습니다.');
    }
    finally {
        editingSubmit.value = false;
    }
};
const removeContact = async (contactId) => {
    const ok = window.confirm('이 연락처를 삭제하시겠습니까?');
    if (!ok) {
        return;
    }
    try {
        await deleteProjectContact(projectId, contactId);
        contacts.value = contacts.value.filter((contact) => contact.id !== contactId);
    }
    catch (error) {
        contactsErrorMessage.value = extractErrorMessage(error, '연락처 삭제에 실패했습니다.');
    }
};
const goBoard = () => {
    router.push(`/app/projects/${projectId}/board`);
};
const goTemplates = () => {
    router.push(`/app/projects/${projectId}/templates`);
};
const goRisks = () => {
    router.push(`/app/projects/${projectId}/risks`);
};
const formatDate = (dateTime) => new Date(dateTime).toLocaleString();
onMounted(async () => {
    await loadProject();
    await loadContacts();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['meta']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts-table']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts-table']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "card detail" },
});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
else if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "error" },
    });
    (__VLS_ctx.errorMessage);
}
else if (__VLS_ctx.project) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "detail-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.project.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.project.description || '설명이 없습니다.');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goBoard) },
        type: "button",
        ...{ class: "primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goRisks) },
        type: "button",
        ...{ class: "ghost" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.goTemplates) },
        type: "button",
        ...{ class: "ghost" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.dl, __VLS_intrinsicElements.dl)({
        ...{ class: "meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.dt, __VLS_intrinsicElements.dt)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.dd, __VLS_intrinsicElements.dd)({});
    (__VLS_ctx.formatDate(__VLS_ctx.project.createdAt));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.dt, __VLS_intrinsicElements.dt)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.dd, __VLS_intrinsicElements.dd)({});
    (__VLS_ctx.formatDate(__VLS_ctx.project.updatedAt));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "contacts-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "contacts-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "contacts-header-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.loadContacts) },
        type: "button",
        ...{ class: "ghost" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openCreateModal) },
        type: "button",
        ...{ class: "primary" },
    });
    if (__VLS_ctx.contactsLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "muted" },
        });
    }
    else if (__VLS_ctx.contactsErrorMessage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "error" },
        });
        (__VLS_ctx.contactsErrorMessage);
    }
    else if (__VLS_ctx.contacts.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
            ...{ class: "contacts-table" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
        for (const [contact] of __VLS_getVForSourceType((__VLS_ctx.contacts))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                key: (contact.id),
            });
            if (__VLS_ctx.editingId === contact.id) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    placeholder: "이름",
                });
                (__VLS_ctx.editForm.name);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    placeholder: "역할",
                });
                (__VLS_ctx.editForm.role);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    placeholder: "email@company.com",
                });
                (__VLS_ctx.editForm.email);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    placeholder: "010-0000-0000",
                });
                (__VLS_ctx.editForm.phone);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    placeholder: "메모",
                });
                (__VLS_ctx.editForm.memo);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                    ...{ class: "actions" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!!(__VLS_ctx.errorMessage))
                                return;
                            if (!(__VLS_ctx.project))
                                return;
                            if (!!(__VLS_ctx.contactsLoading))
                                return;
                            if (!!(__VLS_ctx.contactsErrorMessage))
                                return;
                            if (!(__VLS_ctx.contacts.length))
                                return;
                            if (!(__VLS_ctx.editingId === contact.id))
                                return;
                            __VLS_ctx.submitEdit(contact.id);
                        } },
                    type: "button",
                    ...{ class: "primary" },
                    disabled: (__VLS_ctx.editingSubmit),
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (__VLS_ctx.cancelEdit) },
                    type: "button",
                    disabled: (__VLS_ctx.editingSubmit),
                });
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (contact.name);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (contact.role || '-');
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (contact.email || '-');
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (contact.phone || '-');
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
                (contact.memo || '-');
                __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
                    ...{ class: "actions" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!!(__VLS_ctx.errorMessage))
                                return;
                            if (!(__VLS_ctx.project))
                                return;
                            if (!!(__VLS_ctx.contactsLoading))
                                return;
                            if (!!(__VLS_ctx.contactsErrorMessage))
                                return;
                            if (!(__VLS_ctx.contacts.length))
                                return;
                            if (!!(__VLS_ctx.editingId === contact.id))
                                return;
                            __VLS_ctx.startEdit(contact.id);
                        } },
                    type: "button",
                    ...{ class: "icon-btn" },
                    title: "수정",
                    'aria-label': "연락처 수정",
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
                    ...{ class: "mdi mdi-pencil-outline" },
                    'aria-hidden': "true",
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                return;
                            if (!!(__VLS_ctx.errorMessage))
                                return;
                            if (!(__VLS_ctx.project))
                                return;
                            if (!!(__VLS_ctx.contactsLoading))
                                return;
                            if (!!(__VLS_ctx.contactsErrorMessage))
                                return;
                            if (!(__VLS_ctx.contacts.length))
                                return;
                            if (!!(__VLS_ctx.editingId === contact.id))
                                return;
                            __VLS_ctx.removeContact(contact.id);
                        } },
                    type: "button",
                    ...{ class: "icon-btn danger" },
                    title: "삭제",
                    'aria-label': "연락처 삭제",
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.i)({
                    ...{ class: "mdi mdi-trash-can-outline" },
                    'aria-hidden': "true",
                });
            }
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "muted" },
        });
    }
    const __VLS_0 = {}.VDialog;
    /** @type {[typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, typeof __VLS_components.VDialog, typeof __VLS_components.vDialog, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.createDialogOpen),
        maxWidth: "680",
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.createDialogOpen),
        maxWidth: "680",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    const __VLS_4 = {}.VCard;
    /** @type {[typeof __VLS_components.VCard, typeof __VLS_components.vCard, typeof __VLS_components.VCard, typeof __VLS_components.vCard, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.VCardTitle;
    /** @type {[typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, typeof __VLS_components.VCardTitle, typeof __VLS_components.vCardTitle, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ class: "pt-5 px-5" },
    }));
    const __VLS_10 = __VLS_9({
        ...{ class: "pt-5 px-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    var __VLS_11;
    const __VLS_12 = {}.VCardText;
    /** @type {[typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, typeof __VLS_components.VCardText, typeof __VLS_components.vCardText, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ class: "px-5" },
    }));
    const __VLS_14 = __VLS_13({
        ...{ class: "px-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.submitCreate) },
        ...{ class: "create-form-modal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "이름 *",
        required: true,
        maxlength: "120",
        disabled: (__VLS_ctx.createSubmitting),
    });
    (__VLS_ctx.createForm.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "역할",
        maxlength: "120",
        disabled: (__VLS_ctx.createSubmitting),
    });
    (__VLS_ctx.createForm.role);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "email",
        placeholder: "email@company.com",
        maxlength: "255",
        disabled: (__VLS_ctx.createSubmitting),
    });
    (__VLS_ctx.createForm.email);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "전화번호",
        maxlength: "50",
        disabled: (__VLS_ctx.createSubmitting),
    });
    (__VLS_ctx.createForm.phone);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        placeholder: "메모",
        maxlength: "2000",
        disabled: (__VLS_ctx.createSubmitting),
    });
    (__VLS_ctx.createForm.memo);
    if (__VLS_ctx.createErrorMessage) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "error" },
        });
        (__VLS_ctx.createErrorMessage);
    }
    var __VLS_15;
    const __VLS_16 = {}.VCardActions;
    /** @type {[typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, typeof __VLS_components.VCardActions, typeof __VLS_components.vCardActions, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ class: "px-5 pb-5" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "px-5 pb-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.VSpacer;
    /** @type {[typeof __VLS_components.VSpacer, typeof __VLS_components.vSpacer, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_24 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        variant: "text",
        disabled: (__VLS_ctx.createSubmitting),
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        variant: "text",
        disabled: (__VLS_ctx.createSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.closeCreateModal)
    };
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_32 = {}.VBtn;
    /** @type {[typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, typeof __VLS_components.VBtn, typeof __VLS_components.vBtn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        color: "primary",
        loading: (__VLS_ctx.createSubmitting),
        disabled: (__VLS_ctx.createSubmitting),
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        color: "primary",
        loading: (__VLS_ctx.createSubmitting),
        disabled: (__VLS_ctx.createSubmitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.submitCreate)
    };
    __VLS_35.slots.default;
    var __VLS_35;
    var __VLS_19;
    var __VLS_7;
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['meta']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts-header']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts-header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ghost']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['contacts-table']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['mdi']} */ ;
/** @type {__VLS_StyleScopedClasses['mdi-pencil-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['mdi']} */ ;
/** @type {__VLS_StyleScopedClasses['mdi-trash-can-outline']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['create-form-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['error']} */ ;
/** @type {__VLS_StyleScopedClasses['px-5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            project: project,
            loading: loading,
            errorMessage: errorMessage,
            contacts: contacts,
            contactsLoading: contactsLoading,
            contactsErrorMessage: contactsErrorMessage,
            createSubmitting: createSubmitting,
            createErrorMessage: createErrorMessage,
            createDialogOpen: createDialogOpen,
            editingId: editingId,
            editingSubmit: editingSubmit,
            createForm: createForm,
            editForm: editForm,
            loadContacts: loadContacts,
            openCreateModal: openCreateModal,
            closeCreateModal: closeCreateModal,
            submitCreate: submitCreate,
            startEdit: startEdit,
            cancelEdit: cancelEdit,
            submitEdit: submitEdit,
            removeContact: removeContact,
            goBoard: goBoard,
            goTemplates: goTemplates,
            goRisks: goRisks,
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
