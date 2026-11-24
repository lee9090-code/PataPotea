// TODO: Table of all claims with status badges
// TODO: "Review →" action for pending claims

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { claimsService } from '../../services/claimsService'

interface PendingClaim {
  id: number
  reference: string
  itemReference: string
  itemDescription: string
  claimantName?: string
  status: string
  submittedAt: string
}

function formatDate(value: string) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}

export default function ClaimsList() {
  const [claims, setClaims] = useState<PendingClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(claims.length / pageSize))
  const visibleClaims = claims.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  useEffect(() => {
    const loadClaims = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await claimsService.pending()
        setClaims(Array.isArray(response.data) ? response.data : [])
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          'Unable to load pending claims. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadClaims()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Claims needing review</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review ownership claims and verify the information submitted by claimants.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending claims</p>
          <p className="text-2xl font-bold text-navy mt-2">
            {loading ? '—' : claims.length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Claims on this page</p>
          <p className="text-2xl font-bold text-navy mt-2">
            {loading ? '—' : visibleClaims.length}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-navy">Pending claim records</h2>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-navy hover:text-amber-600"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading pending claims...
          </div>
        ) : claims.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">No pending claims</p>
            <p className="text-sm text-gray-500 mt-1">
              New claims submitted by students and staff will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Claim reference</th>
                    <th className="px-5 py-3 font-semibold">Item</th>
                    <th className="px-5 py-3 font-semibold">Claimant</th>
                    <th className="px-5 py-3 font-semibold">Submitted</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visibleClaims.map(claim => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-navy whitespace-nowrap">
                        {claim.reference}
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {claim.itemReference}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 max-w-xs">
                          {claim.itemDescription}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {claim.claimantName || 'Not provided by API'}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(claim.submittedAt)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          {claim.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <Link
                          to={`/guard/claims/${claim.id}/verify`}
                          className="text-sm font-semibold text-navy hover:text-amber-600"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, claims.length)} of {claims.length} claims
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(current => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

