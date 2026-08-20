import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { newId, todayISO } from '../lib/id'
import type {
  Victory,
  Task,
  Project,
  Stage,
  Deliverable,
  Idea,
  IdeaResult,
  TimeBlock,
  FinanceEntry,
  DailyClose,
  WeeklyReview,
  WeeklyFocus,
  QuarterlyReview,
  MonthlyReview,
  Goal,
  CapitalState,
  DelegationState,
  AppMode,
  EntityStatus,
} from '../types'

function emptyDailyClose(date: string): DailyClose {
  return {
    id: newId(),
    date,
    caja: { ingresos: 0, gastos: 0, resultado: 0 },
    operacion: { motosCoinciden: null, cascosCorrectos: null, hayDesorden: null },
    reflexion: { queSalioBien: '', queSalioMal: '', porque: '', queAprendiste: '', queCorregir: '' },
    ideasProcesadas: [],
    victoriasManana: [],
    satisfaccion: null,
  }
}

interface StoreState {
  victories: Victory[]
  tasks: Task[]
  projects: Project[]
  ideas: Idea[]
  timeBlocks: TimeBlock[]
  financeEntries: FinanceEntry[]
  dailyCloses: DailyClose[]
  weeklyReviews: WeeklyReview[]
  quarterlyReviews: QuarterlyReview[]
  monthlyReviews: MonthlyReview[]
  goals: Goal[]
  capital: CapitalState
  delegation: DelegationState
  mode: AppMode
  currentFocus: WeeklyFocus | null
  activeTimeBlockId: string | null
  hasSeeded: boolean
  newClientsByMonth: Record<string, number>
  addNewClient: (month: string) => void

  // Victorias
  ensureTodayVictories: () => void
  addVictory: (v: Omit<Victory, 'id'>) => string
  updateVictory: (id: string, patch: Partial<Victory>) => void
  removeVictory: (id: string) => void

  // Tareas
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
  setTaskStatus: (id: string, status: EntityStatus, result?: string) => void

  // Proyectos
  addProject: (p: Omit<Project, 'id' | 'stages' | 'archived' | 'createdAt'>) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  archiveProject: (id: string) => void
  addStage: (projectId: string, name: string) => string
  addDeliverable: (projectId: string, stageId: string, name: string) => string
  toggleDeliverable: (projectId: string, stageId: string, deliverableId: string) => void
  linkTaskToDeliverable: (projectId: string, stageId: string, deliverableId: string, taskId: string) => void

  // Ideas
  addIdea: (text: string) => void
  processIdea: (id: string, result: IdeaResult, opts?: { reviewMonthly?: boolean }) => void

  // Bloques de tiempo
  startTimeBlock: (opts: { label: string; durationSeconds: number; taskId?: string; victoryId?: string }) => string
  pauseTimeBlock: (id: string) => void
  resumeTimeBlock: (id: string) => void
  finishTimeBlock: (id: string, completion: 'si' | 'parcial' | 'no', outcome: string, note?: string) => void
  discardTimeBlock: (id: string) => void

  // Finanzas
  addFinanceEntry: (e: Omit<FinanceEntry, 'id'>) => void
  removeFinanceEntry: (id: string) => void

  // Cierre diario
  getOrCreateDailyClose: (date: string) => DailyClose
  updateDailyClose: (date: string, patch: Partial<DailyClose>) => void
  completeDailyClose: (date: string) => void

  // Revisión semanal
  addOrUpdateWeeklyReview: (weekStart: string, patch: Partial<WeeklyReview>) => void
  completeWeeklyReview: (weekStart: string) => void

  // Revisión trimestral / mensual
  addOrUpdateQuarterlyReview: (year: number, quarter: string, patch: Partial<QuarterlyReview>) => void
  addOrUpdateMonthlyReview: (month: string, patch: Partial<MonthlyReview>) => void

  // Metas
  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  removeGoal: (id: string) => void

  // Capital / Delegación
  updateCapital: (patch: Partial<CapitalState>) => void
  updateDelegation: (patch: Partial<DelegationState>) => void

  // Modo / foco
  setMode: (mode: AppMode) => void
  setFocus: (focus: WeeklyFocus | null) => void

  // Seed
  seedIfEmpty: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      victories: [],
      tasks: [],
      projects: [],
      ideas: [],
      timeBlocks: [],
      financeEntries: [],
      dailyCloses: [],
      weeklyReviews: [],
      quarterlyReviews: [],
      monthlyReviews: [],
      goals: [],
      capital: { acumulado: 0, reservas: 0, disponible: 0, updatedAt: todayISO() },
      delegation: {
        rentabilidadSuficiente: false,
        procesosDocumentados: false,
        personaConfiable: false,
        numerosControlados: false,
        updatedAt: todayISO(),
      },
      mode: 'general',
      currentFocus: null,
      activeTimeBlockId: null,
      hasSeeded: false,
      newClientsByMonth: {},
      addNewClient: (month) =>
        set((s) => ({ newClientsByMonth: { ...s.newClientsByMonth, [month]: (s.newClientsByMonth[month] ?? 0) + 1 } })),

