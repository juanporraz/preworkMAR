import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { todayISO, tomorrowISO } from '../lib/id'
import { entriesForDay, sumEntries, formatCOP } from '../lib/finance'
import { Button, Card, TextArea, TextField } from '../components/ui'

const STEPS = ['caja', 'operacion', 'reflexion', 'ideas', 'manana', 'satisfaccion', 'listo'] as const
type Step = (typeof STEPS)[number]

const YESNO_FIELDS: { key: 'motosCoinciden' | 'cascosCorrectos' | 'hayDesorden'; question: string; invert?: boolean }[] = [
  { key: 'motosCoinciden', question: '¿Las motos del sistema coinciden con las físicas?' },
  { key: 'cascosCorrectos', question: '¿Los cascos están correctos?' },
  { key: 'hayDesorden', question: '¿Hay desorden?', invert: true },
]

const REFLEXION_FIELDS: { key: keyof ReturnType<typeof emptyReflexion>; question: string }[] = [
  { key: 'queSalioBien', question: '¿Qué salió bien?' },
  { key: 'queSalioMal', question: '¿Qué salió mal?' },
  { key: 'porque', question: '¿Por qué?' },
  { key: 'queAprendiste', question: '¿Qué aprendiste?' },
  { key: 'queCorregir', question: '¿Qué debes corregir?' },
]

function emptyReflexion() {
  return { queSalioBien: '', queSalioMal: '', porque: '', queAprendiste: '', queCorregir: '' }
}

const SATISFACTION = [
  { v: 1, e: '😞' },
  { v: 2, e: '😐' },
  { v: 3, e: '🙂' },
  { v: 4, e: '😄' },
  { v: 5, e: '🔥' },
] as const

