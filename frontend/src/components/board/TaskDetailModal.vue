<template>
  <v-dialog :model-value="open && !!task" max-width="820" scrollable @update:model-value="onDialogToggle">
    <v-card v-if="task">
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5">
        <div>
          <h3 class="modal-title">{{ task.title }}</h3>
          <p class="modal-sub">태스크 상세 정보</p>
        </div>
        <v-btn variant="text" icon="mdi-close" @click="$emit('close')" />
      </v-card-title>

      <v-card-text class="px-5 pb-1">
        <v-alert v-if="commentErrorMessage" type="error" variant="tonal" class="mb-3">{{ commentErrorMessage }}</v-alert>

        <div class="meta-grid">
          <v-card variant="tonal" class="meta-card" color="surface">
            <h4>설명</h4>
            <p>{{ task.description || '없음' }}</p>
          </v-card>

          <v-card variant="tonal" class="meta-card" color="surface">
            <h4>우선순위</h4>
            <div class="priority-row">
              <v-select
                v-model="priorityInput"
                :items="priorityItems"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                :disabled="prioritySubmitting"
              />
              <v-btn size="small" color="primary" :loading="prioritySubmitting" @click="updatePriority">변경</v-btn>
            </div>
          </v-card>

          <v-card variant="tonal" class="meta-card" color="surface">
            <h4>기본 정보</h4>
            <div class="chips">
              <v-chip size="small" prepend-icon="mdi-calendar-month-outline">{{ task.dueDate || '마감 없음' }}</v-chip>
              <v-chip size="small" prepend-icon="mdi-account-outline">{{ task.assigneeUserId || '담당자 없음' }}</v-chip>
              <v-chip size="small" :color="priorityColor" variant="tonal">{{ priorityInput }}</v-chip>
            </div>
            <p class="tag-text"><strong>태그:</strong> {{ tagText }}</p>
          </v-card>
        </div>

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
import { computed, ref, watch } from 'vue'
import { extractErrorMessage } from '../../api/apiClient'
import { createTaskComment, deleteComment, getTaskComments } from '../../api/comments'
import { patchTask } from '../../api/tasks'
import { useAuthStore } from '../../stores/auth'
import type { CommentItem } from '../../types/comment'
import type { TaskItem, TaskPriority } from '../../types/task'
import { taskPriorityColors } from '../../utils/taskVisuals'

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
const priorityInput = ref<TaskPriority>('MEDIUM')
const prioritySubmitting = ref(false)
const authStore = useAuthStore()

const priorityItems = [
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
]

const commentRules = [(v: string) => !!v?.trim() || '댓글을 입력하세요.']

const tagText = computed(() => {
  if (!props.task?.tags?.length) {
    return '없음'
  }
  return props.task.tags.map((tag) => tag.name).join(', ')
})

const priorityColor = computed(() => taskPriorityColors[priorityInput.value])

const onDialogToggle = (value: boolean) => {
  if (!value) {
    emit('close')
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

const updatePriority = async () => {
  if (!props.task) {
    return
  }
  try {
    prioritySubmitting.value = true
    const updated = await patchTask(props.task.id, { priority: priorityInput.value })
    emit('updated', updated)
  } catch (error) {
    emit('error', extractErrorMessage(error, '우선순위 변경에 실패했습니다.'))
  } finally {
    prioritySubmitting.value = false
  }
}

watch(
  () => [props.open, props.task?.id, props.task?.priority],
  async () => {
    if (props.task?.priority) {
      priorityInput.value = props.task.priority
    }
    if (props.open && props.task?.id) {
      await loadComments()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.modal-title {
  margin: 0;
  font-size: 20px;
}

.modal-sub {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.meta-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.meta-card {
  padding: 10px;
}

.meta-card h4 {
  margin: 0 0 8px;
  font-size: 13px;
}

.meta-card p {
  margin: 0;
  color: #475569;
}

.priority-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-text {
  margin-top: 8px;
  font-size: 13px;
}

.comments {
  margin-top: 16px;
}

.comments-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comments-head h4 {
  margin: 0;
}

.comment-list {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 10px;
  background: rgba(var(--v-theme-surface), 0.4);
}

.comment-item {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.14);
}

.comment-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-content {
  margin: 0;
  white-space: pre-wrap;
}

.comment-form {
  margin-top: 12px;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
