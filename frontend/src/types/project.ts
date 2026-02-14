export interface ProjectItem {
  id: string
  ownerUserId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectCreateRequest {
  name: string
  description?: string
}

export interface ProjectUpdateRequest {
  name?: string
  description?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
