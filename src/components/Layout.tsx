import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { IdeaButton, BlockedButton, MicroTaskButton } from './QuickActions'

const NAV_ITEMS = [
  { to: '/', label: 'Hoy', icon: '🏠' },
  { to: '/modos', label: 'Modos', icon: '🧭' },
  { to: '/tareas', label: 'Tareas', icon: '✅' },
  { to: '/proyectos', label: 'Proyectos', icon: '📁' },
  { to: '/mas', label: 'Más', icon: '☰' },
]

function formatToday() {
  const d = new Date()
  const s = d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function Layout() {
  const location = useLocation()
  const isHoy = location.pathname === '/'

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-900 bg-neutral-950/95 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500">Sí Podía</p>
            {isHoy && <p className="text-sm font-medium text-neutral-400">{formatToday()}</p>}
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-3 pt-4">
        <Outlet />
      </main>

      <div className="sticky bottom-[64px] z-20 flex gap-2 border-t border-neutral-900 bg-neutral-950/95 px-3 py-2 backdrop-blur">
        <IdeaButton />
        <BlockedButton />
        <MicroTaskButton />
      </div>

      <nav className="sticky bottom-0 z-30 flex border-t border-neutral-800 bg-neutral-950 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive ? 'text-amber-500' : 'text-neutral-500'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
