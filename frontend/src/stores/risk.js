import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { createRisk, getRiskMatrixSummary, getRiskSummary, listRisks } from '../api/risks';
import { useAuthStore } from './auth';
const defaultFilters = () => ({
    status: null,
    levelBucket: null,
    probability: null,
    impact: null,
    ownerFilter: 'ALL',
    keyword: '',
    tagId: null,
    sort: 'updatedAt,desc',
});
export const useRiskStore = defineStore('risk', () => {
    const authStore = useAuthStore();
    const projectId = ref(null);
    const risks = ref([]);
    const summary = ref(null);
    const summaryCache = ref({});
    const matrix = ref([]);
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(0);
    const totalElements = ref(0);
    const loadingList = ref(false);
    const loadingSummary = ref(false);
    const listError = ref('');
    const summaryError = ref('');
    const filters = reactive(defaultFilters());
    const effectiveOwnerUserId = computed(() => {
        if (filters.ownerFilter !== 'ME') {
            return undefined;
        }
        return authStore.user?.userId;
    });
    const visibleRisks = computed(() => {
        if (filters.ownerFilter !== 'UNASSIGNED') {
            return risks.value;
        }
        return risks.value.filter((risk) => !risk.ownerUserId);
    });
    const setProject = (nextProjectId) => {
        if (projectId.value === nextProjectId) {
            return;
        }
        projectId.value = nextProjectId;
        page.value = 0;
        Object.assign(filters, defaultFilters());
        risks.value = [];
        matrix.value = [];
        totalPages.value = 0;
        totalElements.value = 0;
        listError.value = '';
        summaryError.value = '';
    };
    const loadList = async () => {
        if (!projectId.value)
            return;
        loadingList.value = true;
        listError.value = '';
        try {
            const response = await listRisks(projectId.value, {
                page: page.value,
                size: size.value,
                sort: filters.sort,
                status: filters.status ?? undefined,
                levelBucket: filters.levelBucket ?? undefined,
                probability: filters.probability ?? undefined,
                impact: filters.impact ?? undefined,
                ownerUserId: effectiveOwnerUserId.value,
                keyword: filters.keyword.trim() || undefined,
                tagId: filters.tagId ?? undefined,
            });
            risks.value = response.content;
            totalPages.value = response.totalPages;
            totalElements.value = response.totalElements;
        }
        catch {
            listError.value = '리스크 목록을 불러오지 못했습니다.';
            risks.value = [];
        }
        finally {
            loadingList.value = false;
        }
    };
    const loadSummary = async (force = false) => {
        if (!projectId.value)
            return;
        const key = projectId.value;
        if (!force && summaryCache.value[key]) {
            summary.value = summaryCache.value[key];
            return;
        }
        loadingSummary.value = true;
        summaryError.value = '';
        try {
            const next = await getRiskSummary(projectId.value);
            summary.value = next;
            summaryCache.value = { ...summaryCache.value, [key]: next };
        }
        catch {
            summaryError.value = '리스크 요약을 불러오지 못했습니다.';
            summary.value = null;
        }
        finally {
            loadingSummary.value = false;
        }
    };
    const reload = async () => {
        await Promise.all([loadSummary(true), loadMatrixSummary(), loadList()]);
    };
    const loadMatrixSummary = async () => {
        if (!projectId.value)
            return;
        try {
            const response = await getRiskMatrixSummary(projectId.value, {
                status: filters.status ?? undefined,
                levelBucket: filters.levelBucket ?? undefined,
                ownerUserId: effectiveOwnerUserId.value,
                keyword: filters.keyword.trim() || undefined,
                tagId: filters.tagId ?? undefined,
            });
            matrix.value = response.cells;
        }
        catch {
            matrix.value = [];
        }
    };
    const applyFilters = async (next) => {
        filters.status = next.status;
        filters.levelBucket = next.levelBucket;
        filters.probability = next.probability;
        filters.impact = next.impact;
        filters.ownerFilter = next.ownerFilter;
        filters.keyword = next.keyword;
        page.value = 0;
        await Promise.all([loadList(), loadMatrixSummary()]);
    };
    const setPage = async (nextPage) => {
        page.value = nextPage;
        await loadList();
    };
    const addRisk = async (payload) => {
        if (!projectId.value) {
            throw new Error('Project is not selected');
        }
        await createRisk(projectId.value, payload);
        await reload();
    };
    return {
        projectId,
        risks,
        visibleRisks,
        summary,
        matrix,
        page,
        size,
        totalPages,
        totalElements,
        loadingList,
        loadingSummary,
        listError,
        summaryError,
        filters,
        setProject,
        loadList,
        loadSummary,
        reload,
        loadMatrixSummary,
        applyFilters,
        setPage,
        addRisk,
    };
});
