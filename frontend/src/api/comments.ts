import { apiClient, type ApiEnvelope, type ApiMeta, unwrapData } from './apiClient'
import type { CommentItem, PageResponse } from '../types/comment'

export async function getTaskComments(taskId: string, page = 0, size = 20) {
  const { data } = await apiClient.get(`/api/tasks/${taskId}/comments`, {
    params: { page, size, sort: 'createdAt,asc' },
  })
  const envelope = data as ApiEnvelope<CommentItem[], ApiMeta | null>
  return {
    content: envelope.data,
    totalElements: envelope.meta?.totalElements ?? envelope.data.length,
    totalPages: envelope.meta?.totalPages ?? 1,
    size: envelope.meta?.size ?? envelope.data.length,
    number: envelope.meta?.page ?? 0,
  } satisfies PageResponse<CommentItem>
}

export async function createTaskComment(taskId: string, content: string) {
  const { data } = await apiClient.post(`/api/tasks/${taskId}/comments`, { content })
  return unwrapData<CommentItem>(data)
}

export async function deleteComment(commentId: string) {
  await apiClient.delete(`/api/comments/${commentId}`)
}
