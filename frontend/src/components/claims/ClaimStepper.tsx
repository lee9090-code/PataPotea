
import type { ClaimStatus } from '../../types'

const STEPS = [
  'Submitted',
  'In review',
  'Approved',
  'Collected',
]

const stepIndex: Record<ClaimStatus, number> = {
  submitted: 0,
  in_review: 1,
  approved: 2,
  collected: 3,
  rejected: 1,
}

export default function ClaimStepper({ status }: { status: ClaimStatus }) {
  const current = stepIndex[status]
  const isRejected = status === 'rejected'

  return (
    <div className="w-full" aria-label={`Claim status: ${status}`}>
      <div className="flex items-start w-full">
        {STEPS.map((label, index) => {
          const completed = index < current
          const active = index === current
          const reached = index <= current && !isRejected

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-semibold shrink-0
                    ${
                      isRejected && active
                        ? 'bg-red-600 text-white'
                        : reached
                          ? 'bg-navy text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {completed ? '✓' : index + 1}
                </div>

                <span
                  className={`text-xs mt-2 text-center
                    ${active ? 'font-semibold text-navy' : 'text-gray-500'}`}
                >
                  {label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-5
                    ${
                      index < current && !isRejected
                        ? 'bg-navy'
                        : 'bg-gray-200'
                    }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {isRejected && (
        <p className="mt-3 text-sm font-medium text-red-600" role="status">
          Your claim was rejected. Please review the decision details.
        </p>
      )}
    </div>
  )
}
