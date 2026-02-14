<template>
  <v-dialog :model-value="open && !!task" max-width="920" scrollable @update:model-value="onDialogToggle">
    <v-card v-if="task">
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5">
        <div>
          <h3 class="modal-title">태스크 상세/수정</h3>
          <p class="modal-sub">{{ task.id }}</p>
        </div>
        <v-btn variant="text" icon="mdi-close" @click="$emit('close')" />
      </v-card-title>

      <v-card-text class="px-5 pb-2">
        <v-alert v-if="formErrorMessage" type="error" variant="tonal" class="mb-3">{{ formErrorMessage }}</v-alert>
        <v-alert v-if="commentErrorMessage" type="error" variant="tonal" class="mb-3">{{ commentErrorMessage }}</v-alert>

        <v-form class="edit-grid" @submit.prevent="saveTask">
          <v-text-field
            v-model="form.title"
            label="제목"
            :rules="titleRules"
            :disabled="formSubmitting"
            density="comfortable"
          />
          <v-select
            v-model="form.status"
            label="상태"
            :items="statusItems"
            item-title="label"
            item-value="value"
            :disabled="formSubmitting"
            density="comfortable"
          />
          <v-select
            v-model="form.priority"
            label="우선순위"
            :items="priorityItems"
            item-title="label"
            item-value="value"
            :disabled="formSubmitting"
            density="comfortable"
          />
          <v-text-field
            v-model="form.dueDate"
            label="마감일"
            type="date"
            placeholder="YYYY-MM-DD"
            :disabled="formSubmitting"
            density="comfortable"
          />
          <v-autocomplete
            v-model="form.assigneeUserId"
            v-model:search="assigneeSearch"
            :items="assigneeOptions"
            item-title="label"
            item-value="userId"
            label="담당자"
            placeholder="이름/이메일로 검색"
            clearable
            :loading="assigneeLoading"
            :disabled="formSubmitting"
            density="comfortable"
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :title="item.raw.name" :subtitle="item.raw.email" />
            </template>
          </v-autocomplete>
          <v-textarea
            v-model="form.description"
            label="설명"
            rows="3"
            auto-grow
            :disabled="formSubmitting"
          />

          <div class="form-actions">
            <v-btn type="submit" color="primary" :loading="formSubmitting" :disabled="formSubmitting">
              저장
            </v-btn>
          </div>
        </v-form>

        <v-divider class="my-4" />

        <section class="tags-section">
          <h4>태그</h4>
          <div class="tag-controls">
            <v-text-field
              v-model="tagInput"
              label="태그명"
              density="compact"
              hide-details
              :disabled="tagSubmitting"
              @keyup.enter="addTag"
            />
            <v-btn color="primary" variant="tonal" :loading="tagSubmitting" :disabled="tagSubmitting" @click="addTag">
              태그 추가
            </v-btn>
          </div>
          <div class="tag-list">
            <v-chip
              v-for="tag in task.tags"
              :key="tag.id"
              size="small"
              class="mr-2 mb-2"
              closable
              @click:close="removeTag(tag.id)"
            >
              {{ tag.name }}
            </v-chip>
            <span v-if="task.tags.length === 0" class="muted">태그 없음</span>
          </div>
        </section>

        <v-divider class="my-4" />

        <section class="comments">
          <div class="comments-head">
            <h4>댓글</h4>
            <v-btn size="small" variant="text" prepend-icon="mdi-refresh" @click="loadComments">새로고침</v-btn>
          </div>

          <v-skeleton-loader v-if="loadingComments" type="list-item-three-line@3" />
          <v-list v-else-if="comments.length > 0" lines="two" class="comment-list">
            <v-list-item v-for="comment in comments" :key="comment.id" class="comment-item">
              <template #title>
                <div class="comment-head">
                  <strong>{{ comment.authorName || 'Unknown' }}</strong>
                  <v-btn
                    v-if="canDeleteComment(comment)"
                    size="x-small"
                    color="error"
                    variant="text"
                    :loading="deletingCommentId === comment.id"
                    @click="removeComment(comment.id)"
                  >
                    삭제
                  </v-btn>
                </div>
              </template>
              <template #subtitle>
                <p class="comment-content">{{ comment.content }}</p>
                <small>{{ new Date(comment.createdAt).toLocaleString() }}</small>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" variant="tonal">댓글이 없습니다.</v-alert>

          <v-form class="comment-form" @submit.prevent="submitComment">
            <v-textarea
              v-model="commentInput"
              rows="3"
              auto-grow
              label="댓글 작성"
              :rules="commentRules"
              :disabled="commentSubmitting"
            />
            <div class="comment-actions">
              <v-btn type="submit" color="primary" :loading="commentSubmitting" :disabled="commentSubmitting">
                댓글 등록
              </v-btn>
            </div>
          </v-form>
        </section>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, ref, watch } from 'vue'
