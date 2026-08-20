import { useRef, useState } from 'react'
import { exportBackup, importBackup, lastBackupHint } from '../lib/backup'
import { Button, Card } from '../components/ui'

export default function Respaldo() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async (file: File) => {
    setError(null)
    try {
      await importBackup(file)
      setStatus('Respaldo restaurado. Recargando...')
      setTimeout(() => window.location.reload(), 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al importar.')
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-lg font-bold">💾 Respaldo</h1>
      <p className="text-sm text-neutral-500">
        Tu información se guarda solo en este dispositivo y navegador. Descarga un respaldo de vez en cuando para no
        perder nada si cambias de celular o borras datos del navegador.
      </p>

      <Card>
        <p className="mb-1 font-semibold">Exportar</p>
        <p className="mb-3 text-xs text-neutral-500">{lastBackupHint() ?? 'Aún no hay datos guardados.'}</p>
        <Button variant="primary" className="w-full" onClick={exportBackup}>
          DESCARGAR RESPALDO
        </Button>
      </Card>

      <Card>
        <p className="mb-1 font-semibold">Restaurar</p>
        <p className="mb-3 text-xs text-neutral-500">
          Elige un archivo de respaldo que hayas descargado antes. Esto reemplaza toda la información actual.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImport(file)
          }}
        />
        <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
          ELEGIR ARCHIVO
        </Button>
        {status && <p className="mt-2 text-center text-sm text-emerald-400">{status}</p>}
        {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
      </Card>
    </div>
  )
}
