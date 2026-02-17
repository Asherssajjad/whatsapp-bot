import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listNotifications, markNotificationRead } from '../api/client'

export default function Notifications() {
  const [list, setList] = useState([])
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchList = () => {
    setLoading(true)
    listNotifications({ unread_only: unreadOnly })
      .then((r) => setList(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [unreadOnly])

  const markRead = async (id) => {
    try {
      await markNotificationRead(id)
      fetchList()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary-600"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">Unread only</span>
        </label>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications.</div>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              className={`p-4 ${!n.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                  {n.body && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                  {n.lead_id && (
                    <Link to="/leads" className="text-sm text-primary-600 hover:underline mt-2 inline-block">View leads</Link>
                  )}
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-sm text-primary-600 hover:underline whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
