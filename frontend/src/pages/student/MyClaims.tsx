
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { claimsService } from '../../services/claimsService'
import ClaimStepper from '../../components/claims/ClaimStepper'
import StatusBadge from '../../components/ui/StatusBadge'
import type { ClaimStatus } from '../../types'

interface MyClaim {
  id: number
  reference: string
  itemReference: string
  itemDescription: string
  status: ClaimStatus
  submittedAt: string
}

export default function MyClaims() {
  const [claims, setClaims] = useState<MyClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClaims = async () => {
      try {
        const response = await claimsService.mine()
        setClaims(response.data)
      } catch {
        setError('We could not load your claims. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadClaims()
  }, [])

  const activeClaims = claims.filter(
    claim => !['collected', 'rejected'].includes(claim.status)
  )

  const previousClaims = claims.filter(
    claim => ['collected', 'rejected'].includes(claim.status)
  )

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">My Claims</h1>
        <p className="mt-2 text-sm text-gray-500">
          Track the progress of items you have claimed.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 py-8 text-center">
          Loading your claims...
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && claims.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-navy">
            You haven't submitted any claims yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Found something that belongs to you? Browse the items handed in
            and submit a claim.
          </p>
          <Link
            to="/items"
            className="inline-block mt-5 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Browse found items
          </Link>
        </div>
      )}

      {!loading && !error && activeClaims.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-navy mb-4">
            Active claims
          </h2>

          <div className="space-y-5">
            {activeClaims.map(claim => (
              <article
                key={claim.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {claim.itemReference}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-navy">
                      {claim.itemDescription}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Claim reference: {claim.reference}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Submitted {formatDate(claim.submittedAt)}
                    </p>
                  </div>

                  <StatusBadge status={claim.status} />
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-semibold text-navy mb-4">
                    Claim progress
                  </h4>
                  <ClaimStepper status={claim.status} />
                </div>

                <p className="mt-5 text-sm text-gray-500">
                  {claim.status === 'submitted' &&
                    'Your claim has been submitted and is waiting for review.'}
                  {claim.status === 'in_review' &&
                    "We're checking the details you provided."}
                  {claim.status === 'approved' &&
                    'Your claim has been approved. Please visit the lost and found desk with your identification to collect your item.'}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && previousClaims.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-navy mb-4">
            Previous claims
          </h2>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {previousClaims.map(claim => (
              <div
                key={claim.id}
                className="flex flex-col gap-3 border-b border-gray-100 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-navy">
                    {claim.itemDescription}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {claim.reference} · {claim.itemReference}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Submitted {formatDate(claim.submittedAt)}
                  </p>
                </div>

                <StatusBadge status={claim.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
