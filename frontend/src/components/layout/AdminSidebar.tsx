// Left sidebar for admin workspace
// Nav items: Dashboard | Guards | Items & claims | Audit log
// See design: Page 6 of patapotea.pdf

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminSidebar() {
  const { logout } = useAuth()
  const links = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/guards', label: 'Guards' },
    { to: '/admin/items-claims', label: 'Items & claims' },
    { to: '/admin/audit-log', label: 'Audit log' },
  ]
  return (
    <aside className="w-48 min-h-screen bg-navy text-white flex flex-col">
      <div className="p-5 border-b border-navy-light">
        <div className="font-bold text-lg">patapotea</div>
        <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Admin Workspace</div>
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
