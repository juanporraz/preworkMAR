const STORAGE_KEY = 'si-podia-store'

export function exportBackup() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `si-podia-respaldo-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importBackup(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result)
        const parsed = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object' || !('state' in parsed)) {
          reject(new Error('Este archivo no parece un respaldo válido de Sí Podía.'))
          return
        }
        localStorage.setItem(STORAGE_KEY, text)
        resolve()
      } catch {
        reject(new Error('No se pudo leer el archivo. ¿Es un respaldo de Sí Podía?'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export function lastBackupHint(): string | null {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? `${(new Blob([data]).size / 1024).toFixed(0)} KB guardados en este dispositivo` : null
}
