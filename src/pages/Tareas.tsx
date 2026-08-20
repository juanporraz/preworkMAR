import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { todayISO } from '../lib/id'
import { Button, Card, EmptyState, PriorityBadge, Select, Sheet, StatusDot, TextField } from '../components/ui'
import type { EnergyLevel, EntityStatus, Priority, Task, TaskType } from '../types'
import { BLOCK_DURATION_SECONDS } from '../lib/timer'

const TYPE_LABEL: Record<TaskType, string> = {
  operacion: 'Operación',
  crecimiento: 'Crecimiento',
  construccion: 'Construcción',
  control: 'Control',
  pensamiento: 'Pensamiento',
  aprendizaje: 'Aprendizaje',
  administracion: 'Administración',
  descanso: 'Descanso',
}

const STATUS_CYCLE: EntityStatus[] = ['pendiente', 'en_progreso', 'terminada']

function suggestPriority(date: string | undefined): Priority {
  if (!date) return 'media'
  const today = todayISO()
  if (date < today) return 'alta'
  if (date === today) return 'alta'
  return 'media'
}

export default function Tareas() {
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const updateTask = useStore((s) => s.updateTask)
  const removeTask = useStore((s) => s.removeTask)
  const startTimeBlock = useStore((s) => s.startTimeBlock)
  const [openNew, setOpenNew] = useState(false)
  const [filter, setFilter] = useState<'activas' | 'todas'>('activas')

  const visible = useMemo(() => {
    const list = filter === 'activas' ? tasks.filter((t) => t.status === 'pendiente' || t.status === 'en_progreso') : tasks
    return [...list].sort((a) => (a.status === 'en_progreso' ? -1 : 1))
  }, [tasks, filter])

  const cycle = (t: Task) => {
    const idx = STATUS_CYCLE.indexOf(t.status)
    updateTask(t.id, { status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] })
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Tareas</h1>
        <Button variant="primary" size="sm" onClick={() => setOpenNew(true)}>
          + Nueva
        </Button>
      </div>

      <div className="flex gap-2 text-xs">
        {(['activas', 'todas'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 font-semibold ${
              filter === f ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {f === 'activas' ? 'Activas' : 'Todas'}
          </button>
        ))}
      </div>

      {visible.length === 0 && <EmptyState text="No hay tareas. Crea la primera." />}

      <div className="space-y-2">
        {visible.map((t) => {
          const project = projects.find((p) => p.id === t.projectId)
          return (
            <Card key={t.id} className="flex items-start gap-3 py-3">
              <button onClick={() => cycle(t)} className="mt-0.5 shrink-0">
                <StatusDot status={t.status} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-semibold ${t.status === 'terminada' ? 'text-neutral-500 line-through' : ''}`}>
                  {t.name}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {TYPE_LABEL[t.type]} · {t.estimatedMinutes} min{project ? ` · ${project.name}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <PriorityBadge priority={t.priority} />
                <div className="flex gap-1">
                  {t.status !== 'terminada' && (
                    <button
                      className="rounded-lg bg-neutral-800 px-2 py-1 text-[11px] font-semibold text-amber-400"
                      onClick={() =>
                        startTimeBlock({ label: t.name, durationSeconds: BLOCK_DURATION_SECONDS, taskId: t.id })
                      }
                    >
                      ▶
                    </button>
                  )}
                  <button
                    className="rounded-lg bg-neutral-800 px-2 py-1 text-[11px] font-semibold text-neutral-500"
                    onClick={() => removeTask(t.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <NewTaskSheet open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  )
}

function NewTaskSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addTask = useStore((s) => s.addTask)
  const projects = useStore((s) => s.projects)
  const [name, setName] = useState('')
  const [type, setType] = useState<TaskType>('operacion')
  const [priority, setPriority] = useState<Priority>('media')
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel>('media')
  const [estimatedMinutes, setEstimatedMinutes] = useState(20)
  const [date, setDate] = useState(todayISO())
  const [projectId, setProjectId] = useState('')

  const reset = () => {
    setName('')
    setType('operacion')
    setPriority('media')
    setEnergyRequired('media')
    setEstimatedMinutes(20)
    setDate(todayISO())
    setProjectId('')
  }

  const save = () => {
    if (!name.trim()) return
    addTask({
      name: name.trim(),
      type,
      priority,
      energyRequired,
      estimatedMinutes,
      date,
      status: 'pendiente',
      projectId: projectId || undefined,
    })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Nueva tarea">
      <div className="space-y-3">
        <TextField autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la tarea" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Tipo</label>
            <Select value={type} onChange={(e) => setType(e.target.value as TaskType)}>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Prioridad</label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              onFocus={() => setPriority((p) => (p === 'media' ? suggestPriority(date) : p))}
            >
              <option value="critica">🔥 Crítica</option>
              <option value="alta">🔴 Alta</option>
              <option value="media">🟡 Media</option>
              <option value="baja">⚪ Baja</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Energía requerida</label>
            <Select value={energyRequired} onChange={(e) => setEnergyRequired(e.target.value as EnergyLevel)}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Minutos</label>
            <TextField type="number" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Fecha</label>
            <TextField type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Proyecto</label>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Ninguno</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Button variant="primary" className="w-full" onClick={save}>
          GUARDAR
        </Button>
      </div>
    </Sheet>
  )
}

export { TYPE_LABEL }
