export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Report',
      description:
        'Tell us what you lost or browse items that have already been handed in to campus security.',
      details: [
        'Browse found items using their category, date, or location.',
        'If your item is missing, submit a lost item report.',
        'Provide enough information to help identify your item.',
      ],
    },
    {
      number: '02',
      title: 'Match',
      description:
        'Think you have spotted your item? Submit a claim with identifying details only you would know.',
      details: [
        'Select the found item that looks familiar.',
        'Sign in and privately describe its identifying features.',
        'Wait while campus security reviews your claim.',
      ],
    },
    {
      number: '03',
      title: 'Collect',
      description:
        'Once your claim is approved, visit the lost and found desk to collect your item safely.',
      details: [
        'Check that your claim has been approved.',
        'Bring your identification when visiting the desk.',
        'Sign for your item when it is handed back to you.',
      ],
    },
  ]

  return (
    <div className="bg-gray-50">
      {/* Page heading */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold tracking-widest text-amber-600 uppercase mb-4">
            HOW IT WORKS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-5">
            From lost to found, in three steps.
          </h1>

          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            Getting your belongings back doesn't have to be complicated.
            Follow three simple steps to report, identify, and collect your item.
          </p>
        </div>
      </section>

      {/* Three-step process */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="space-y-10">
          {steps.map((step) => (
            <div
              key={step.number}
              className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 md:gap-10 bg-white rounded-xl p-8 border border-gray-100"
            >
              <div>
                <span className="text-4xl font-bold text-amber-500">
                  {step.number}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-navy mb-3">
                  {step.title}
                </h2>

                <p className="text-gray-600 leading-relaxed mb-5 max-w-3xl">
                  {step.description}
                </p>

                <ul className="space-y-3">
                  {step.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-3 text-gray-600"
                    >
                      <span className="text-amber-500 font-bold mt-0.5">
                        ✓
                      </span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy information */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-navy rounded-xl p-8 md:p-10">
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">
            YOUR PRIVACY MATTERS
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Enough to recognise. Not enough to impersonate.
          </h2>

          <p className="text-gray-200 leading-relaxed max-w-3xl">
            Public listings only show the information needed to help identify
            an item. Serial numbers, unique identifying marks, and proof of
            ownership remain private and are only shared with the team
            verifying your claim.
          </p>
        </div>
      </section>
    </div>
  )
}
