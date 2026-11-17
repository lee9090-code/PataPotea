
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
        navigate('/browse', { replace: true })
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left panel */}
          <section>
            <p className="text-sm font-semibold tracking-widest text-amber-600 uppercase mb-6">
              LESS SEARCHING. MORE PEACE OF MIND.
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-6">
              A familiar place to find what's yours.
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg">
              One place for lost reports, found items, and a safe return to
              the right owner.
            </p>

            <div className="space-y-7 mb-10">
              {[
                'Tell us what’s missing',
                'Prove it’s yours, privately',
                'Sign and collect at the desk',
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-5">
                  <span className="text-amber-500 font-bold text-lg">
                    0{index + 1}
                  </span>
                  <p className="text-navy font-medium">{step}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              For Strathmore University students and staff.
            </p>
          </section>

          {/* Right panel */}
          <section className="bg-white border border-gray-100 rounded-xl p-7 md:p-10 shadow-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-navy mb-3">
                Welcome back
              </h2>
              <p className="text-gray-600">
                Sign in to report, claim, and keep track.
              </p>
            </div>

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

            <div className="mt-8 bg-gray-50 border border-gray-100 rounded-lg p-5">
              <h3 className="font-semibold text-navy mb-2">
                Working at the desk?
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed">
                Guard and admin accounts are created by the university.
                Use your assigned email to sign in.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
