import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { extractErrorMessage } from '../api/apiClient';
import { getTasksSummary, listTasksGlobal } from '../api/tasks';
export const useTasksListStore = defineStore('tasksList', () => {
    const filters = reactive({
        projectId: null,
        status: null,
        priority: null,
        assigneeUserId: null,
        dueFrom: null,
        dueTo: null,
        keyword: '',
    });
    const page = ref(0);
    const size = ref(20);
    const totalPages = ref(0);
    const totalElements = ref(0);
    const sortField = ref('updatedAt');
    const sortDir = ref('desc');
    const loading = ref(false);
    const errorMessage = ref('');
    const items = ref([]);
    const summary = ref(null);
    const summaryLoading = ref(false);
    let debounceTimer = null;
    const sort = computed(() => `${sortField.value},${sortDir.value}`);
    const fetch = async () => {
        try {
            loading.value = true;
            errorMessage.value = '';
            const result = await listTasksGlobal({
                page: page.value,
                size: size.value,
                sort: sort.value,
                projectId: filters.projectId ?? undefined,
                status: filters.status ?? undefined,
                priority: filters.priority ?? undefined,
                assigneeUserId: filters.assigneeUserId ?? undefined,
                dueFrom: filters.dueFrom ?? undefined,
                dueTo: filters.dueTo ?? undefined,
                keyword: filters.keyword.trim() || undefined,
            });
            items.value = result.content;
            totalPages.value = result.totalPages;
            totalElements.value = result.totalElements;
        }
        catch (error) {
            errorMessage.value = extractErrorMessage(error, '태스크 목록을 불러오지 못했습니다.');
        }
        finally {
            loading.value = false;
        }
    };
    const fetchSummary = async () => {
        try {
            summaryLoading.value = true;
            summary.value = await getTasksSummary(filters.projectId ?? undefined);
        }
        finally {
            summaryLoading.value = false;
        }
    };
    const applyFilters = async (next) => {
        Object.assign(filters, next);
        page.value = 0;
        await fetch();
    };
    const setKeywordDebounced = (keyword, delay = 300) => {
        filters.keyword = keyword;
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            page.value = 0;
            void fetch();
        }, delay);
    };
    const setPage = async (nextPage) => {
        page.value = nextPage;
        await fetch();
    };
    const setSort = async (field, dir) => {
        sortField.value = field;
        sortDir.value = dir;
        page.value = 0;
        await fetch();
    };
    const resetFilters = async () => {
        filters.projectId = null;
        filters.status = null;
        filters.priority = null;
        filters.assigneeUserId = null;
        filters.dueFrom = null;
        filters.dueTo = null;
        filters.keyword = '';
        page.value = 0;
        await fetch();
    };
    return {
        filters,
        page,
        size,
        totalPages,
        totalElements,
        sortField,
        sortDir,
        sort,
        loading,
        errorMessage,
        items,
        summary,
        summaryLoading,
        fetch,
        fetchSummary,
        applyFilters,
        setKeywordDebounced,
        setPage,
        setSort,
        resetFilters,
    };
});
