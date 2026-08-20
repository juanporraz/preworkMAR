import { useMemo } from 'react'
import { useStore } from '../store'
import { currentMonth } from '../lib/date'
import { entriesForMonth, sumEntries, formatCOP } from '../lib/finance'
import { Button, Card } from '../components/ui'
import { FOCUS_LABEL } from './Crecer'

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60 * 1000).toISOString().slice(0, 10)
}

export default function Empresa() {
  const financeEntries = useStore((s) => s.financeEntries)
  const victories = useStore((s) => s.victories)
  const dailyCloses = useStore((s) => s.dailyCloses)
  const currentFocus = useStore((s) => s.currentFocus)
  const newClientsByMonth = useStore((s) => s.newClientsByMonth)
  const addNewClient = useStore((s) => s.addNewClient)

  const month = currentMonth()
  const monthSums = useMemo(() => sumEntries(entriesForMonth(financeEntries, month)), [financeEntries, month])

  const last7 = daysAgoISO(6)
  const weekVictories = victories.filter((v) => v.date >= last7 && v.title.trim() !== '')
  const doneVictories = weekVictories.filter((v) => v.status === 'terminada')
  const cumplimiento = weekVictories.length > 0 ? Math.round((doneVictories.length / weekVictories.length) * 100) : 0

  const weekCloses = dailyCloses.filter((c) => c.date >= last7 && c.satisfaccion)
  const avgSatisfaction =
    weekCloses.length > 0 ? (weekCloses.reduce((a, c) => a + (c.satisfaccion ?? 0), 0) / weekCloses.length).toFixed(1) : '—'

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">📊 Empresa</h1>

      <div className="grid grid-cols-2 gap-2">
        <Card className="text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">Ingresos (mes)</p>
          <p className="text-lg font-bold text-emerald-400">{formatCOP(monthSums.ingresos)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">Resultado (mes)</p>
          <p className={`text-lg font-bold ${monthSums.resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCOP(monthSums.resultado)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">Nuevos clientes (mes)</p>
          <p className="text-lg font-bold text-amber-400">{newClientsByMonth[month] ?? 0}</p>
          <button onClick={() => addNewClient(month)} className="mt-1 text-xs text-neutral-500 underline">
            + registrar
          </button>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">3 victorias (7 días)</p>
          <p className="text-lg font-bold text-amber-400">{cumplimiento}%</p>
        </Card>
      </div>

      <Card className="text-center">
        <p className="text-[10px] font-semibold uppercase text-neutral-500">Satisfacción promedio (7 días)</p>
        <p className="text-lg font-bold">{avgSatisfaction}</p>
      </Card>

      <Card className="border-amber-900/40 bg-amber-950/10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-500">Foco semanal</p>
        <p className="font-bold">{currentFocus ? FOCUS_LABEL[currentFocus] : 'Sin definir'}</p>
      </Card>

      <Button variant="ghost" className="w-full" disabled>
        Alertas: sin anomalías detectadas
      </Button>
    </div>
  )
}
