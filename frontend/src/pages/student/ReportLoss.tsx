
import { useState, type FormEvent } from 'react'

export default function ReportLoss() {
  const [itemType, setItemType] = useState('')
  const [description, setDescription] = useState('')
  const [lastSeen, setLastSeen] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!confirmed) return

    // Backend endpoint is not available yet.
    // Do not report success until the backend integration is implemented.
    setSubmitted(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">
          Report a lost item
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Tell us about something you've lost on campus. We'll use these
          details to help identify a possible match.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">
          Reporting service not yet connected
        </p>
        <p className="mt-1 text-sm text-yellow-700">
          You can prepare your report below, but submission will become
          available once the reporting service is connected.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {submitted ? (
          <div className="py-8 text-center">
            <h2 className="text-xl font-semibold text-navy">
              Your report is ready
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Your information has been validated locally, but it has not
              been sent or saved. Please try again after the reporting
              service becomes available.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-5 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white"
            >
              Review report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="mb-6 text-lg font-semibold text-navy">
              Item details
            </h2>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Item type
              </label>
              <select
                required
                value={itemType}
                onChange={event => setItemType(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-navy focus:outline-none"
              >
                <option value="">Select item category</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Bags">Bags</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
                <option value="Keys">Keys</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Item description
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Describe the item, including its colour, brand and distinguishing features..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                When and where did you last see it?
              </label>
              <textarea
                required
                rows={3}
                value={lastSeen}
                onChange={event => setLastSeen(event.target.value)}
                placeholder="e.g. 18 November, around 2 PM, near the university library..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contact email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={event => setContactEmail(event.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-navy focus:outline-none"
              />
            </div>

            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <label className="flex items-start gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={event => setConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-navy"
                />
                <span>
                  I confirm that the information provided is accurate and
                  that this item belongs to me.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-gray-400 px-5 py-3 font-semibold text-white"
            >
              Reporting service coming soon
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="font-semibold text-navy">
          Lost something? Don't lose hope.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Items handed in by other students and staff may appear in the
          found items catalogue. Check regularly for a possible match.
        </p>
      </div>
    </div>
  )
}
