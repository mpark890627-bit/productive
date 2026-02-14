<template>
  <section class="templates-view">
    <v-card class="header-card" rounded="lg" elevation="1">
      <div>
        <h2>Task Templates</h2>
        <p>프로젝트에 재사용할 태스크 템플릿을 관리합니다.</p>
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" prepend-icon="mdi-refresh" @click="loadTemplates">새로고침</v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateTemplateDialog">새 템플릿</v-btn>
      </div>
    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <div class="content-grid">
      <v-card rounded="lg" elevation="1">
        <v-skeleton-loader v-if="loading" type="list-item-two-line@5" class="pa-3" />
        <EmptyState
          v-else-if="templates.length === 0"
          title="템플릿이 없습니다"
          description="새 템플릿을 만들어 반복 업무를 줄여보세요."
          icon="mdi-file-document-outline"
          class="py-8"
        >
          <v-btn color="primary" class="mt-4" @click="openCreateTemplateDialog">새 템플릿 만들기</v-btn>
        </EmptyState>
        <v-list v-else nav>
          <v-list-item
            v-for="template in templates"
            :key="template.id"
            :active="selectedTemplateId === template.id"
            rounded="lg"
            @click="selectTemplate(template.id)"
          >
            <template #title>{{ template.name }}</template>
            <template #subtitle>{{ template.description || '설명 없음' }}</template>
            <template #append>
              <v-chip size="small" variant="tonal">{{ template.items.length }} items</v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-card rounded="lg" elevation="1">
        <v-skeleton-loader v-if="loadingDetail" type="article, list-item-three-line@2" class="pa-4" />
        <EmptyState
          v-else-if="!selectedTemplate"
          title="템플릿을 선택하세요"
          description="왼쪽 목록에서 템플릿을 선택하면 상세를 편집할 수 있습니다."
          icon="mdi-file-tree-outline"
          class="py-8"
        />
        <template v-else>
          <v-card-title class="d-flex justify-space-between align-center py-4">
            <div>
              <div class="detail-title">{{ selectedTemplate.name }}</div>
              <div class="detail-sub">{{ selectedTemplate.description || '설명 없음' }}</div>
            </div>
            <div class="d-flex ga-2">
              <v-btn size="small" variant="outlined" @click="openEditTemplateDialog">수정</v-btn>
              <v-btn size="small" color="error" variant="tonal" @click="openDeleteTemplateDialog">삭제</v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pt-4">
            <div class="item-header">
              <h3>Template Items</h3>
              <v-btn size="small" color="primary" prepend-icon="mdi-plus" @click="openCreateItemDialog">
                아이템 추가
              </v-btn>
            </div>

            <EmptyState
              v-if="selectedTemplate.items.length === 0"
              title="아이템이 없습니다"
              description="템플릿에 기본 태스크를 추가해보세요."
              icon="mdi-format-list-bulleted"
              class="py-6"
            />

            <v-list v-else lines="two">
              <v-list-item
                v-for="(item, index) in selectedTemplate.items"
                :key="item.id"
                rounded="lg"
                class="item-row"
              >
                <template #title>
                  <div class="item-title-row">
                    <span>{{ item.title }}</span>
                    <div class="chips">
                      <v-chip size="small" variant="outlined">{{ item.defaultStatus }}</v-chip>
                      <v-chip size="small" variant="tonal">{{ item.defaultPriority }}</v-chip>
                      <v-chip size="small" variant="tonal">{{ item.defaultAssignee }}</v-chip>
                      <v-chip size="small" prepend-icon="mdi-calendar-month-outline" variant="outlined">
                        {{ item.dueOffsetDays == null ? '마감 오프셋 없음' : `D+${item.dueOffsetDays}` }}
                      </v-chip>
                    </div>
                  </div>
                </template>
                <template #subtitle>
                  <p class="item-description">{{ item.description || '설명 없음' }}</p>
                </template>
                <template #append>
                  <div class="item-actions">
                    <v-btn
                      icon="mdi-arrow-up"
                      size="small"
                      variant="text"
                      :disabled="index === 0 || reordering"
                      @click.stop="moveItem(index, -1)"
                    />
                    <v-btn
                      icon="mdi-arrow-down"
                      size="small"
                      variant="text"
                      :disabled="index === selectedTemplate.items.length - 1 || reordering"
                      @click.stop="moveItem(index, 1)"
                    />
                    <v-btn
                      icon="mdi-delete-outline"
                      size="small"
                      color="error"
                      variant="text"
                      :loading="deletingItemId === item.id"
                      @click.stop="removeItem(item.id)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </template>
      </v-card>
    </div>

    <footer v-if="totalPages > 1" class="pager">
      <v-btn variant="outlined" :disabled="page <= 0" @click="goPrevPage">Prev</v-btn>
      <span>Page {{ page + 1 }} / {{ totalPages }}</span>
      <v-btn variant="outlined" :disabled="page >= totalPages - 1" @click="goNextPage">Next</v-btn>
    </footer>

    <v-dialog v-model="templateDialogOpen" max-width="560">
      <v-card>
        <v-card-title class="pt-5 px-5">{{ templateDialogMode === 'create' ? '새 템플릿' : '템플릿 수정' }}</v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-text-field
            v-model="templateForm.name"
            label="이름"
            variant="outlined"
            density="comfortable"
            :error-messages="templateFormError ? [templateFormError] : []"
          />
          <v-textarea
            v-model="templateForm.description"
            label="설명"
            variant="outlined"
            density="comfortable"
            rows="3"
            auto-grow
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="templateSubmitting" @click="templateDialogOpen = false">취소</v-btn>
          <v-btn color="primary" :loading="templateSubmitting" @click="submitTemplateForm">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="itemDialogOpen" max-width="620">
      <v-card>
        <v-card-title class="pt-5 px-5">템플릿 아이템 추가</v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-text-field
            v-model="itemForm.title"
            label="제목"
            variant="outlined"
            density="comfortable"
            :error-messages="itemFormError ? [itemFormError] : []"
          />
          <v-textarea
            v-model="itemForm.description"
            label="설명"
            variant="outlined"
            density="comfortable"
            rows="3"
            auto-grow
          />
          <div class="item-form-grid">
            <v-select
              v-model="itemForm.defaultStatus"
              :items="statusOptions"
              label="기본 상태"
              variant="outlined"
              density="comfortable"
            />
            <v-select
              v-model="itemForm.defaultPriority"
              :items="priorityOptions"
              label="기본 우선순위"
              variant="outlined"
              density="comfortable"
            />
            <v-select
              v-model="itemForm.defaultAssignee"
              :items="assigneeOptions"
              label="기본 담당자"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model.number="itemForm.dueOffsetDays"
              type="number"
              label="마감 오프셋(D+N)"
              variant="outlined"
              density="comfortable"
            />
          </div>
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="itemSubmitting" @click="itemDialogOpen = false">취소</v-btn>
          <v-btn color="primary" :loading="itemSubmitting" @click="submitItemForm">추가</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteTemplateDialogOpen" max-width="420">
      <v-card>
        <v-card-title class="pt-5 px-5">템플릿 삭제</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p><strong>{{ selectedTemplate?.name }}</strong> 템플릿을 삭제하시겠습니까?</p>
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="templateSubmitting" @click="deleteTemplateDialogOpen = false">취소</v-btn>
          <v-btn color="error" :loading="templateSubmitting" @click="confirmDeleteTemplate">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" timeout="2600">
      {{ snackbar.message }}
    </v-snackbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { extractErrorMessage } from '../../api/apiClient'
