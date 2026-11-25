
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SignIn() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Redirect after AuthContext updates the logged-in user.
  useEffect(() => {
    if (!user) return

    switch (user.role) {
      case 'student':
      case 'staff':
        navigate('/dashboard', { replace: true })
        break
      case 'guard':
        navigate('/guard', { replace: true })
        break
      case 'admin':
        navigate('/admin', { replace: true })
        break
    }
  }, [user, navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email.trim(), password)
    } catch {
      setError('Unable to sign in. Please check your email and password and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1B2A3B] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white"
        >
          ← Back to home
        </Link>

        <div className="text-center mb-8">
          <Link to="/" className="font-bold text-white text-xl">
            patapotea
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">
            Welcome back
          </h1>
          <p className="text-gray-300 mt-2 text-sm">
            Sign in to report, claim, and keep track.
          </p>
        </div>

        <section className="bg-white rounded-xl p-7 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-navy mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@strathmore.edu"
                autoComplete="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-navy mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-navy"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <span
                className="text-sm text-gray-400"
                title="Password recovery is not yet connected."
              >
                Forgot password?
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-navy font-semibold py-3 rounded-lg transition-colors"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-7">
            New to Patapotea?{' '}
            <Link
              to="/auth/create-account"
              className="text-amber-600 font-semibold hover:text-amber-700"
            >
              Create an account
            </Link>
          </p>
        </section>

        <p className="text-center text-sm text-gray-400 mt-6">
          Guard and admin accounts are created by the university.
          Use your assigned email to sign in.
        </p>
      </div>
    </div>
  )
}
