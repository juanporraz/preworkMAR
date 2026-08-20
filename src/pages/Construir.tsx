import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { ModeTaskList } from '../components/ModeTaskList'
import { Card, EmptyState } from '../components/ui'

export default function Construir() {
  const setMode = useStore((s) => s.setMode)
  const allProjects = useStore((s) => s.projects)
  const projects = allProjects.filter((p) => !p.archived)
  useEffect(() => {
    setMode('construir')
    return () => setMode('general')
  }, [setMode])

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-bold">⚙️ Construir</h1>
        <p className="text-sm text-neutral-500">Sistemas para que el negocio dependa menos de ti.</p>
      </div>

      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">Proyectos</p>
        {projects.length === 0 && <EmptyState text="No hay proyectos de construcción todavía." />}
        <div className="space-y-2">
          {projects.map((p) => {
            const all = p.stages.flatMap((s) => s.deliverables)
            const done = all.filter((d) => d.done).length
            return (
              <Link key={p.id} to={`/proyectos/${p.id}`}>
                <Card>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-neutral-500">
                    {done}/{all.length} entregables completados
                  </p>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">Tareas de construcción</p>
        <ModeTaskList types={['construccion', 'pensamiento']} emptyText="No hay tareas de construcción pendientes." />
      </section>
    </div>
  )
}
