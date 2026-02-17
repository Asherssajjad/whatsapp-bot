/**
 * User Dashboard preview with mock data (no backend required).
 * Access via /demo
 */
import { Link } from 'react-router-dom'

const mockConversations = [
  { id: '1', wa_phone: '+92 300 1234567', current_stage: 'ASK_CONTACT', is_complete: false, updated_at: new Date().toISOString() },
  { id: '2', wa_phone: '+92 321 9876543', current_stage: 'DONE', is_complete: true, updated_at: new Date().toISOString() },
]
const mockLeads = [
  { id: '1', wa_phone: '+92 300 1234567', name: 'Ali Khan', requirement: 'Need property in DHA', contact_info: 'ali@email.com', status: 'New', created_at: new Date().toISOString() },
  { id: '2', wa_phone: '+92 321 9876543', name: 'Sara', requirement: 'Clinic appointment', contact_info: '+92 321 9876543', status: 'Contacted', created_at: new Date().toISOString() },
]
const mockAccounts = [{ id: '1', phone_number: '+1 234 567 8900', is_active: true }]
const mockNotifications = [
  { id: '1', title: 'New lead', body: 'Lead from +92 300 1234567 (Ali Khan)', is_read: false, created_at: new Date().toISOString() },
]

export default function DemoUserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-primary-600 dark:text-primary-400">WhatsApp Bot — User Dashboard (Demo)</h1>
        <div className="flex gap-4">
          <Link to="/demo/admin" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">View Admin Demo</Link>
          <Link to="/login" className="text-sm text-gray-500 hover:underline">Exit demo</Link>
        </div>
      </div>
      <main className="p-6 max-w-6xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{mockConversations.length}</p>
              <span className="text-sm text-primary-600 mt-1 block">View all (in full app)</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Leads</p>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{mockLeads.length}</p>
              <span className="text-sm text-primary-600 mt-1 block">View all (in full app)</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp numbers</p>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{mockAccounts.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Unread notifications</p>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{mockNotifications.filter((n) => !n.is_read).length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Recent conversations</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockConversations.map((c) => (
                  <div key={c.id} className="p-4">
                    <p className="font-medium">{c.wa_phone}</p>
                    <p className="text-sm text-gray-500">Stage: {c.current_stage}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">Recent leads</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockLeads.map((l) => (
                  <div key={l.id} className="p-4">
                    <p className="font-medium">{l.name || l.wa_phone}</p>
                    <p className="text-sm text-gray-500">{l.status} · {l.wa_phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
