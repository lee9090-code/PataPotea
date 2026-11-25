
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import api from '../../services/api'

interface Guard {
  id: number
  fullName: string
  email: string
  isActive?: boolean
  active?: boolean
  lastActive?: string | null
}

export default function Guards() {
  const [guards, setGuards] = useState<Guard[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingGuard, setEditingGuard] = useState<Guard | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [newGuardPassword, setNewGuardPassword] = useState<{ email: string; password: string } | null>(null)

  const loadGuards = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/admin/guards')
      setGuards(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Unable to load guard accounts. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuards()
  }, [])

  const filteredGuards = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return guards

    return guards.filter(guard =>
      guard.fullName?.toLowerCase().includes(term) ||
      guard.email?.toLowerCase().includes(term)
    )
  }, [guards, search])

  const openAddForm = () => {
    setEditingGuard(null)
    setFullName('')
    setEmail('')
    setError('')
    setMessage('')
    setNewGuardPassword(null)
    setShowForm(true)
  }

  const openEditForm = (guard: Guard) => {
    setEditingGuard(guard)
    setFullName(guard.fullName)
    setEmail(guard.email)
    setError('')
    setMessage('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingGuard(null)
    setFullName('')
    setEmail('')
    setNewGuardPassword(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (editingGuard) {
        await api.patch(`/admin/guards/${editingGuard.id}`, {
          fullName: fullName.trim(),
          email: email.trim(),
        })
        setMessage('Guard account updated.')
        setShowForm(false)
        setEditingGuard(null)
        setFullName('')
        setEmail('')
      } else {
        const response = await api.post('/admin/guards', {
          fullName: fullName.trim(),
          email: email.trim(),
        })
        setNewGuardPassword({
          email: email.trim(),
          password: response.data.temporaryPassword,
        })
        setMessage('Guard account created. Share the temporary password below with them directly, there is no email invitation system yet.')
        setFullName('')
        setEmail('')
      }

      await loadGuards()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'The backend could not complete this request. Please try again later.'
      )
    } finally {
      setSaving(false)
    }
  }

  const toggleGuard = async (guard: Guard) => {
    const active = guard.isActive ?? guard.active ?? true
    const action = active ? 'deactivate' : 'activate'

    if (!window.confirm(`Are you sure you want to ${action} ${guard.fullName}?`)) {
      return
    }

    try {
      setError('')
      setMessage('')

      await api.patch(`/admin/guards/${guard.id}/${action}`)

      setMessage(`Guard account ${action}d successfully.`)
      await loadGuards()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        `Unable to ${action} this account. The backend may not support this operation yet.`
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Guard accounts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the security personnel who operate the lost-and-found desk.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-amber-brand px-4 py-2.5 text-sm font-semibold text-navy hover:opacity-90"
        >
          + Add guard
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {showForm && (
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-navy">
                {editingGuard ? 'Edit guard account' : 'Add or edit guard'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter the guard's name and university email address.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm text-gray-500 hover:text-navy"
            >
              Close
            </button>
          </div>

          {newGuardPassword && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Temporary password for {newGuardPassword.email}
              </p>
              <p className="mt-1 font-mono text-sm text-amber-900">
                {newGuardPassword.password}
              </p>
              <p className="mt-2 text-xs text-amber-800">
                Share this with the guard directly, it will not be shown again.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
                  placeholder="guard@strathmore.edu"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-amber-brand px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingGuard
                    ? 'Save changes'
                    : 'Create guard account'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by guard name or email..."
            className="w-full md:max-w-md rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading guard accounts...
          </div>
        ) : filteredGuards.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">No guard accounts found</p>
            <p className="text-sm text-gray-500 mt-1">
              Guard accounts returned by the backend will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Guard</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Account state</th>
                  <th className="px-5 py-3 font-semibold">Last active</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredGuards.map(guard => {
                  const active = guard.isActive ?? guard.active ?? true

                  return (
                    <tr key={guard.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-navy">
                        {guard.fullName}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {guard.email}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {guard.lastActive || '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-sm">
                          <button
                            onClick={() => openEditForm(guard)}
                            className="font-medium text-navy hover:text-amber-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleGuard(guard)}
                            className={`font-medium ${
                              active ? 'text-red-600' : 'text-green-700'
                            }`}
                          >
                            {active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold text-navy">Account access</h3>
        <p className="text-sm text-gray-600 mt-2">
          Deactivation removes access but keeps past actions in the audit log.
        </p>
      </div>
    </div>
  )
}


