import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { todayISO } from '../lib/id'
import { getRecommendation } from '../lib/recommend'
import { getCurrentEnergy } from '../lib/energy'
import { BLOCK_DURATION_SECONDS } from '../lib/timer'
import { Button, Card, PriorityBadge, ProgressBar, Select, Sheet, StatusDot, TextArea, TextField } from '../components/ui'
import { Timer } from '../components/Timer'
import type { EntityStatus, Priority, Victory } from '../types'

const STATUS_CYCLE: EntityStatus[] = ['pendiente', 'en_progreso', 'terminada']

export default function Hoy() {
  const navigate = useNavigate()
  const date = todayISO()
  const ensureTodayVictories = useStore((s) => s.ensureTodayVictories)
  const allVictories = useStore((s) => s.victories)
  const victories = allVictories.filter((v) => v.date === date)
  const updateVictory = useStore((s) => s.updateVictory)
  const tasks = useStore((s) => s.tasks)
  const mode = useStore((s) => s.mode)
  const currentFocus = useStore((s) => s.currentFocus)
  const activeTimeBlockId = useStore((s) => s.activeTimeBlockId)
  const startTimeBlock = useStore((s) => s.startTimeBlock)
  const seedIfEmpty = useStore((s) => s.seedIfEmpty)

  const [editing, setEditing] = useState<Victory | null>(null)

  useEffect(() => {
    ensureTodayVictories()
    seedIfEmpty()
  }, [ensureTodayVictories, seedIfEmpty])

  const done = victories.filter((v) => v.status === 'terminada').length
  const rec = getRecommendation({ tasks, victories, mode, currentFocus })
  const energy = getCurrentEnergy()

  const cycleStatus = (v: Victory) => {
    const idx = STATUS_CYCLE.indexOf(v.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    updateVictory(v.id, { status: next })
  }

  const empezarAhora = () => {
    startTimeBlock({
      label: rec.title,
      durationSeconds: BLOCK_DURATION_SECONDS,
      taskId: rec.taskId,
      victoryId: rec.victoryId,
    })
  }

  return (
    <div className="space-y-4 pb-4">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-neutral-300">
            🎯 Mis 3 victorias
          </h2>
          <span className="text-xs font-medium text-neutral-500">
            {done}/{victories.length}
          </span>
        </div>
        <ProgressBar value={done} max={victories.length || 3} className="mb-3" />
        <div className="space-y-2">
          {victories.map((v, i) => (
            <Card key={v.id} className="flex items-start gap-3 py-3">
              <button onClick={() => cycleStatus(v)} className="mt-0.5 shrink-0">
                <StatusDot status={v.status} />
              </button>
              <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(v)}>
                <p className={`truncate font-semibold ${v.status === 'terminada' ? 'text-neutral-500 line-through' : ''}`}>
                  {v.title || `Victoria ${i + 1} — toca para definir`}
                </p>
                {v.expectedResult && <p className="truncate text-xs text-neutral-500">→ {v.expectedResult}</p>}
              </button>
              <PriorityBadge priority={v.priority} />
            </Card>
          ))}
        </div>
      </section>

      {activeTimeBlockId ? (
        <Timer />
      ) : (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-300">⚡ Ahora</h2>
            <span className="text-xs text-neutral-500">Energía {energy.level}</span>
          </div>
          <Card className="border-amber-900/40 bg-gradient-to-br from-amber-950/30 to-neutral-900">
            <p className="mb-1 text-lg font-bold leading-snug">{rec.title}</p>
            {rec.description && <p className="mb-4 text-sm text-neutral-400">{rec.description}</p>}
            <Button variant="primary" size="lg" className="w-full" onClick={empezarAhora}>
              EMPEZAR {rec.kind === 'task' ? '20 MIN' : ''}
            </Button>
          </Card>
        </section>
      )}

      <VictoryEditSheet victory={editing} onClose={() => setEditing(null)} />

      <button
        onClick={() => navigate('/cierre')}
        className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 py-3 text-sm font-semibold text-neutral-300"
      >
        🌙 Cierre del día
      </button>
    </div>
  )
}

function VictoryEditSheet({ victory, onClose }: { victory: Victory | null; onClose: () => void }) {
  const updateVictory = useStore((s) => s.updateVictory)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [estimatedMinutes, setEstimatedMinutes] = useState(60)

  useEffect(() => {
    if (victory) {
      setTitle(victory.title)
      setDescription(victory.description)
      setExpectedResult(victory.expectedResult)
      setPriority(victory.priority)
      setEstimatedMinutes(victory.estimatedMinutes)
    }
  }, [victory])

  if (!victory) return null

  const save = () => {
    updateVictory(victory.id, { title, description, expectedResult, priority, estimatedMinutes })
    onClose()
  }

  return (
    <Sheet open={!!victory} onClose={save} title="Editar victoria">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Título (resultado, no actividad)</label>
          <TextField value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Ej. "Dejar funcionando el cierre de caja"' />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Resultado esperado</label>
          <TextField value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Descripción</label>
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Prioridad</label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="critica">🔥 Crítica</option>
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Media</option>
              <option value="baja">⚪ Baja</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Minutos estimados</label>
            <TextField
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
          </div>
        </div>
        <Button variant="primary" className="w-full" onClick={save}>
          GUARDAR
        </Button>
      </div>
    </Sheet>
  )
}
