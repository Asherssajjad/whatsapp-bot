import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listConversations, listLeads, listMyWhatsAppAccounts, listNotifications } from '../api/client'

export default function Dashboard() {
  const [conversations, setConversations] = useState([])
  const [leads, setLeads] = useState([])
  const [accounts, setAccounts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listConversations({ limit: 5 }).then((r) => setConversations(r.data)),
      listLeads({ limit: 5 }).then((r) => setLeads(r.data)),
      listMyWhatsAppAccounts().then((r) => setAccounts(r.data)),
      listNotifications({ limit: 5 }).then((r) => setNotifications(r.data)),
    ]).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
          <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{conversations.length}</p>
          <Link to="/conversations" className="text-sm text-primary-600 hover:underline mt-1 block">View all</Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Leads</p>
          <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{leads.length}</p>
          <Link to="/leads" className="text-sm text-primary-600 hover:underline mt-1 block">View all</Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp numbers</p>
          <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">{accounts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Unread notifications</p>
          <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
            {notifications.filter((n) => !n.is_read).length}
          </p>
          <Link to="/notifications" className="text-sm text-primary-600 hover:underline mt-1 block">View all</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold">Recent conversations</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No conversations yet.</p>
            ) : (
              conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/conversations/${c.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <p className="font-medium">{c.wa_phone}</p>
                  <p className="text-sm text-gray-500">Stage: {c.current_stage}</p>
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold">Recent leads</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leads.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No leads yet.</p>
            ) : (
              leads.map((l) => (
                <Link key={l.id} to="/leads" className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <p className="font-medium">{l.name || l.wa_phone}</p>
                  <p className="text-sm text-gray-500">{l.status} · {l.wa_phone}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
