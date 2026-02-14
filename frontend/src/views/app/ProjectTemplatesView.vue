<template>
  <section class="project-templates-view">
    <v-card class="header-card" rounded="lg" elevation="1">
      <div>
        <h2>프로젝트 템플릿 적용</h2>
        <p>{{ project?.name || '프로젝트 로딩 중...' }}</p>
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" :to="`/app/projects/${projectId}`">프로젝트 상세</v-btn>
        <v-btn variant="outlined" :to="`/app/projects/${projectId}/board`">칸반 보드</v-btn>
      </div>
    </v-card>

    <v-alert v-if="errorMessage" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <v-card rounded="lg" elevation="1">
      <v-card-text class="pt-5">
        <v-skeleton-loader v-if="loading" type="article, list-item-two-line@3" />
        <template v-else>
          <div class="form-grid">
            <v-select
              v-model="selectedTemplateId"
              :items="templateOptions"
              item-title="title"
              item-value="value"
              label="템플릿 선택"
              variant="outlined"
              density="comfortable"
              :disabled="applying"
            />
            <v-text-field
              v-model="baseDate"
              type="date"
              label="기준일(baseDate)"
              variant="outlined"
              density="comfortable"
              :disabled="applying"
            />
          </div>

          <div class="apply-actions">
            <v-btn
              color="primary"
              prepend-icon="mdi-playlist-plus"
              :loading="applying"
              :disabled="!selectedTemplateId || applying"
              @click="applyTemplate"
            >
              템플릿 적용
            </v-btn>
          </div>

          <v-divider class="my-4" />

          <section v-if="selectedTemplate" class="preview">
            <h3>템플릿 미리보기</h3>
            <p class="preview-desc">{{ selectedTemplate.description || '설명 없음' }}</p>

            <v-list lines="two">
              <v-list-item v-for="item in selectedTemplate.items" :key="item.id" rounded="lg" class="preview-item">
                <template #title>
                  <div class="item-title-row">
                    <span>{{ item.title }}</span>
                    <div class="chips">
                      <v-chip size="small" variant="outlined">{{ item.defaultStatus }}</v-chip>
                      <v-chip size="small" variant="tonal">{{ item.defaultPriority }}</v-chip>
                      <v-chip size="small" variant="tonal">{{ item.defaultAssignee }}</v-chip>
                    </div>
                  </div>
                </template>
                <template #subtitle>
                  <p class="item-subtitle">
                    {{ item.description || '설명 없음' }}
                    <span class="offset">
                      · {{ item.dueOffsetDays == null ? 'D+N 없음' : `D+${item.dueOffsetDays}` }}
                    </span>
                  </p>
                </template>
              </v-list-item>
            </v-list>
          </section>
        </template>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { extractErrorMessage } from '../../api/apiClient'
import { getProjectById } from '../../api/projects'
import {
  applyTaskTemplateToProject,
  getTaskTemplateById,
  getTaskTemplates,
} from '../../api/taskTemplates'
import type { ProjectItem } from '../../types/project'
import type { TaskTemplate } from '../../types/template'

const route = useRoute()
const projectId = route.params.id as string

const loading = ref(false)
const applying = ref(false)
const errorMessage = ref('')

const project = ref<ProjectItem | null>(null)
const templates = ref<TaskTemplate[]>([])
const selectedTemplateId = ref<string | null>(null)
const selectedTemplate = ref<TaskTemplate | null>(null)
const baseDate = ref(new Date().toISOString().slice(0, 10))

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

const templateOptions = computed(() =>
  templates.value.map((template) => ({
    title: template.name,
    value: template.id,
  })),
)

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbar.show = false
  snackbar.message = message
  snackbar.color = color
  setTimeout(() => {
    snackbar.show = true
  }, 10)
}

const loadData = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const [projectData, templatePage] = await Promise.all([
      getProjectById(projectId),
      getTaskTemplates({ page: 0, size: 100, sort: 'updatedAt,desc' }),
    ])
    project.value = projectData
    templates.value = templatePage.data
    if (!selectedTemplateId.value && templatePage.data.length > 0) {
      selectedTemplateId.value = templatePage.data[0].id
    }
  } catch (error) {
    errorMessage.value = extractErrorMessage(error, '템플릿 적용 데이터를 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

const loadSelectedTemplateDetail = async () => {
  if (!selectedTemplateId.value) {
    selectedTemplate.value = null
    return
  }
  try {
    selectedTemplate.value = await getTaskTemplateById(selectedTemplateId.value)
  } catch (error) {
    showSnackbar(extractErrorMessage(error, '템플릿 상세를 불러오지 못했습니다.'), 'error')
  }
}

const applyTemplate = async () => {
  if (!selectedTemplateId.value) {
    return
  }
  try {
    applying.value = true
    const result = await applyTaskTemplateToProject(projectId, selectedTemplateId.value, {
      baseDate: baseDate.value || undefined,
    })
    showSnackbar(`템플릿 적용 완료: ${result.createdCount}개 태스크 생성`)
  } catch (error) {
    showSnackbar(extractErrorMessage(error, '템플릿 적용에 실패했습니다.'), 'error')
  } finally {
    applying.value = false
  }
}

watch(selectedTemplateId, async () => {
  await loadSelectedTemplateDetail()
})

onMounted(async () => {
  await loadData()
  await loadSelectedTemplateDetail()
})
</script>

<style scoped>
.project-templates-view {
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

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.apply-actions {
  margin-top: 6px;
}

.preview h3 {
  margin: 0;
}

.preview-desc {
  margin: 4px 0 12px;
  color: #64748b;
}

.preview-item {
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

.item-subtitle {
  margin: 4px 0 0;
}

.offset {
  color: #64748b;
}

@media (max-width: 980px) {
  .header-card {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
