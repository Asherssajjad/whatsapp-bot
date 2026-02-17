import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listConversations } from '../api/client'

export default function Conversations() {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchList = () => {
    setLoading(true)
    listConversations({ search: search || undefined, stage: stage || undefined })
      .then((r) => setList(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [stage])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchList()}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-64"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All stages</option>
          <option value="NEW">NEW</option>
          <option value="ASK_NAME">ASK_NAME</option>
          <option value="ASK_REQUIREMENT">ASK_REQUIREMENT</option>
          <option value="ASK_CONTACT">ASK_CONTACT</option>
          <option value="DONE">DONE</option>
        </select>
        <button
          type="button"
          onClick={fetchList}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
        >
          Search
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Phone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Stage</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Updated</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {list.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No conversations.</td></tr>
                ) : (
                  list.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3">{c.wa_phone}</td>
                      <td className="px-4 py-3">{c.current_stage}</td>
                      <td className="px-4 py-3">{c.is_complete ? 'Complete' : 'Active'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.updated_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Link to={`/conversations/${c.id}`} className="text-primary-600 hover:underline text-sm">View</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
