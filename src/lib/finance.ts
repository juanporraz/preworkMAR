import type { FinanceEntry } from '../types'
import { mondayOfWeek, todayISO } from './id'

export function sumEntries(entries: FinanceEntry[]) {
  const ingresos = entries.filter((e) => e.type === 'ingreso').reduce((a, e) => a + e.amount, 0)
  const gastos = entries.filter((e) => e.type === 'gasto').reduce((a, e) => a + e.amount, 0)
  return { ingresos, gastos, resultado: ingresos - gastos }
}

export function entriesForDay(entries: FinanceEntry[], date: string) {
  return entries.filter((e) => e.date === date)
}

export function entriesForWeek(entries: FinanceEntry[], weekStart: string) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return entries.filter((e) => {
    const d = new Date(e.date)
    return d >= start && d < end
  })
}

export function entriesForMonth(entries: FinanceEntry[], month: string) {
  return entries.filter((e) => e.date.startsWith(month))
}

export function currentSummaries(entries: FinanceEntry[]) {
  const today = todayISO()
  const week = mondayOfWeek()
  const month = today.slice(0, 7)
  return {
    hoy: sumEntries(entriesForDay(entries, today)),
    semana: sumEntries(entriesForWeek(entries, week)),
    mes: sumEntries(entriesForMonth(entries, month)),
  }
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}
