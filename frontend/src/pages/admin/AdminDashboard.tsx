// TODO: 4 stat cards — Items logged, Claims approved, Items collected, Unclaimed (last 6 weeks)
// TODO: 4 bar charts — Items logged weekly, Claims approved weekly,
//        Items collected weekly, Unclaimed weekly
// TODO: Date range label ("25 Sep–05 Nov 2026 · Example data")
// TODO: Footer note: "Counts reflect activity in the selected period, not current stock."
// See mockup: Page 6 of patapotea.pdf

import { useEffect, useState } from 'react'
import api from '../../services/api'

interface DashboardStats {
  itemsLogged?: number
  claimsApproved?: number
  itemsCollected?: number
  unclaimedItems?: number
}

const statCards = [
  { key: 'itemsLogged', label: 'Items logged', color: 'bg-blue-500' },
  { key: 'claimsApproved', label: 'Claims approved', color: 'bg-amber-500' },
  { key: 'itemsCollected', label: 'Items collected', color: 'bg-green-500' },
  { key: 'unclaimedItems', label: 'Unclaimed', color: 'bg-gray-500' },
] as const

const chartTitles = [
  'Items logged weekly',
  'Claims approved weekly',
  'Items collected weekly',
  'Unclaimed weekly',
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data)
        setAvailable(true)
      } catch {
        setAvailable(false)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Admin dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of lost-and-found activity across the university.
          </p>
        </div>

        <span className="text-xs text-gray-500">
          Reporting period: 25 Sep–05 Nov 2026
        </span>
      </div>

      {!loading && !available && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Dashboard statistics are not available yet because the statistics
          endpoint has not been completed by the backend.
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{card.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
            </div>

            <p className="text-3xl font-bold text-navy mt-4">
              {loading
                ? '—'
                : available && stats?.[card.key] !== undefined
                  ? stats[card.key]
                  : '—'}
            </p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-navy">Activity overview</h2>
            <p className="text-xs text-gray-500 mt-1">
              Weekly activity during the selected reporting period.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chartTitles.map(title => (
            <div
              key={title}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <h3 className="font-semibold text-sm text-navy">{title}</h3>

              <div className="h-40 mt-5 flex items-center justify-center border-b border-l border-gray-200">
                <p className="text-xs text-gray-400 text-center px-4">
                  {available
                    ? 'Weekly breakdown will appear when the backend provides chart data.'
                    : 'Weekly chart data is not available yet.'}
                </p>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
                <span>Week 5</span>
                <span>Week 6</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold text-navy">Reporting information</h3>
        <p className="text-sm text-gray-600 mt-2">
          Counts reflect activity in the selected period, not current stock.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {available
            ? 'Example reporting period: 25 Sep–05 Nov 2026.'
            : 'Statistics will appear here when the reporting API is available.'}
        </p>
      </div>
    </div>
  )
}

