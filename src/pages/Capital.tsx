import { useState } from 'react'
import { useStore } from '../store'
import { formatCOP } from '../lib/finance'
import { Button, Card, TextField } from '../components/ui'

export default function Capital() {
  const capital = useStore((s) => s.capital)
  const updateCapital = useStore((s) => s.updateCapital)
  const [acumulado, setAcumulado] = useState(capital.acumulado)
  const [reservas, setReservas] = useState(capital.reservas)
  const [disponible, setDisponible] = useState(capital.disponible)

  const save = () => updateCapital({ acumulado, reservas, disponible })

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">🏦 Capital</h1>
      <p className="text-sm text-neutral-500">
        No todo el dinero disponible debe gastarse. Decide: reserva, reinversión, capital acumulado u oportunidad futura.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">Acumulado</p>
          <p className="text-sm font-bold text-emerald-400">{formatCOP(capital.acumulado)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">Reservas</p>
          <p className="text-sm font-bold text-amber-400">{formatCOP(capital.reservas)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-[10px] font-semibold uppercase text-neutral-500">Disponible</p>
          <p className="text-sm font-bold">{formatCOP(capital.disponible)}</p>
        </Card>
      </div>

      <Card>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Capital acumulado</label>
            <TextField type="number" value={acumulado} onChange={(e) => setAcumulado(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Reservas</label>
            <TextField type="number" value={reservas} onChange={(e) => setReservas(Number(e.target.value))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Capital disponible</label>
            <TextField type="number" value={disponible} onChange={(e) => setDisponible(Number(e.target.value))} />
          </div>
          <Button variant="primary" className="w-full" onClick={save}>
            GUARDAR
          </Button>
        </div>
      </Card>
    </div>
  )
}
