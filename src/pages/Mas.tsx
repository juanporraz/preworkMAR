import { Link } from 'react-router-dom'
import { Card } from '../components/ui'

const ITEMS = [
  { to: '/ideas', icon: '💡', label: 'Ideas', desc: 'Bandeja de ideas capturadas' },
  { to: '/finanzas', icon: '💰', label: 'Finanzas', desc: 'Ingresos, gastos, resultado' },
  { to: '/metas', icon: '🎯', label: 'Metas', desc: 'Metas anuales por trimestre' },
  { to: '/revisiones', icon: '📅', label: 'Revisiones', desc: 'Semanal, mensual, trimestral' },
  { to: '/empresa', icon: '📊', label: 'Empresa', desc: 'Tablero empresarial' },
  { to: '/capital', icon: '🏦', label: 'Capital', desc: 'Acumulado, reservas, disponible' },
  { to: '/delegacion', icon: '👤', label: 'Delegación', desc: 'Condiciones para delegar' },
  { to: '/cierre', icon: '🌙', label: 'Cierre del día', desc: 'Guía paso a paso' },
]

export default function Mas() {
  return (
    <div className="space-y-2 pb-4">
      <h1 className="mb-2 text-lg font-bold">Más</h1>
      {ITEMS.map((item) => (
        <Link key={item.to} to={item.to}>
          <Card className="flex items-center gap-3 py-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
