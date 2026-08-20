import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { Button, Card, EmptyState, TextField } from '../components/ui'
import { todayISO } from '../lib/id'

export default function ProyectoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const project = useStore((s) => s.projects.find((p) => p.id === id))
  const tasks = useStore((s) => s.tasks)
  const addStage = useStore((s) => s.addStage)
  const addDeliverable = useStore((s) => s.addDeliverable)
  const toggleDeliverable = useStore((s) => s.toggleDeliverable)
  const addTask = useStore((s) => s.addTask)
  const linkTaskToDeliverable = useStore((s) => s.linkTaskToDeliverable)
  const archiveProject = useStore((s) => s.archiveProject)

  const [newStageName, setNewStageName] = useState('')
  const [newDeliverable, setNewDeliverable] = useState<Record<string, string>>({})

  if (!project) return <EmptyState text="Proyecto no encontrado." />

  const makeTaskFromDeliverable = (stageId: string, deliverableId: string, name: string) => {
    const taskId = addTask({
      name,
      projectId: project.id,
      stageId,
      deliverableId,
      priority: 'media',
      estimatedMinutes: 20,
      date: todayISO(),
      status: 'pendiente',
      energyRequired: 'media',
      type: project.type,
    })
    linkTaskToDeliverable(project.id, stageId, deliverableId, taskId)
  }

  return (
    <div className="space-y-4 pb-4">
      <button onClick={() => navigate('/proyectos')} className="text-xs text-neutral-500">
        ← Proyectos
      </button>
      <div>
        <h1 className="text-lg font-bold">{project.name}</h1>
        {project.description && <p className="text-sm text-neutral-500">{project.description}</p>}
      </div>

      {project.stages.map((stage) => (
        <Card key={stage.id}>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-500">{stage.name}</p>
          <div className="space-y-2">
            {stage.deliverables.map((d) => {
              const linkedTasks = tasks.filter((t) => d.taskIds.includes(t.id))
              return (
                <div key={d.id} className="rounded-xl border border-neutral-800 p-2.5">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={d.done}
                      onChange={() => toggleDeliverable(project.id, stage.id, d.id)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    <span className={`text-sm font-medium ${d.done ? 'text-neutral-500 line-through' : ''}`}>{d.name}</span>
                  </label>
                  {linkedTasks.length > 0 && (
                    <ul className="ml-6 mt-1 space-y-0.5">
                      {linkedTasks.map((t) => (
                        <li key={t.id} className="text-xs text-neutral-500">
                          · {t.name} {t.status === 'terminada' ? '✓' : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!d.done && (
                    <button
                      className="ml-6 mt-1 text-xs font-semibold text-amber-500"
                      onClick={() => makeTaskFromDeliverable(stage.id, d.id, d.name)}
                    >
                      + Convertir en tarea
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <TextField
              placeholder="Nuevo entregable..."
              value={newDeliverable[stage.id] ?? ''}
              onChange={(e) => setNewDeliverable((s) => ({ ...s, [stage.id]: e.target.value }))}
            />
            <Button
              variant="secondary"
              onClick={() => {
                const val = newDeliverable[stage.id]
                if (!val?.trim()) return
                addDeliverable(project.id, stage.id, val.trim())
                setNewDeliverable((s) => ({ ...s, [stage.id]: '' }))
              }}
            >
              +
            </Button>
          </div>
        </Card>
      ))}

      <Card>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">Nueva etapa</p>
        <div className="flex gap-2">
          <TextField placeholder="Nombre de la etapa" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} />
          <Button
            variant="secondary"
            onClick={() => {
              if (!newStageName.trim()) return
              addStage(project.id, newStageName.trim())
              setNewStageName('')
            }}
          >
            +
          </Button>
        </div>
      </Card>

      <Button variant="danger" className="w-full" onClick={() => { archiveProject(project.id); navigate('/proyectos') }}>
        Archivar proyecto
      </Button>
    </div>
  )
}