import { extractErrorMessage } from '../../api/apiClient'
import { createTaskComment, deleteComment, getTaskComments } from '../../api/comments'
import { getTags, createTag } from '../../api/tags'
import { attachTagToTask, detachTagFromTask, getTaskById, patchTask } from '../../api/tasks'
import { getProjectUsers } from '../../api/users'
import { useAuthStore } from '../../stores/auth'
import type { CommentItem } from '../../types/comment'
import type { TaskItem, TaskPriority, TaskStatus } from '../../types/task'

const props = defineProps<{
  open: boolean
  task: TaskItem | null
}>()

const emit = defineEmits<{
  close: []
  commented: []
  error: [message: string]
  updated: [task: TaskItem]
}>()

const comments = ref<CommentItem[]>([])
const loadingComments = ref(false)
const commentInput = ref('')
const commentSubmitting = ref(false)
const deletingCommentId = ref<string | null>(null)
const commentErrorMessage = ref('')
const formSubmitting = ref(false)
const formErrorMessage = ref('')
const tagInput = ref('')
const tagSubmitting = ref(false)
const assigneeSearch = ref('')
const assigneeLoading = ref(false)
const assigneeOptions = ref<Array<{ userId: string; name: string; email: string; label: string }>>([])
let assigneeSearchTimer: ReturnType<typeof setTimeout> | null = null
const authStore = useAuthStore()

const form = reactive<{
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  assigneeUserId: string | null
}>({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeUserId: null,
})

