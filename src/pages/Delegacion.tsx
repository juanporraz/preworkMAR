import { useStore } from '../store'
import { Card } from '../components/ui'

const CONDITIONS: { key: 'rentabilidadSuficiente' | 'procesosDocumentados' | 'personaConfiable' | 'numerosControlados'; icon: string; label: string }[] = [
  { key: 'rentabilidadSuficiente', icon: '💰', label: 'Rentabilidad suficiente' },
  { key: 'procesosDocumentados', icon: '⚙️', label: 'Procesos documentados' },
  { key: 'personaConfiable', icon: '👤', label: 'Persona confiable' },
  { key: 'numerosControlados', icon: '📊', label: 'Números controlados' },
]

export default function Delegacion() {
  const delegation = useStore((s) => s.delegation)
  const updateDelegation = useStore((s) => s.updateDelegation)
  const allReady = CONDITIONS.every((c) => delegation[c.key])

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">👤 Delegación</h1>
      <p className="text-sm text-neutral-500">Cuando las cuatro condiciones estén desarrolladas, podrás reducir tu presencia operativa.</p>

      <div className="space-y-2">
        {CONDITIONS.map((c) => (
          <Card key={c.key} className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <span className="text-lg">{c.icon}</span> {c.label}
            </span>
            <button
              onClick={() => updateDelegation({ [c.key]: !delegation[c.key] })}
              className={`h-6 w-11 rounded-full transition ${delegation[c.key] ? 'bg-amber-500' : 'bg-neutral-800'}`}
            >
              <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-neutral-950 transition ${delegation[c.key] ? 'translate-x-[22px]' : ''}`} />
            </button>
          </Card>
        ))}
      </div>

      {allReady && (
        <Card className="border-emerald-700 bg-emerald-950/30 text-center">
          <p className="font-bold text-emerald-400">Puedes empezar a reducir progresivamente tu presencia operativa.</p>
        </Card>
      )}
    </div>
  )
}
