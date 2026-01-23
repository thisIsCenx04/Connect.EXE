import type { ReactNode } from 'react'

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export function AdminModal({
  open,
  title,
  onClose,
  size = 'md',
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className={`w-full ${sizeClasses[size]} rounded-3xl bg-white p-6 shadow-[0_40px_120px_rgba(15,23,42,0.25)]`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export function AdminIconButton({
  label,
  onClick,
  disabled,
  tone = 'default',
  children,
}: {
  label: string
  onClick?: () => void
  disabled?: boolean
  tone?: 'default' | 'primary' | 'danger'
  children: ReactNode
}) {
  const toneClass =
    tone === 'primary'
      ? 'border-slate-900 bg-slate-900 text-white'
      : tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-600'
      : 'border-slate-200 bg-white text-slate-500'

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${toneClass} ${disabled ? 'opacity-50' : 'hover:shadow-[0_10px_20px_rgba(15,23,42,0.12)]'}`}
    >
      {children}
    </button>
  )
}
