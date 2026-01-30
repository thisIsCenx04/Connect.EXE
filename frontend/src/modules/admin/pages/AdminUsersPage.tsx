import { useEffect, useState } from 'react'
import { register as registerUser } from '../../../services/auth'
import {
  listAdminUsers,
  updateAdminUserStatus,
  type AdminUserSummary,
} from '../../../services/admin'
import { updateUserProfile } from '../../../services/user'
import { AdminIconButton, AdminModal } from '../components/AdminUi'

const createUserDefaults = {
  fullName: '',
  email: '',
  password: '',
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 20 4.5-1 9-9-3.5-3.5-9 9L4 20Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m14 6 3.5 3.5" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
)

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserSummary[]>([])
  const [userQueryInput, setUserQueryInput] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userActiveFilter, setUserActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null)
  const [editUserName, setEditUserName] = useState('')
  const [createUserForm, setCreateUserForm] = useState(createUserDefaults)
  const [activeModal, setActiveModal] = useState<null | 'detail' | 'edit' | 'create'>(null)
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
        setError('Không thể tải danh sách người dùng.')
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
      setMessage(`Người dùng đã ${updated.active ? 'kích hoạt lại' : 'bị khóa'}.`)
    } catch {
      setError('Không thể cập nhật trạng thái người dùng.')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    setMessage(null)
    setError(null)
    try {
      const updated = await updateUserProfile(selectedUser.id, {
        fullName: editUserName.trim() || selectedUser.fullName,
      })
      setUsers((prev) =>
        prev.map((item) =>
          item.id === selectedUser.id
            ? { ...item, fullName: updated.fullName ?? item.fullName }
            : item
        )
      )
      setMessage('Cập nhật hồ sơ người dùng thành công.')
      setActiveModal(null)
    } catch {
      setError('Không thể cập nhật hồ sơ người dùng.')
    }
  }

  const handleCreateUser = async () => {
    setMessage(null)
    setError(null)
    try {
      await registerUser({
        email: createUserForm.email.trim(),
        password: createUserForm.password,
        fullName: createUserForm.fullName.trim(),
      })
      setMessage('Tạo người dùng thành công.')
      setCreateUserForm(createUserDefaults)
      const active = userActiveFilter === 'all' ? undefined : userActiveFilter === 'active'
      const data = await listAdminUsers({ query: userQuery || undefined, active })
      setUsers(data)
      setActiveModal(null)
    } catch {
      setError('Không thể tạo người dùng.')
    }
  }

  const openDetail = (user: AdminUserSummary) => {
    setSelectedUser(user)
    setActiveModal('detail')
  }

  const openEdit = (user: AdminUserSummary) => {
    setSelectedUser(user)
    setEditUserName(user.fullName ?? '')
    setActiveModal('edit')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Người dùng</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">Quản lý tài khoản</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={userQueryInput}
            onChange={(event) => setUserQueryInput(event.target.value)}
            placeholder="Tìm theo email hoặc tên"
            className="w-52 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
          />
          <select
            value={userActiveFilter}
            onChange={(event) => setUserActiveFilter(event.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
          <button
            type="button"
            onClick={handleUserSearch}
            className="rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
          >
            Apply
          </button>
          <AdminIconButton
            label="Tạo người dùng"
            tone="primary"
            onClick={() => setActiveModal('create')}
          >
            <PlusIcon />
          </AdminIconButton>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {message}
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_0.8fr] gap-3 border-b border-slate-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          <span>Người dùng</span>
          <span>Email</span>
          <span>Vai trò</span>
          <span>Trạng thái</span>
          <span>Thao tác</span>
        </div>
        <div className="divide-y divide-slate-200">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1.2fr_1fr_0.6fr_0.6fr_0.8fr] items-center gap-3 px-6 py-4 text-sm"
            >
              <div>
                <div className="font-semibold text-slate-900">{user.fullName || 'Chưa có tên'}</div>
                <div className="text-xs text-slate-400">Tham gia {new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
              <span className="truncate text-slate-600">{user.email}</span>
              <span className="text-slate-600">{user.role}</span>
              <span>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    user.active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-600'
                  }`}
                >
                  {user.active ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <AdminIconButton label="Xem chi tiết" onClick={() => openDetail(user)}>
                  <EyeIcon />
                </AdminIconButton>
                <AdminIconButton label="Sửa người dùng" onClick={() => openEdit(user)}>
                  <EditIcon />
                </AdminIconButton>
                <button
                  type="button"
                  aria-label="Khóa người dùng"
                  onClick={() => handleToggleUser(user)}
                  className={`relative h-6 w-11 rounded-full ${
                    user.active ? 'bg-emerald-200' : 'bg-rose-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      user.active ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-6 py-6 text-sm text-slate-500">Không tìm thấy người dùng.</div>
          )}
        </div>
      </div>

      <AdminModal
        open={activeModal === 'detail'}
        title="Chi tiết người dùng"
        onClose={() => setActiveModal(null)}
        size="sm"
      >
        {selectedUser ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tên</span>
              <span>{selectedUser.fullName || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email</span>
              <span>{selectedUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Vai trò</span>
              <span>{selectedUser.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Xác thực</span>
              <span>{selectedUser.verifiedStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email xác thực</span>
              <span>{selectedUser.emailVerified ? 'Có' : 'Không'}</span>
            </div>
            <button
              type="button"
              onClick={() => handleToggleUser(selectedUser)}
              className={`mt-4 w-full rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                selectedUser.active
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {selectedUser.active ? 'Khóa người dùng' : 'Kích hoạt lại'}
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Chọn người dùng để xem chi tiết.</div>
        )}
      </AdminModal>

      <AdminModal
        open={activeModal === 'edit'}
        title="Sửa người dùng"
        onClose={() => setActiveModal(null)}
        size="sm"
      >
        {selectedUser ? (
          <div className="space-y-4">
            <label className="text-xs text-slate-500">
              Họ và tên
              <input
                value={editUserName}
                onChange={(event) => setEditUserName(event.target.value)}
                placeholder="Tên người dùng"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="text-xs text-slate-500">
              Vai trò
              <input
                value={selectedUser.role}
                disabled
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
              />
            </label>
            <button
              type="button"
              onClick={handleUpdateUser}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
            >
              Lưu thay đổi
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Chọn người dùng để sửa.</div>
        )}
      </AdminModal>

      <AdminModal
        open={activeModal === 'create'}
        title="Tạo người dùng"
        onClose={() => setActiveModal(null)}
        size="sm"
      >
        <div className="space-y-4">
          <label className="text-xs text-slate-500">
            Họ và tên
            <input
              value={createUserForm.fullName}
              onChange={(event) => setCreateUserForm((prev) => ({ ...prev, fullName: event.target.value }))}
              placeholder="Họ và tên"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500">
            Email
            <input
              value={createUserForm.email}
              onChange={(event) => setCreateUserForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="ten@email.com"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500">
            Mật khẩu tạm thời
            <input
              type="password"
              value={createUserForm.password}
              onChange={(event) => setCreateUserForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Đặt mật khẩu"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <button
            type="button"
            onClick={handleCreateUser}
            className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
          >
            Tạo người dùng
          </button>
        </div>
      </AdminModal>
    </section>
  )
}