const statusItems: Array<{ label: string; value: TaskStatus }> = [
  { label: 'TODO', value: 'TODO' },
  { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
  { label: 'DONE', value: 'DONE' },
]

const priorityItems: Array<{ label: string; value: TaskPriority }> = [
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
]

const titleRules = [(v: string) => !!v?.trim() || '제목은 필수입니다.']
const commentRules = [(v: string) => !!v?.trim() || '댓글을 입력하세요.']

const onDialogToggle = (value: boolean) => {
  if (!value) {
    emit('close')
  }
}

const syncFormFromTask = () => {
  if (!props.task) {
    return
  }
  form.title = props.task.title ?? ''
  form.description = props.task.description ?? ''
  form.status = props.task.status ?? 'TODO'
  form.priority = props.task.priority ?? 'MEDIUM'
  form.dueDate = props.task.dueDate ?? ''
  form.assigneeUserId = props.task.assigneeUserId ?? null
  assigneeSearch.value = ''
}

const loadAssigneeOptions = async (keyword = '') => {
  if (!props.task?.projectId) {
    return
  }
  try {
    assigneeLoading.value = true
    const users = await getProjectUsers(props.task.projectId, keyword, 0, 50)
    assigneeOptions.value = users.map((user) => ({
      userId: user.userId,
      name: user.name,
      email: user.email,
      label: `${user.name} (${user.email})`,
    }))
  } catch (error) {
    emit('error', extractErrorMessage(error, '담당자 목록을 불러오지 못했습니다.'))
  } finally {
    assigneeLoading.value = false
  }
}

const loadComments = async () => {
  if (!props.task) {
    return
  }
  try {
    loadingComments.value = true
    commentErrorMessage.value = ''
    const response = await getTaskComments(props.task.id, 0, 50)
    comments.value = response.content
  } catch (error) {
    const message = extractErrorMessage(error, '댓글을 불러오지 못했습니다.')
    commentErrorMessage.value = message
    emit('error', message)
  } finally {
    loadingComments.value = false
  }
}

const refreshTaskDetail = async () => {
  if (!props.task) {
    return
  }
  const detail = await getTaskById(props.task.id)
  emit('updated', detail)
}

const saveTask = async () => {
  if (!props.task) {
    return
  }
  if (!form.title.trim()) {
    formErrorMessage.value = '제목은 필수입니다.'
    return
  }

  try {
    formSubmitting.value = true
    formErrorMessage.value = ''
    const updated = await patchTask(props.task.id, {
      title: form.title.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      assigneeUserId: form.assigneeUserId,
    })
    emit('updated', updated)
  } catch (error) {
    const message = extractErrorMessage(error, '태스크 수정에 실패했습니다.')
    formErrorMessage.value = message
    emit('error', message)
  } finally {
    formSubmitting.value = false
  }
}

const addTag = async () => {
  if (!props.task || !tagInput.value.trim()) {
    return
  }
  try {
    tagSubmitting.value = true
    const name = tagInput.value.trim()
    const existing = await getTags(name)
    const tag =
      existing.find((item) => item.name.trim().toLowerCase() === name.toLowerCase()) ?? (await createTag(name))
    await attachTagToTask(props.task.id, tag.id)
    tagInput.value = ''
    await refreshTaskDetail()
  } catch (error) {
    emit('error', extractErrorMessage(error, '태그 추가에 실패했습니다.'))
  } finally {
    tagSubmitting.value = false
  }
}

const removeTag = async (tagId: string) => {
  if (!props.task) {
    return
  }
  try {
    tagSubmitting.value = true
    await detachTagFromTask(props.task.id, tagId)
    await refreshTaskDetail()
  } catch (error) {
    emit('error', extractErrorMessage(error, '태그 제거에 실패했습니다.'))
  } finally {
    tagSubmitting.value = false
  }
}

const submitComment = async () => {
  if (!props.task || !commentInput.value.trim()) {
    return
  }
  try {
    commentSubmitting.value = true
    await createTaskComment(props.task.id, commentInput.value.trim())
    commentInput.value = ''
    await loadComments()
    emit('commented')
  } catch (error) {
    emit('error', extractErrorMessage(error, '댓글 작성에 실패했습니다.'))
  } finally {
    commentSubmitting.value = false
  }
}

const canDeleteComment = (comment: CommentItem) => authStore.user?.userId === comment.authorUserId

const removeComment = async (commentId: string) => {
  try {
    deletingCommentId.value = commentId
    await deleteComment(commentId)
    await loadComments()
  } catch (error) {
    emit('error', extractErrorMessage(error, '댓글 삭제에 실패했습니다.'))
  } finally {
    deletingCommentId.value = null
  }
}

watch(
  () => [props.open, props.task?.id],
  async () => {
    formErrorMessage.value = ''
    commentErrorMessage.value = ''
    syncFormFromTask()
    if (props.open && props.task?.id) {
      await Promise.all([loadComments(), loadAssigneeOptions()])
    }
  },
  { immediate: true },
)

watch(
  assigneeSearch,
  (keyword) => {
    if (!props.open || !props.task?.id) {
      return
    }
    if (assigneeSearchTimer) {
      clearTimeout(assigneeSearchTimer)
    }
    assigneeSearchTimer = setTimeout(() => {
      void loadAssigneeOptions(keyword)
    }, 250)
  },
)

onUnmounted(() => {
  if (assigneeSearchTimer) {
    clearTimeout(assigneeSearchTimer)
    assigneeSearchTimer = null
  }
  assigneeSearch.value = ''
})
</script>

<style scoped>
.modal-title {
  margin: 0;
  font-size: 20px;
}

.modal-sub {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.edit-grid .v-textarea,
.form-actions {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.tags-section h4,
.comments h4 {
  margin: 0 0 8px;
}

.tag-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-list {
  margin-top: 10px;
  min-height: 24px;
}

.muted {
  color: #64748b;
  font-size: 13px;
}

.comments-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-list {
  max-height: 220px;
  overflow: auto;
  margin-bottom: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 10px;
}

.comment-item + .comment-item {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.comment-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-content {
  margin: 4px 0;
  white-space: pre-wrap;
}

.comment-form {
  margin-top: 10px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .edit-grid {
    grid-template-columns: 1fr;
  }

  .tag-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
