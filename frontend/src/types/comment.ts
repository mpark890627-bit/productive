export interface CommentItem {
  id: string
  taskId: string
  authorUserId: string
  authorName: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
