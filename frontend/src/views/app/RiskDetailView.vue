<template>
  <section class="risk-detail">
    <v-card rounded="lg" elevation="1" class="header-card">
      <div>
        <h2>{{ risk?.title || 'Risk Detail' }}</h2>
        <div class="header-meta">
          <v-chip size="small" variant="tonal">{{ risk?.status || '-' }}</v-chip>
          <v-chip v-if="risk" size="small" :color="levelColor(risk.levelBucket)" variant="tonal">
            {{ risk.levelBucket }} ({{ risk.levelScore }})
          </v-chip>
        </div>
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" :to="`/app/projects/${projectId}/risks`">목록</v-btn>
        <v-btn variant="outlined" :disabled="loading || !risk" @click="toggleEdit">
          {{ editMode ? 'Cancel' : 'Edit' }}
        </v-btn>
        <v-btn v-if="editMode" color="primary" :loading="saving" :disabled="saving || !risk" @click="saveRisk">Save</v-btn>
        <v-btn color="error" variant="tonal" :loading="closing" :disabled="!risk || risk.status === 'CLOSED'" @click="closeCurrentRisk">
          Close
        </v-btn>
      </div>
    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <v-skeleton-loader v-if="loading" type="article, table-row@4" />

    <template v-else-if="risk">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="overview">Overview</v-tab>
        <v-tab value="assessment">Assessment</v-tab>
        <v-tab value="actions">Actions</v-tab>
        <v-tab value="tasks">Linked Tasks</v-tab>
        <v-tab value="comments">Comments</v-tab>
        <v-tab value="activity">Activity</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="overview">
          <v-card rounded="lg" elevation="1">
            <v-card-text class="section-grid">
              <v-text-field v-model="form.title" label="Title" variant="outlined" :disabled="!editMode" />
              <v-text-field v-model="form.category" label="Category" variant="outlined" :disabled="!editMode" />
              <v-select
                v-model="form.status"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                :disabled="!editMode"
              />
              <v-text-field v-model="form.nextReviewDate" type="date" label="Next review" variant="outlined" :disabled="!editMode" />
              <v-textarea v-model="form.description" label="Description" rows="3" variant="outlined" :disabled="!editMode" />
              <v-textarea v-model="form.mitigationPlan" label="Mitigation plan" rows="3" variant="outlined" :disabled="!editMode" />
              <v-textarea v-model="form.contingencyPlan" label="Contingency plan" rows="3" variant="outlined" :disabled="!editMode" />
              <v-textarea v-model="form.triggers" label="Triggers" rows="2" variant="outlined" :disabled="!editMode" />
              <v-text-field :model-value="risk.ownerUserName || '미지정'" label="Owner" variant="outlined" disabled />
            </v-card-text>

            <v-divider />

            <v-card-text>
              <div class="tag-header">
                <h3>Tags</h3>
                <div class="tag-actions">
                  <v-text-field
                    v-model="tagKeyword"
                    label="Tag keyword"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="tag-keyword"
                    @update:model-value="searchTags"
                  />
                  <v-select
                    v-model="selectedTagId"
                    :items="tagOptions"
                    label="Select tag"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="tag-select"
                  />
                  <v-btn variant="outlined" :disabled="!selectedTagId" @click="addTagToRisk">Add Tag</v-btn>
                </div>
              </div>

              <EmptyState
                v-if="riskTags.length === 0"
                title="태그가 없습니다"
                description="리스크 태그를 추가해 분류하세요."
                icon="mdi-tag-outline"
              />
              <div v-else class="tag-list">
                <v-chip v-for="tag in riskTags" :key="tag.id" closable @click:close="removeTagFromRisk(tag.id)">
                  {{ tag.name }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="assessment">
          <v-card rounded="lg" elevation="1">
            <v-card-text class="assessment-grid">
              <v-select
                v-model="form.probability"
                :items="scoreOptions"
                label="Probability (1~5)"
                variant="outlined"
                :disabled="!editMode"
              />
              <v-select
                v-model="form.impact"
                :items="scoreOptions"
                label="Impact (1~5)"
                variant="outlined"
                :disabled="!editMode"
              />
              <v-text-field :model-value="String(computedLevelScore)" label="Level Score" variant="outlined" disabled />
              <v-text-field :model-value="computedLevelBucket" label="Level Bucket" variant="outlined" disabled />
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="actions">
          <v-card rounded="lg" elevation="1">
            <v-card-title class="section-title">Risk Actions</v-card-title>
            <v-card-text>
              <div class="action-create">
                <v-text-field v-model="newAction.title" label="Action title" variant="outlined" />
                <v-select v-model="newAction.status" :items="actionStatusOptions" label="Status" variant="outlined" />
                <v-text-field v-model="newAction.dueDate" type="date" label="Due date" variant="outlined" />
                <v-btn color="primary" :loading="actionsLoading" @click="createAction">Add</v-btn>
              </div>

              <EmptyState
                v-if="riskActions.length === 0"
                title="액션이 없습니다"
                description="대응 액션을 추가해 실행 상태를 관리하세요."
                icon="mdi-format-list-checks"
              />

              <v-list v-else lines="two">
                <v-list-item v-for="action in riskActions" :key="action.id" class="action-item">
                  <template #title>
                    <div class="action-row">
                      <v-text-field
                        v-model="actionDrafts[action.id].title"
                        density="compact"
                        variant="outlined"
                        hide-details
                      />
                      <v-select
                        v-model="actionDrafts[action.id].status"
                        :items="actionStatusOptions"
                        density="compact"
                        variant="outlined"
                        hide-details
                      />
                      <v-text-field
                        v-model="actionDrafts[action.id].dueDate"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details
                      />
                      <v-btn size="small" variant="outlined" @click="saveAction(action.id)">Save</v-btn>
                      <v-btn size="small" color="error" variant="text" @click="deleteAction(action.id)">Delete</v-btn>
                    </div>
                  </template>
                  <template #subtitle>
                    <small>Assignee: {{ action.assigneeUserName || '-' }} · Updated: {{ formatDate(action.updatedAt) }}</small>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="tasks">
          <v-card rounded="lg" elevation="1">
            <v-card-title class="section-title">Linked Tasks</v-card-title>
            <v-card-text>
              <div class="task-link-create">
                <v-text-field v-model="manualTaskId" label="Task ID" variant="outlined" />
                <v-autocomplete
                  v-model="selectedTaskId"
                  :items="taskOptions"
                  label="or select task"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                />
                <v-btn color="primary" @click="linkTask">Link</v-btn>
              </div>

              <EmptyState
                v-if="linkedTasks.length === 0"
                title="연결된 태스크가 없습니다"
                description="Task ID 입력 또는 태스크 선택으로 연결하세요."
                icon="mdi-link-variant"
              />

              <v-list v-else>
                <v-list-item v-for="task in linkedTasks" :key="task.id" class="linked-task-row">
                  <template #title>
                    <div class="linked-task-title">
                      <span>{{ task.title }}</span>
                      <div class="chips">
                        <v-chip size="x-small" variant="tonal">{{ task.status }}</v-chip>
                        <v-chip size="x-small" variant="outlined">{{ task.priority }}</v-chip>
                      </div>
                    </div>
                  </template>
                  <template #subtitle>
                    <small>Due: {{ task.dueDate || '-' }}</small>
                  </template>
                  <template #append>
                    <v-btn size="small" color="error" variant="text" @click="unlinkTask(task.id)">Unlink</v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="comments">
          <v-card rounded="lg" elevation="1">
            <v-card-title class="section-title">Comments</v-card-title>
            <v-card-text>
              <v-textarea v-model="newComment" label="Write comment" rows="3" variant="outlined" />
              <v-btn color="primary" :disabled="newComment.trim().length === 0" @click="createComment">Add Comment</v-btn>

              <EmptyState
                v-if="riskComments.length === 0"
                title="댓글이 없습니다"
                description="리스크 관련 의사결정을 기록하세요."
                icon="mdi-comment-text-outline"
                class="mt-3"
              />

              <v-list v-else lines="three" class="mt-2">
                <v-list-item v-for="comment in riskComments" :key="comment.id" class="comment-row">
                  <template #title>
                    <div class="comment-title">
                      <span>{{ comment.authorUserName }}</span>
                      <small>{{ formatDate(comment.createdAt) }}</small>
                    </div>
                  </template>
                  <template #subtitle>
                    <p class="comment-content">{{ comment.content }}</p>
                  </template>
                  <template #append>
                    <v-btn size="small" color="error" variant="text" @click="removeComment(comment.id)">Delete</v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="activity">
          <v-card rounded="lg" elevation="1">
            <v-card-title class="section-title">Activity</v-card-title>
            <v-card-text>
              <EmptyState
                v-if="activities.length === 0"
                title="활동 로그가 없습니다"
                description="리스크 변경 내역이 여기에 표시됩니다."
                icon="mdi-history"
              />

              <v-timeline v-else density="compact" side="end" align="start">
                <v-timeline-item
                  v-for="activity in activities"
                  :key="activity.id"
                  dot-color="primary"
                  size="small"
                >
                  <div class="activity-item">
                    <strong>{{ activity.action }}</strong>
                    <p>{{ formatDate(activity.createdAt) }}</p>
                    <code v-if="activity.meta">{{ stringifyMeta(activity.meta) }}</code>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2400" location="bottom right">
      {{ snackbar.message }}
    </v-snackbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTags } from '../../api/tags'
