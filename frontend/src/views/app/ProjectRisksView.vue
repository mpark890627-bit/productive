<template>
  <section class="risk-register">
    <v-card class="header-card" rounded="lg" elevation="1">
      <div>
        <h2>Risk Register</h2>
        <p>{{ projectName }}</p>
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" :to="`/app/projects/${projectId}/board`">Board</v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">New Risk</v-btn>
      </div>
    </v-card>

    <section class="summary-grid">
      <v-card rounded="lg" elevation="1">
        <v-card-text>
          <p class="summary-title">Open risks</p>
          <h3>{{ openRiskCount }}</h3>
        </v-card-text>
      </v-card>
      <v-card rounded="lg" elevation="1">
        <v-card-text>
          <p class="summary-title">High/Critical risks</p>
          <h3>{{ highCriticalCount }}</h3>
        </v-card-text>
      </v-card>
      <v-card rounded="lg" elevation="1">
        <v-card-text>
          <p class="summary-title">Overdue actions</p>
          <h3>{{ riskStore.summary?.overdueActionsCount ?? 0 }}</h3>
        </v-card-text>
      </v-card>
    </section>

    <RiskMatrixSummary
      :cells="riskStore.matrix"
      :selected-probability="probabilityModel"
      :selected-impact="impactModel"
      @select="onMatrixCellSelect"
    />

    <v-alert v-if="riskStore.summaryError" type="warning" variant="tonal">{{ riskStore.summaryError }}</v-alert>
    <v-alert v-if="riskStore.listError" type="error" variant="tonal">{{ riskStore.listError }}</v-alert>

    <v-card rounded="lg" elevation="1">
      <v-card-text class="filters">
        <v-select
          v-model="statusModel"
          :items="statusOptions"
          label="Status"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
        />
        <v-select
          v-model="levelBucketModel"
          :items="levelBucketOptions"
          label="Level"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
        />
        <v-select
          v-model="ownerFilterModel"
          :items="ownerOptions"
          label="Owner"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          hide-details
        />
        <v-text-field
          v-model="keywordModel"
          label="Keyword"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          @keydown.enter="applyFilters"
        />
        <v-btn
          v-if="probabilityModel !== null || impactModel !== null"
          variant="text"
          color="primary"
          @click="clearMatrixFilter"
        >
          P/I 필터 해제
        </v-btn>
        <v-btn variant="outlined" :loading="riskStore.loadingList" @click="applyFilters">Apply</v-btn>
      </v-card-text>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="riskStore.visibleRisks"
        :loading="riskStore.loadingList || riskStore.loadingSummary"
        item-key="id"
        density="comfortable"
        hover
        class="risk-table"
        @click:row="onRowClick"
      >
        <template #item.title="{ item }">
          <div class="title-cell">
            <strong>{{ item.title }}</strong>
            <small>{{ item.description || '-' }}</small>
          </div>
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" variant="tonal">{{ item.status }}</v-chip>
        </template>
        <template #item.levelBucket="{ item }">
          <v-chip size="small" :color="levelColor(item.levelBucket)" variant="tonal">{{ item.levelBucket }}</v-chip>
        </template>
        <template #item.pi="{ item }">
          {{ item.probability }} / {{ item.impact }}
        </template>
        <template #item.owner="{ item }">
          {{ item.ownerUserName || '미지정' }}
        </template>
        <template #item.nextReviewDate="{ item }">
          {{ item.nextReviewDate || '-' }}
        </template>
        <template #item.updatedAt="{ item }">
          {{ formatDate(item.updatedAt) }}
        </template>
      </v-data-table>

      <v-card-actions class="pager">
        <v-btn variant="outlined" :disabled="riskStore.page <= 0 || riskStore.loadingList" @click="goPrev">Prev</v-btn>
        <span>Page {{ riskStore.page + 1 }} / {{ riskStore.totalPages || 1 }}</span>
        <v-btn
          variant="outlined"
          :disabled="riskStore.page >= riskStore.totalPages - 1 || riskStore.loadingList"
          @click="goNext"
        >
          Next
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="createDialogOpen" max-width="640">
      <v-card>
        <v-card-title class="pt-5 px-5">New Risk</v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-text-field v-model="createForm.title" label="Title *" variant="outlined" />
          <v-textarea v-model="createForm.description" label="Description" rows="3" variant="outlined" />
          <div class="create-grid">
            <v-select
              v-model="createForm.status"
              :items="statusOptions.filter((item) => item.value !== null)"
              item-title="label"
              item-value="value"
              label="Status"
              variant="outlined"
            />
            <v-text-field v-model="createForm.category" label="Category" variant="outlined" />
            <v-text-field v-model.number="createForm.probability" type="number" min="1" max="5" label="Probability (1~5)" variant="outlined" />
            <v-text-field v-model.number="createForm.impact" type="number" min="1" max="5" label="Impact (1~5)" variant="outlined" />
          </div>
          <v-alert v-if="createErrorMessage" type="error" variant="tonal">{{ createErrorMessage }}</v-alert>
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="createSubmitting" @click="closeCreateDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="createSubmitting" :disabled="createSubmitting" @click="submitCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { extractErrorMessage } from '../../api/apiClient'
import { getProjectById } from '../../api/projects'
import RiskMatrixSummary from '../../components/risks/RiskMatrixSummary.vue'
import { useRiskStore } from '../../stores/risk'
import type { RiskLevelBucket, RiskOwnerFilter, RiskStatus } from '../../types/risk'

const route = useRoute()
const router = useRouter()
const riskStore = useRiskStore()

const projectId = route.params.projectId as string
const projectName = ref('Project Risks')

