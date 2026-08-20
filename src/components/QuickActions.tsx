import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { getMicroTask, getRecommendation } from '../lib/recommend'
import { Button, Sheet, TextArea } from './ui'

export function IdeaButton({ full = false }: { full?: boolean }) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [text, setText] = useState('')
  const addIdea = useStore((s) => s.addIdea)

  const save = () => {
    if (!text.trim()) return
    addIdea(text.trim())
    setText('')
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setOpen(false)
    }, 900)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          full
            ? 'flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-3 font-semibold text-neutral-100'
            : 'flex flex-1 flex-col items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-semibold text-neutral-300'
        }
      >
        <span className="text-lg">💡</span>
        <span>{full ? 'TENGO UNA IDEA' : 'IDEA'}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="💡 Tengo una idea">
        {saved ? (
          <p className="py-6 text-center text-neutral-300">Guardada. Sigue con lo que estabas haciendo.</p>
        ) : (
          <>
            <TextArea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu idea rápidamente..."
              rows={3}
              className="mb-3"
            />
            <Button variant="primary" className="w-full" onClick={save}>
              GUARDAR
            </Button>
          </>
        )}
      </Sheet>
    </>
  )
}

export function BlockedButton({ full = false }: { full?: boolean }) {
  const [open, setOpen] = useState(false)
  const tasks = useStore((s) => s.tasks)
  const victories = useStore((s) => s.victories)
  const mode = useStore((s) => s.mode)
  const currentFocus = useStore((s) => s.currentFocus)
  const rec = getRecommendation({ tasks, victories, mode, currentFocus })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          full
            ? 'flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-3 font-semibold text-neutral-100'
            : 'flex flex-1 flex-col items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-semibold text-neutral-300'
        }
      >
        <span className="text-lg">🧠</span>
        <span>{full ? 'ESTOY BLOQUEADO' : 'BLOQUEADO'}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="🧠 Tu siguiente paso">
        <p className="mb-1 text-sm text-neutral-400">Tu siguiente paso es:</p>
        <p className="mb-2 text-lg font-bold text-amber-400">{rec.title}</p>
        {rec.description && <p className="mb-4 text-sm text-neutral-400">{rec.description}</p>}
        <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>
          ENTENDIDO
        </Button>
      </Sheet>
    </>
  )
}

export function MicroTaskButton({ full = false }: { full?: boolean }) {
  const [open, setOpen] = useState(false)
  const tasks = useStore((s) => s.tasks)
  const victories = useStore((s) => s.victories)
  const mode = useStore((s) => s.mode)
  const currentFocus = useStore((s) => s.currentFocus)
  const startTimeBlock = useStore((s) => s.startTimeBlock)
  const navigate = useNavigate()
  const rec = getMicroTask({ tasks, victories, mode, currentFocus })

  const empezar = () => {
    startTimeBlock({
      label: rec.title,
      durationSeconds: Math.min(rec.minutes, 10) * 60,
      taskId: rec.taskId,
      victoryId: rec.victoryId,
    })
    setOpen(false)
    navigate('/')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          full
            ? 'flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-3 font-semibold text-neutral-100'
            : 'flex flex-1 flex-col items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-semibold text-neutral-300'
        }
      >
        <span className="text-lg">⏱️</span>
        <span>{full ? 'TENGO 5 MINUTOS' : '5 MIN'}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="⏱️ Tengo 5 minutos">
        <p className="mb-2 text-lg font-bold">{rec.title}</p>
        {rec.description && <p className="mb-4 text-sm text-neutral-400">{rec.description}</p>}
        <Button variant="primary" className="w-full" onClick={empezar}>
          EMPEZAR
        </Button>
      </Sheet>
    </>
  )
}
