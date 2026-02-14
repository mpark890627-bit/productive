<template>
  <section class="card detail app-page">
    <p v-if="loading">Loading project...</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

    <template v-else-if="project">
      <header class="detail-header section-card">
        <div>
          <h2 class="page-title">{{ project.name }}</h2>
          <p class="page-subtitle">{{ project.description || '설명이 없습니다.' }}</p>
        </div>
        <div class="header-actions">
          <button type="button" class="primary" @click="goBoard">태스크 칸반으로 이동</button>
          <button type="button" class="ghost" @click="goRisks">리스크 관리</button>
          <button type="button" class="ghost" @click="goTemplates">템플릿 적용</button>
        </div>
      </header>

      <dl class="meta section-card">
        <div>
          <dt>생성일</dt>
          <dd>{{ formatDate(project.createdAt) }}</dd>
        </div>
        <div>
          <dt>수정일</dt>
          <dd>{{ formatDate(project.updatedAt) }}</dd>
        </div>
      </dl>

      <section class="contacts-section section-card">
        <header class="contacts-header">
          <h3>담당자 연락처</h3>
          <div class="contacts-header-actions">
            <button type="button" class="ghost" @click="loadContacts">새로고침</button>
            <button type="button" class="primary" @click="openCreateModal">새 담당자</button>
          </div>
        </header>

        <p v-if="contactsLoading" class="muted">연락처를 불러오는 중...</p>
        <p v-else-if="contactsErrorMessage" class="error">{{ contactsErrorMessage }}</p>

        <table v-else-if="contacts.length" class="contacts-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>역할</th>
              <th>이메일</th>
              <th>전화번호</th>
              <th>메모</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contact in contacts" :key="contact.id">
              <template v-if="editingId === contact.id">
                <td><input v-model="editForm.name" placeholder="이름" /></td>
                <td><input v-model="editForm.role" placeholder="역할" /></td>
                <td><input v-model="editForm.email" placeholder="email@company.com" /></td>
                <td><input v-model="editForm.phone" placeholder="010-0000-0000" /></td>
                <td><input v-model="editForm.memo" placeholder="메모" /></td>
                <td class="actions">
                  <button type="button" class="primary" :disabled="editingSubmit" @click="submitEdit(contact.id)">
                    저장
                  </button>
                  <button type="button" :disabled="editingSubmit" @click="cancelEdit">취소</button>
                </td>
              </template>

              <template v-else>
                <td>{{ contact.name }}</td>
                <td>{{ contact.role || '-' }}</td>
                <td>{{ contact.email || '-' }}</td>
                <td>{{ contact.phone || '-' }}</td>
                <td>{{ contact.memo || '-' }}</td>
                <td class="actions">
                  <button
                    type="button"
                    class="icon-btn"
                    title="수정"
                    aria-label="연락처 수정"
                    @click="startEdit(contact.id)"
                  >
                    <i class="mdi mdi-pencil-outline" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="icon-btn danger"
                    title="삭제"
                    aria-label="연락처 삭제"
                    @click="removeContact(contact.id)"
                  >
                    <i class="mdi mdi-trash-can-outline" aria-hidden="true" />
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>

        <p v-else class="muted">등록된 담당자 연락처가 없습니다.</p>
      </section>

      <v-dialog v-model="createDialogOpen" max-width="680">
        <v-card>
          <v-card-title class="pt-5 px-5">새 담당자 추가</v-card-title>
          <v-card-text class="px-5">
            <form class="create-form-modal" @submit.prevent="submitCreate">
              <div class="form-grid">
                <input v-model="createForm.name" placeholder="이름 *" required maxlength="120" :disabled="createSubmitting" />
                <input v-model="createForm.role" placeholder="역할" maxlength="120" :disabled="createSubmitting" />
                <input
                  v-model="createForm.email"
                  type="email"
                  placeholder="email@company.com"
                  maxlength="255"
                  :disabled="createSubmitting"
                />
                <input v-model="createForm.phone" placeholder="전화번호" maxlength="50" :disabled="createSubmitting" />
                <input v-model="createForm.memo" placeholder="메모" maxlength="2000" :disabled="createSubmitting" />
              </div>
              <p v-if="createErrorMessage" class="error">{{ createErrorMessage }}</p>
            </form>
          </v-card-text>
          <v-card-actions class="px-5 pb-5">
            <v-spacer />
            <v-btn variant="text" :disabled="createSubmitting" @click="closeCreateModal">취소</v-btn>
            <v-btn color="primary" :loading="createSubmitting" :disabled="createSubmitting" @click="submitCreate">추가</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { extractErrorMessage } from '../../api/apiClient'
import {
  createProjectContact,
  deleteProjectContact,
  getProjectContacts,
  updateProjectContact,
} from '../../api/projectContacts'
import { getProjectById } from '../../api/projects'
import type { ProjectItem } from '../../types/project'
import type { ProjectContactItem } from '../../types/projectContact'

const route = useRoute()
const router = useRouter()

const project = ref<ProjectItem | null>(null)
const loading = ref(false)
const errorMessage = ref('')

