import type { AppMode, Priority, Task, Victory, WeeklyFocus } from '../types'
import { energyRank, getCurrentEnergy, ENERGY_TASK_TYPES } from './energy'
import { todayISO } from './id'

export interface Recommendation {
  kind: 'task' | 'victory' | 'idea' | 'rest' | 'none'
  title: string
  description?: string
  expectedResult?: string
  taskId?: string
  victoryId?: string
  minutes: number
}

const PRIORITY_WEIGHT: Record<Priority, number> = { critica: 4, alta: 3, media: 2, baja: 1 }

interface RecommendInput {
  tasks: Task[]
  victories: Victory[]
  mode: AppMode
  currentFocus: WeeklyFocus | null
  maxMinutes?: number
  now?: Date
}

const MODE_TYPES: Record<AppMode, string[] | null> = {
  general: null,
  operacion: ['operacion', 'control'],
  construir: ['construccion', 'pensamiento'],
  crecer: ['crecimiento'],
}

function scoreTask(task: Task, input: RecommendInput): number {
  const energy = getCurrentEnergy(input.now)
  let score = PRIORITY_WEIGHT[task.priority] * 10

  // Coincide con energía actual
  const preferredTypes = ENERGY_TASK_TYPES[energy.level]
  if (preferredTypes.includes(task.type)) score += 6
  if (energyRank(task.energyRequired) === energyRank(energy.level)) score += 4

  // Vinculada a una victoria de hoy
  const linkedToVictory = input.victories.some((v) => v.date === todayISO() && v.taskIds.includes(task.id))
  if (linkedToVictory) score += 20

  // Alineada con el foco semanal
  if (input.currentFocus && task.type === 'crecimiento') score += 8

  // Urgencia por fecha
  if (task.date && task.date <= todayISO()) score += 10

  // En progreso pesa más que pendiente (continuar > empezar)
  if (task.status === 'en_progreso') score += 15

  return score
}

export function getRecommendation(input: RecommendInput): Recommendation {
  const today = todayISO()
  const allowedTypes = MODE_TYPES[input.mode]

  const candidateTasks = input.tasks.filter((t) => {
    if (t.status !== 'pendiente' && t.status !== 'en_progreso') return false
    if (allowedTypes && !allowedTypes.includes(t.type)) return false
    if (input.maxMinutes && t.estimatedMinutes > input.maxMinutes) return false
    return true
  })

  if (candidateTasks.length > 0) {
    const sorted = [...candidateTasks].sort((a, b) => scoreTask(b, input) - scoreTask(a, input))
    const best = sorted[0]
    return {
      kind: 'task',
      title: best.name,
      description: `${best.type.toUpperCase()} · prioridad ${best.priority} · ${best.estimatedMinutes} min`,
      taskId: best.id,
      minutes: best.estimatedMinutes,
    }
  }

  // Sin tareas candidatas: revisar victorias de hoy sin tareas vinculadas
  const todaysVictories = input.victories.filter((v) => v.date === today && v.status !== 'terminada' && v.status !== 'cancelada')
  const victoryWithoutTasks = todaysVictories.find((v) => v.taskIds.length === 0 && v.title.trim() !== '')
  if (victoryWithoutTasks) {
    return {
      kind: 'victory',
      title: `Definir la primera tarea de "${victoryWithoutTasks.title}"`,
      description: 'Esta victoria todavía no tiene tareas. Divídela en un primer paso concreto.',
      expectedResult: victoryWithoutTasks.expectedResult,
      victoryId: victoryWithoutTasks.id,
      minutes: 10,
    }
  }

  const emptyVictory = todaysVictories.find((v) => v.title.trim() === '')
  if (emptyVictory) {
    return {
      kind: 'victory',
      title: 'Definir tus 3 victorias de hoy',
      description: 'Todavía te falta escribir alguna de tus 3 victorias del día.',
      victoryId: emptyVictory.id,
      minutes: 5,
    }
  }

  if (todaysVictories.length === 0) {
    return {
      kind: 'rest',
      title: 'No tienes victorias activas hoy',
      description: 'Define tus 3 victorias del día para que el sistema pueda recomendarte algo.',
      minutes: 5,
    }
  }

  return {
    kind: 'rest',
    title: 'No hay tareas pendientes ahora mismo',
    description: 'Buen momento para descansar o revisar tu bandeja de ideas.',
    minutes: 5,
  }
}

export function getMicroTask(input: RecommendInput): Recommendation {
  return getRecommendation({ ...input, maxMinutes: 10 })
}
