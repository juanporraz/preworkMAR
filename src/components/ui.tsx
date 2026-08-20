import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import type { Priority } from '../types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 ${className}`}>{children}</div>
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'secondary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none'
  const variants: Record<string, string> = {
    primary: 'bg-amber-500 text-neutral-950 hover:bg-amber-400',
    secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700',
    ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800',
    danger: 'bg-red-600/20 text-red-400 border border-red-900 hover:bg-red-600/30',
  }
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3.5 text-base',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { label: string; className: string }> = {
    critica: { label: '🔥 Crítica', className: 'bg-red-500/15 text-red-400 border-red-900' },
    alta: { label: '🔴 Alta', className: 'bg-orange-500/15 text-orange-400 border-orange-900' },
    media: { label: '🟡 Media', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-900' },
    baja: { label: '⚪ Baja', className: 'bg-neutral-500/15 text-neutral-400 border-neutral-700' },
  }
  const p = map[priority]
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${p.className}`}>{p.label}</span>
}

export function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-neutral-800 ${className}`}>
      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-amber-500 ${props.className ?? ''}`}
    />
  )
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-neutral-100 placeholder-neutral-500 outline-none focus:border-amber-500 ${props.className ?? ''}`}
    />
  )
}

export function Select({ children, className = '', ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-neutral-100 outline-none focus:border-amber-500 ${className}`}
    >
      {children}
    </select>
  )
}

export function StatusDot({ status }: { status: 'pendiente' | 'en_progreso' | 'terminada' | 'cancelada' }) {
  const map = {
    pendiente: { icon: '○', className: 'text-neutral-500' },
    en_progreso: { icon: '◐', className: 'text-amber-400' },
    terminada: { icon: '✓', className: 'text-emerald-400' },
    cancelada: { icon: '✕', className: 'text-neutral-600' },
  }
  const s = map[status]
  return <span className={`text-lg ${s.className}`}>{s.icon}</span>
}

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-neutral-800 bg-neutral-950 p-5 pb-8 sm:max-w-md sm:rounded-3xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          <button onClick={onClose} className="ml-auto rounded-full p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-neutral-500">{text}</p>
}