import {
  createTaskTemplate,
  createTaskTemplateItem,
  deleteTaskTemplate,
  deleteTaskTemplateItem,
  getTaskTemplateById,
  getTaskTemplates,
  updateTaskTemplate,
  updateTaskTemplateItem,
} from '../../api/taskTemplates'
import EmptyState from '../../components/common/EmptyState.vue'
import type {
  TaskTemplate,
  TemplateDefaultAssignee,
  TemplateTaskPriority,
  TemplateTaskStatus,
} from '../../types/template'

const templates = ref<TaskTemplate[]>([])
const selectedTemplateId = ref<string | null>(null)
const loading = ref(false)
const loadingDetail = ref(false)
const errorMessage = ref('')
const deletingItemId = ref<string | null>(null)
const reordering = ref(false)

const page = ref(0)
const size = ref(10)
const totalPages = ref(1)

const templateDialogOpen = ref(false)
const templateDialogMode = ref<'create' | 'edit'>('create')
const templateSubmitting = ref(false)
const templateFormError = ref('')
const templateForm = reactive({
  name: '',
  description: '',
})

const itemDialogOpen = ref(false)
const itemSubmitting = ref(false)
const itemFormError = ref('')
const itemForm = reactive<{
  title: string
  description: string
  defaultStatus: TemplateTaskStatus
  defaultPriority: TemplateTaskPriority
  defaultAssignee: TemplateDefaultAssignee
  dueOffsetDays: number | null
}>({
  title: '',
  description: '',
  defaultStatus: 'TODO',
  defaultPriority: 'MEDIUM',
  defaultAssignee: 'UNASSIGNED',
  dueOffsetDays: null,
})

