// TODO: Searchable list of all items in store
// TODO: Filter by status (In store / Claim pending / Approved / Collected)
// TODO: Each row links to VerifyClaim or Handover depending on status


import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { itemsService } from '../../services/itemsService'
import type { Item } from '../../types'

const statusStyles: Record<string, string> = {
  in_store: 'bg-blue-50 text-blue-700',
  claim_pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  collected: 'bg-gray-100 text-gray-600',
  unclaimed: 'bg-red-50 text-red-700',
}

const statusLabels: Record<string, string> = {
  in_store: 'In store',
  claim_pending: 'Claim pending',
  approved: 'Approved',
  collected: 'Collected',
  unclaimed: 'Unclaimed',
}

function formatDate(value: string) {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

export default function ItemsList() {
  const location = useLocation()

  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadItems = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await itemsService.getAll({
        q: search.trim() || undefined,
        category: category || undefined,
      })

      setItems(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Unable to load found items. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
    // Load once when the page opens. Search is submitted using the Search button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Found items</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and search items recorded at the security desk.
          </p>
        </div>

        <Link
          to="/guard/log-item"
          className="inline-flex justify-center items-center rounded-lg bg-amber-brand px-4 py-2.5 text-sm font-semibold text-navy hover:opacity-90"
        >
          + Log found item
        </Link>
      </div>

      {location.state?.message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {location.state.message}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <form
          onSubmit={event => {
            event.preventDefault()
            loadItems()
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <input
            type="text"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by reference or description..."
            className="md:col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />

          <select
            value={category}
            onChange={event => setCategory(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          >
            <option value="">All categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Bags">Bags</option>
            <option value="Clothing">Clothing</option>
            <option value="Books and stationery">Books and stationery</option>
            <option value="Accessories">Accessories</option>
            <option value="Documents">Documents</option>
            <option value="Other">Other</option>
          </select>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-light disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search items'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy">Item records</h2>
          <span className="text-xs text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {error && (
          <div className="m-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading item records...
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">No items found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try changing your search or record a newly found item.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Item</th>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Location found</th>
                  <th className="px-5 py-3 font-semibold">Date found</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-sm text-navy">
                        {item.category}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-xs">
                        {item.publicDescription}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-navy whitespace-nowrap">
                      {item.reference}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {item.locationFound}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(item.dateFound)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusStyles[item.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabels[item.status] || item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