import { getProjectTasks } from '../../api/tasks'
import {
  addRiskTag,
  closeRisk,
  createRiskAction,
  createRiskComment,
  getRisk,
  linkTaskToRisk,
  listRiskActions,
  listRiskActivities,
  listRiskComments,
  listRiskLinkedTasks,
  listRiskTags,
  removeRiskTag,
  unlinkTaskFromRisk,
  updateRisk,
  updateRiskAction,
  deleteRiskAction,
  deleteRiskComment,
} from '../../api/risks'
import EmptyState from '../../components/common/EmptyState.vue'
import type {
  RiskActionItem,
  RiskActionStatus,
  RiskActivityItem,
  RiskCommentItem,
  RiskItem,
  RiskLevelBucket,
  RiskLinkedTaskItem,
  RiskStatus,
  RiskTagItem,
} from '../../types/risk'
import type { TaskItem } from '../../types/task'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId as string
const riskId = route.params.riskId as string

const tab = ref('overview')
const loading = ref(false)
const saving = ref(false)
const closing = ref(false)
const actionsLoading = ref(false)
const errorMessage = ref('')
const editMode = ref(false)

const risk = ref<RiskItem | null>(null)
const riskActions = ref<RiskActionItem[]>([])
const linkedTasks = ref<RiskLinkedTaskItem[]>([])
const riskTags = ref<RiskTagItem[]>([])
const riskComments = ref<RiskCommentItem[]>([])
const activities = ref<RiskActivityItem[]>([])
const projectTasks = ref<TaskItem[]>([])

