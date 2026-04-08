export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function getFirstDayOfMonth(date: Date): number {
  // Convert JS day index (Sun=0..Sat=6) to Monday-first index (Mon=0..Sun=6).
  const jsDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  return (jsDay + 6) % 7
}

export function getMonthName(date: Date): string {
  return date.toLocaleString("default", { month: "long" })
}

export function getYearString(date: Date): string {
  return date.getFullYear().toString()
}

export function getDayOfWeek(date: Date): number {
  return date.getDay()
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export function isDateInRange(
  date: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean {
  if (!startDate || !endDate) return false

  const start = startDate < endDate ? startDate : endDate
  const end = startDate < endDate ? endDate : startDate
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const normalizedStart = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  )
  const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  return target >= normalizedStart && target <= normalizedEnd
}

export function isStartDate(
  date: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean {
  if (!startDate) return false
  if (!endDate) return isSameDay(date, startDate)
  const normalizedStart = startDate < endDate ? startDate : endDate
  return isSameDay(date, normalizedStart)
}

export function isEndDate(
  date: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean {
  if (!startDate || !endDate) return false
  const normalizedEnd = startDate < endDate ? endDate : startDate
  return isSameDay(date, normalizedEnd)
}

function formatDatePart(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function formatDateKey(start: Date, end: Date): string {
  const normalizedStart = start < end ? start : end
  const normalizedEnd = start < end ? end : start
  return `${formatDatePart(normalizedStart)}_${formatDatePart(normalizedEnd)}`
}

export function formatSingleDateKey(date: Date): string {
  return formatDatePart(date)
}
