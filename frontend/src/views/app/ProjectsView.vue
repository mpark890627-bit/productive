<template>
  <section class="card app-page">
    <header class="projects-header page-header">
      <div class="header-left">
        <div>
          <h2 class="page-title">Projects</h2>
          <p class="page-subtitle">프로젝트를 생성하고 진행 상태를 한눈에 관리합니다.</p>
        </div>
        <v-text-field
          v-model="keyword"
          prepend-inner-icon="mdi-magnify"
          placeholder="프로젝트 검색 (이름/설명)"
          density="compact"
          variant="solo-filled"
          flat
          hide-details
          class="keyword-field"
        />
      </div>
      <div class="header-actions">
        <v-btn variant="outlined" @click="loadProjects">새로고침</v-btn>
        <v-btn color="primary" @click="openCreateModal">새 프로젝트</v-btn>
      </div>
    </header>

    <AppSkeleton v-if="loading" />
    <v-alert v-else-if="errorMessage" type="error" variant="tonal" class="mt-4">{{ errorMessage }}</v-alert>
    <EmptyState
      v-else-if="projects.length === 0"
      title="프로젝트가 없습니다"
      description="첫 프로젝트를 생성해서 보드를 시작하세요."
      icon="mdi-folder-outline"
      class="mt-4"
    >
      <v-btn color="primary" class="mt-4" @click="openCreateModal">새 프로젝트 만들기</v-btn>
    </EmptyState>

    <ProjectList
      v-else-if="filteredProjects.length > 0"
      :projects="filteredProjects"
      @open="handleOpen"
      @edit="handleEdit"
      @delete="openDeleteDialog"
    />

    <EmptyState
      v-else-if="projects.length > 0 && filteredProjects.length === 0"
      title="검색 결과가 없습니다"
      description="다른 키워드로 다시 검색해보세요."
      icon="mdi-magnify-close"
      class="mt-4"
    />

    <footer v-if="!loading && !errorMessage && projects.length > 0 && filteredProjects.length > 0" class="pager">
      <v-btn variant="outlined" :disabled="page <= 0" @click="goPrev">Prev</v-btn>
      <span>Page {{ page + 1 }} / {{ totalPages || 1 }}</span>
      <v-btn variant="outlined" :disabled="page >= totalPages - 1" @click="goNext">Next</v-btn>
    </footer>

    <ProjectFormModal
      :open="modalOpen"
      :mode="modalMode"
      :initial-project="selectedProject"
      :submitting="modalSubmitting"
      :error-message="modalErrorMessage"
      @close="closeModal"
      @submit="handleModalSubmit"
    />

    <v-dialog v-model="deleteDialogOpen" max-width="460">
      <v-card>
        <v-card-title class="pt-5 px-5">프로젝트 삭제</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p class="delete-text">
            <strong>{{ projectToDelete?.name }}</strong> 프로젝트를 삭제하시겠습니까?
          </p>
          <p class="delete-sub">이 작업은 되돌릴 수 없습니다.</p>
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="deleteSubmitting" @click="closeDeleteDialog">취소</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="deleteSubmitting"
            :disabled="deleteSubmitting"
            @click="confirmDelete"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" timeout="2500">
      {{ snackbar.message }}
    </v-snackbar>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProjectList from '../../components/projects/ProjectList.vue'
import ProjectFormModal from '../../components/projects/ProjectFormModal.vue'
import AppSkeleton from '../../components/common/AppSkeleton.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import { createProject, deleteProject, getProjects, updateProject } from '../../api/projects'
import type { ProjectItem } from '../../types/project'

const router = useRouter()

const projects = ref<ProjectItem[]>([])
const page = ref(0)
const size = ref(10)
const totalPages = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const keyword = ref('')

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalSubmitting = ref(false)
const modalErrorMessage = ref('')
const selectedProject = ref<ProjectItem | null>(null)
const deleteDialogOpen = ref(false)
const deleteSubmitting = ref(false)
const projectToDelete = ref<ProjectItem | null>(null)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

const filteredProjects = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) {
    return projects.value
  }

  return projects.value.filter((project) => {
    const name = project.name.toLowerCase()
    const description = (project.description ?? '').toLowerCase()
    return name.includes(q) || description.includes(q)
  })
})

const showSnackbar = (message: string, color: 'success' | 'error') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.show = true
}

const loadProjects = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    const response = await getProjects({ page: page.value, size: size.value, sort: 'createdAt,desc' })
    projects.value = response.content
    totalPages.value = response.totalPages
  } catch {
    errorMessage.value = '프로젝트 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const goPrev = async () => {
  if (page.value > 0) {
    page.value -= 1
    await loadProjects()
  }
}

const goNext = async () => {
  if (page.value < totalPages.value - 1) {
    page.value += 1
    await loadProjects()
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedProject.value = null
  modalErrorMessage.value = ''
  modalOpen.value = true
}

const handleOpen = (project: ProjectItem) => {
  router.push(`/app/projects/${project.id}`)
}

const handleEdit = (project: ProjectItem) => {
  modalMode.value = 'edit'
  selectedProject.value = project
  modalErrorMessage.value = ''
  modalOpen.value = true
}

const openDeleteDialog = (project: ProjectItem) => {
  projectToDelete.value = project
  deleteDialogOpen.value = true
}

const closeDeleteDialog = () => {
  deleteDialogOpen.value = false
  deleteSubmitting.value = false
  projectToDelete.value = null
}

const confirmDelete = async () => {
  if (!projectToDelete.value) {
    return
  }
  try {
    deleteSubmitting.value = true
    await deleteProject(projectToDelete.value.id)
    if (projects.value.length === 1 && page.value > 0) {
      page.value -= 1
    }
    await loadProjects()
    closeDeleteDialog()
    showSnackbar('프로젝트가 삭제되었습니다.', 'success')
  } catch {
    showSnackbar('프로젝트 삭제에 실패했습니다.', 'error')
  } finally {
    deleteSubmitting.value = false
  }
}

const closeModal = () => {
  modalOpen.value = false
  modalSubmitting.value = false
  modalErrorMessage.value = ''
}

const handleModalSubmit = async (payload: { name: string; description: string }) => {
  if (!payload.name) {
    modalErrorMessage.value = '프로젝트 이름은 필수입니다.'
    return
  }

  try {
    modalSubmitting.value = true
    modalErrorMessage.value = ''

    if (modalMode.value === 'create') {
      await createProject({ name: payload.name, description: payload.description })
      page.value = 0
      showSnackbar('프로젝트가 생성되었습니다.', 'success')
    } else if (selectedProject.value) {
      await updateProject(selectedProject.value.id, {
        name: payload.name,
        description: payload.description,
      })
      showSnackbar('프로젝트가 수정되었습니다.', 'success')
    }

    closeModal()
    await loadProjects()
  } catch {
    modalErrorMessage.value = modalMode.value === 'create' ? '프로젝트 생성 실패' : '프로젝트 수정 실패'
    showSnackbar(modalErrorMessage.value, 'error')
  } finally {
    modalSubmitting.value = false
  }
}

onMounted(loadProjects)
</script>

<style scoped>
.projects-header {
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.keyword-field {
  width: 360px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pager {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5f6f86;
  font-size: 0.92rem;
}

.delete-text {
  margin: 0 0 8px;
}

.delete-sub {
  margin: 0;
  color: #64748b;
}

@media (max-width: 960px) {
  .header-left {
    flex-direction: column;
    align-items: stretch;
  }

  .keyword-field {
    width: 100%;
  }
}
</style>
