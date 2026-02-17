import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminListUsers, adminUsage } from '../../api/client'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminListUsers({ limit: 10 }).then((r) => setUsers(r.data)),
      adminUsage().then((r) => setUsage(r.data)),
    ]).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading...</div>

  const usageMap = usage?.users ? Object.fromEntries(usage.users.map((u) => [u.user_id, u])) : {}

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total users</p>
          <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{users.length}</p>
          <Link to="/admin/users" className="text-sm text-amber-600 hover:underline mt-1 block">Manage users</Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total messages sent</p>
          <p className="text-2xl font-semibold">
            {usage?.users?.reduce((a, u) => a + (u.messages_sent || 0), 0) ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total leads captured</p>
          <p className="text-2xl font-semibold">
            {usage?.users?.reduce((a, u) => a + (u.leads_captured || 0), 0) ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Recent users & usage</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Messages sent</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Leads</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{usageMap[u.id]?.messages_sent ?? 0}</td>
                  <td className="px-4 py-3">{usageMap[u.id]?.leads_captured ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={u.is_active ? 'text-green-600' : 'text-red-600'}>{u.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
