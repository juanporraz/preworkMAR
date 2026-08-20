import type { EnergyLevel } from '../types'

interface EnergyWindow {
  startMinutes: number // minutos desde medianoche
  endMinutes: number
  level: EnergyLevel
  label: string
}

// Patrón de energía basado en el ritmo real del usuario.
const ENERGY_PATTERN: EnergyWindow[] = [
  { startMinutes: 6 * 60, endMinutes: 8 * 60, level: 'alta', label: 'Activación fuerte de la mañana' },
  { startMinutes: 8 * 60, endMinutes: 9 * 60 + 30, level: 'media', label: 'Puede bajar' },
  { startMinutes: 10 * 60, endMinutes: 10 * 60 + 40, level: 'alta', label: 'Segundo pico' },
  { startMinutes: 10 * 60 + 40, endMinutes: 11 * 60 + 30, level: 'baja', label: 'Puede aparecer sueño' },
  { startMinutes: 12 * 60, endMinutes: 13 * 60, level: 'media', label: 'Operación' },
  { startMinutes: 13 * 60, endMinutes: 14 * 60, level: 'baja', label: 'Almuerzo y recuperación' },
  { startMinutes: 14 * 60, endMinutes: 15 * 60, level: 'media', label: 'Operación / transición' },
  { startMinutes: 15 * 60, endMinutes: 15 * 60 + 45, level: 'baja', label: 'Bajón de energía / recuperación' },
  { startMinutes: 15 * 60 + 45, endMinutes: 19 * 60, level: 'alta', label: 'Construir + crecer' },
  { startMinutes: 19 * 60, endMinutes: 20 * 60 + 30, level: 'alta', label: 'Segunda activación fuerte' },
  { startMinutes: 20 * 60 + 30, endMinutes: 21 * 60 + 30, level: 'media', label: 'Ritmo menor' },
  { startMinutes: 21 * 60 + 30, endMinutes: 22 * 60, level: 'media', label: 'Último empujón' },
]

function minutesNow(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function getCurrentEnergy(date: Date = new Date()): { level: EnergyLevel; label: string } {
  const m = minutesNow(date)
  const window = ENERGY_PATTERN.find((w) => m >= w.startMinutes && m < w.endMinutes)
  if (window) return { level: window.level, label: window.label }
  return { level: 'baja', label: 'Fuera de horario activo' }
}

export function energyRank(level: EnergyLevel): number {
  return level === 'alta' ? 3 : level === 'media' ? 2 : 1
}

// Tipos de tarea recomendados según nivel de energía.
export const ENERGY_TASK_TYPES: Record<EnergyLevel, string[]> = {
  alta: ['pensamiento', 'construccion', 'crecimiento'],
  media: ['operacion', 'control', 'aprendizaje'],
  baja: ['administracion', 'operacion', 'descanso'],
}
