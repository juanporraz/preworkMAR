import { useEffect } from 'react'
import { useStore } from '../store'
import { ModeTaskList } from '../components/ModeTaskList'
import { Card } from '../components/ui'

export default function Operacion() {
  const setMode = useStore((s) => s.setMode)
  useEffect(() => {
    setMode('operacion')
    return () => setMode('general')
  }, [setMode])

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-bold">🏍️ Operación</h1>
        <p className="text-sm text-neutral-500">Solo lo urgente: operación, entradas, salidas, cascos.</p>
      </div>
      <Card className="border-amber-900/40 bg-amber-950/10">
        <p className="text-xs text-neutral-400">
          Modo activo. La navegación secundaria queda en segundo plano — usa los botones rápidos de abajo para cualquier
          imprevisto.
        </p>
      </Card>
      <ModeTaskList types={['operacion', 'control']} emptyText="No hay tareas operativas pendientes." />
    </div>
  )
}
