
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { claimsService } from '../../services/claimsService'
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

export default function Dashboard() {
  const { user } = useAuth()
  const [claims, setClaims] = useState<MyClaim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClaims = async () => {
      try {
        const response = await claimsService.mine()
        setClaims(response.data)
      } catch {
        setClaims([])
      } finally {
        setLoading(false)
      }
    }

    loadClaims()
  }, [])

  const activeClaims = claims.filter(
    claim => !['collected', 'rejected'].includes(claim.status)
  )

  const collectedClaims = claims.filter(claim => claim.status === 'collected')

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">
          Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Here is what is happening with your lost and found activity.
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active claims</p>
          <p className="text-3xl font-bold text-navy mt-2">
            {loading ? '—' : activeClaims.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Items collected</p>
          <p className="text-3xl font-bold text-navy mt-2">
            {loading ? '—' : collectedClaims.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Account type</p>
          <p className="text-3xl font-bold text-navy mt-2 capitalize">
            {user?.role ?? '—'}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/items"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-navy transition-colors"
        >
          <h3 className="font-semibold text-navy">Browse found items</h3>
          <p className="mt-1 text-sm text-gray-500">
            See what has been handed in recently.
          </p>
        </Link>

        <Link
          to="/report"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-navy transition-colors"
        >
          <h3 className="font-semibold text-navy">Report a loss</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tell us what you lost and where.
          </p>
        </Link>

        <Link
          to="/account"
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-navy transition-colors"
        >
          <h3 className="font-semibold text-navy">My account</h3>
          <p className="mt-1 text-sm text-gray-500">
            View your profile and sign out.
          </p>
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy">Active claims</h2>
          <Link
            to="/student/my-claims"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            View all claims
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-gray-500 py-8 text-center">
            Loading your claims...
          </p>
        )}

        {!loading && activeClaims.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <h3 className="text-lg font-semibold text-navy">
              No active claims right now
            </h3>
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

        {!loading && activeClaims.length > 0 && (
          <div className="space-y-4">
            {activeClaims.slice(0, 3).map(claim => (
              <article
                key={claim.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {claim.itemReference}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-navy">
                    {claim.itemDescription}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Submitted {formatDate(claim.submittedAt)}
                  </p>
                </div>

                <StatusBadge status={claim.status} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