const tagKeyword = ref('')
const selectedTagId = ref<string | null>(null)
const tagOptions = ref<Array<{ title: string; value: string }>>([])

const manualTaskId = ref('')
const selectedTaskId = ref<string | null>(null)
const taskOptions = computed(() =>
  projectTasks.value.map((task) => ({ title: task.title, value: task.id })),
)

const newComment = ref('')

const newAction = reactive<{
  title: string
  status: RiskActionStatus
  dueDate: string
}>({
  title: '',
  status: 'OPEN',
  dueDate: '',
})

const actionDrafts = reactive<Record<string, { title: string; status: RiskActionStatus; dueDate: string }>>({})

const form = reactive({
  title: '',
  description: '',
  category: '',
  status: 'IDENTIFIED' as RiskStatus,
  probability: 3,
  impact: 3,
  nextReviewDate: '',
  mitigationPlan: '',
  contingencyPlan: '',
  triggers: '',
})

const statusOptions: RiskStatus[] = ['IDENTIFIED', 'ASSESSING', 'MITIGATING', 'MONITORING', 'CLOSED']
const scoreOptions = [1, 2, 3, 4, 5]
const actionStatusOptions: RiskActionStatus[] = ['OPEN', 'IN_PROGRESS', 'DONE']

const snackbar = reactive<{ show: boolean; message: string; color: 'success' | 'error' }>({
  show: false,
  message: '',
  color: 'success',
})

const computedLevelScore = computed(() => Number(form.probability) * Number(form.impact))
const computedLevelBucket = computed(() => {
  const score = computedLevelScore.value
  if (score >= 16) return 'CRITICAL'
  if (score >= 10) return 'HIGH'
  if (score >= 5) return 'MEDIUM'
  return 'LOW'
})

const showToast = (message: string, color: 'success' | 'error' = 'success') => {
  snackbar.show = false
  snackbar.message = message
  snackbar.color = color
  setTimeout(() => {
    snackbar.show = true
  }, 10)
}

const levelColor = (bucket: RiskLevelBucket) => {
  if (bucket === 'CRITICAL') return 'error'
  if (bucket === 'HIGH') return 'warning'
  if (bucket === 'MEDIUM') return 'primary'
  return 'success'
}

