import { useEffect } from 'react'
import { useStore } from '../store'
import { ModeTaskList } from '../components/ModeTaskList'
import { Card, Select } from '../components/ui'
import type { WeeklyFocus } from '../types'

const FOCUS_LABEL: Record<WeeklyFocus, string> = {
  marketing: 'Marketing',
  mensualidades: 'Mensualidades',
  fracciones: 'Fracciones',
  nuevos_servicios: 'Nuevos servicios',
  valor_por_cliente: 'Valor por cliente',
  alianzas: 'Alianzas',
}

export default function Crecer() {
  const setMode = useStore((s) => s.setMode)
  const currentFocus = useStore((s) => s.currentFocus)
  const setFocus = useStore((s) => s.setFocus)
  useEffect(() => {
    setMode('crecer')
    return () => setMode('general')
  }, [setMode])

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-bold">🚀 Crecer</h1>
        <p className="text-sm text-neutral-500">Solo las acciones relacionadas con tu foco semanal.</p>
      </div>

      <Card className="border-amber-900/40 bg-amber-950/10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-500">Foco semanal</p>
        <Select value={currentFocus ?? ''} onChange={(e) => setFocus((e.target.value || null) as WeeklyFocus | null)}>
          <option value="">Sin definir — elige uno</option>
          {Object.entries(FOCUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Card>

      <ModeTaskList types={['crecimiento']} emptyText="No hay acciones de crecimiento pendientes. Crea una tarea tipo Crecimiento." />
    </div>
  )
}

export { FOCUS_LABEL }
