
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { lostReportsService } from '../../services/lostReportsService'

export default function ReportLoss() {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [locationLost, setLocationLost] = useState('')
  const [dateLost, setDateLost] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedReference, setSubmittedReference] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!confirmed) return

    setSubmitting(true)
    setError('')

    try {
      const response = await lostReportsService.submit({
        category,
        description,
        locationLost,
        dateLost,
      })

      setSubmittedReference(response.data.reference)
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        'We could not submit your report. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const startNewReport = () => {
    setCategory('')
    setDescription('')
    setLocationLost('')
    setDateLost('')
    setConfirmed(false)
    setSubmittedReference('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">
          Report a lost item
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Tell us about something you've lost on campus. Campus security
          will be able to see your report alongside items that have been
          handed in.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {submittedReference ? (
          <div className="py-8 text-center">
            <h2 className="text-xl font-semibold text-navy">
              Report submitted
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Your reference is <span className="font-semibold text-navy">{submittedReference}</span>.
              Campus security can now see it. Keep checking Search lost items for a
              possible match.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={startNewReport}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700"
              >
                Report another item
              </button>
              <Link
                to="/items"
                className="rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white"
              >
                Search lost items
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="mb-6 text-lg font-semibold text-navy">
              Item details
            </h2>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Item category
              </label>
              <select
                required
                value={category}
                onChange={event => setCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:border-navy focus:outline-none"
              >
                <option value="">Select item category</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Bags">Bags</option>
                <option value="Bottles">Bottles</option>
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

            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Where did you lose it?
                </label>
                <input
                  type="text"
                  required
                  value={locationLost}
                  onChange={event => setLocationLost(event.target.value)}
                  placeholder="e.g. Library, main entrance"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  When did you lose it?
                </label>
                <input
                  type="date"
                  required
                  value={dateLost}
                  onChange={event => setDateLost(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-navy focus:outline-none"
                />
              </div>
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
              disabled={!confirmed || submitting}
              className="w-full rounded-lg bg-amber-brand px-5 py-3 font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit report'}
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