const syncForm = (item: RiskItem) => {
  form.title = item.title
  form.description = item.description ?? ''
  form.category = item.category ?? ''
  form.status = item.status
  form.probability = item.probability
  form.impact = item.impact
  form.nextReviewDate = item.nextReviewDate ?? ''
  form.mitigationPlan = item.mitigationPlan ?? ''
  form.contingencyPlan = item.contingencyPlan ?? ''
  form.triggers = item.triggers ?? ''
}

const loadRisk = async () => {
  const item = await getRisk(riskId)
  risk.value = item
  syncForm(item)
}

const loadActions = async () => {
  const page = await listRiskActions(riskId, { page: 0, size: 100, sort: 'updatedAt,desc' })
  riskActions.value = page.content
  riskActions.value.forEach((action) => {
    actionDrafts[action.id] = {
      title: action.title,
      status: action.status,
      dueDate: action.dueDate ?? '',
    }
  })
}

const loadLinkedTasks = async () => {
  linkedTasks.value = await listRiskLinkedTasks(riskId)
}

const loadRiskTags = async () => {
  riskTags.value = await listRiskTags(riskId)
}

const loadComments = async () => {
  const page = await listRiskComments(riskId, { page: 0, size: 100, sort: 'createdAt,desc' })
  riskComments.value = page.content
}

const loadActivity = async () => {
  const page = await listRiskActivities(riskId, { page: 0, size: 50, sort: 'createdAt,desc' })
  activities.value = page.content
}

const loadProjectTaskCandidates = async () => {
  const page = await getProjectTasks(projectId, { page: 0, size: 100, sort: 'updatedAt,desc' })
  projectTasks.value = page.content
}

const loadAll = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    await Promise.all([
      loadRisk(),
      loadActions(),
      loadLinkedTasks(),
      loadRiskTags(),
      loadComments(),
      loadActivity(),
      loadProjectTaskCandidates(),
    ])
  } catch {
    errorMessage.value = '리스크 상세 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const toggleEdit = () => {
  if (!risk.value) return
  if (editMode.value) {
    syncForm(risk.value)
  }
  editMode.value = !editMode.value
}

const saveRisk = async () => {
  if (!risk.value) return
  const title = form.title.trim()
  if (!title) {
    showToast('제목은 필수입니다.', 'error')
    return
  }
  try {
    saving.value = true
    const updated = await updateRisk(risk.value.id, {
      title,
      description: form.description.trim() || undefined,
      category: form.category.trim() || undefined,
      status: form.status,
      probability: form.probability,
      impact: form.impact,
      nextReviewDate: form.nextReviewDate || undefined,
      mitigationPlan: form.mitigationPlan.trim() || undefined,
      contingencyPlan: form.contingencyPlan.trim() || undefined,
      triggers: form.triggers.trim() || undefined,
    })
    risk.value = updated
    syncForm(updated)
    editMode.value = false
    showToast('리스크가 저장되었습니다.')
    await loadActivity()
  } catch {
    showToast('리스크 저장에 실패했습니다.', 'error')
  } finally {
    saving.value = false
  }
}

const closeCurrentRisk = async () => {
  if (!risk.value) return
  try {
    closing.value = true
    const closed = await closeRisk(risk.value.id)
    risk.value = closed
    syncForm(closed)
    showToast('리스크가 CLOSED 처리되었습니다.')
    await loadActivity()
  } catch {
    showToast('리스크 종료에 실패했습니다.', 'error')
  } finally {
    closing.value = false
  }
}

const createAction = async () => {
  const title = newAction.title.trim()
  if (!title) {
    showToast('액션 제목을 입력하세요.', 'error')
    return
  }
  try {
    actionsLoading.value = true
    await createRiskAction(riskId, {
      title,
      status: newAction.status,
      dueDate: newAction.dueDate || undefined,
    })
    newAction.title = ''
    newAction.status = 'OPEN'
    newAction.dueDate = ''
    await loadActions()
    await loadActivity()
    showToast('액션이 추가되었습니다.')
  } catch {
    showToast('액션 추가에 실패했습니다.', 'error')
  } finally {
    actionsLoading.value = false
  }
}

const saveAction = async (actionId: string) => {
  try {
    const draft = actionDrafts[actionId]
    await updateRiskAction(actionId, {
      title: draft.title.trim(),
      status: draft.status,
      dueDate: draft.dueDate || undefined,
    })
    await loadActions()
    await loadActivity()
    showToast('액션이 저장되었습니다.')
  } catch {
    showToast('액션 저장에 실패했습니다.', 'error')
  }
}

