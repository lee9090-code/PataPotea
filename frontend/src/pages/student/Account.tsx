
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    setSigningOut(true)
    setError('')

    try {
      await logout()
      navigate('/auth/sign-in', { replace: true })
    } catch {
      setError('Unable to sign out. Please try again.')
      setSigningOut(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm text-gray-500">
          Your account information is currently unavailable.
          Please sign in again.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">My Account</h1>
        <p className="mt-2 text-sm text-gray-500">
          View your personal information and manage your account.
        </p>
      </div>

      {/* Profile information */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-navy">
            Personal information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your registered account details.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-bold text-white">
            {user.fullName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              {user.fullName}
            </h3>
            <p className="text-sm capitalize text-gray-500">
              {user.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Full name
            </p>
            <p className="mt-1 text-sm font-medium text-gray-800">
              {user.fullName}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Student / Staff number
            </p>
            <p className="mt-1 text-sm font-medium text-gray-800">
              {user.studentOrStaffNumber}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Email address
            </p>
            <p className="mt-1 break-all text-sm font-medium text-gray-800">
              {user.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Account type
            </p>
            <p className="mt-1 text-sm font-medium capitalize text-gray-800">
              {user.role}
            </p>
          </div>
        </div>
      </section>

      {/* Password section */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-navy">
          Password and security
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Password management will be available once the backend
          password-change service has been implemented.
        </p>

        <button
          type="button"
          disabled
          className="mt-4 cursor-not-allowed rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500"
        >
          Change password — Coming soon
        </button>
      </section>

      {/* Sign out section */}
      <section className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Sign out
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Sign out of your PataPotea account on this device.
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-4 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </section>
    </div>
  )
}
