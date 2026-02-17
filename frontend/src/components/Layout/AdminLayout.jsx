import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const adminNav = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/usage', label: 'Usage' },
  { to: '/admin/whatsapp', label: 'Assign WhatsApp' },
  { to: '/admin/logs', label: 'Webhook Logs' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-56 bg-amber-50 dark:bg-gray-800 border-r border-amber-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-amber-200 dark:border-gray-700">
          <h1 className="font-semibold text-amber-700 dark:text-amber-400 text-lg">Admin</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">WhatsApp SaaS</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {adminNav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-amber-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-gray-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/"
            className="block px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ← Back to App
          </NavLink>
        </nav>
        <div className="p-2 border-t">
          <button
            type="button"
            onClick={() => { logout(); navigate('/login') }}
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
