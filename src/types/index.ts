// ============================================================
// SÍ PODÍA — Modelo de datos central
// ============================================================

export type Priority = 'critica' | 'alta' | 'media' | 'baja'

export type EnergyLevel = 'alta' | 'media' | 'baja'

export type TaskType =
  | 'operacion'
  | 'crecimiento'
  | 'construccion'
  | 'control'
  | 'pensamiento'
  | 'aprendizaje'
  | 'administracion'
  | 'descanso'

export type EntityStatus = 'pendiente' | 'en_progreso' | 'terminada' | 'cancelada'

// ---------- Victorias del día ----------
export interface Victory {
  id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
  priority: Priority
  expectedResult: string
  status: EntityStatus
  estimatedMinutes: number
  taskIds: string[]
}

// ---------- Tareas ----------
export interface Task {
  id: string
  name: string
  projectId?: string
  stageId?: string
  deliverableId?: string
  priority: Priority
  estimatedMinutes: number
  date?: string // fecha objetivo, opcional
  status: EntityStatus
  energyRequired: EnergyLevel
  type: TaskType
  createdAt: string
  result?: string // resultado registrado al terminar
}

// ---------- Proyectos ----------
export interface Deliverable {
  id: string
  name: string
  done: boolean
  taskIds: string[]
}

export interface Stage {
  id: string
  name: string
  deliverables: Deliverable[]
}

export interface Project {
  id: string
  name: string
  description?: string
  type: TaskType
  stages: Stage[]
  archived: boolean
  createdAt: string
}

// ---------- Ideas ----------
export type IdeaResult = 'proyecto' | 'tarea' | 'programar' | 'archivo' | null

export interface Idea {
  id: string
  text: string
  createdAt: string
  processed: boolean
  result: IdeaResult
  reviewMonthly?: boolean
}

// ---------- Bloques de tiempo ----------
export type BlockStatus = 'running' | 'paused' | 'completed' | 'discarded'

export interface TimeBlock {
  id: string
  taskId?: string
  victoryId?: string
  label: string
  durationSeconds: number
  remainingSeconds: number // snapshot válido cuando status !== 'running'
  endsAt?: string // ISO timestamp; presente solo cuando status === 'running'
  status: BlockStatus
  startedAt: string
  completedAt?: string
  outcome?: string // "¿Qué resultado produjiste?"
  completion?: 'si' | 'parcial' | 'no'
  completionNote?: string
}

// ---------- Finanzas ----------
export type IncomeCategory = 'mensualidad' | 'fraccion' | 'otro_servicio'
export type FinanceType = 'ingreso' | 'gasto'

export interface FinanceEntry {
  id: string
  date: string // YYYY-MM-DD
  type: FinanceType
  category: string
  amount: number
  note?: string
}

// ---------- Cierre diario ----------
export interface DailyClose {
  id: string
  date: string
  caja: {
    ingresos: number
    gastos: number
    resultado: number
  }
  operacion: {
    motosCoinciden: boolean | null
    cascosCorrectos: boolean | null
    hayDesorden: boolean | null
  }
  reflexion: {
    queSalioBien: string
    queSalioMal: string
    porque: string
    queAprendiste: string
    queCorregir: string
  }
  ideasProcesadas: string[] // idea ids procesadas ese cierre
  victoriasManana: string[] // victory ids creados para el día siguiente
  satisfaccion: 1 | 2 | 3 | 4 | 5 | null
  completedAt?: string
}

// ---------- Revisión semanal ----------
export type WeeklyFocus =
  | 'marketing'
  | 'mensualidades'
  | 'fracciones'
  | 'nuevos_servicios'
  | 'valor_por_cliente'
  | 'alianzas'

export interface WeeklyReview {
  id: string
  weekStart: string // lunes YYYY-MM-DD
  dinero: string
  crecimiento: string
  operacion: string
  objetivo: string
  aprendizajes: string
  ideas: string
  satisfaccion: string
  nextFocus: WeeklyFocus | null
  completedAt?: string
}

// ---------- Metas ----------
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface Goal {
  id: string
  name: string
  description: string
  year: number
  quarter: Quarter
  expectedResult: string
  status: EntityStatus
}

// ---------- Revisión trimestral ----------
export interface QuarterlyReview {
  id: string
  year: number
  quarter: Quarter
  capital: string
  resultados: string
  aprendizajes: string
  sistemas: string
  proximoEscalon: string
  completedAt?: string
}

// ---------- Revisión mensual ----------
export interface MonthlyReview {
  id: string
  month: string // YYYY-MM
  resumen: string
  ideasArchivadasRevisadas: boolean
  completedAt?: string
}

// ---------- Capital ----------
export interface CapitalState {
  acumulado: number
  reservas: number
  disponible: number
  updatedAt: string
}

// ---------- Delegación ----------
export interface DelegationState {
  rentabilidadSuficiente: boolean
  procesosDocumentados: boolean
  personaConfiable: boolean
  numerosControlados: boolean
  updatedAt: string
}

// ---------- App mode ----------
export type AppMode = 'general' | 'operacion' | 'construir' | 'crecer'

export interface AppSettings {
  currentFocus: WeeklyFocus | null
  mode: AppMode
}