      ensureTodayVictories: () => {
        const date = todayISO()
        const existing = get().victories.filter((v) => v.date === date)
        if (existing.length >= 3) return
        const toCreate = 3 - existing.length
        const created: Victory[] = Array.from({ length: toCreate }).map(() => ({
          id: newId(),
          date,
          title: '',
          description: '',
          priority: 'media',
          expectedResult: '',
          status: 'pendiente',
          estimatedMinutes: 60,
          taskIds: [],
        }))
        set((s) => ({ victories: [...s.victories, ...created] }))
      },

      addVictory: (v) => {
        const id = newId()
        set((s) => ({ victories: [...s.victories, { ...v, id }] }))
        return id
      },
      updateVictory: (id, patch) =>
        set((s) => ({ victories: s.victories.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
      removeVictory: (id) => set((s) => ({ victories: s.victories.filter((v) => v.id !== id) })),

      addTask: (t) => {
        const id = newId()
        set((s) => ({ tasks: [...s.tasks, { ...t, id, createdAt: new Date().toISOString() }] }))
        return id
      },
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      setTaskStatus: (id, status, result) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status, result: result ?? t.result } : t)) })),

      addProject: (p) => {
        const id = newId()
        set((s) => ({
          projects: [...s.projects, { ...p, id, stages: [], archived: false, createdAt: new Date().toISOString() }],
        }))
        return id
      },
      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      archiveProject: (id) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, archived: true } : p)) })),

      addStage: (projectId, name) => {
        const id = newId()
        const stage: Stage = { id, name, deliverables: [] }
        set((s) => ({
          projects: s.projects.map((p) => (p.id === projectId ? { ...p, stages: [...p.stages, stage] } : p)),
        }))
        return id
      },
      addDeliverable: (projectId, stageId, name) => {
        const id = newId()
        const deliverable: Deliverable = { id, name, done: false, taskIds: [] }
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  stages: p.stages.map((st) =>
                    st.id === stageId ? { ...st, deliverables: [...st.deliverables, deliverable] } : st,
                  ),
                }
              : p,
          ),
        }))
        return id
      },
      toggleDeliverable: (projectId, stageId, deliverableId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  stages: p.stages.map((st) =>
                    st.id === stageId
                      ? {
                          ...st,
                          deliverables: st.deliverables.map((d) =>
                            d.id === deliverableId ? { ...d, done: !d.done } : d,
                          ),
                        }
                      : st,
                  ),
                }
              : p,
          ),
        })),
      linkTaskToDeliverable: (projectId, stageId, deliverableId, taskId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  stages: p.stages.map((st) =>
                    st.id === stageId
                      ? {
                          ...st,
                          deliverables: st.deliverables.map((d) =>
                            d.id === deliverableId ? { ...d, taskIds: [...d.taskIds, taskId] } : d,
                          ),
                        }
                      : st,
                  ),
                }
              : p,
          ),
        })),

      addIdea: (text) =>
        set((s) => ({
          ideas: [...s.ideas, { id: newId(), text, createdAt: new Date().toISOString(), processed: false, result: null }],
        })),
      processIdea: (id, result, opts) =>
        set((s) => ({
          ideas: s.ideas.map((i) =>
            i.id === id ? { ...i, processed: true, result, reviewMonthly: opts?.reviewMonthly ?? false } : i,
          ),
        })),

      startTimeBlock: ({ label, durationSeconds, taskId, victoryId }) => {
        const id = newId()
        const now = Date.now()
        const block: TimeBlock = {
          id,
          taskId,
          victoryId,
          label,
          durationSeconds,
          remainingSeconds: durationSeconds,
          endsAt: new Date(now + durationSeconds * 1000).toISOString(),
          status: 'running',
          startedAt: new Date().toISOString(),
        }
        set((s) => ({ timeBlocks: [...s.timeBlocks, block], activeTimeBlockId: id }))
        if (taskId) get().updateTask(taskId, { status: 'en_progreso' })
        return id
      },
      pauseTimeBlock: (id) =>
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) => {
            if (b.id !== id || b.status !== 'running') return b
            const remaining = b.endsAt ? Math.max(0, Math.round((new Date(b.endsAt).getTime() - Date.now()) / 1000)) : b.remainingSeconds
            return { ...b, status: 'paused', remainingSeconds: remaining, endsAt: undefined }
          }),
        })),
      resumeTimeBlock: (id) =>
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) =>
            b.id === id && b.status === 'paused'
              ? { ...b, status: 'running', endsAt: new Date(Date.now() + b.remainingSeconds * 1000).toISOString() }
              : b,
          ),
          activeTimeBlockId: id,
        })),
      finishTimeBlock: (id, completion, outcome, note) => {
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) =>
            b.id === id
              ? { ...b, status: 'completed', completedAt: new Date().toISOString(), completion, outcome, completionNote: note }
              : b,
          ),
          activeTimeBlockId: s.activeTimeBlockId === id ? null : s.activeTimeBlockId,
        }))
        const block = get().timeBlocks.find((b) => b.id === id)
        if (block?.taskId && completion === 'si') {
          get().setTaskStatus(block.taskId, 'terminada', outcome)
        }
      },
      discardTimeBlock: (id) =>
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) => (b.id === id ? { ...b, status: 'discarded' } : b)),
          activeTimeBlockId: s.activeTimeBlockId === id ? null : s.activeTimeBlockId,
        })),

      addFinanceEntry: (e) => set((s) => ({ financeEntries: [...s.financeEntries, { ...e, id: newId() }] })),
      removeFinanceEntry: (id) => set((s) => ({ financeEntries: s.financeEntries.filter((e) => e.id !== id) })),

      getOrCreateDailyClose: (date) => {
        const existing = get().dailyCloses.find((c) => c.date === date)
        if (existing) return existing
        const created = emptyDailyClose(date)
        set((s) => ({ dailyCloses: [...s.dailyCloses, created] }))
        return created
      },
      updateDailyClose: (date, patch) =>
        set((s) => ({
          dailyCloses: s.dailyCloses.map((c) => (c.date === date ? { ...c, ...patch } : c)),
        })),
      completeDailyClose: (date) =>
        set((s) => ({
          dailyCloses: s.dailyCloses.map((c) => (c.date === date ? { ...c, completedAt: new Date().toISOString() } : c)),
        })),

      addOrUpdateWeeklyReview: (weekStart, patch) =>
        set((s) => {
          const existing = s.weeklyReviews.find((w) => w.weekStart === weekStart)
          if (existing) {
            return {
              weeklyReviews: s.weeklyReviews.map((w) => (w.weekStart === weekStart ? { ...w, ...patch } : w)),
            }
          }
          const created: WeeklyReview = {
            id: newId(),
            weekStart,
            dinero: '',
            crecimiento: '',
            operacion: '',
            objetivo: '',
            aprendizajes: '',
            ideas: '',
            satisfaccion: '',
            nextFocus: null,
            ...patch,
          }
          return { weeklyReviews: [...s.weeklyReviews, created] }
        }),
      completeWeeklyReview: (weekStart) =>
        set((s) => ({
          weeklyReviews: s.weeklyReviews.map((w) =>
            w.weekStart === weekStart ? { ...w, completedAt: new Date().toISOString() } : w,
          ),
        })),

      addOrUpdateQuarterlyReview: (year, quarter, patch) =>
        set((s) => {
          const existing = s.quarterlyReviews.find((q) => q.year === year && q.quarter === quarter)
          if (existing) {
            return {
              quarterlyReviews: s.quarterlyReviews.map((q) =>
                q.year === year && q.quarter === quarter ? { ...q, ...patch } : q,
              ),
            }
          }
          const created: QuarterlyReview = {
            id: newId(),
            year,
            quarter: quarter as QuarterlyReview['quarter'],
            capital: '',
            resultados: '',
            aprendizajes: '',
            sistemas: '',
            proximoEscalon: '',
            ...patch,
          }
          return { quarterlyReviews: [...s.quarterlyReviews, created] }
        }),
      addOrUpdateMonthlyReview: (month, patch) =>
        set((s) => {
          const existing = s.monthlyReviews.find((m) => m.month === month)
          if (existing) {
            return { monthlyReviews: s.monthlyReviews.map((m) => (m.month === month ? { ...m, ...patch } : m)) }
          }
          const created: MonthlyReview = {
            id: newId(),
            month,
            resumen: '',
            ideasArchivadasRevisadas: false,
            ...patch,
          }
          return { monthlyReviews: [...s.monthlyReviews, created] }
        }),

      addGoal: (g) => set((s) => ({ goals: [...s.goals, { ...g, id: newId() }] })),
      updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      updateCapital: (patch) => set((s) => ({ capital: { ...s.capital, ...patch, updatedAt: todayISO() } })),
      updateDelegation: (patch) => set((s) => ({ delegation: { ...s.delegation, ...patch, updatedAt: todayISO() } })),

      setMode: (mode) => set({ mode }),
      setFocus: (focus) => set({ currentFocus: focus }),

      seedIfEmpty: () => {
        const s = get()
        if (s.hasSeeded || s.projects.length > 0) return
        const projectId = newId()
        const stageId = newId()
        const project: Project = {
          id: projectId,
          name: 'Sistema de Caja',
          description: 'Ejemplo: estructura del sistema de caja del parqueadero.',
          type: 'construccion',
          archived: false,
          createdAt: new Date().toISOString(),
          stages: [
            {
              id: stageId,
              name: 'Diseño',
              deliverables: [
                { id: newId(), name: 'Definir información', done: false, taskIds: [] },
                { id: newId(), name: 'Definir entradas', done: false, taskIds: [] },
                { id: newId(), name: 'Definir gastos', done: false, taskIds: [] },
                { id: newId(), name: 'Definir cierre', done: false, taskIds: [] },
              ],
            },
          ],
        }
        set({ projects: [project], hasSeeded: true })
      },
    }),
    {
      name: 'si-podia-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
