import { useState, useEffect } from 'react'
import { adminListUsers, adminCreateUser, adminUpdateUser } from '../../api/client'

export default function AdminUsers() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createName, setCreateName] = useState('')
  const [createError, setCreateError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editActive, setEditActive] = useState(true)

  const fetchList = () => {
    adminListUsers()
      .then((r) => setList(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    try {
      await adminCreateUser({ email: createEmail, password: createPassword, full_name: createName || undefined })
      setShowCreate(false)
      setCreateEmail('')
      setCreatePassword('')
      setCreateName('')
      fetchList()
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to create user')
    }
  }

  const startEdit = (u) => {
    setEditingId(u.id)
    setEditName(u.full_name || '')
    setEditActive(u.is_active)
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      await adminUpdateUser(editingId, { full_name: editName || null, is_active: editActive })
      setEditingId(null)
      fetchList()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User management</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
        >
          Create user
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold mb-4">Create user</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full name (optional)</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded bg-amber-500 text-white hover:bg-amber-600">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : (
              list.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-40 px-2 py-1 border rounded bg-white dark:bg-gray-700"
                      />
                    ) : (
                      u.full_name || '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
                        Active
                      </label>
                    ) : (
                      <span className={u.is_active ? 'text-green-600' : 'text-red-600'}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="text-sm text-amber-600 hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(u)} className="text-sm text-amber-600 hover:underline">Edit</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
