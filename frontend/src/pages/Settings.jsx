import { useState, useEffect } from 'react'
import { getConversationFlow, updateConversationFlow } from '../api/client'

const STAGES = [
  { key: 'msg_new', label: 'NEW (welcome)', aiKey: 'ai_fallback_new' },
  { key: 'msg_ask_name', label: 'ASK_NAME', aiKey: 'ai_fallback_ask_name' },
  { key: 'msg_ask_requirement', label: 'ASK_REQUIREMENT', aiKey: 'ai_fallback_ask_requirement' },
  { key: 'msg_ask_contact', label: 'ASK_CONTACT', aiKey: 'ai_fallback_ask_contact' },
  { key: 'msg_done', label: 'DONE', aiKey: 'ai_fallback_done' },
]

export default function Settings() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getConversationFlow()
      .then((r) => setConfig(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key, value) => {
    setConfig((c) => (c ? { ...c, [key]: value } : c))
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    setMessage('')
    try {
      await updateConversationFlow({
        msg_new: config.msg_new,
        msg_ask_name: config.msg_ask_name,
        msg_ask_requirement: config.msg_ask_requirement,
        msg_ask_contact: config.msg_ask_contact,
        msg_done: config.msg_done,
        ai_fallback_new: config.ai_fallback_new,
        ai_fallback_ask_name: config.ai_fallback_ask_name,
        ai_fallback_ask_requirement: config.ai_fallback_ask_requirement,
        ai_fallback_ask_contact: config.ai_fallback_ask_contact,
        ai_fallback_done: config.ai_fallback_done,
      })
      setMessage('Saved successfully.')
    } catch (e) {
      setMessage(e.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (!config) return <div className="text-gray-500">Failed to load settings.</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversation flow settings</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Customize the messages sent at each stage. Enable AI fallback to use OpenAI for unexpected replies.
      </p>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('Success') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {STAGES.map(({ key, label, aiKey }) => (
          <div key={key} className="p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <textarea
              value={config[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-3"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config[aiKey] ?? false}
                onChange={(e) => handleChange(aiKey, e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Enable AI fallback for this stage</span>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  )
}