const statusModel = ref<RiskStatus | null>(null)
const levelBucketModel = ref<RiskLevelBucket | null>(null)
const probabilityModel = ref<number | null>(null)
const impactModel = ref<number | null>(null)
const ownerFilterModel = ref<RiskOwnerFilter>('ALL')
const keywordModel = ref('')

const createDialogOpen = ref(false)
const createSubmitting = ref(false)
const createErrorMessage = ref('')
const createForm = reactive({
  title: '',
  description: '',
  category: '',
  status: 'IDENTIFIED' as RiskStatus,
  probability: 3,
  impact: 3,
})

const headers = [
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Level', key: 'levelBucket', sortable: false },
  { title: 'P/I', key: 'pi', sortable: false },
  { title: 'Owner', key: 'owner', sortable: false },
  { title: 'Next review', key: 'nextReviewDate', sortable: false },
  { title: 'Updated', key: 'updatedAt', sortable: false },
]

const statusOptions: Array<{ label: string; value: RiskStatus | null }> = [
  { label: 'All', value: null },
  { label: 'IDENTIFIED', value: 'IDENTIFIED' },
  { label: 'ASSESSING', value: 'ASSESSING' },
  { label: 'MITIGATING', value: 'MITIGATING' },
  { label: 'MONITORING', value: 'MONITORING' },
  { label: 'CLOSED', value: 'CLOSED' },
]

const levelBucketOptions: Array<{ label: string; value: RiskLevelBucket | null }> = [
  { label: 'All', value: null },
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
  { label: 'CRITICAL', value: 'CRITICAL' },
]

const ownerOptions: Array<{ label: string; value: RiskOwnerFilter }> = [
  { label: '전체', value: 'ALL' },
  { label: '나', value: 'ME' },
  { label: '미지정', value: 'UNASSIGNED' },
]

const openRiskCount = computed(() => {
  const counts = riskStore.summary?.statusCounts ?? {}
  return (counts.IDENTIFIED ?? 0) + (counts.ASSESSING ?? 0) + (counts.MITIGATING ?? 0) + (counts.MONITORING ?? 0)
})

const highCriticalCount = computed(() => {
  const counts = riskStore.summary?.levelBucketCounts ?? {}
  return (counts.HIGH ?? 0) + (counts.CRITICAL ?? 0)
})

const levelColor = (bucket: RiskLevelBucket) => {
  if (bucket === 'CRITICAL') return 'error'
  if (bucket === 'HIGH') return 'warning'
  if (bucket === 'MEDIUM') return 'primary'
  return 'success'
}

const applyFilters = async () => {
  await riskStore.applyFilters({
    status: statusModel.value,
    levelBucket: levelBucketModel.value,
    probability: probabilityModel.value,
    impact: impactModel.value,
    ownerFilter: ownerFilterModel.value,
    keyword: keywordModel.value,
  })
}

const onMatrixCellSelect = async (payload: { probability: number; impact: number }) => {
  probabilityModel.value = payload.probability
  impactModel.value = payload.impact
  await applyFilters()
}

const clearMatrixFilter = async () => {
  probabilityModel.value = null
  impactModel.value = null
  await applyFilters()
}

const goPrev = async () => {
  if (riskStore.page > 0) {
    await riskStore.setPage(riskStore.page - 1)
  }
}

const goNext = async () => {
  if (riskStore.page < riskStore.totalPages - 1) {
    await riskStore.setPage(riskStore.page + 1)
  }
}

const onRowClick = (_event: Event, row: unknown) => {
  const candidate = row as { item?: { id?: string; raw?: { id?: string } } }
  const riskId = candidate.item?.raw?.id ?? candidate.item?.id
  if (!riskId) {
    return
  }
  router.push(`/app/projects/${projectId}/risks/${riskId}`)
}

const openCreateDialog = () => {
  createErrorMessage.value = ''
  createForm.title = ''
  createForm.description = ''
  createForm.category = ''
  createForm.status = 'IDENTIFIED'
  createForm.probability = 3
  createForm.impact = 3
  createDialogOpen.value = true
}

const closeCreateDialog = () => {
  createDialogOpen.value = false
}

const submitCreate = async () => {
  const title = createForm.title.trim()
  if (!title) {
    createErrorMessage.value = 'Title is required.'
    return
  }
  try {
    createSubmitting.value = true
    createErrorMessage.value = ''
    await riskStore.addRisk({
      title,
      description: createForm.description.trim() || undefined,
      category: createForm.category.trim() || undefined,
      status: createForm.status,
      probability: createForm.probability,
      impact: createForm.impact,
    })
    closeCreateDialog()
  } catch (error) {
    createErrorMessage.value = extractErrorMessage(error, '리스크 생성에 실패했습니다.')
  } finally {
    createSubmitting.value = false
  }
}

const formatDate = (value: string) => new Date(value).toLocaleString()

onMounted(async () => {
  riskStore.setProject(projectId)
  try {
    const project = await getProjectById(projectId)
    projectName.value = project.name
  } catch {
    projectName.value = 'Project Risks'
  }
  await riskStore.reload()
})
</script>

<style scoped>
.risk-register {
  display: grid;
  gap: 12px;
}

.header-card {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-card h2 {
  margin: 0;
}

.header-card p {
  margin: 2px 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summary-title {
  margin: 0;
  color: #64748b;
}

.summary-grid h3 {
  margin: 8px 0 0;
  font-size: 28px;
}

.filters {
  display: grid;
  grid-template-columns: 180px 180px 160px 1fr auto auto;
  gap: 10px;
  align-items: center;
}

.risk-table :deep(tbody tr) {
  cursor: pointer;
}

.title-cell {
  display: grid;
}

.title-cell small {
  color: #64748b;
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.create-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 1080px) {
  .header-card {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .create-grid {
    grid-template-columns: 1fr;
  }
}
</style>
