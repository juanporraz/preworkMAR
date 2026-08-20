import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Card, EmptyState } from '../components/ui'
import { mondayOfWeek } from '../lib/id'

export default function Revisiones() {
  const weeklyReviews = useStore((s) => s.weeklyReviews)
  const week = mondayOfWeek()
  const thisWeekDone = weeklyReviews.find((w) => w.weekStart === week)?.completedAt

  return (
    <div className="space-y-3 pb-4">
      <h1 className="text-lg font-bold">Revisiones</h1>

      <Link to="/revisiones/semanal">
        <Card className={thisWeekDone ? '' : 'border-amber-500'}>
          <p className="font-bold">📅 Revisión semanal</p>
          <p className="text-xs text-neutral-500">{thisWeekDone ? 'Completada esta semana' : 'Pendiente — domingo'}</p>
        </Card>
      </Link>

      <Link to="/revisiones/mensual">
        <Card>
          <p className="font-bold">🗓️ Revisión mensual</p>
          <p className="text-xs text-neutral-500">Resumen del mes e ideas archivadas</p>
        </Card>
      </Link>

      <Link to="/revisiones/trimestral">
        <Card>
          <p className="font-bold">🧭 Revisión trimestral</p>
          <p className="text-xs text-neutral-500">Capital, resultados, sistemas, próximo escalón</p>
        </Card>
      </Link>

      <section>
        <p className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-neutral-400">Historial semanal</p>
        {weeklyReviews.filter((w) => w.completedAt).length === 0 && <EmptyState text="Aún no hay revisiones completadas." />}
        <div className="space-y-2">
          {[...weeklyReviews]
            .filter((w) => w.completedAt)
            .sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1))
            .map((w) => (
              <Card key={w.id} className="py-2.5">
                <p className="text-sm font-semibold">Semana de {w.weekStart}</p>
                {w.nextFocus && <p className="text-xs text-neutral-500">Foco: {w.nextFocus}</p>}
              </Card>
            ))}
        </div>
      </section>
    </div>
  )
}
