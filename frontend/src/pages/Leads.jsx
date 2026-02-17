import { useState, useEffect } from 'react'
import { listLeads, updateLead, exportLeadsCsv } from '../api/client'

const STATUS_OPTIONS = ['New', 'Contacted', 'Interested', 'Closed']

export default function Leads() {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('')

  const fetchList = () => {
    setLoading(true)
    listLeads({ search: search || undefined, status: statusFilter || undefined })
      .then((r) => setList(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [statusFilter])

  const handleExport = () => {
    setExporting(true)
    exportLeadsCsv()
      .then((r) => {
        const url = URL.createObjectURL(new Blob([r.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = 'leads.csv'
        a.click()
        URL.revokeObjectURL(url)
      })
      .catch(console.error)
      .finally(() => setExporting(false))
  }

  const startEdit = (lead) => {
    setEditingId(lead.id)
    setEditNotes(lead.notes || '')
    setEditStatus(lead.status)
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      await updateLead(editingId, { status: editStatus, notes: editNotes })
      setEditingId(null)
      fetchList()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchList()}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 w-48"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={fetchList} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
            Filter
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Requirement</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Contact</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Created</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No leads.</td></tr>
              ) : (
                list.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">{l.wa_phone}</td>
                    <td className="px-4 py-3">{l.name || '—'}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{l.requirement || '—'}</td>
                    <td className="px-4 py-3">{l.contact_info || '—'}</td>
                    <td className="px-4 py-3">
                      {editingId === l.id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-700"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-sm bg-gray-100 dark:bg-gray-700">{l.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {editingId === l.id ? (
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="text-sm text-primary-600 hover:underline">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(l)} className="text-sm text-primary-600 hover:underline">Edit</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {editingId && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
        )}
      </div>
    </div>
  )
}
