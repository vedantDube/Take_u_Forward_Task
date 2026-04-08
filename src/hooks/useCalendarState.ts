"use client"

import { useCallback, useEffect, useState } from "react"
import type { CalendarState, ThemeColor, RangeNotes, DateMoods, MoodType } from "@/types/calendar"
import { formatDateKey, formatSingleDateKey } from "@/lib/dateUtils"
import { HERO_IMAGES } from "@/lib/constants"

const STORAGE_KEYS = {
  MONTHLY_NOTES: "calendar_monthly_notes",
  RANGE_NOTES: "calendar_range_notes",
  DATE_MOODS: "calendar_date_moods",
  HERO_IMAGE_INDEX: "calendar_hero_image_index",
  THEME_COLOR: "calendar_theme_color",
  AUTO_THEME: "calendar_auto_theme",
  SELECTED_DATES: "calendar_selected_dates",
}

const INITIAL_STATE: CalendarState = {
  selectedStartDate: null,
  selectedEndDate: null,
  currentMonth: new Date(),
  monthlyNotes: "",
  rangeNotes: {},
  dateMoods: {},
  heroImageIndex: 0,
  themeColor: "blue",
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getMonthStorageKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function readMonthlyNotesMap(): Record<string, string> {
  const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_NOTES)
  if (!raw) return {}

  const parsed = safeJsonParse<Record<string, string> | string>(raw, {})

  // Backward compatibility: migrate legacy plain-string notes to current month key.
  if (typeof parsed === "string") {
    return { [getMonthStorageKey(new Date())]: parsed }
  }

  return parsed
}

interface CalendarBackupPayload {
  monthlyNotesMap: Record<string, string>
  rangeNotes: RangeNotes
  dateMoods: DateMoods
  heroImageIndex: number
  themeColor: ThemeColor
  autoThemeEnabled: boolean
  selectedDates: { start: string | null; end: string | null } | null
}

