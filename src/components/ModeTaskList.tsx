import { useStore } from '../store'
import { Card, EmptyState, PriorityBadge, StatusDot } from './ui'
import { BLOCK_DURATION_SECONDS } from '../lib/timer'
import type { EntityStatus, Task, TaskType } from '../types'

const STATUS_CYCLE: EntityStatus[] = ['pendiente', 'en_progreso', 'terminada']

export function ModeTaskList({ types, emptyText }: { types: TaskType[]; emptyText: string }) {
  const allTasks = useStore((s) => s.tasks)
  const tasks = allTasks.filter((t) => types.includes(t.type) && t.status !== 'cancelada')
  const updateTask = useStore((s) => s.updateTask)
  const startTimeBlock = useStore((s) => s.startTimeBlock)

  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'terminada' && b.status !== 'terminada') return 1
    if (b.status === 'terminada' && a.status !== 'terminada') return -1
    return 0
  })

  const cycle = (t: Task) => {
    const idx = STATUS_CYCLE.indexOf(t.status)
    updateTask(t.id, { status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] })
  }

  if (sorted.length === 0) return <EmptyState text={emptyText} />

  return (
    <div className="space-y-2">
      {sorted.map((t) => (
        <Card key={t.id} className="flex items-center gap-3 py-3">
          <button onClick={() => cycle(t)} className="shrink-0">
            <StatusDot status={t.status} />
          </button>
          <p className={`min-w-0 flex-1 truncate text-sm font-semibold ${t.status === 'terminada' ? 'text-neutral-500 line-through' : ''}`}>
            {t.name}
          </p>
          <PriorityBadge priority={t.priority} />
          {t.status !== 'terminada' && (
            <button
              className="shrink-0 rounded-lg bg-neutral-800 px-2 py-1 text-[11px] font-semibold text-amber-400"
              onClick={() => startTimeBlock({ label: t.name, durationSeconds: BLOCK_DURATION_SECONDS, taskId: t.id })}
            >
              ▶
            </button>
          )}
        </Card>
      ))}
    </div>
  )
}
