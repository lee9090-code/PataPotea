
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="font-bold text-navy text-lg">
        patapotea
      </Link>

      {/* Navigation links */}
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/items" className="text-gray-600 hover:text-navy">
          Found items
        </Link>

        <Link to="/report" className="text-gray-600 hover:text-navy">
          Report a loss
        </Link>

        <Link to="/how-it-works" className="text-gray-600 hover:text-navy">
          How it works
        </Link>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 text-navy hover:text-amber-600 font-semibold"
            >
              {user.fullName}
              <span className="text-xs">{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-navy"
                >
                  My account
                </Link>

                <Link
                  to="/student/my-claims"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-navy"
                >
                  My claims
                </Link>

                <div className="border-t border-gray-100 my-2" />

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/auth/sign-in"
              className="text-gray-600 hover:text-navy"
            >
              Sign in
            </Link>

            <Link
              to="/auth/create-account"
              className="bg-amber-brand text-white px-4 py-2 rounded-lg font-semibold"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
