import { useState, useEffect } from 'react'
import { adminUsage, adminListUsers } from '../../api/client'

export default function AdminUsage() {
  const [usage, setUsage] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminUsage().then((r) => setUsage(r.data)),
      adminListUsers().then((r) => setUsers(r.data)),
    ]).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading...</div>

  const usageList = usage?.users || []
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usage monitoring</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Messages sent and leads captured per user.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">User (email)</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Messages sent</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Leads captured</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {usageList.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No usage data.</td></tr>
            ) : (
              usageList.map((u) => (
                <tr key={u.user_id}>
                  <td className="px-4 py-3">{userMap[u.user_id]?.email ?? u.user_id}</td>
                  <td className="px-4 py-3">{u.messages_sent ?? 0}</td>
                  <td className="px-4 py-3">{u.leads_captured ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
