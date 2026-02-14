import type { TaskPriority, TaskStatus } from '../types/task'

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN PROGRESS',
  DONE: 'DONE',
}

export const taskStatusColors: Record<TaskStatus, string> = {
  TODO: 'info',
  IN_PROGRESS: 'primary',
  DONE: 'success',
}

export const taskPriorityColors: Record<TaskPriority, string> = {
  LOW: 'info',
  MEDIUM: 'secondary',
  HIGH: 'warning',
}
