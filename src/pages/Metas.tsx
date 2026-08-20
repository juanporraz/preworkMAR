import { useState } from 'react'
import { useStore } from '../store'
import { currentYear } from '../lib/date'
import { Button, Card, EmptyState, Select, Sheet, StatusDot, TextArea, TextField } from '../components/ui'
import type { EntityStatus, Goal, Quarter } from '../types'

const STATUS_CYCLE: EntityStatus[] = ['pendiente', 'en_progreso', 'terminada']
const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']

export default function Metas() {
  const goals = useStore((s) => s.goals)
  const updateGoal = useStore((s) => s.updateGoal)
  const [openNew, setOpenNew] = useState(false)
  const year = currentYear()
  const yearGoals = goals.filter((g) => g.year === year)

  const cycle = (g: Goal) => {
    const idx = STATUS_CYCLE.indexOf(g.status)
    updateGoal(g.id, { status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] })
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">🎯 Metas {year}</h1>
        <Button variant="primary" size="sm" onClick={() => setOpenNew(true)} disabled={yearGoals.length >= 5}>
          + Nueva
        </Button>
      </div>
      <p className="text-xs text-neutral-500">Largo plazo → año → trimestre → semana → día. Máximo 5 metas anuales.</p>

      {QUARTERS.map((q) => {
        const list = yearGoals.filter((g) => g.quarter === q)
        if (list.length === 0) return null
        return (
          <section key={q}>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">{q}</p>
            <div className="space-y-2">
              {list.map((g) => (
                <Card key={g.id} className="flex items-start gap-3">
                  <button onClick={() => cycle(g)} className="mt-0.5 shrink-0">
                    <StatusDot status={g.status} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${g.status === 'terminada' ? 'text-neutral-500 line-through' : ''}`}>{g.name}</p>
                    {g.expectedResult && <p className="text-xs text-neutral-500">→ {g.expectedResult}</p>}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )
      })}

      {yearGoals.length === 0 && <EmptyState text="Define tu primera meta anual." />}

      <NewGoalSheet open={openNew} onClose={() => setOpenNew(false)} year={year} />
    </div>
  )
}

function NewGoalSheet({ open, onClose, year }: { open: boolean; onClose: () => void; year: number }) {
  const addGoal = useStore((s) => s.addGoal)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [quarter, setQuarter] = useState<Quarter>('Q1')

  const save = () => {
    if (!name.trim()) return
    addGoal({ name: name.trim(), description, expectedResult, quarter, year, status: 'pendiente' })
    setName('')
    setDescription('')
    setExpectedResult('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Nueva meta anual">
      <div className="space-y-3">
        <TextField autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la meta" />
        <TextField value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} placeholder="Resultado esperado" />
        <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" rows={2} />
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Trimestre</label>
          <Select value={quarter} onChange={(e) => setQuarter(e.target.value as Quarter)}>
            {QUARTERS.map((q) => (
              <option key={q} value={q}>
                {q}
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
