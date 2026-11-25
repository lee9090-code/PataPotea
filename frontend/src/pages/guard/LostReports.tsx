import { useEffect, useState } from 'react'
import { lostReportsService } from '../../services/lostReportsService'

interface LostReport {
  id: number
  reference: string
  category: string
  description: string
  locationLost?: string
  dateLost: string
  status: string
  reporterName: string
  reporterEmail: string
  reportedAt: string
}

export default function LostReports() {
  const [reports, setReports] = useState<LostReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await lostReportsService.all()
        setReports(response.data)
      } catch {
        setError('Unable to load lost reports. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-8 py-5">
        <h2 className="font-semibold text-navy">Guard workspace</h2>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Guard desk
          </p>
          <h1 className="mt-2 text-2xl font-bold text-navy">
            Lost reports
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Reports students and staff have submitted about items they lost.
            Compare these with items you log to spot a possible match.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Item</th>
                <th className="px-5 py-4">Reported by</th>
                <th className="px-5 py-4">Lost</th>
                <th className="px-5 py-4">Reported</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Loading lost reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    No lost reports have been submitted yet.
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 font-semibold text-navy">
                      {report.reference}
                    </td>

                    <td className="px-5 py-5">
                      <p className="font-medium text-navy">{report.category}</p>
                      <p className="mt-1 max-w-sm text-xs text-gray-500">
                        {report.description}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-navy">{report.reporterName}</p>
                      <p className="mt-1 text-xs text-gray-500">{report.reporterEmail}</p>
                    </td>

                    <td className="px-5 py-5 text-gray-500">
                      {formatDate(report.dateLost)}
                      {report.locationLost && (
                        <span className="block text-xs">{report.locationLost}</span>
                      )}
                    </td>

                    <td className="px-5 py-5 text-gray-500">
                      {formatDate(report.reportedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
