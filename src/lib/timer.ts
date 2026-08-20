import type { TimeBlock } from '../types'

export function remainingSecondsOf(block: TimeBlock, now: number = Date.now()): number {
  if (block.status === 'running' && block.endsAt) {
    return Math.max(0, Math.round((new Date(block.endsAt).getTime() - now) / 1000))
  }
  return block.remainingSeconds
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const BLOCK_DURATION_SECONDS = 20 * 60
export const RECOVERY_DURATION_SECONDS = 5 * 60
