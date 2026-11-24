// TODO: Search input + "Export audit log" button
// TODO: Filter dropdowns: All dates | All roles | All actions
// TODO: Table: Action | Actor | Record | When (EAT) | Details (View event →)
// TODO: Pagination
// TODO: "A history you can rely on." info panel (read-only, timestamps UTC+3)
// See mockup: Page 16 of patapotea.pdf

import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

interface AuditEntry {
  id: number
  action: string
  actorName: string
  actorRole: string
  recordId: string
  timestamp: string
  details?: string
}

function formatDate(value: string) {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-KE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Nairobi',
      })
}

function exportAuditCsv(entries: AuditEntry[]) {
  const headings = ['Action', 'Actor', 'Role', 'Record', 'Timestamp', 'Details']

  const rows = entries.map(entry => [
    entry.action,
    entry.actorName,
    entry.actorRole,
    entry.recordId,
    entry.timestamp,
    entry.details || '',
  ])

  const escapeCsv = (value: unknown) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`

  const csv = [headings, ...rows]
    .map(row => row.map(escapeCsv).join(','))
    .join('\r\n')

  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `patapotea-audit-log-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null)

  const pageSize = 10

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('/admin/audit-log')
        setEntries(Array.isArray(response.data) ? response.data : [])
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          'Unable to load audit records. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAuditLog()
  }, [])

  const filteredEntries = useMemo(() => {
    const now = new Date()
    const term = search.trim().toLowerCase()

    return entries.filter(entry => {
      const matchesSearch =
        !term ||
        [
          entry.action,
          entry.actorName,
          entry.actorRole,
          entry.recordId,
          entry.details,
        ].some(value => value?.toLowerCase().includes(term))

      const matchesRole =
        roleFilter === 'all' ||
        entry.actorRole?.toLowerCase() === roleFilter

      const matchesAction =
        actionFilter === 'all' ||
        entry.action?.toLowerCase() === actionFilter

      let matchesDate = true

      if (dateFilter !== 'all') {
        const timestamp = new Date(entry.timestamp).getTime()
        const days = Number(dateFilter)
        const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000

        matchesDate = !Number.isNaN(timestamp) && timestamp >= cutoff
      }

      return matchesSearch && matchesRole && matchesAction && matchesDate
    })
  }, [entries, search, dateFilter, roleFilter, actionFilter])

  const roles = useMemo(
    () => Array.from(new Set(entries.map(entry => entry.actorRole).filter(Boolean))),
    [entries]
  )

  const actions = useMemo(
    () => Array.from(new Set(entries.map(entry => entry.action).filter(Boolean))),
    [entries]
  )

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize))
  const visibleEntries = filteredEntries.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const clearFilters = () => {
    setSearch('')
    setDateFilter('all')
    setRoleFilter('all')
    setActionFilter('all')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Audit log</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review important actions performed across the PataPotea system.
          </p>
        </div>

        <button
          onClick={() => exportAuditCsv(filteredEntries)}
          disabled={filteredEntries.length === 0}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-navy hover:bg-white disabled:opacity-40"
        >
          ↓ Export audit log
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <input
            type="search"
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search audit records..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />

          <select
            value={dateFilter}
            onChange={event => {
              setDateFilter(event.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          >
            <option value="all">All dates</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="42">Last 6 weeks</option>
          </select>

          <select
            value={roleFilter}
            onChange={event => {
              setRoleFilter(event.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          >
            <option value="all">All roles</option>
            {roles.map(role => (
              <option key={role} value={role.toLowerCase()}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={event => {
              setActionFilter(event.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          >
            <option value="all">All actions</option>
            {actions.map(action => (
              <option key={action} value={action.toLowerCase()}>
                {action.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-gray-500 hover:text-navy"
          >
            Clear filters
          </button>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy">System activity</h2>
          <span className="text-xs text-gray-500">
            {filteredEntries.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading audit log...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">No audit records found</p>
            <p className="text-sm text-gray-500 mt-1">
              System activity will appear here when the audit-log API is available.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Action</th>
                    <th className="px-5 py-3 font-semibold">Actor</th>
                    <th className="px-5 py-3 font-semibold">Record</th>
                    <th className="px-5 py-3 font-semibold">When (EAT)</th>
                    <th className="px-5 py-3 font-semibold">Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {visibleEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-navy">
                          {entry.action?.replaceAll('_', ' ') || '—'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {entry.actorName || '—'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {entry.actorRole || '—'}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {entry.recordId || '—'}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(entry.timestamp)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="text-sm font-semibold text-navy hover:text-amber-600"
                        >
                          View event →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filteredEntries.length)} of{' '}
                {filteredEntries.length} records
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
      </section>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="font-semibold text-navy">Audit event details</h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-sm text-gray-500 hover:text-navy"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs text-gray-500">Action</p>
                <p className="text-sm font-medium text-navy mt-1">
                  {selectedEntry.action}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Actor</p>
                <p className="text-sm text-gray-800 mt-1">
                  {selectedEntry.actorName} ({selectedEntry.actorRole})
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Record reference</p>
                <p className="text-sm text-gray-800 mt-1">
                  {selectedEntry.recordId}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Timestamp (East Africa Time)</p>
                <p className="text-sm text-gray-800 mt-1">
                  {formatDate(selectedEntry.timestamp)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Details</p>
                <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                  {selectedEntry.details || 'No additional event details provided.'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 p-5 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-light"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-navy">A history you can rely on</h2>
        <p className="text-sm text-gray-600 mt-2">
          The audit log provides a read-only history of important actions,
          supporting accountability and traceability across the system.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Timestamps are displayed in East Africa Time (UTC+3).
        </p>
      </section>
    </div>
  )
}
