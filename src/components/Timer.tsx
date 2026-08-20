import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { formatClock, remainingSecondsOf } from '../lib/timer'
import { Button, Card, TextArea } from './ui'

export function Timer() {
  const activeId = useStore((s) => s.activeTimeBlockId)
  const block = useStore((s) => s.timeBlocks.find((b) => b.id === activeId))
  const pauseTimeBlock = useStore((s) => s.pauseTimeBlock)
  const resumeTimeBlock = useStore((s) => s.resumeTimeBlock)
  const finishTimeBlock = useStore((s) => s.finishTimeBlock)
  const discardTimeBlock = useStore((s) => s.discardTimeBlock)

  const [now, setNow] = useState(Date.now())
  const [asking, setAsking] = useState(false)
  const [outcome, setOutcome] = useState('')
  const [partialNote, setPartialNote] = useState('')
  const [askingPartial, setAskingPartial] = useState(false)
  const [askingNo, setAskingNo] = useState(false)

  useEffect(() => {
    if (!block || block.status !== 'running') return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [block])

  const remaining = block ? remainingSecondsOf(block, now) : 0
  const finished = !!block && remaining <= 0 && block.status === 'running'

  useEffect(() => {
    if (finished) setAsking(true)
  }, [finished])

  if (!block) return null

  const handleFinish = (completion: 'si' | 'parcial' | 'no') => {
    if (completion === 'si') {
      finishTimeBlock(block.id, 'si', outcome)
      resetLocal()
    } else if (completion === 'parcial') {
      setAskingPartial(true)
    } else {
      setAskingNo(true)
    }
  }

  const resetLocal = () => {
    setAsking(false)
    setOutcome('')
    setPartialNote('')
    setAskingPartial(false)
    setAskingNo(false)
  }

  if (asking || finished) {
    return (
      <Card className="border-amber-900/50 bg-amber-950/20">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-400">Bloque terminado</p>
        <p className="mb-3 font-bold">{block.label}</p>

        {!askingPartial && !askingNo && (
          <>
            <p className="mb-2 text-sm text-neutral-300">¿Qué resultado produjiste?</p>
            <TextArea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Escribe una respuesta corta..."
              rows={2}
              className="mb-3"
            />
            <p className="mb-2 text-sm text-neutral-300">¿Terminaste?</p>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" onClick={() => handleFinish('si')}>
                SÍ
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => handleFinish('parcial')}>
                PARCIAL
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => handleFinish('no')}>
                NO
              </Button>
            </div>
          </>
        )}

        {askingPartial && (
          <>
            <p className="mb-2 text-sm text-neutral-300">¿Qué falta?</p>
            <TextArea value={partialNote} onChange={(e) => setPartialNote(e.target.value)} rows={2} className="mb-3" />
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                finishTimeBlock(block.id, 'parcial', outcome, partialNote)
                resetLocal()
              }}
            >
              Guardar
            </Button>
          </>
        )}

        {askingNo && (
          <>
            <p className="mb-2 text-sm text-neutral-300">¿Cuál fue el motivo?</p>
            <TextArea value={partialNote} onChange={(e) => setPartialNote(e.target.value)} rows={2} className="mb-3" />
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                finishTimeBlock(block.id, 'no', outcome, partialNote)
                resetLocal()
              }}
            >
              Guardar
            </Button>
          </>
        )}
      </Card>
    )
  }

  return (
    <Card className="border-neutral-700">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Bloque actual</p>
        {block.status === 'paused' && <span className="text-xs font-semibold text-amber-400">EN PAUSA</span>}
      </div>
      <p className="mb-3 font-bold">{block.label}</p>
      <p className="mb-4 text-center font-mono text-5xl font-bold tabular-nums">{formatClock(remaining)}</p>
      <div className="flex gap-2">
        {block.status === 'running' ? (
          <Button variant="secondary" className="flex-1" onClick={() => pauseTimeBlock(block.id)}>
            PAUSAR
          </Button>
        ) : (
          <Button variant="secondary" className="flex-1" onClick={() => resumeTimeBlock(block.id)}>
            REANUDAR
          </Button>
        )}
        <Button variant="primary" className="flex-1" onClick={() => setAsking(true)}>
          TERMINAR
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => discardTimeBlock(block.id)}>
          CAMBIAR
        </Button>
      </div>
    </Card>
  )
}
