import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Button, Card, EmptyState, Select, Sheet, TextArea, TextField } from '../components/ui'
import type { TaskType } from '../types'
import { TYPE_LABEL } from './Tareas'

function projectProgress(project: { stages: { deliverables: { done: boolean }[] }[] }) {
  const all = project.stages.flatMap((s) => s.deliverables)
  const done = all.filter((d) => d.done).length
  return { done, total: all.length }
}

export default function Proyectos() {
  const allProjects = useStore((s) => s.projects)
  const projects = allProjects.filter((p) => !p.archived)
  const [openNew, setOpenNew] = useState(false)

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Proyectos</h1>
        <Button variant="primary" size="sm" onClick={() => setOpenNew(true)}>
          + Nuevo
        </Button>
      </div>

      {projects.length === 0 && <EmptyState text="No hay proyectos todavía." />}

      <div className="space-y-2">
        {projects.map((p) => {
          const { done, total } = projectProgress(p)
          return (
            <Link key={p.id} to={`/proyectos/${p.id}`}>
              <Card>
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-bold">{p.name}</p>
                  <span className="text-xs text-neutral-500">{TYPE_LABEL[p.type]}</span>
                </div>
                {p.description && <p className="mb-2 text-xs text-neutral-500">{p.description}</p>}
                <p className="text-xs text-neutral-500">
                  {p.stages.length} etapa(s) · {done}/{total} entregables
                </p>
              </Card>
            </Link>
          )
        })}
      </div>

      <NewProjectSheet open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  )
}

function NewProjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addProject = useStore((s) => s.addProject)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TaskType>('construccion')

  const save = () => {
    if (!name.trim()) return
    addProject({ name: name.trim(), description, type })
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Nuevo proyecto">
      <div className="space-y-3">
        <TextField autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del proyecto" />
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" rows={2} />
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
        <Button variant="primary" className="w-full" onClick={save}>
          GUARDAR
        </Button>
      </div>
    </Sheet>
  )
}
