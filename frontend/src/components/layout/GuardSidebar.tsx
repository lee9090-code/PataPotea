// Left sidebar for guard workspace
// Nav items: Dashboard | Items | Claims | Handover
// Footer: University name + "Desk access · Nairobi" + Sign out
// See design: Page 5 of patapotea.pdf

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function GuardSidebar() {
  const { user, logout } = useAuth()
  const links = [
    { to: '/guard', label: 'Dashboard' },
    { to: '/guard/items', label: 'Items' },
    { to: '/guard/claims', label: 'Claims' },
    { to: '/guard/handover', label: 'Handover' },
  ]
  return (
    <aside className="w-48 min-h-screen bg-navy text-white flex flex-col">
      <div className="p-5 border-b border-navy-light">
        <div className="font-bold text-lg">patapotea</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Guard Workspace</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} end className={({ isActive }) =>
            `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-navy-light' : 'hover:bg-navy-light'}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-navy-light text-xs text-gray-400">
        <div className="font-semibold text-white">Strathmore University</div>
        <div>Desk access · Nairobi</div>
        <button onClick={logout} className="mt-2 text-gray-300 hover:text-white">Sign out</button>
      </div>
    </aside>
  )
}
