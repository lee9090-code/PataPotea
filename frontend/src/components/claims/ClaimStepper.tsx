// 4-step progress indicator: Submitted → In review → Approved → Collected
// Active step highlighted, completed steps filled
// See design: Page 10 of patapotea.pdf

const STEPS = ['Submitted', 'In review', 'Approved', 'Collected']

const stepIndex: Record<string, number> = {
  submitted: 0,
  in_review: 1,
  approved: 2,
  collected: 3,
}

export default function ClaimStepper({ status }: { status: string }) {
  const current = stepIndex[status] ?? 0
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex flex-col items-center`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              ${i <= current ? 'bg-navy text-white' : 'bg-gray-200 text-gray-400'}`}>
              {i + 1}
            </div>
            <span className="text-xs mt-1 text-gray-500">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-8 mb-5 ${i < current ? 'bg-navy' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
