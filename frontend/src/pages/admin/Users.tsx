import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

interface AppUser {
  id: number
  fullName: string
  studentOrStaffNumber: string
  email: string
  role: string
  isActive: boolean
  lastActiveAt: string | null
  createdAt: string | null
}

const roleOptions = [
  { value: '', label: 'All roles' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'guard', label: 'Guard' },
  { value: 'admin', label: 'Admin' },
]

function formatDate(value: string | null) {
  if (!value) return 'Never'

  return new Date(value).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  })
}

export default function Users() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/admin/users')
        setUsers(Array.isArray(response.data) ? response.data : [])
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          'Unable to load users. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()

    return users.filter(user => {
      const matchesSearch =
        !term ||
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.studentOrStaffNumber?.toLowerCase().includes(term)

      const matchesRole = !role || user.role === role

      return matchesSearch && matchesRole
    })
  }, [users, search, role])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Everyone registered on Patapotea, across every role, with when they
          last signed in.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by name, email or number..."
            className="w-full sm:max-w-md rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          />

          <select
            value={role}
            onChange={event => setRole(event.target.value)}
            className="w-full sm:w-44 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-brand"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-700">No users found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try a different search term or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Account state</th>
                  <th className="px-5 py-3">Last active</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-navy">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.studentOrStaffNumber}</p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">{user.email}</td>

                    <td className="px-5 py-4">
                      <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(user.lastActiveAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
