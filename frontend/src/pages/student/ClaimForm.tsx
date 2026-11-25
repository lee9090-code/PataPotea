
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { claimsService } from '../../services/claimsService'
import { itemsService } from '../../services/itemsService'
import StatusBadge from '../../components/ui/StatusBadge'
import type { Item } from '../../types'

export default function ClaimForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [item, setItem] = useState<Item | null>(null)
  const [identifyingMarks, setIdentifyingMarks] = useState('')
  const [hiddenDetails, setHiddenDetails] = useState('')
  const [lostWhenWhere, setLostWhenWhere] = useState('')
  const [proofFile, setProofFile] = useState<File | undefined>()
  const [confirmed, setConfirmed] = useState(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadItem = async () => {
      try {
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
          setError('Invalid item reference.')
          return
        }

        const response = await itemsService.getById(Number(id))
        setItem(response.data)
      } catch {
        setError('We could not find this item. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [id])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!item) {
      setError('Item details are unavailable.')
      return
    }

    if (item.status !== 'in_store') {
      setError('This item is no longer available for claiming.')
      return
    }

    if (!confirmed) {
      setError('Please confirm that the information you provided is accurate.')
      return
    }

    try {
      setSubmitting(true)

      await claimsService.submit({
        itemId: item.id,
        identifyingMarks,
        hiddenDetails,
        lostWhenWhere,
        proofFile,
      })

      navigate('/student/my-claims', {
        state: { claimSubmitted: true },
      })
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data &&
        typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Your claim could not be submitted. Please check your details and try again.'

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading item details...
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-navy">
          Item not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          We could not load the item you want to claim.
        </p>
        <button
          onClick={() => navigate('/items')}
          className="mt-5 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white"
        >
          Browse items
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/items/${item.id}`)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy"
      >
        ← Back to item
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">
          Claim an item
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Provide details that help us verify that this item belongs to you.
        </p>
      </div>

      {item.status !== 'in_store' && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          This item is no longer available for new claims.
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Claim form */}
        <section className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-navy">
                Help us identify your item
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Give us enough information to verify ownership.
              </p>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Identifying marks
              </label>
              <textarea
                value={identifyingMarks}
                onChange={event => setIdentifyingMarks(event.target.value)}
                required
                rows={3}
                placeholder="Describe scratches, stickers, engravings, colours or other identifying marks..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
              <p className="mt-1 text-xs text-gray-400">
                Describe visible features that can help identify your item.
              </p>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contents / hidden details
              </label>
              <textarea
                value={hiddenDetails}
                onChange={event => setHiddenDetails(event.target.value)}
                required
                rows={3}
                placeholder="Describe contents, internal details or anything not visible to the public..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
              <p className="mt-1 text-xs text-gray-400">
                These details are private and help verify ownership.
              </p>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                When and where did you lose it?
              </label>
              <input
                type="text"
                value={lostWhenWhere}
                onChange={event => setLostWhenWhere(event.target.value)}
                required
                placeholder="e.g. 12 November, near the library"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Supporting proof (optional)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={event => {
                  const file = event.target.files?.[0]

                  if (file) {
                    const allowedTypes = [
                      'image/jpeg',
                      'image/png',
                      'application/pdf',
                    ]

                    if (!allowedTypes.includes(file.type)) {
                      setError('Please upload a JPG, PNG or PDF file.')
                      event.target.value = ''
                      setProofFile(undefined)
                      return
                    }

                    setError('')
                    setProofFile(file)
                  } else {
                    setProofFile(undefined)
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-400">
                Accepted formats: JPG, PNG and PDF.
              </p>
              {proofFile && (
                <p className="mt-2 text-sm text-green-700">
                  Selected: {proofFile.name}
                </p>
              )}
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
                  that I am the rightful owner of this item.
                </span>
              </label>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || item.status !== 'in_store'}
              className="w-full rounded-lg bg-navy px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting claim...' : 'Submit claim'}
            </button>
          </form>
        </section>

        {/* Item summary and privacy information */}
        <aside className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.publicDescription}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 items-center justify-center bg-gray-100 text-sm text-gray-400">
                No item image available
              </div>
            )}

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {item.category}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-navy">
                {item.publicDescription}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Reference: {item.reference}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Found: {item.dateFound}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Location: {item.locationFound}
              </p>

              <div className="mt-4">
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <h3 className="font-semibold text-navy">
              A safe return to the right person.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Your identifying marks and hidden details are private.
              They help our team verify ownership and are not displayed
              publicly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
