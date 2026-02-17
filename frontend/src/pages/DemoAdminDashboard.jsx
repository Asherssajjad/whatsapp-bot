/**
 * Admin Dashboard preview with mock data (no backend required).
 * Access via /demo/admin
 */
import { Link } from 'react-router-dom'

const mockUsers = [
  { id: '1', email: 'user1@example.com', full_name: 'User One', is_active: true },
  { id: '2', email: 'user2@example.com', full_name: 'User Two', is_active: true },
]
const mockUsage = [
  { user_id: '1', messages_sent: 142, leads_captured: 12 },
  { user_id: '2', messages_sent: 89, leads_captured: 7 },
]

export default function DemoAdminDashboard() {
  const usageMap = Object.fromEntries(mockUsage.map((u) => [u.user_id, u]))
  const totalMessages = mockUsage.reduce((a, u) => a + u.messages_sent, 0)
  const totalLeads = mockUsage.reduce((a, u) => a + u.leads_captured, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-amber-50 dark:bg-gray-800 border-b border-amber-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-amber-700 dark:text-amber-400">Admin Dashboard (Demo)</h1>
        <div className="flex gap-4">
          <Link to="/demo" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View User Demo</Link>
          <Link to="/login" className="text-sm text-gray-500 hover:underline">Exit demo</Link>
        </div>
      </div>
      <main className="p-6 max-w-6xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total users</p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{mockUsers.length}</p>
              <span className="text-sm text-amber-600 hover:underline mt-1 block">Manage users</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total messages sent</p>
              <p className="text-2xl font-semibold">{totalMessages}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total leads captured</p>
              <p className="text-2xl font-semibold">{totalLeads}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Recent users & usage</h3>
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
                  {mockUsers.map((u) => (
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
      </main>
    </div>
  )
}
