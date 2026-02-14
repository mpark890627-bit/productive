export interface ProjectContactItem {
  id: string
  projectId: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  memo: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectContactCreateRequest {
  name: string
  role?: string
  email?: string
  phone?: string
  memo?: string
}

export interface ProjectContactUpdateRequest {
  name?: string
  role?: string
  email?: string
  phone?: string
  memo?: string
}
