import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { currentSummaries, formatCOP } from '../lib/finance'
import { todayISO } from '../lib/id'
import { Button, Card, EmptyState, Select, Sheet, TextField } from '../components/ui'
import type { FinanceType, IncomeCategory } from '../types'

const INCOME_CATEGORY_LABEL: Record<IncomeCategory, string> = {
  mensualidad: 'Mensualidad',
  fraccion: 'Fracción',
  otro_servicio: 'Otro servicio',
}

export default function Finanzas() {
  const entries = useStore((s) => s.financeEntries)
  const removeFinanceEntry = useStore((s) => s.removeFinanceEntry)
  const [openNew, setOpenNew] = useState(false)
  const summaries = useMemo(() => currentSummaries(entries), [entries])
  const recent = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 15), [entries])

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">💰 Finanzas</h1>
        <Button variant="primary" size="sm" onClick={() => setOpenNew(true)}>
          + Registrar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SummaryCard label="Hoy" data={summaries.hoy} />
        <SummaryCard label="Semana" data={summaries.semana} />
        <SummaryCard label="Mes" data={summaries.mes} />
      </div>

      <section>
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-400">Movimientos recientes</p>
        {recent.length === 0 && <EmptyState text="No hay movimientos registrados." />}
        <div className="space-y-2">
          {recent.map((e) => (
            <Card key={e.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-semibold">{e.category}</p>
                <p className="text-xs text-neutral-500">{e.date}{e.note ? ` · ${e.note}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${e.type === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {e.type === 'ingreso' ? '+' : '-'}
                  {formatCOP(e.amount)}
                </span>
                <button onClick={() => removeFinanceEntry(e.id)} className="text-xs text-neutral-600">
                  ✕
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <NewEntrySheet open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  )
}

function SummaryCard({ label, data }: { label: string; data: { ingresos: number; gastos: number; resultado: number } }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`text-sm font-bold ${data.resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {formatCOP(data.resultado)}
      </p>
    </Card>
  )
}

function NewEntrySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addFinanceEntry = useStore((s) => s.addFinanceEntry)
  const [type, setType] = useState<FinanceType>('ingreso')
  const [category, setCategory] = useState<string>('mensualidad')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())

  const save = () => {
    const value = Number(amount)
    if (!value || value <= 0) return
    addFinanceEntry({ type, category, amount: value, note: note || undefined, date })
    setAmount('')
    setNote('')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Registrar movimiento">
      <div className="space-y-3">
        <div className="flex gap-2">
          {(['ingreso', 'gasto'] as FinanceType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t)
                setCategory(t === 'ingreso' ? 'mensualidad' : 'otro')
              }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${
                type === t ? (t === 'ingreso' ? 'bg-emerald-500 text-neutral-950' : 'bg-red-500 text-neutral-950') : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {t === 'ingreso' ? 'INGRESO' : 'GASTO'}
            </button>
          ))}
        </div>

        {type === 'ingreso' ? (
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(INCOME_CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        ) : (
          <TextField value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoría del gasto" />
        )}

        <TextField
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Monto"
          autoFocus
        />
        <TextField type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <TextField value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" />
        <Button variant="primary" className="w-full" onClick={save}>
          GUARDAR
        </Button>
      </div>
    </Sheet>
  )
}