const deleteTemplateDialogOpen = ref(false)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

const statusOptions: TemplateTaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
const priorityOptions: TemplateTaskPriority[] = ['LOW', 'MEDIUM', 'HIGH']
const assigneeOptions: TemplateDefaultAssignee[] = ['ME', 'UNASSIGNED']

const selectedTemplate = computed(() =>
  templates.value.find((template) => template.id === selectedTemplateId.value) ?? null,
)

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbar.show = false
  snackbar.message = message
  snackbar.color = color
  setTimeout(() => {
    snackbar.show = true
  }, 10)
}

const loadTemplates = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const response = await getTaskTemplates({
      page: page.value,
      size: size.value,
      sort: 'updatedAt,desc',
    })
    templates.value = response.data
    totalPages.value = response.meta?.totalPages ?? 1

    if (!selectedTemplateId.value && response.data.length > 0) {
      selectedTemplateId.value = response.data[0].id
    }
    if (selectedTemplateId.value) {
      await reloadSelectedTemplate()
    }
  } catch (error) {
    errorMessage.value = extractErrorMessage(error, '템플릿 목록을 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

const reloadSelectedTemplate = async () => {
  if (!selectedTemplateId.value) {
    return
  }
  try {
    loadingDetail.value = true
    const detail = await getTaskTemplateById(selectedTemplateId.value)
    templates.value = templates.value.map((template) =>
      template.id === detail.id ? detail : template,
    )
  } finally {
    loadingDetail.value = false
  }
}

const selectTemplate = async (templateId: string) => {
  selectedTemplateId.value = templateId
  await reloadSelectedTemplate()
}

const openCreateTemplateDialog = () => {
  templateDialogMode.value = 'create'
  templateForm.name = ''
  templateForm.description = ''
  templateFormError.value = ''
  templateDialogOpen.value = true
}

const openEditTemplateDialog = () => {
  if (!selectedTemplate.value) {
    return
  }
  templateDialogMode.value = 'edit'
  templateForm.name = selectedTemplate.value.name
  templateForm.description = selectedTemplate.value.description ?? ''
  templateFormError.value = ''
  templateDialogOpen.value = true
}

const submitTemplateForm = async () => {
  if (!templateForm.name.trim()) {
    templateFormError.value = '템플릿 이름은 필수입니다.'
    return
  }

  try {
    templateSubmitting.value = true
    templateFormError.value = ''

    if (templateDialogMode.value === 'create') {
      const created = await createTaskTemplate({
        name: templateForm.name.trim(),
        description: templateForm.description.trim() || undefined,
        items: [],
      })
      selectedTemplateId.value = created.id
      showSnackbar('템플릿이 생성되었습니다.')
    } else if (selectedTemplate.value) {
      await updateTaskTemplate(selectedTemplate.value.id, {
        name: templateForm.name.trim(),
        description: templateForm.description.trim() || '',
      })
      showSnackbar('템플릿이 수정되었습니다.')
    }

    templateDialogOpen.value = false
    await loadTemplates()
  } catch (error) {
    templateFormError.value = extractErrorMessage(error, '템플릿 저장에 실패했습니다.')
  } finally {
    templateSubmitting.value = false
  }
}

const openDeleteTemplateDialog = () => {
  deleteTemplateDialogOpen.value = true
}

const confirmDeleteTemplate = async () => {
  if (!selectedTemplate.value) {
    return
  }
  try {
    templateSubmitting.value = true
    await deleteTaskTemplate(selectedTemplate.value.id)
    deleteTemplateDialogOpen.value = false
    selectedTemplateId.value = null
    showSnackbar('템플릿이 삭제되었습니다.')
    await loadTemplates()
  } catch (error) {
    showSnackbar(extractErrorMessage(error, '템플릿 삭제에 실패했습니다.'), 'error')
  } finally {
    templateSubmitting.value = false
  }
}

const openCreateItemDialog = () => {
  itemForm.title = ''
  itemForm.description = ''
  itemForm.defaultStatus = 'TODO'
  itemForm.defaultPriority = 'MEDIUM'
  itemForm.defaultAssignee = 'UNASSIGNED'
  itemForm.dueOffsetDays = null
  itemFormError.value = ''
  itemDialogOpen.value = true
}

const submitItemForm = async () => {
  if (!selectedTemplate.value) {
    return
  }
  if (!itemForm.title.trim()) {
    itemFormError.value = '아이템 제목은 필수입니다.'
    return
  }
  try {
    itemSubmitting.value = true
    await createTaskTemplateItem(selectedTemplate.value.id, {
      title: itemForm.title.trim(),
      description: itemForm.description.trim() || undefined,
      defaultStatus: itemForm.defaultStatus,
      defaultPriority: itemForm.defaultPriority,
      defaultAssignee: itemForm.defaultAssignee,
      dueOffsetDays: itemForm.dueOffsetDays,
      sortOrder: selectedTemplate.value.items.length,
    })
    itemDialogOpen.value = false
    showSnackbar('템플릿 아이템이 추가되었습니다.')
    await reloadSelectedTemplate()
  } catch (error) {
    itemFormError.value = extractErrorMessage(error, '아이템 추가에 실패했습니다.')
  } finally {
    itemSubmitting.value = false
  }
}

const removeItem = async (itemId: string) => {
  if (!selectedTemplate.value) {
    return
  }
  try {
    deletingItemId.value = itemId
    await deleteTaskTemplateItem(itemId)
    showSnackbar('템플릿 아이템이 삭제되었습니다.')
    await reloadSelectedTemplate()
  } catch (error) {
    showSnackbar(extractErrorMessage(error, '아이템 삭제에 실패했습니다.'), 'error')
  } finally {
    deletingItemId.value = null
  }
}

const moveItem = async (fromIndex: number, delta: -1 | 1) => {
  if (!selectedTemplate.value) {
    return
  }
  const toIndex = fromIndex + delta
  if (toIndex < 0 || toIndex >= selectedTemplate.value.items.length) {
    return
  }

  const current = selectedTemplate.value.items[fromIndex]
  const target = selectedTemplate.value.items[toIndex]

  try {
    reordering.value = true
    await Promise.all([
      updateTaskTemplateItem(current.id, { sortOrder: target.sortOrder }),
      updateTaskTemplateItem(target.id, { sortOrder: current.sortOrder }),
    ])
    await reloadSelectedTemplate()
    showSnackbar('아이템 순서가 변경되었습니다.')
  } catch (error) {
    showSnackbar(extractErrorMessage(error, '아이템 순서 변경에 실패했습니다.'), 'error')
  } finally {
    reordering.value = false
  }
}

const goPrevPage = async () => {
  if (page.value <= 0) {
    return
  }
  page.value -= 1
  await loadTemplates()
}

const goNextPage = async () => {
  if (page.value >= totalPages.value - 1) {
    return
  }
  page.value += 1
  await loadTemplates()
}

onMounted(loadTemplates)
</script>

<style scoped>
.templates-view {
  display: grid;
  gap: 12px;
}

.header-card {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.content-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 320px 1fr;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
}

.detail-sub {
  color: #64748b;
  margin-top: 2px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-header h3 {
  margin: 0;
  font-size: 16px;
}

.item-row {
  border: 1px solid rgba(var(--v-theme-outline), 0.18);
  border-radius: 10px;
  margin-bottom: 8px;
}

.item-title-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.item-actions {
  display: flex;
  align-items: center;
}

.item-description {
  margin: 3px 0 0;
  color: #475569;
}

.item-form-grid {
  margin-top: 8px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pager {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .header-card {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 720px) {
  .item-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
