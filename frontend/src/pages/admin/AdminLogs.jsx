import { useState, useEffect } from 'react'
import { adminWebhookLogs } from '../../api/client'

export default function AdminLogs() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    adminWebhookLogs({ limit: 100 })
      .then((r) => setList(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Webhook logs</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Recent webhook events for debugging.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Time</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Direction</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Phone number ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Error</th>
                <th className="text-left px-4 py-3 text-sm font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No logs.</td></tr>
              ) : (
                list.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{log.direction || '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{log.phone_number_id || '—'}</td>
                    <td className="px-4 py-3 text-sm">{log.status || '—'}</td>
                    <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate">{log.error_message || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(selected?.id === log.id ? null : log)}
                        className="text-sm text-amber-600 hover:underline"
                      >
                        {selected?.id === log.id ? 'Hide' : 'Payload'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {selected?.payload && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <p className="text-xs font-medium text-gray-500 mb-2">Raw payload (truncated)</p>
            <pre className="text-xs overflow-auto max-h-48 font-mono whitespace-pre-wrap break-all">{selected.payload}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
