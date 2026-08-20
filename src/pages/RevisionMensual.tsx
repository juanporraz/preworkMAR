import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { currentMonth } from '../lib/date'
import { Button, Card, TextArea } from '../components/ui'

export default function RevisionMensual() {
  const navigate = useNavigate()
  const month = currentMonth()
  const existing = useStore((s) => s.monthlyReviews.find((m) => m.month === month))
  const addOrUpdateMonthlyReview = useStore((s) => s.addOrUpdateMonthlyReview)
  const allIdeas = useStore((s) => s.ideas)
  const ideasArchivadas = allIdeas.filter((i) => i.reviewMonthly && i.result === 'archivo')

  const [resumen, setResumen] = useState(existing?.resumen ?? '')
  const [revisadas, setRevisadas] = useState(existing?.ideasArchivadasRevisadas ?? false)

  const save = () => {
    addOrUpdateMonthlyReview(month, { resumen, ideasArchivadasRevisadas: revisadas, completedAt: new Date().toISOString() })
    navigate('/revisiones')
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">🗓️ Revisión mensual — {month}</h1>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Resumen del mes</label>
        <TextArea rows={5} value={resumen} onChange={(e) => setResumen(e.target.value)} />
      </div>

      <Card>
        <p className="mb-2 text-sm font-bold text-neutral-300">💡 Ideas archivadas para revisar</p>
        {ideasArchivadas.length === 0 ? (
          <p className="text-xs text-neutral-500">No hay ideas archivadas pendientes de revisión.</p>
        ) : (
          <ul className="mb-2 space-y-1">
            {ideasArchivadas.map((i) => (
              <li key={i.id} className="text-xs text-neutral-400">
                · {i.text}
              </li>
            ))}
          </ul>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={revisadas} onChange={(e) => setRevisadas(e.target.checked)} className="h-4 w-4 accent-amber-500" />
          Ya revisé las ideas archivadas
        </label>
      </Card>

      <Button variant="primary" size="lg" className="w-full" onClick={save}>
        GUARDAR
      </Button>
    </div>
  )
}