export function useCalendarState() {
  const [calendarState, setCalendarState] = useState<CalendarState>(INITIAL_STATE)
  const [isHydrated, setIsHydrated] = useState(false)
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(true)

  useEffect(() => {
    const monthlyNotesMap = readMonthlyNotesMap()
    const currentMonthKey = getMonthStorageKey(new Date())
    const savedMonthlyNotes = monthlyNotesMap[currentMonthKey] || ""
    const savedRangeNotes = safeJsonParse<RangeNotes>(
      localStorage.getItem(STORAGE_KEYS.RANGE_NOTES),
      {}
    )
    const savedDateMoods = safeJsonParse<DateMoods>(
      localStorage.getItem(STORAGE_KEYS.DATE_MOODS),
      {}
    )
    const savedImageIndexRaw = parseInt(
      localStorage.getItem(STORAGE_KEYS.HERO_IMAGE_INDEX) || "0",
      10
    )
    const savedImageIndex = Number.isNaN(savedImageIndexRaw)
      ? 0
      : savedImageIndexRaw
    const savedTheme =
      (localStorage.getItem(STORAGE_KEYS.THEME_COLOR) as ThemeColor) || "blue"
    const savedAutoTheme = localStorage.getItem(STORAGE_KEYS.AUTO_THEME)
    const savedDates = safeJsonParse<{ start: string | null; end: string | null } | null>(
      localStorage.getItem(STORAGE_KEYS.SELECTED_DATES),
      null
    )

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCalendarState((prev) => ({
      ...prev,
      selectedStartDate: savedDates?.start ? new Date(savedDates.start) : null,
      selectedEndDate: savedDates?.end ? new Date(savedDates.end) : null,
      monthlyNotes: savedMonthlyNotes,
      rangeNotes: savedRangeNotes,
      dateMoods: savedDateMoods,
      heroImageIndex: savedImageIndex,
      themeColor: savedTheme,
    }))

    localStorage.setItem(
      STORAGE_KEYS.MONTHLY_NOTES,
      JSON.stringify(monthlyNotesMap)
    )

    setAutoThemeEnabled(savedAutoTheme === null ? true : savedAutoTheme === "true")

    setIsHydrated(true)
  }, [])

  // Persist monthly notes
  const setMonthlyNotes = useCallback((notes: string) => {
    setCalendarState((prev) => {
      const monthKey = getMonthStorageKey(prev.currentMonth)
      const notesMap = readMonthlyNotesMap()
      notesMap[monthKey] = notes
      localStorage.setItem(STORAGE_KEYS.MONTHLY_NOTES, JSON.stringify(notesMap))

      return { ...prev, monthlyNotes: notes }
    })
  }, [])

  // Persist range-specific notes
  const setRangeNote = useCallback(
    (startDate: Date, endDate: Date, note: string) => {
      const key = formatDateKey(startDate, endDate)
      setCalendarState((prev) => {
        const nextRangeNotes = { ...prev.rangeNotes, [key]: note }
        localStorage.setItem(
          STORAGE_KEYS.RANGE_NOTES,
          JSON.stringify(nextRangeNotes)
        )

        return {
          ...prev,
          rangeNotes: nextRangeNotes,
        }
      })
    },
    []
  )

  const setSingleDateNote = useCallback((date: Date, note: string) => {
    const key = formatSingleDateKey(date)
    setCalendarState((prev) => {
      const nextRangeNotes = { ...prev.rangeNotes, [key]: note }
      localStorage.setItem(
        STORAGE_KEYS.RANGE_NOTES,
        JSON.stringify(nextRangeNotes)
      )

      return {
        ...prev,
        rangeNotes: nextRangeNotes,
      }
    })
  }, [])

  const setDateMood = useCallback((date: Date, mood: MoodType | null) => {
    const key = formatSingleDateKey(date)

    setCalendarState((prev) => {
      const nextDateMoods = { ...prev.dateMoods }
      if (mood) {
        nextDateMoods[key] = mood
      } else {
        delete nextDateMoods[key]
      }

      localStorage.setItem(STORAGE_KEYS.DATE_MOODS, JSON.stringify(nextDateMoods))

      return {
        ...prev,
        dateMoods: nextDateMoods,
      }
    })
  }, [])

  const getDateMood = useCallback(
    (date: Date): MoodType | null => {
      const key = formatSingleDateKey(date)
      return calendarState.dateMoods[key] || null
    },
    [calendarState.dateMoods]
  )

  // Get range-specific note
  const getRangeNote = useCallback(
    (startDate: Date, endDate: Date): string => {
      const key = formatDateKey(startDate, endDate)
      return calendarState.rangeNotes[key] || ""
    },
    [calendarState.rangeNotes]
  )

  const getSingleDateNote = useCallback(
    (date: Date): string => {
      const key = formatSingleDateKey(date)
      return calendarState.rangeNotes[key] || ""
    },
    [calendarState.rangeNotes]
  )

  // Select date (range selection logic)
  const selectDate = useCallback((date: Date) => {
    setCalendarState((prev) => {
      const { selectedStartDate, selectedEndDate } = prev

      if (selectedStartDate && selectedEndDate) {
        const nextState = {
          start: date.toISOString(),
          end: null,
        }
        localStorage.setItem(STORAGE_KEYS.SELECTED_DATES, JSON.stringify(nextState))

        return {
          ...prev,
          selectedStartDate: date,
          selectedEndDate: null,
        }
      }

      if (selectedStartDate && !selectedEndDate) {
        const nextState = {
          start: selectedStartDate.toISOString(),
          end: date.toISOString(),
        }
        localStorage.setItem(STORAGE_KEYS.SELECTED_DATES, JSON.stringify(nextState))

        return {
          ...prev,
          selectedEndDate: date,
        }
      }

      const nextState = { start: date.toISOString(), end: null }
      localStorage.setItem(STORAGE_KEYS.SELECTED_DATES, JSON.stringify(nextState))

      return {
        ...prev,
        selectedStartDate: date,
        selectedEndDate: null,
      }
    })
  }, [])

  const setDateSelection = useCallback((startDate: Date, endDate: Date | null) => {
    setCalendarState((prev) => ({
      ...prev,
      selectedStartDate: startDate,
      selectedEndDate: endDate,
    }))

    const nextState = {
      start: startDate.toISOString(),
      end: endDate ? endDate.toISOString() : null,
    }
    localStorage.setItem(STORAGE_KEYS.SELECTED_DATES, JSON.stringify(nextState))
  }, [])

  // Clear date range
  const clearDateRange = useCallback(() => {
    setCalendarState((prev) => ({
      ...prev,
      selectedStartDate: null,
      selectedEndDate: null,
    }))
    localStorage.removeItem(STORAGE_KEYS.SELECTED_DATES)
  }, [])

  // Navigate months
  const previousMonth = useCallback(() => {
    setCalendarState((prev) => {
      const nextMonth = new Date(
        prev.currentMonth.getFullYear(),
        prev.currentMonth.getMonth() - 1
      )
      const monthKey = getMonthStorageKey(nextMonth)
      const notesMap = readMonthlyNotesMap()

      return {
        ...prev,
        currentMonth: nextMonth,
        monthlyNotes: notesMap[monthKey] || "",
      }
    })
  }, [])

  const nextMonth = useCallback(() => {
    setCalendarState((prev) => {
      const nextMonth = new Date(
        prev.currentMonth.getFullYear(),
        prev.currentMonth.getMonth() + 1
      )
      const monthKey = getMonthStorageKey(nextMonth)
      const notesMap = readMonthlyNotesMap()

      return {
        ...prev,
        currentMonth: nextMonth,
        monthlyNotes: notesMap[monthKey] || "",
      }
    })
  }, [])

  const setCurrentMonth = useCallback((date: Date) => {
    setCalendarState((prev) => {
      const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthKey = getMonthStorageKey(nextMonth)
      const notesMap = readMonthlyNotesMap()

      return {
        ...prev,
        currentMonth: nextMonth,
        monthlyNotes: notesMap[monthKey] || "",
      }
    })
  }, [])

  // Set hero image index
  const setHeroImageIndex = useCallback(
    (index: number) => {
      setCalendarState((prev) => {
        const nextTheme = autoThemeEnabled
          ? HERO_IMAGES[index]?.dominantColor || prev.themeColor
          : prev.themeColor

        localStorage.setItem(STORAGE_KEYS.HERO_IMAGE_INDEX, index.toString())
        localStorage.setItem(STORAGE_KEYS.THEME_COLOR, nextTheme)

        return {
          ...prev,
          heroImageIndex: index,
          themeColor: nextTheme,
        }
      })
    },
    [autoThemeEnabled]
  )

  // Set theme color
  const setThemeColor = useCallback((color: ThemeColor) => {
    setCalendarState((prev) => ({ ...prev, themeColor: color }))
    localStorage.setItem(STORAGE_KEYS.THEME_COLOR, color)
    localStorage.setItem(STORAGE_KEYS.AUTO_THEME, "false")
    setAutoThemeEnabled(false)
  }, [])

  const setAutoTheme = useCallback((enabled: boolean) => {
    setAutoThemeEnabled(enabled)
    localStorage.setItem(STORAGE_KEYS.AUTO_THEME, String(enabled))

    if (!enabled) return

    setCalendarState((prev) => {
      const derivedTheme =
        HERO_IMAGES[prev.heroImageIndex]?.dominantColor || prev.themeColor
      localStorage.setItem(STORAGE_KEYS.THEME_COLOR, derivedTheme)
      return {
        ...prev,
        themeColor: derivedTheme,
      }
    })
  }, [])

  const exportCalendarData = useCallback((): CalendarBackupPayload => {
    const selectedDates = calendarState.selectedStartDate
      ? {
          start: calendarState.selectedStartDate.toISOString(),
          end: calendarState.selectedEndDate
            ? calendarState.selectedEndDate.toISOString()
            : null,
        }
      : null

    return {
      monthlyNotesMap: readMonthlyNotesMap(),
      rangeNotes: calendarState.rangeNotes,
      dateMoods: calendarState.dateMoods,
      heroImageIndex: calendarState.heroImageIndex,
      themeColor: calendarState.themeColor,
      autoThemeEnabled,
      selectedDates,
    }
  }, [
    autoThemeEnabled,
    calendarState.dateMoods,
    calendarState.heroImageIndex,
    calendarState.rangeNotes,
    calendarState.selectedEndDate,
    calendarState.selectedStartDate,
    calendarState.themeColor,
  ])

  const importCalendarData = useCallback((payload: CalendarBackupPayload) => {
    localStorage.setItem(
      STORAGE_KEYS.MONTHLY_NOTES,
      JSON.stringify(payload.monthlyNotesMap || {})
    )
    localStorage.setItem(
      STORAGE_KEYS.RANGE_NOTES,
      JSON.stringify(payload.rangeNotes || {})
    )
    localStorage.setItem(
      STORAGE_KEYS.DATE_MOODS,
      JSON.stringify(payload.dateMoods || {})
    )
    localStorage.setItem(
      STORAGE_KEYS.HERO_IMAGE_INDEX,
      String(payload.heroImageIndex ?? 0)
    )
    localStorage.setItem(
      STORAGE_KEYS.THEME_COLOR,
      payload.themeColor || "blue"
    )
    localStorage.setItem(
      STORAGE_KEYS.AUTO_THEME,
      String(payload.autoThemeEnabled ?? true)
    )

    if (payload.selectedDates) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_DATES,
        JSON.stringify(payload.selectedDates)
      )
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_DATES)
    }

    const currentMonthKey = getMonthStorageKey(calendarState.currentMonth)

    setAutoThemeEnabled(payload.autoThemeEnabled ?? true)
    setCalendarState((prev) => ({
      ...prev,
      monthlyNotes: payload.monthlyNotesMap?.[currentMonthKey] || "",
      rangeNotes: payload.rangeNotes || {},
      dateMoods: payload.dateMoods || {},
      heroImageIndex: payload.heroImageIndex ?? 0,
      themeColor: payload.themeColor || "blue",
      selectedStartDate: payload.selectedDates?.start
        ? new Date(payload.selectedDates.start)
        : null,
      selectedEndDate: payload.selectedDates?.end
        ? new Date(payload.selectedDates.end)
        : null,
    }))
  }, [calendarState.currentMonth])

  return {
    calendarState,
    isHydrated,
    selectDate,
    setDateSelection,
    clearDateRange,
    previousMonth,
    nextMonth,
    setCurrentMonth,
    setMonthlyNotes,
    setRangeNote,
    setSingleDateNote,
    setDateMood,
    getDateMood,
    getRangeNote,
    getSingleDateNote,
    setHeroImageIndex,
    setThemeColor,
    autoThemeEnabled,
    setAutoTheme,
    exportCalendarData,
    importCalendarData,
  }
}
