import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Card } from '../components/ui'

const MODES = [
  { to: '/operacion', icon: '🏍️', title: 'OPERACIÓN', desc: 'Concentración operativa: entradas, salidas, cascos, urgencias.' },
  { to: '/construir', icon: '⚙️', title: 'CONSTRUIR', desc: 'Proyectos, etapas y entregables para depender menos de ti.' },
  { to: '/crecer', icon: '🚀', title: 'CRECER', desc: 'Solo lo relacionado con tu foco semanal de crecimiento.' },
]

export default function Modos() {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)

  return (
    <div className="space-y-3 pb-4">
      <h1 className="text-lg font-bold">Modos de enfoque</h1>
      <p className="text-sm text-neutral-500">Activa un modo para que la app deje de mostrarte lo secundario.</p>

      <div className="space-y-2">
        {MODES.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className={mode === m.to.slice(1) ? 'border-amber-500' : ''}>
              <p className="mb-1 flex items-center gap-2 font-bold">
                <span className="text-xl">{m.icon}</span> {m.title}
              </p>
              <p className="text-xs text-neutral-500">{m.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {mode !== 'general' && (
        <button
          onClick={() => setMode('general')}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-sm font-semibold text-neutral-400"
        >
          Salir del modo actual
        </button>
      )}
    </div>
  )
}
