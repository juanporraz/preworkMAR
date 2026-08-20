import type { Quarter } from '../types'

export function currentQuarter(date: Date = new Date()): Quarter {
  const m = date.getMonth()
  if (m < 3) return 'Q1'
  if (m < 6) return 'Q2'
  if (m < 9) return 'Q3'
  return 'Q4'
}

export function currentYear(date: Date = new Date()): number {
  return date.getFullYear()
}

export function currentMonth(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
