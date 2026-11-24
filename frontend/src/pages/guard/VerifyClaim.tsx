// TODO: Item + claimant header (item name, PT ref, claimant name + student number, status badge)
// TODO: Side-by-side comparison:
//   - Left: Claimant's answers (identifying mark, contents/hidden detail)
//   - Right: Item record — staff only (same fields from logged details)
// TODO: "A match is more than a similar colour." warning banner
// TODO: Decision reason textarea (required for rejection)
// TODO: "Approve claim" + "Reject claim" buttons
// TODO: "Every decision is saved with your name and timestamp." footer note
// See mockup: Page 12 of patapotea.pdf


import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { claimsService } from '../../services/claimsService'

interface ClaimDetails {
  id: number
  reference: string
  status: string
  submittedAt: string
  claimantAnswers: {
    identifyingMarks?: string
    hiddenDetails?: string
    lostWhenWhere?: string
    proofUrl?: string
  }
  itemRecord: {
    reference: string
    category: string
    privateDetails?: string
    loggedAt?: string
  }
}

export default function VerifyClaim() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [claim, setClaim] = useState<ClaimDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    const loadClaim = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await claimsService.getById(Number(id))
        setClaim(response.data)
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          'Unable to load this claim. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) loadClaim()
  }, [id])

  const handleDecision = async (
    decision: 'approved' | 'rejected',
    event?: FormEvent
  ) => {
    event?.preventDefault()
    if (!claim) return

    if (decision === 'rejected' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejecting this claim.')
      return
    }

    try {
      setSaving(true)
      setError('')

      await claimsService.decide(
        claim.id,
        decision,
        decision === 'rejected' ? rejectionReason.trim() : undefined
      )

      if (decision === 'approved') {
        navigate(`/guard/handover/${claim.id}`)
      } else {
        navigate('/guard/claims', {
          state: { message: `Claim ${claim.reference} was rejected.` },
        })
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Unable to update this claim. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Loading claim details...
      </div>
    )
  }

  if (error && !claim) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
        <Link to="/guard/claims" className="inline-block mt-4 text-sm text-navy font-medium">
          ← Back to claims
        </Link>
      </div>
    )
  }

  if (!claim) return null

  const answers = claim.claimantAnswers || {}
  const item = claim.itemRecord || {}
  const canDecide = ['submitted', 'in_review'].includes(claim.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/guard/claims" className="text-sm text-gray-500 hover:text-navy">
          ← Back to claims
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
          <div>
            <h1 className="text-2xl font-bold text-navy">Verify claim</h1>
            <p className="text-sm text-gray-500 mt-1">
              Claim reference: {claim.reference}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            {claim.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-navy">Item record</h2>
          <p className="text-xs text-gray-500 mt-1">
            Compare the claimant's answers with the original found-item record.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Item reference</p>
            <p className="text-sm font-semibold text-navy mt-1">
              {item.reference || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="text-sm text-gray-800 mt-1">{item.category || '—'}</p>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Private identifying details
          </p>
          <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">
            {item.privateDetails || 'No private details were recorded for this item.'}
          </p>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-navy">Claimant's answers</h2>
          <p className="text-xs text-gray-500 mt-1">
            Check whether the claimant has accurately described the item.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700">
            1. Identifying marks
          </p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
            {answers.identifyingMarks || 'No answer provided.'}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700">
            2. Hidden details
          </p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
            {answers.hiddenDetails || 'No answer provided.'}
          </p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700">
            3. When and where was the item lost?
          </p>
          <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
            {answers.lostWhenWhere || 'No answer provided.'}
          </p>
        </div>

        {answers.proofUrl && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700">Supporting proof</p>
            <a
              href={answers.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-sm font-medium text-blue-700 hover:underline"
            >
              View submitted proof →
            </a>
          </div>
        )}
      </section>

      {canDecide ? (
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-navy">Claim decision</h2>
            <p className="text-sm text-gray-500 mt-1">
              Approve only when the claimant provides convincing ownership evidence.
            </p>
          </div>

          {showRejectForm ? (
            <form onSubmit={event => handleDecision('rejected', event)} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Reason for rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={event => setRejectionReason(event.target.value)}
                required
                rows={3}
                placeholder="Explain why the ownership claim could not be verified."
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
              />

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Rejecting...' : 'Confirm rejection'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={saving}
                className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Reject claim
              </button>

              <button
                type="button"
                onClick={() => handleDecision('approved')}
                disabled={saving}
                className="rounded-lg bg-amber-brand px-5 py-2.5 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-60"
              >
                {saving ? 'Approving...' : 'Approve claim'}
              </button>
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          This claim has already been processed. No further decision can be submitted here.
        </div>
      )}
    </div>
  )
}