export default function Cierre() {
  const navigate = useNavigate()
  const date = todayISO()
  const getOrCreateDailyClose = useStore((s) => s.getOrCreateDailyClose)
  const updateDailyClose = useStore((s) => s.updateDailyClose)
  const completeDailyClose = useStore((s) => s.completeDailyClose)
  const financeEntries = useStore((s) => s.financeEntries)
  const allIdeas = useStore((s) => s.ideas)
  const ideas = allIdeas.filter((i) => !i.processed)
  const processIdea = useStore((s) => s.processIdea)
  const addIdea = useStore((s) => s.addIdea)
  const addTask = useStore((s) => s.addTask)
  const addProject = useStore((s) => s.addProject)
  const addVictory = useStore((s) => s.addVictory)

  const close = useMemo(() => getOrCreateDailyClose(date), [date, getOrCreateDailyClose])
  const [stepIdx, setStepIdx] = useState(0)
  const step: Step = STEPS[stepIdx]

  const todaySums = useMemo(() => sumEntries(entriesForDay(financeEntries, date)), [financeEntries, date])

  const [ingresos, setIngresos] = useState(close.caja.ingresos || todaySums.ingresos)
  const [gastos, setGastos] = useState(close.caja.gastos || todaySums.gastos)
  const [operacion, setOperacion] = useState(close.operacion)
  const [reflexion, setReflexion] = useState(close.reflexion.queSalioBien ? close.reflexion : emptyReflexion())
  const [reflexIdx, setReflexIdx] = useState(0)
  const [newIdeaText, setNewIdeaText] = useState('')
  const [victories, setVictories] = useState([
    { title: '', expectedResult: '' },
    { title: '', expectedResult: '' },
    { title: '', expectedResult: '' },
  ])
  const [satisfaccion, setSatisfaccion] = useState<1 | 2 | 3 | 4 | 5 | null>(close.satisfaccion)

  useEffect(() => {
    updateDailyClose(date, { caja: { ingresos, gastos, resultado: ingresos - gastos } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingresos, gastos])

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1))
  const back = () => setStepIdx((i) => Math.max(i - 1, 0))

  const finishAll = () => {
    updateDailyClose(date, { operacion, reflexion, satisfaccion })
    victories.forEach((v) => {
      if (!v.title.trim()) return
      addVictory({
        date: tomorrowISO(),
        title: v.title.trim(),
        description: '',
        priority: 'media',
        expectedResult: v.expectedResult.trim(),
        status: 'pendiente',
        estimatedMinutes: 60,
        taskIds: [],
      })
    })
    completeDailyClose(date)
    navigate('/')
  }

  return (
    <div className="flex min-h-[70vh] flex-col pb-4">
      <div className="mb-4 flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${i <= stepIdx ? 'bg-amber-500' : 'bg-neutral-800'}`} />
        ))}
      </div>

      {step === 'caja' && (
        <StepShell title="💰 Caja" onNext={next}>
          <Field label="Ingresos">
            <TextField type="number" value={ingresos} onChange={(e) => setIngresos(Number(e.target.value))} />
          </Field>
          <Field label="Gastos">
            <TextField type="number" value={gastos} onChange={(e) => setGastos(Number(e.target.value))} />
          </Field>
          <Card className="text-center">
            <p className="text-xs text-neutral-500">Resultado</p>
            <p className={`text-2xl font-bold ${ingresos - gastos >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCOP(ingresos - gastos)}
            </p>
          </Card>
        </StepShell>
      )}

      {step === 'operacion' && (
        <StepShell title="🏍️ Operación" onNext={next} onBack={back}>
          {YESNO_FIELDS.map((f) => (
            <div key={f.key} className="mb-3">
              <p className="mb-2 text-sm font-medium text-neutral-300">{f.question}</p>
              <div className="flex gap-2">
                <Button
                  variant={operacion[f.key] === true ? 'primary' : 'secondary'}
                  className="flex-1"
                  onClick={() => setOperacion((o) => ({ ...o, [f.key]: true }))}
                >
                  SÍ
                </Button>
                <Button
                  variant={operacion[f.key] === false ? 'primary' : 'secondary'}
                  className="flex-1"
                  onClick={() => setOperacion((o) => ({ ...o, [f.key]: false }))}
                >
                  NO
                </Button>
              </div>
            </div>
          ))}
        </StepShell>
      )}

      {step === 'reflexion' && (
        <StepShell
          title="🧠 Reflexión"
          onNext={() => (reflexIdx < REFLEXION_FIELDS.length - 1 ? setReflexIdx((i) => i + 1) : next())}
          onBack={() => (reflexIdx > 0 ? setReflexIdx((i) => i - 1) : back())}
        >
          <p className="mb-2 text-sm font-semibold text-neutral-300">{REFLEXION_FIELDS[reflexIdx].question}</p>
          <TextArea
            autoFocus
            rows={4}
            value={reflexion[REFLEXION_FIELDS[reflexIdx].key]}
            onChange={(e) => setReflexion((r) => ({ ...r, [REFLEXION_FIELDS[reflexIdx].key]: e.target.value }))}
          />
          <p className="mt-2 text-right text-xs text-neutral-600">
            {reflexIdx + 1}/{REFLEXION_FIELDS.length}
          </p>
        </StepShell>
      )}

      {step === 'ideas' && (
        <StepShell title="💡 Ideas" onNext={next} onBack={back}>
          {ideas.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">Bandeja de ideas vacía. Nada que procesar.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-neutral-400">Tienes {ideas.length} idea(s) sin procesar:</p>
              {ideas.map((idea) => (
                <Card key={idea.id} className="py-2.5">
                  <p className="mb-2 text-sm">{idea.text}</p>
                  <div className="grid grid-cols-4 gap-1">
                    {(['proyecto', 'tarea', 'programar', 'archivo'] as const).map((r) => (
                      <button
                        key={r}
                        className="rounded-lg bg-neutral-800 py-1.5 text-[10px] font-bold uppercase text-neutral-300"
                        onClick={() => {
                          processIdea(idea.id, r, { reviewMonthly: r === 'archivo' })
                          if (r === 'tarea')
                            addTask({
                              name: idea.text,
                              priority: 'media',
                              estimatedMinutes: 20,
                              date: todayISO(),
                              status: 'pendiente',
                              energyRequired: 'media',
                              type: 'administracion',
                            })
                          if (r === 'proyecto') addProject({ name: idea.text, type: 'construccion' })
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <TextField placeholder="Nueva idea de último momento..." value={newIdeaText} onChange={(e) => setNewIdeaText(e.target.value)} />
            <Button
              variant="secondary"
              onClick={() => {
                if (!newIdeaText.trim()) return
                addIdea(newIdeaText.trim())
                setNewIdeaText('')
              }}
            >
              +
            </Button>
          </div>
        </StepShell>
      )}

      {step === 'manana' && (
        <StepShell title="🎯 Mañana" onNext={next} onBack={back}>
          <p className="mb-3 text-sm text-neutral-400">Define tus 3 victorias de mañana.</p>
          {victories.map((v, i) => (
            <div key={i} className="mb-3 space-y-1.5">
              <TextField
                placeholder={`Victoria ${i + 1}`}
                value={v.title}
                onChange={(e) => setVictories((arr) => arr.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
              />
              <TextField
                placeholder="Resultado esperado"
                value={v.expectedResult}
                onChange={(e) =>
                  setVictories((arr) => arr.map((x, idx) => (idx === i ? { ...x, expectedResult: e.target.value } : x)))
                }
              />
            </div>
          ))}
        </StepShell>
      )}

      {step === 'satisfaccion' && (
        <StepShell title="❤️ Satisfacción" onNext={next} onBack={back} nextDisabled={!satisfaccion}>
          <div className="flex justify-between gap-2 py-4">
            {SATISFACTION.map((s) => (
              <button
                key={s.v}
                onClick={() => setSatisfaccion(s.v)}
                className={`flex-1 rounded-xl py-3 text-2xl ${satisfaccion === s.v ? 'bg-amber-500/20 ring-2 ring-amber-500' : 'bg-neutral-900'}`}
              >
                {s.e}
              </button>
            ))}
          </div>
        </StepShell>
      )}

      {step === 'listo' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-4xl">✅</p>
          <p className="text-lg font-bold">Cierre listo</p>
          <p className="text-sm text-neutral-400">Guarda tu día y prepara mañana.</p>
          <Button variant="primary" size="lg" className="w-full" onClick={finishAll}>
            GUARDAR Y CERRAR
          </Button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      {children}
    </div>
  )
}

function StepShell({
  title,
  children,
  onNext,
  onBack,
  nextDisabled,
}: {
  title: string
  children: ReactNode
  onNext: () => void
  onBack?: () => void
  nextDisabled?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      <div className="flex-1">{children}</div>
      <div className="mt-4 flex gap-2">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            ← Atrás
          </Button>
        )}
        <Button variant="primary" className="flex-1" onClick={onNext} disabled={nextDisabled}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
