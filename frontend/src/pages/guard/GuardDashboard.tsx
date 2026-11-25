
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { itemsService } from '../../services/itemsService'
import { claimsService } from '../../services/claimsService'
import type { Item } from '../../types'

interface PendingClaim {
  id: number
  reference: string
  itemReference: string
  itemDescription: string
  claimantName?: string
  status: string
  submittedAt: string
}

export default function GuardDashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [claims, setClaims] = useState<PendingClaim[]>([])
  const [collectedToday, setCollectedToday] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const pageSize = 4

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)

        const [itemsResponse, claimsResponse, statsResponse] = await Promise.all([
          itemsService.getAll(),
          claimsService.pending(),
          api.get('/handover/stats'),
        ])

        setItems(itemsResponse.data)
        setClaims(claimsResponse.data)
        setCollectedToday(statsResponse.data.collectedToday)
      } catch {
        setError('Unable to load dashboard information. Check that the backend is running.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const itemsInStore = items.filter(
    item => item.status === 'in_store'
  ).length

  const totalPages = Math.max(1, Math.ceil(claims.length / pageSize))
  const visibleClaims = claims.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  function formatDate(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleString('en-KE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-5">
        <h2 className="font-semibold text-navy">Guard workspace</h2>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Guard desk
            </p>
            <h1 className="mt-2 text-3xl font-bold text-navy">
              A safe return starts here.
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Here's what needs your attention today.
            </p>
          </div>

          <Link
            to="/guard/log-item"
            className="rounded-lg bg-amber-brand px-6 py-3 text-center text-sm font-semibold text-navy hover:opacity-90"
          >
            + Log found item
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-3">
          <StatCard
            title="Items in store"
            value={loading ? '...' : String(itemsInStore)}
            description="Ready to return"
          />
          <StatCard
            title="Pending claims"
            value={loading ? '...' : String(claims.length)}
            description="Need verification"
          />
          <StatCard
            title="Collected today"
            value={loading || collectedToday === null ? '...' : String(collectedToday)}
            description="ID checked & signed"
          />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-navy">
              Claims needing review
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review ownership evidence before approving a claim.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Item / claim</th>
                  <th className="px-5 py-4">Person</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      Loading claims...
                    </td>
                  </tr>
                ) : visibleClaims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      No claims currently need review.
                    </td>
                  </tr>
                ) : (
                  visibleClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-5 py-5">
                        <p className="font-semibold text-navy">
                          {claim.itemDescription || claim.itemReference}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {claim.reference}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        {claim.claimantName || 'Claimant'}
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                          {claim.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-gray-500">
                        {formatDate(claim.submittedAt)}
                      </td>

                      <td className="px-5 py-5">
                        <Link
                          to={`/guard/claims/${claim.id}/verify`}
                          className="font-semibold text-navy hover:text-amber-700"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex flex-col justify-between gap-3 border-t px-5 py-4 text-sm sm:flex-row sm:items-center">
              <span className="text-gray-500">
                Showing {claims.length === 0 ? 0 : (page - 1) * pageSize + 1}
                {'–'}
                {Math.min(page * pageSize, claims.length)} of {claims.length} pending claims
              </span>

              <div className="flex items-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(current => current - 1)}
                  className="rounded px-3 py-1 disabled:opacity-30"
                >
                  ‹
                </button>

                <span>{page} / {totalPages}</span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(current => current + 1)}
                  className="rounded px-3 py-1 disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="text-xs text-gray-500">
          All handovers require an in-person ID check and the owner's signature.
        </p>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  )
}