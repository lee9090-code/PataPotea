
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

export default function CreateAccount() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [studentOrStaffNumber, setStudentOrStaffNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!email.trim().toLowerCase().endsWith('@strathmore.edu')) {
      setError('Please use your Strathmore University email address.')
      return
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.')
      return
    }

    if (!consent) {
      setError('Please read and accept the personal data consent statement.')
      return
    }

    setSubmitting(true)

    try {
      await authService.register({
        fullName: fullName.trim(),
        studentOrStaffNumber: studentOrStaffNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      await login(email.trim().toLowerCase(), password)
      navigate('/student/my-claims', { replace: true })
    } catch {
      setError(
        'We could not create your account. Registration may not be available yet. Please try again later.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left panel */}
          <section className="bg-[#1B2A3B] rounded-xl p-8 md:p-12 text-white">
            <p className="text-sm font-semibold tracking-widest text-amber-400 uppercase mb-6">
              LESS SEARCHING. MORE PEACE OF MIND.
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Your campus is looking out for you.
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
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
                  <span className="text-amber-400 font-bold text-lg">
                    0{index + 1}
                  </span>
                  <p className="text-white font-medium">{step}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-300">
              For Strathmore University students and staff.
            </p>
          </section>

          {/* Right panel */}
          <section className="bg-white border border-gray-100 rounded-xl p-7 md:p-10 shadow-sm">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-navy mb-3">
                Create your account
              </h2>
              <p className="text-gray-600">
                A safe way back to your belongings.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-navy mb-2"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

              <div>
                <label
                  htmlFor="studentOrStaffNumber"
                  className="block text-sm font-medium text-navy mb-2"
                >
                  Student or staff number
                </label>
                <input
                  id="studentOrStaffNumber"
                  type="text"
                  value={studentOrStaffNumber}
                  onChange={(event) =>
                    setStudentOrStaffNumber(event.target.value)
                  }
                  placeholder="e.g. 123456"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>

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
                  pattern=".+@strathmore\.edu"
                  title="Please use your Strathmore University email address."
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
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
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

                <p className="text-xs text-gray-500 mt-2">
                  Use at least 8 characters.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    required
                    className="mt-1 h-4 w-4 accent-amber-500"
                  />
                  <span>
                    I consent to the use of my personal data to manage lost
                    &amp; found services under Kenya’s Data Protection Act,
                    2019.
                  </span>
                </label>

                <p className="mt-2 ml-7 text-sm">
                  <span
                    className="text-amber-600 font-medium"
                    title="The privacy policy page is not yet available."
                  >
                    Read the privacy policy
                  </span>
                </p>
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
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-7">
              Already have an account?{' '}
              <Link
                to="/auth/sign-in"
                className="text-amber-600 font-semibold hover:text-amber-700"
              >
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
