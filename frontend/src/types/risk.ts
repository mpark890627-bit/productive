export type RiskStatus = 'IDENTIFIED' | 'ASSESSING' | 'MITIGATING' | 'MONITORING' | 'CLOSED'
export type RiskLevelBucket = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type RiskOwnerFilter = 'ALL' | 'ME' | 'UNASSIGNED'

export interface RiskItem {
  id: string
  projectId: string
  title: string
  description: string | null
  category: string | null
  status: RiskStatus
  probability: number
  impact: number
  levelScore: number
  levelBucket: RiskLevelBucket
  ownerUserId: string | null
  ownerUserName: string | null
  nextReviewDate: string | null
  mitigationPlan: string | null
  contingencyPlan: string | null
  triggers: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RiskSummary {
  statusCounts: Record<string, number>
  levelBucketCounts: Record<string, number>
  overdueActionsCount: number
}

export type RiskActionStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'

export interface RiskActionItem {
  id: string
  riskId: string
  title: string
  description: string | null
  status: RiskActionStatus
  dueDate: string | null
  assigneeUserId: string | null
  assigneeUserName: string | null
  createdAt: string
  updatedAt: string
}

export interface RiskLinkedTaskItem {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string | null
}

export interface RiskTagItem {
  id: string
  name: string
}

export interface RiskCommentItem {
  id: string
  riskId: string
  authorUserId: string
  authorUserName: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface RiskActivityItem {
  id: string
  actorUserId: string
  entityType: string
  entityId: string
  action: string
  meta: Record<string, unknown> | null
  createdAt: string
}

export interface RiskMatrixCell {
  probability: number
  impact: number
  count: number
}

export interface RiskMatrixSummary {
  cells: RiskMatrixCell[]
}