const contacts = ref<ProjectContactItem[]>([])
const contactsLoading = ref(false)
const contactsErrorMessage = ref('')
const createSubmitting = ref(false)
const createErrorMessage = ref('')
const createDialogOpen = ref(false)
const editingId = ref<string | null>(null)
const editingSubmit = ref(false)

const createForm = reactive({
  name: '',
  role: '',
  email: '',
  phone: '',
  memo: '',
})

const editForm = reactive({
  name: '',
  role: '',
  email: '',
  phone: '',
  memo: '',
})

const projectId = route.params.id as string

const optionalValue = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

const loadProject = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    project.value = await getProjectById(projectId)
  } catch {
    errorMessage.value = '프로젝트 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const loadContacts = async () => {
  try {
    contactsLoading.value = true
    contactsErrorMessage.value = ''
    contacts.value = await getProjectContacts(projectId)
  } catch (error) {
    contactsErrorMessage.value = extractErrorMessage(error, '담당자 연락처를 불러오지 못했습니다.')
  } finally {
    contactsLoading.value = false
  }
}

const resetCreateForm = () => {
  createForm.name = ''
  createForm.role = ''
  createForm.email = ''
  createForm.phone = ''
  createForm.memo = ''
}

const openCreateModal = () => {
  createErrorMessage.value = ''
  resetCreateForm()
  createDialogOpen.value = true
}

const closeCreateModal = () => {
  if (createSubmitting.value) {
    return
  }
  createDialogOpen.value = false
}

const submitCreate = async () => {
  try {
    createSubmitting.value = true
    createErrorMessage.value = ''

    const created = await createProjectContact(projectId, {
      name: createForm.name.trim(),
      role: optionalValue(createForm.role),
      email: optionalValue(createForm.email),
      phone: optionalValue(createForm.phone),
      memo: optionalValue(createForm.memo),
    })

    contacts.value = [created, ...contacts.value]
    resetCreateForm()
    createDialogOpen.value = false
  } catch (error) {
    createErrorMessage.value = extractErrorMessage(error, '연락처 추가에 실패했습니다.')
  } finally {
    createSubmitting.value = false
  }
}

const startEdit = (contactId: string) => {
  const target = contacts.value.find((contact) => contact.id === contactId)
  if (!target) {
    return
  }

  editingId.value = contactId
  editForm.name = target.name
  editForm.role = target.role ?? ''
  editForm.email = target.email ?? ''
  editForm.phone = target.phone ?? ''
  editForm.memo = target.memo ?? ''
}

const cancelEdit = () => {
  editingId.value = null
}

const submitEdit = async (contactId: string) => {
  try {
    editingSubmit.value = true
    const updated = await updateProjectContact(projectId, contactId, {
      name: editForm.name.trim(),
      role: optionalValue(editForm.role),
      email: optionalValue(editForm.email),
      phone: optionalValue(editForm.phone),
      memo: optionalValue(editForm.memo),
    })

    contacts.value = contacts.value.map((contact) =>
      contact.id === contactId ? updated : contact,
    )
    editingId.value = null
  } catch (error) {
    contactsErrorMessage.value = extractErrorMessage(error, '연락처 수정에 실패했습니다.')
  } finally {
    editingSubmit.value = false
  }
}

const removeContact = async (contactId: string) => {
  const ok = window.confirm('이 연락처를 삭제하시겠습니까?')
  if (!ok) {
    return
  }

  try {
    await deleteProjectContact(projectId, contactId)
    contacts.value = contacts.value.filter((contact) => contact.id !== contactId)
  } catch (error) {
    contactsErrorMessage.value = extractErrorMessage(error, '연락처 삭제에 실패했습니다.')
  }
}

const goBoard = () => {
  router.push(`/app/projects/${projectId}/board`)
}

const goTemplates = () => {
  router.push(`/app/projects/${projectId}/templates`)
}

const goRisks = () => {
  router.push(`/app/projects/${projectId}/risks`)
}

const formatDate = (dateTime: string) => new Date(dateTime).toLocaleString()

onMounted(async () => {
  await loadProject()
  await loadContacts()
})
</script>

<style scoped>
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 18px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta {
  margin-top: 0;
  display: grid;
  gap: 10px;
  padding: 14px 16px;
}

.meta div {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 8px;
}

dt {
  color: #64748b;
}

dd {
  margin: 0;
}

button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #fff;
  border-radius: 12px;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 600;
}

button.ghost {
  background: #fff;
  color: #2563eb;
  border-color: #e6eaf2;
}

button.danger {
  border-color: #ef4444;
  background: #ef4444;
}

.contacts-section {
  margin-top: 0;
  padding: 16px;
  border: 1px solid #e6eaf2;
}

.contacts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.contacts-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.contacts-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.contacts-table th,
.contacts-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #e6eaf2;
  text-align: left;
  vertical-align: top;
}

.contacts-table tr:hover td {
  background: rgba(37, 99, 235, 0.04);
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-btn {
  width: 34px;
  height: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.icon-btn .mdi {
  font-size: 18px;
  line-height: 1;
}

.create-form-modal {
  margin: 0;
}

.form-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 10px;
}

input {
  border: 1px solid #e6eaf2;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
}

.error {
  color: #ef4444;
}

.muted {
  color: #64748b;
}

@media (max-width: 900px) {
  .detail-header {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
