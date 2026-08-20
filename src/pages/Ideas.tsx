import { useState } from 'react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Sheet } from '../components/ui'
import type { Idea, IdeaResult } from '../types'
import { todayISO } from '../lib/id'

const QUESTIONS = [
  '¿Es relevante?',
  '¿La necesito?',
  '¿Es fuerte o débil?',
  '¿Es eficiente o ineficiente?',
  '¿Tiene prisa?',
  '¿Está alineada con mis objetivos?',
]

export default function Ideas() {
  const ideas = useStore((s) => s.ideas)
  const [processing, setProcessing] = useState<Idea | null>(null)
  const pending = ideas.filter((i) => !i.processed)
  const processed = ideas.filter((i) => i.processed)

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">💡 Bandeja de ideas</h1>

      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">Sin procesar ({pending.length})</p>
        {pending.length === 0 && <EmptyState text="Bandeja vacía." />}
        <div className="space-y-2">
          {pending.map((i) => (
            <Card key={i.id} className="flex items-center justify-between gap-3">
              <p className="text-sm">{i.text}</p>
              <Button size="sm" variant="secondary" onClick={() => setProcessing(i)}>
                Procesar
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {processed.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">Procesadas</p>
          <div className="space-y-2">
            {processed.map((i) => (
              <Card key={i.id} className="flex items-center justify-between gap-3 opacity-70">
                <p className="text-sm">{i.text}</p>
                <span className="text-xs uppercase text-amber-500">{i.result}</span>
              </Card>
            ))}
          </div>
        </section>
      )}

      <ProcessSheet idea={processing} onClose={() => setProcessing(null)} />
    </div>
  )
}

function ProcessSheet({ idea, onClose }: { idea: Idea | null; onClose: () => void }) {
  const processIdea = useStore((s) => s.processIdea)
  const addTask = useStore((s) => s.addTask)
  const addProject = useStore((s) => s.addProject)
  const [step, setStep] = useState(0)

  if (!idea) return null

  const finish = (result: IdeaResult) => {
    processIdea(idea.id, result, { reviewMonthly: result === 'archivo' })
    if (result === 'tarea') {
      addTask({
        name: idea.text,
        priority: 'media',
        estimatedMinutes: 20,
        date: todayISO(),
        status: 'pendiente',
        energyRequired: 'media',
        type: 'administracion',
      })
    }
    if (result === 'proyecto') {
      addProject({ name: idea.text, type: 'construccion' })
    }
    setStep(0)
    onClose()
  }

  const atLastQuestion = step >= QUESTIONS.length

  return (
    <Sheet open={!!idea} onClose={onClose} title="Procesar idea">
      <p className="mb-4 rounded-xl bg-neutral-900 p-3 text-sm italic text-neutral-300">"{idea.text}"</p>

      {!atLastQuestion ? (
        <div>
          <p className="mb-4 text-center text-lg font-semibold">{QUESTIONS[step]}</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setStep(step + 1)}>
              SÍ
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => setStep(step + 1)}>
              NO
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-neutral-600">
            Pregunta {step + 1} de {QUESTIONS.length}
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-center text-sm text-neutral-400">¿En qué se convierte esta idea?</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" onClick={() => finish('proyecto')}>
              PROYECTO
            </Button>
            <Button variant="primary" onClick={() => finish('tarea')}>
              TAREA
            </Button>
            <Button variant="secondary" onClick={() => finish('programar')}>
              PROGRAMAR
            </Button>
            <Button variant="ghost" onClick={() => finish('archivo')}>
              ARCHIVO
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
