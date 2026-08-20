import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { currentQuarter, currentYear } from '../lib/date'
import { Button, TextArea } from '../components/ui'

const FIELDS = [
  { key: 'capital', icon: '💰', label: 'Capital' },
  { key: 'resultados', icon: '📈', label: 'Resultados' },
  { key: 'aprendizajes', icon: '🧠', label: 'Aprendizajes' },
  { key: 'sistemas', icon: '⚙️', label: 'Sistemas' },
  { key: 'proximoEscalon', icon: '🚀', label: 'Próximo escalón' },
] as const

export default function RevisionTrimestral() {
  const navigate = useNavigate()
  const year = currentYear()
  const quarter = currentQuarter()
  const existing = useStore((s) => s.quarterlyReviews.find((q) => q.year === year && q.quarter === quarter))
  const addOrUpdateQuarterlyReview = useStore((s) => s.addOrUpdateQuarterlyReview)

  const [values, setValues] = useState({
    capital: existing?.capital ?? '',
    resultados: existing?.resultados ?? '',
    aprendizajes: existing?.aprendizajes ?? '',
    sistemas: existing?.sistemas ?? '',
    proximoEscalon: existing?.proximoEscalon ?? '',
  })

  const save = () => {
    addOrUpdateQuarterlyReview(year, quarter, { ...values, completedAt: new Date().toISOString() })
    navigate('/revisiones')
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">
        🧭 Revisión trimestral — {quarter} {year}
      </h1>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-medium text-neutral-500">
            {f.icon} {f.label}
          </label>
          <TextArea
            rows={3}
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
          />
        </div>
      ))}
      <Button variant="primary" size="lg" className="w-full" onClick={save}>
        GUARDAR
      </Button>
    </div>
  )
}
