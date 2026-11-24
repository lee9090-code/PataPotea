// TODO: Search bar + "Export records" button
// TODO: "Items · 186 | Claims · 154" tab switcher
// TODO: Status filter chips (In store / Claim pending / Approved / Collected / Rejected / Unclaimed)
// TODO: Table: Item/claim | Person | Status | Updated | Action (Review → / View →)
// TODO: Pagination + "Showing 1–4 of N records"
// TODO: "A clear path from storage to collection" info section at bottom
// See mockup: Page 13 of patapotea.pdf


import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

interface RecordRow {
  id: number
  reference?: string
  itemReference?: string
  itemDescription?: string
  publicDescription?: string
  category?: string
  person?: string
  claimantName?: string
  finderName?: string
  status?: string
  updatedAt?: string
  submittedAt?: string
  dateFound?: string
  type?: string
}

type Tab = 'items' | 'claims'

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'in_store', label: 'In store' },
  { value: 'claim_pending', label: 'Claim pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'collected', label: 'Collected' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'unclaimed', label: 'Unclaimed' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'in_review', label: 'In review' },
]

const statusStyles: Record<string, string> = {
  in_store: 'bg-blue-50 text-blue-700',
  claim_pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  collected: 'bg-gray-100 text-gray-700',
  rejected: 'bg-red-50 text-red-700',
  unclaimed: 'bg-orange-50 text-orange-700',
  submitted: 'bg-amber-50 text-amber-700',
  in_review: 'bg-blue-50 text-blue-700',
}

function labelStatus(status?: string) {
  if (!status) return 'Unknown'
  return statusOptions.find(option => option.value === status)?.label ||
    status.replaceAll('_', ' ')
}

function formatDate(value?: string) {
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

function exportCsv(rows: RecordRow[], tab: Tab) {
  const headings = [
    'Reference',
    'Description',
    'Person',
    'Status',
    'Updated',
  ]

  const values = rows.map(row => [
    row.reference || row.itemReference || '',
    row.itemDescription || row.publicDescription || row.category || '',
    row.person || row.claimantName || row.finderName || '',
    labelStatus(row.status),
    row.updatedAt || row.submittedAt || row.dateFound || '',
  ])

  const escapeCsv = (value: unknown) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`

  const csv = [headings, ...values]
    .map(line => line.map(escapeCsv).join(','))
    .join('\r\n')

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `patapotea-${tab}-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function ItemsAndClaims() {
  const [activeTab, setActiveTab] = useState<Tab>('items')
  const [records, setRecords] = useState<RecordRow[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const pageSize = 8

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/items-claims', {
          params: { tab: activeTab },
        })
        const data = response.data

        const selectedRecords: RecordRow[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : []

        setRecords(selectedRecords)
        setPage(1)
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          'Unable to load records. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadRecords()
  }, [activeTab])

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase()

    return records.filter(record => {
      const matchesSearch =
        !term ||
        [
          record.reference,
          record.itemReference,
          record.itemDescription,
          record.publicDescription,
          record.category,
          record.person,
          record.claimantName,
          record.finderName,
        ].some(value => value?.toLowerCase().includes(term))

      const matchesStatus = !status || record.status === status

      return matchesSearch && matchesStatus
    })
  }, [records, search, status])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const visibleRecords = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const changeTab = (tab: Tab) => {
    setActiveTab(tab)
    setSearch('')
    setStatus('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Items & claims</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor found-item records and ownership claims across the university.
          </p>
        </div>

        <button
          onClick={() => exportCsv(filteredRecords, activeTab)}
          disabled={filteredRecords.length === 0}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-navy hover:bg-white disabled:opacity-40"
        >
          ↓ Export records
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => changeTab('items')}
            className={`flex-1 px-5 py-4 text-sm font-semibold ${
              activeTab === 'items'
                ? 'border-b-2 border-amber-brand text-navy'
                : 'text-gray-500 hover:text-navy'
            }`}
          >
            Items
            <span className="ml-2 text-xs text-gray-400">
              {activeTab === 'items' && !loading ? records.length : ''}
            </span>
          </button>

          <button
            onClick={() => changeTab('claims')}
            className={`flex-1 px-5 py-4 text-sm font-semibold ${
              activeTab === 'claims'
                ? 'border-b-2 border-amber-brand text-navy'
                : 'text-gray-500 hover:text-navy'
            }`}
          >
            Claims
            <span className="ml-2 text-xs text-gray-400">
              {activeTab === 'claims' && !loading ? records.length : ''}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border-b border-gray-100">
          <input
            type="search"
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search records..."
            className="md:col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />

          <select
            value={status}
            onChange={event => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">
              No {activeTab} records found
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Records will appear here when the Admin records API is implemented.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      {activeTab === 'items' ? 'Item' : 'Claim'}
                    </th>
                    <th className="px-5 py-3 font-semibold">Person</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Updated</th>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visibleRecords.map((record, index) => (
                    <tr key={record.id ?? index} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-navy">
                          {record.itemDescription ||
                            record.publicDescription ||
                            record.category ||
                            'Record'}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record.person ||
                          record.claimantName ||
                          record.finderName ||
                          '—'}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusStyles[record.status || ''] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {labelStatus(record.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(
                          record.updatedAt || record.submittedAt || record.dateFound
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-navy whitespace-nowrap">
                        {record.reference || record.itemReference || `#${record.id}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filteredRecords.length)} of{' '}
                {filteredRecords.length} records
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
                  {page} / {totalPages}
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
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-navy">
          A clear path from storage to collection
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Every found item is recorded, reviewed when claimed, approved only
          after verification, and marked collected after a documented handover.
        </p>
      </section>
    </div>
  )
}
