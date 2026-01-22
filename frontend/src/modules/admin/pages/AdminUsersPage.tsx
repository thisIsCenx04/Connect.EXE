import { useEffect, useState } from 'react'
import {
  listAdminUsers,
  updateAdminUserStatus,
  type AdminUserSummary,
} from '../../../services/admin'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [userQueryInput, setUserQueryInput] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userActiveFilter, setUserActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadUsers = async () => {
      try {
        const active = userActiveFilter === 'all' ? undefined : userActiveFilter === 'active'
        const data = await listAdminUsers({
          query: userQuery || undefined,
          active,
        })
        if (!isMounted) return
        setUsers(data)
      } catch {
        if (!isMounted) return
        setError('Unable to load users.')
      }
    }
    loadUsers()
    return () => {
      isMounted = false
    }
  }, [userQuery, userActiveFilter])

  const handleUserSearch = () => {
    setUserQuery(userQueryInput.trim())
  }

  const handleToggleUser = async (user: AdminUserSummary) => {
    setMessage(null)
    setError(null)
    try {
      const updated = await updateAdminUserStatus(user.id, !user.active)
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
      setMessage(`User ${updated.active ? 'activated' : 'deactivated'}.`)
    } catch {
      setError('Unable to update user status.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Users</p>
          <h2 className="display-font text-xl font-semibold text-white">Manage accounts</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={userQueryInput}
            onChange={(event) => setUserQueryInput(event.target.value)}
            placeholder="Search by email or name"
            className="w-48 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white"
          />
          <select
            value={userActiveFilter}
            onChange={(event) => setUserActiveFilter(event.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={handleUserSearch}
            className="rounded-full btn-ghost px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Apply
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div className="card-surface overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_0.6fr] gap-3 border-b border-white/10 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-white/10">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_0.6fr] items-center gap-3 px-6 py-4 text-sm text-white/80"
            >
              <div>
                <div className="font-semibold text-white">{user.fullName || 'No name'}</div>
                <div className="text-xs text-white/40">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <span>{user.email}</span>
              <span>{user.role}</span>
              <span>
                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${user.active ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/40 bg-rose-500/10 text-rose-200'}`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleToggleUser(user)}
                className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 hover:border-white/30"
              >
                {user.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-6 py-6 text-sm text-white/50">No users found.</div>
          )}
        </div>
      </div>
    </section>
  )
}
