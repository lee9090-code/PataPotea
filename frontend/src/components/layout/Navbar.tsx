// Public navbar: Logo | Found items | Report a loss | How it works | Sign in | Create account
// Logged-in student: Logo | Found items | Report a loss | My claims | [Name dropdown]
// Guard/Admin: handled by their own sidebar layout
// See design: Page 1, 11, 14 of patapotea.pdf

import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-bold text-navy text-lg">patapotea</Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/items">Found items</Link>
        <Link to="/report">Report a loss</Link>
        <Link to="/how-it-works">How it works</Link>
        {user ? (
          <>
            <Link to="/student/my-claims">My claims</Link>
            <button onClick={logout} className="text-gray-500 hover:text-navy">Sign out</button>
          </>
        ) : (
          <>
            <Link to="/auth/sign-in">Sign in</Link>
            <Link to="/auth/create-account" className="bg-amber-brand text-white px-4 py-2 rounded-lg font-semibold">
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
