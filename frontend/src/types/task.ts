export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface TaskTagItem {
  id: string
  name: string
}

export interface TaskItem {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeUserId: string | null
  tags: TaskTagItem[]
  createdAt: string
  updatedAt: string
}