const deleteAction = async (actionId: string) => {
  try {
    await deleteRiskAction(actionId)
    await loadActions()
    await loadActivity()
    showToast('액션이 삭제되었습니다.')
  } catch {
    showToast('액션 삭제에 실패했습니다.', 'error')
  }
}

const linkTask = async () => {
  const taskId = manualTaskId.value.trim() || selectedTaskId.value
  if (!taskId) {
    showToast('연결할 taskId를 입력하거나 선택하세요.', 'error')
    return
  }
  try {
    await linkTaskToRisk(riskId, taskId)
    manualTaskId.value = ''
    selectedTaskId.value = null
    await loadLinkedTasks()
    showToast('태스크가 연결되었습니다.')
  } catch {
    showToast('태스크 연결에 실패했습니다.', 'error')
  }
}

const unlinkTask = async (taskId: string) => {
  try {
    await unlinkTaskFromRisk(riskId, taskId)
    await loadLinkedTasks()
    showToast('태스크 연결이 해제되었습니다.')
  } catch {
    showToast('태스크 연결 해제에 실패했습니다.', 'error')
  }
}

const searchTags = async () => {
  const list = await getTags(tagKeyword.value.trim() || undefined)
  tagOptions.value = list.map((tag) => ({ title: tag.name, value: tag.id }))
}

const addTagToRisk = async () => {
  if (!selectedTagId.value) return
  try {
    await addRiskTag(riskId, selectedTagId.value)
    selectedTagId.value = null
    await loadRiskTags()
    showToast('태그가 추가되었습니다.')
  } catch {
    showToast('태그 추가에 실패했습니다.', 'error')
  }
}

const removeTagFromRisk = async (tagId: string) => {
  try {
    await removeRiskTag(riskId, tagId)
    await loadRiskTags()
    showToast('태그가 제거되었습니다.')
  } catch {
    showToast('태그 제거에 실패했습니다.', 'error')
  }
}

const createComment = async () => {
  const content = newComment.value.trim()
  if (!content) return
  try {
    await createRiskComment(riskId, content)
    newComment.value = ''
    await loadComments()
    showToast('댓글이 추가되었습니다.')
  } catch {
    showToast('댓글 추가에 실패했습니다.', 'error')
  }
}

const removeComment = async (commentId: string) => {
  try {
    await deleteRiskComment(commentId)
    await loadComments()
    showToast('댓글이 삭제되었습니다.')
  } catch {
    showToast('댓글 삭제에 실패했습니다.', 'error')
  }
}

const stringifyMeta = (meta: Record<string, unknown>) => JSON.stringify(meta)
const formatDate = (value: string) => new Date(value).toLocaleString()

watch(tab, async (nextTab) => {
  if (nextTab === 'activity') {
    await loadActivity()
  }
})

onMounted(async () => {
  await searchTags()
  await loadAll()
})
</script>

<style scoped>
.risk-detail {
  display: grid;
  gap: 12px;
}

.header-card {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.header-card h2 {
  margin: 0;
}

.header-meta {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.tag-header h3 {
  margin: 0;
}

.tag-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-keyword {
  width: 180px;
}

.tag-select {
  width: 220px;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.assessment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.action-create {
  display: grid;
  grid-template-columns: 1fr 180px 180px auto;
  gap: 10px;
  margin-bottom: 12px;
}

.action-item {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 10px;
  margin-bottom: 8px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 160px 170px auto auto;
  gap: 8px;
  align-items: center;
}

.task-link-create {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 12px;
}

.linked-task-row {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 10px;
  margin-bottom: 8px;
}

.linked-task-title {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.chips {
  display: flex;
  gap: 6px;
}

.comment-row {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 10px;
  margin-bottom: 8px;
}

.comment-title {
  display: flex;
  justify-content: space-between;
}

.comment-content {
  margin: 4px 0 0;
  white-space: pre-wrap;
}

.activity-item p {
  margin: 4px 0;
  color: #64748b;
}

.activity-item code {
  display: inline-block;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 6px 8px;
  border-radius: 8px;
}

@media (max-width: 1100px) {
  .header-card {
    flex-direction: column;
  }

  .section-grid,
  .assessment-grid,
  .action-create,
  .action-row,
  .task-link-create {
    grid-template-columns: 1fr;
  }

  .tag-header,
  .tag-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .tag-keyword,
  .tag-select {
    width: 100%;
  }
}
</style>
