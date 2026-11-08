// Reusable badge for item/claim statuses
// Colours from the design system (Page 4 of patapotea.pdf):
//   in_store / submitted  → grey
//   claim_pending         → amber/yellow
//   approved / in_review  → blue
//   collected             → green
//   rejected              → red
//   unclaimed             → grey outline

import type { ItemStatus, ClaimStatus } from '../../types'

type Status = ItemStatus | ClaimStatus

const labels: Record<Status, string> = {
  in_store: 'In store',
  claim_pending: 'Claim pending',
  approved: 'Approved',
  collected: 'Collected',
  rejected: 'Rejected',
  unclaimed: 'Unclaimed',
  submitted: 'Submitted',
  in_review: 'In review',
}

const colours: Record<Status, string> = {
  in_store: 'bg-gray-100 text-gray-700',
  claim_pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  collected: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  unclaimed: 'bg-gray-100 text-gray-500 border border-gray-300',
  submitted: 'bg-blue-100 text-blue-700',
  in_review: 'bg-blue-100 text-blue-700',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colours[status]}`}>
      {labels[status]}
    </span>
  )
}
