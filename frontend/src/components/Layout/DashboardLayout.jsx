import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/conversations', label: 'Conversations' },
  { to: '/leads', label: 'Leads' },
  { to: '/settings', label: 'Settings' },
  { to: '/notifications', label: 'Notifications' },
]

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return true
    return document.documentElement.classList.contains('dark')
  })

  const toggleDark = () => {
    setDark((d) => !d)
    document.documentElement.classList.toggle('dark', !dark)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-semibold text-primary-600 dark:text-primary-400 text-lg">WhatsApp Bot</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-500 text-white' : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleDark}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600"
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
