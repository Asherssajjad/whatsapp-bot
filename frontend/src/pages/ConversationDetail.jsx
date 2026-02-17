import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getConversation } from '../api/client'

export default function ConversationDetail() {
  const { id } = useParams()
  const [conv, setConv] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConversation(id)
      .then((r) => setConv(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (!conv) return <div className="text-gray-500">Conversation not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{conv.wa_phone}</h1>
        <span className="px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
          {conv.current_stage}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <p className="text-sm text-gray-500">Message history</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
          {(conv.messages || []).map((m) => (
            <div
              key={m.id}
              className={`p-4 ${m.direction === 'inbound' ? 'bg-gray-50 dark:bg-gray-700/20' : 'bg-primary-50 dark:bg-primary-900/20'}`}
            >
              <p className="text-xs text-gray-500 mb-1">{m.direction === 'inbound' ? 'Contact' : 'Bot'}</p>
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{m.body}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
