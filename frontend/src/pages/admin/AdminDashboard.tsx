import { useEffect, useState } from 'react'
import api from '../../services/api'

interface WeeklyBreakdown {
  weekStarting: string
  itemsLogged: number
  claimsSubmitted: number
  itemsCollected: number
}

interface DashboardStats {
  itemsLogged?: number
  claimsApproved?: number
  itemsCollected?: number
  unclaimedItems?: number
  weeklyBreakdown?: WeeklyBreakdown[]
}

const statCards = [
  { key: 'itemsLogged', label: 'Items logged', color: 'bg-blue-500' },
  { key: 'claimsApproved', label: 'Claims approved', color: 'bg-amber-500' },
  { key: 'itemsCollected', label: 'Items collected', color: 'bg-green-500' },
  { key: 'unclaimedItems', label: 'Unclaimed', color: 'bg-gray-500' },
] as const

const charts = [
  { key: 'itemsLogged', title: 'Items logged weekly', barColor: 'bg-navy' },
  { key: 'claimsSubmitted', title: 'Claims submitted weekly', barColor: 'bg-blue-500' },
  { key: 'itemsCollected', title: 'Items collected weekly', barColor: 'bg-green-600' },
] as const

function formatWeekLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
}

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

  const weeklyBreakdown = stats?.weeklyBreakdown ?? []
  const firstWeek = weeklyBreakdown[0]?.weekStarting
  const lastWeek = weeklyBreakdown[weeklyBreakdown.length - 1]?.weekStarting

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Admin dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of lost-and-found activity across the university.
          </p>
        </div>

        {firstWeek && lastWeek && (
          <span className="text-xs text-gray-500">
            Reporting period: {formatWeekLabel(firstWeek)}{' '}
            &ndash; {formatWeekLabel(lastWeek)}
          </span>
        )}
      </div>

      {!loading && !available && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Dashboard statistics are not available yet. Check that the backend is running.
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
          {charts.map(chart => {
            const values = weeklyBreakdown.map(week => week[chart.key])
            const maxValue = Math.max(1, ...values)

            return (
              <div
                key={chart.key}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <h3 className="font-semibold text-sm text-navy">{chart.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Weekly counts &middot; total {values.reduce((sum, value) => sum + value, 0)}
                </p>

                {!available || weeklyBreakdown.length === 0 ? (
                  <div className="h-40 mt-5 flex items-center justify-center border-b border-l border-gray-200">
                    <p className="text-xs text-gray-400 text-center px-4">
                      {loading ? 'Loading weekly data...' : 'Weekly chart data is not available yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="h-40 mt-5 flex items-end justify-between gap-2 border-b border-l border-gray-200 px-2">
                    {weeklyBreakdown.map(week => {
                      const value = week[chart.key]
                      const heightPercent = Math.max(4, (value / maxValue) * 100)

                      return (
                        <div
                          key={week.weekStarting}
                          className="flex-1 flex flex-col items-center justify-end h-full"
                        >
                          <span className="text-xs text-gray-500 mb-1">{value}</span>
                          <div
                            className={`w-full rounded-t ${chart.barColor}`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  {weeklyBreakdown.map(week => (
                    <span key={week.weekStarting}>{formatWeekLabel(week.weekStarting)}</span>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm text-navy">Unclaimed weekly</h3>
            <div className="h-40 mt-5 flex items-center justify-center border-b border-l border-gray-200">
              <p className="text-xs text-gray-400 text-center px-4">
                Unclaimed status does not have a timestamp of when it changed,
                so a weekly breakdown is not available yet. The total unclaimed
                count above is current.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold text-navy">Reporting information</h3>
        <p className="text-sm text-gray-600 mt-2">
          Counts reflect activity in the selected period, not current stock.
        </p>
      </div>
    </div>
  )
}
