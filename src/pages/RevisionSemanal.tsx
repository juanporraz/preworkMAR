import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { mondayOfWeek } from '../lib/id'
import { Button, TextArea } from '../components/ui'
import type { WeeklyFocus, WeeklyReview } from '../types'
import { FOCUS_LABEL } from './Crecer'

const FIELDS: { key: keyof Pick<WeeklyReview, 'dinero' | 'crecimiento' | 'operacion' | 'objetivo' | 'aprendizajes' | 'ideas' | 'satisfaccion'>; icon: string; question: string }[] = [
  { key: 'dinero', icon: '💰', question: '¿Cómo estuvo el dinero esta semana?' },
  { key: 'crecimiento', icon: '📈', question: '¿Cómo avanzó el crecimiento?' },
  { key: 'operacion', icon: '🏍️', question: '¿Cómo estuvo la operación?' },
  { key: 'objetivo', icon: '🎯', question: '¿Cumpliste tu objetivo de la semana?' },
  { key: 'aprendizajes', icon: '🧠', question: '¿Qué aprendiste?' },
  { key: 'ideas', icon: '💡', question: '¿Qué ideas destacaron?' },
  { key: 'satisfaccion', icon: '❤️', question: '¿Qué tan satisfecho estás con la semana?' },
]

export default function RevisionSemanal() {
  const navigate = useNavigate()
  const weekStart = mondayOfWeek()
  const addOrUpdateWeeklyReview = useStore((s) => s.addOrUpdateWeeklyReview)
  const completeWeeklyReview = useStore((s) => s.completeWeeklyReview)
  const setFocus = useStore((s) => s.setFocus)
  const existing = useStore((s) => s.weeklyReviews.find((w) => w.weekStart === weekStart))

  const [answers, setAnswers] = useState(() => ({
    dinero: existing?.dinero ?? '',
    crecimiento: existing?.crecimiento ?? '',
    operacion: existing?.operacion ?? '',
    objetivo: existing?.objetivo ?? '',
    aprendizajes: existing?.aprendizajes ?? '',
    ideas: existing?.ideas ?? '',
    satisfaccion: existing?.satisfaccion ?? '',
  }))
  const [idx, setIdx] = useState(0)
  const [nextFocus, setNextFocus] = useState<WeeklyFocus | null>(existing?.nextFocus ?? null)
  const [askingFocus, setAskingFocus] = useState(false)

  const field = FIELDS[idx]
  const done = useMemo(() => idx >= FIELDS.length, [idx])

  const next = () => {
    addOrUpdateWeeklyReview(weekStart, { [field.key]: answers[field.key] })
    if (idx < FIELDS.length - 1) setIdx(idx + 1)
    else setAskingFocus(true)
  }

  const finish = () => {
    addOrUpdateWeeklyReview(weekStart, { ...answers, nextFocus })
    completeWeeklyReview(weekStart)
    if (nextFocus) setFocus(nextFocus)
    navigate('/')
  }

  if (askingFocus || done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-3xl">🎯</p>
        <p className="text-lg font-bold">¿Cuál será tu foco de crecimiento la próxima semana?</p>
        <div className="grid w-full grid-cols-2 gap-2">
          {Object.entries(FOCUS_LABEL).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setNextFocus(k as WeeklyFocus)}
              className={`rounded-xl border py-3 text-sm font-semibold ${
                nextFocus === k ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-neutral-800 bg-neutral-900 text-neutral-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={finish} disabled={!nextFocus}>
          GUARDAR Y TERMINAR
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col pb-4">
      <div className="mb-4 flex items-center gap-1">
        {FIELDS.map((f, i) => (
          <div key={f.key} className={`h-1 flex-1 rounded-full ${i <= idx ? 'bg-amber-500' : 'bg-neutral-800'}`} />
        ))}
      </div>
      <p className="mb-3 text-2xl">{field.icon}</p>
      <p className="mb-4 text-lg font-bold">{field.question}</p>
      <TextArea
        autoFocus
        rows={5}
        value={answers[field.key]}
        onChange={(e) => setAnswers((a) => ({ ...a, [field.key]: e.target.value }))}
        className="mb-4 flex-1"
      />
      <Button variant="primary" size="lg" className="w-full" onClick={next}>
        Siguiente
      </Button>
    </div>
  )
}
