// ─── User / Auth ────────────────────────────────────────────────
export type Role = 'student' | 'staff' | 'guard' | 'admin'

export interface User {
  id: number
  fullName: string
  email: string
  studentOrStaffNumber: string
  role: Role
}

// ─── Items ──────────────────────────────────────────────────────
export type ItemStatus = 'in_store' | 'claim_pending' | 'approved' | 'collected' | 'rejected' | 'unclaimed'

export interface Item {
  id: number
  reference: string        // e.g. PT-0264
  category: string
  publicDescription: string
  locationFound: string
  dateFound: string        // ISO date string
  status: ItemStatus
  imageUrl?: string
}

// ─── Claims ─────────────────────────────────────────────────────
export type ClaimStatus = 'submitted' | 'in_review' | 'approved' | 'collected' | 'rejected'

export interface Claim {
  id: number
  reference: string        // e.g. CL-0081
  itemId: number
  itemName: string
  itemReference: string
  claimantName: string
  status: ClaimStatus
  submittedAt: string
  updatedAt: string
  identifyingMarks?: string
  hiddenDetails?: string
  lostWhenWhere?: string
  decisionReason?: string
}

// ─── Audit Log ──────────────────────────────────────────────────
export interface AuditEntry {
  id: number
  action: string
  actorName: string
  actorRole: Role
  recordId: string
  timestamp: string
}
