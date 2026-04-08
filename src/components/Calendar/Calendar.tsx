"use client"

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Keyboard,
  Pause,
  Play,
  Search,
  Sparkles,
  Upload,
} from "lucide-react"
import { HeroSection } from "./HeroSection"
import { CalendarGrid } from "./CalendarGrid"
import { NotesSection } from "./NotesSection"
import { useCalendarState } from "@/hooks/useCalendarState"
import { getSpecialDayForDate, HERO_IMAGES, THEME_COLORS } from "@/lib/constants"
import { formatSingleDateKey, getDaysInMonth } from "@/lib/dateUtils"
import type { MoodType, ThemeColor } from "@/types/calendar"

const pageTurnVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    rotateY: direction === 1 ? -82 : 82,
    x: direction === 1 ? 22 : -22,
    filter: "blur(2px)",
    transformOrigin: direction === 1 ? "left center" : "right center",
  }),
  center: {
    opacity: 1,
    rotateY: 0,
    x: 0,
    filter: "blur(0px)",
    transformOrigin: "center center",
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    rotateY: direction === 1 ? 82 : -82,
    x: direction === 1 ? -22 : 22,
    filter: "blur(2px)",
    transformOrigin: direction === 1 ? "right center" : "left center",
  }),
}

interface SavedSelectionNote {
  key: string
  startDate: Date
  endDate: Date
  isRange: boolean
  label: string
  note: string
}

type AppearanceMode = "light" | "dark" | "auto"

const APPEARANCE_MODE_STORAGE_KEY = "calendar_appearance_mode"
const APPEARANCE_MODE_EVENT = "calendar-appearance-mode-change"

function useStoredAppearanceMode(): AppearanceMode {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange)
      window.addEventListener(APPEARANCE_MODE_EVENT, onStoreChange)

      return () => {
        window.removeEventListener("storage", onStoreChange)
        window.removeEventListener(APPEARANCE_MODE_EVENT, onStoreChange)
      }
    },
    () => {
      const storedMode = localStorage.getItem(APPEARANCE_MODE_STORAGE_KEY)
      return storedMode === "light" || storedMode === "dark" || storedMode === "auto"
        ? storedMode
        : "auto"
    },
    () => "auto"
  )
}

function usePrefersDarkMode(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      media.addEventListener("change", onStoreChange)

      return () => {
        media.removeEventListener("change", onStoreChange)
      }
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false
  )
}

function parseSelectionKey(key: string): {
  startDate: Date
  endDate: Date
  isRange: boolean
} | null {
  if (key.includes("_")) {
    const [startRaw, endRaw] = key.split("_")
    const startDate = new Date(startRaw)
    const endDate = new Date(endRaw)

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return null
    }

    return {
      startDate: startDate < endDate ? startDate : endDate,
      endDate: startDate < endDate ? endDate : startDate,
      isRange: true,
    }
  }

  const singleDate = new Date(key)
  if (Number.isNaN(singleDate.getTime())) {
    return null
  }

  return {
    startDate: singleDate,
    endDate: singleDate,
    isRange: false,
  }
}

const MOOD_META: Record<MoodType, { label: string; color: string; theme: ThemeColor }> = {
  focused: { label: "Focused", color: "#2563eb", theme: "cool" },
  chill: { label: "Chill", color: "#0ea5e9", theme: "blue" },
  energetic: { label: "Energetic", color: "#f97316", theme: "warm" },
  reflective: { label: "Reflective", color: "#a855f7", theme: "vibrant" },
}

function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const start = startDate < endDate ? startDate : endDate
  const end = startDate < endDate ? endDate : startDate
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const result: Date[] = []

  while (cursor <= end) {
    result.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

function getWeekKey(date: Date): string {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  return formatSingleDateKey(monday)
}

export function Calendar() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const {
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
  } = useCalendarState()
  const [turnDirection, setTurnDirection] = useState<1 | -1>(1)
  const [now, setNow] = useState(() => new Date())
  const [isReplayRunning, setIsReplayRunning] = useState(false)
  const [replayIndex, setReplayIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const monthlyNotesRef = useRef<HTMLTextAreaElement | null>(null)
  const appearanceMode = useStoredAppearanceMode()
  const systemDark = usePrefersDarkMode()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const currentHeroImage = useMemo(
    () => HERO_IMAGES[calendarState.heroImageIndex] || HERO_IMAGES[0],
    [calendarState.heroImageIndex]
  )

  useEffect(() => {
    const preloadImage = (src: string) => {
      const image = new window.Image()
      image.src = src
    }

    const nextIndex = (calendarState.heroImageIndex + 1) % HERO_IMAGES.length
    const previousIndex = (calendarState.heroImageIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length

    preloadImage(HERO_IMAGES[nextIndex].src)
    preloadImage(HERO_IMAGES[previousIndex].src)
  }, [calendarState.heroImageIndex])

  const monthDates = useMemo(() => {
    const count = getDaysInMonth(calendarState.currentMonth)
    return Array.from({ length: count }, (_, index) =>
      new Date(
        calendarState.currentMonth.getFullYear(),
        calendarState.currentMonth.getMonth(),
        index + 1
      )
    )
  }, [calendarState.currentMonth])

  const noteIntensityByDate = useMemo(() => {
    const intensityMap: Record<string, number> = {}

    Object.entries(calendarState.rangeNotes).forEach(([key, note]) => {
      const trimmed = note.trim()
      if (!trimmed) return

      const parsed = parseSelectionKey(key)
      if (!parsed) return

      const points = Math.max(1, Math.min(5, Math.ceil(trimmed.length / 80)))
      const rangeDates = parsed.isRange
        ? getDatesInRange(parsed.startDate, parsed.endDate)
        : [parsed.startDate]

      rangeDates.forEach((date) => {
        const dateKey = formatSingleDateKey(date)
        intensityMap[dateKey] = (intensityMap[dateKey] || 0) + points
      })
    })

    return intensityMap
  }, [calendarState.rangeNotes])

  const replayDateKeys = useMemo(
    () => monthDates.map((date) => formatSingleDateKey(date)),
    [monthDates]
  )

  useEffect(() => {
    if (!isReplayRunning || replayDateKeys.length === 0) return

    const timer = window.setInterval(() => {
      setReplayIndex((prev) => (prev + 1) % replayDateKeys.length)
    }, 450)

    return () => {
      window.clearInterval(timer)
    }
  }, [isReplayRunning, replayDateKeys.length])

  const replayDateKey = isReplayRunning ? replayDateKeys[replayIndex] : null

  const searchableNotes = useMemo(() => {
    return Object.entries(calendarState.rangeNotes)
      .filter(([, note]) => note.trim().length > 0)
      .map(([key, note]) => {
        const parsed = parseSelectionKey(key)
        if (!parsed) return null
        return {
          key,
          label: parsed.isRange
            ? `${parsed.startDate.toLocaleDateString()} to ${parsed.endDate.toLocaleDateString()}`
            : parsed.startDate.toLocaleDateString(),
          note,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          isRange: parsed.isRange,
        }
      })
      .filter((item): item is NonNullable<typeof item> => !!item)
  }, [calendarState.rangeNotes])

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []

    return searchableNotes.filter((item) => {
      return (
        item.note.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query)
      )
    })
  }, [searchQuery, searchableNotes])

  const weeklySummary = useMemo(() => {
    const today = new Date()
    const weekKey = getWeekKey(today)
    const thisWeekNotes = searchableNotes.filter((item) => {
      const dates = item.isRange
        ? getDatesInRange(item.startDate, item.endDate)
        : [item.startDate]

      return dates.some((date) => getWeekKey(date) === weekKey)
    })

    if (thisWeekNotes.length === 0) {
      return "No notes this week yet. Add at least one focus note to unlock weekly insights."
    }

    const mergedText = thisWeekNotes.map((item) => item.note.toLowerCase()).join(" ")
    const keywords = ["meeting", "study", "design", "review", "call", "deadline", "travel"]
    const foundKeyword = keywords.find((keyword) => mergedText.includes(keyword))
    const pendingHint = mergedText.includes("todo") || mergedText.includes("later")

    return `This week has ${thisWeekNotes.length} planned note${
      thisWeekNotes.length > 1 ? "s" : ""
    }. ${foundKeyword ? `Main focus appears to be ${foundKeyword}. ` : ""}${
      pendingHint
        ? "You still have pending tasks tagged for later."
        : "Momentum looks steady with no obvious pending overflow."
    }`
  }, [searchableNotes])

  const storyCards = useMemo(() => {
    const entries = Object.entries(noteIntensityByDate)
    const totalActiveDays = entries.length

    const topDay = entries.sort((a, b) => b[1] - a[1])[0]
    const notedSet = new Set(entries.map(([key]) => key))

    let longestStreak = 0
    let currentStreak = 0
    monthDates.forEach((date) => {
      const key = formatSingleDateKey(date)
      if (notedSet.has(key)) {
        currentStreak += 1
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })

    const weekLoad: Record<string, number> = {}
    entries.forEach(([key, value]) => {
      weekLoad[getWeekKey(new Date(key))] = (weekLoad[getWeekKey(new Date(key))] || 0) + value
    })
    const busiestWeek = Object.entries(weekLoad).sort((a, b) => b[1] - a[1])[0]

    return {
      totalActiveDays,
      topDay: topDay ? `${new Date(topDay[0]).toLocaleDateString()} (${topDay[1]} energy)` : "-",
      longestStreak,
      busiestWeek: busiestWeek ? `${new Date(busiestWeek[0]).toLocaleDateString()} week` : "-",
    }
  }, [monthDates, noteIntensityByDate])

  const integrityWarnings = useMemo(() => {
    const warnings: string[] = []
    const highLoadKeys = Object.entries(noteIntensityByDate)
      .filter(([, value]) => value >= 4)
      .map(([key]) => key)
      .sort()

    let run = 1
    for (let i = 1; i < highLoadKeys.length; i += 1) {
      const previous = new Date(highLoadKeys[i - 1])
      const current = new Date(highLoadKeys[i])
      const diff = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
      run = diff === 1 ? run + 1 : 1
      if (run >= 4) {
        warnings.push("4+ consecutive high-load days detected. Consider a buffer day.")
        break
      }
    }

    const hasSundayRest = monthDates.some((date) => date.getDay() === 0 && !noteIntensityByDate[formatSingleDateKey(date)])
    if (!hasSundayRest) {
      warnings.push("No clear Sunday rest day found in this month.")
    }

    const rangeWithoutDetails = searchableNotes.some((item) => item.isRange && item.note.trim().length < 14)
    if (rangeWithoutDetails) {
      warnings.push("Some range plans look too short. Add more details for execution clarity.")
    }

    return warnings
  }, [monthDates, noteIntensityByDate, searchableNotes])

  const weekDelta = useMemo(() => {
    if (typeof window === "undefined") {
      return "Baseline captured. Make edits and revisit to see week-over-week changes."
    }

    const snapshotKey = `calendar_snapshot_${calendarState.currentMonth.getFullYear()}_${calendarState.currentMonth.getMonth()}`
    const current = {
      notesCount: searchableNotes.length,
      moodsCount: Object.keys(calendarState.dateMoods).length,
      monthlyChars: calendarState.monthlyNotes.length,
    }

    const previousRaw = localStorage.getItem(snapshotKey)
    const previous = previousRaw ? (JSON.parse(previousRaw) as typeof current) : null

    if (!previous) {
      return "Baseline captured. Make edits and revisit to see week-over-week changes."
    }

    const noteDelta = current.notesCount - previous.notesCount
    const moodDelta = current.moodsCount - previous.moodsCount
    const textDelta = current.monthlyChars - previous.monthlyChars

    return `Notes ${noteDelta >= 0 ? "+" : ""}${noteDelta}, moods ${
      moodDelta >= 0 ? "+" : ""
    }${moodDelta}, monthly note chars ${textDelta >= 0 ? "+" : ""}${textDelta} vs last snapshot.`
  }, [
    calendarState.currentMonth,
    calendarState.dateMoods,
    calendarState.monthlyNotes.length,
    searchableNotes.length,
  ])

  useEffect(() => {
    const snapshotKey = `calendar_snapshot_${calendarState.currentMonth.getFullYear()}_${calendarState.currentMonth.getMonth()}`
    const current = {
      notesCount: searchableNotes.length,
      moodsCount: Object.keys(calendarState.dateMoods).length,
      monthlyChars: calendarState.monthlyNotes.length,
    }

    localStorage.setItem(snapshotKey, JSON.stringify(current))
  }, [
    calendarState.currentMonth,
    calendarState.dateMoods,
    calendarState.monthlyNotes.length,
    searchableNotes.length,
  ])

  const selectionNoteText = useMemo(() => {
    if (calendarState.selectedStartDate && calendarState.selectedEndDate) {
      return getRangeNote(
        calendarState.selectedStartDate,
        calendarState.selectedEndDate
      )
    }

    if (calendarState.selectedStartDate) {
      return getSingleDateNote(calendarState.selectedStartDate)
    }

    return ""
  }, [
    calendarState.selectedStartDate,
    calendarState.selectedEndDate,
    getRangeNote,
    getSingleDateNote,
  ])

  const handleSelectionNoteChange = (text: string) => {
    if (calendarState.selectedStartDate && calendarState.selectedEndDate) {
      setRangeNote(calendarState.selectedStartDate, calendarState.selectedEndDate, text)
      return
    }

    if (calendarState.selectedStartDate) {
      setSingleDateNote(calendarState.selectedStartDate, text)
    }
  }

  const selectedMood = useMemo(() => {
    if (!calendarState.selectedStartDate || calendarState.selectedEndDate) return null
    return getDateMood(calendarState.selectedStartDate)
  }, [
    calendarState.selectedEndDate,
    calendarState.selectedStartDate,
    getDateMood,
  ])

  const handleMoodSelect = useCallback(
    (mood: MoodType | null) => {
      if (!calendarState.selectedStartDate || calendarState.selectedEndDate) return

      setDateMood(calendarState.selectedStartDate, mood)
      if (!mood) return

      setThemeColor(MOOD_META[mood].theme)
    },
    [
      calendarState.selectedEndDate,
      calendarState.selectedStartDate,
      setDateMood,
      setThemeColor,
    ]
  )

  const getEnergyForDate = useCallback(
    (date: Date) => {
      const key = formatSingleDateKey(date)
      const value = noteIntensityByDate[key] || 0
      return Math.min(5, value)
    },
    [noteIntensityByDate]
  )

  const triggerExport = useCallback(() => {
    const payload = exportCalendarData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `calendar-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [exportCalendarData])

  const handleImportBackup = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const text = await file.text()
      const parsed = JSON.parse(text)
      importCalendarData(parsed)
      event.target.value = ""
    },
    [importCalendarData]
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "INPUT" ||
        target?.isContentEditable

      if (!isTyping && event.key.toLowerCase() === "n") {
        event.preventDefault()
        monthlyNotesRef.current?.focus()
      }

      if (!isTyping && event.key === "/") {
        event.preventDefault()
        setShowSearchResults(true)
      }

      if (!calendarState.selectedStartDate || !event.shiftKey) return

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault()
        const delta = event.key === "ArrowRight" ? 1 : -1
        const base = calendarState.selectedEndDate || calendarState.selectedStartDate
        const next = new Date(base)
        next.setDate(base.getDate() + delta)
        setDateSelection(calendarState.selectedStartDate, next)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [
    calendarState.selectedEndDate,
    calendarState.selectedStartDate,
    setDateSelection,
  ])

  const handlePreviousMonth = () => {
    setTurnDirection(-1)
    setHeroImageIndex(
      (calendarState.heroImageIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length
    )
    previousMonth()
  }

  const handleNextMonth = () => {
    setTurnDirection(1)
    setHeroImageIndex((calendarState.heroImageIndex + 1) % HERO_IMAGES.length)
    nextMonth()
  }

  const handleJumpToToday = useCallback(() => {
    const today = new Date()
    const targetMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthIndex =
      calendarState.currentMonth.getFullYear() * 12 + calendarState.currentMonth.getMonth()
    const targetMonthIndex = targetMonth.getFullYear() * 12 + targetMonth.getMonth()
    const monthOffset = targetMonthIndex - currentMonthIndex

    if (monthOffset !== 0) {
      setTurnDirection(monthOffset > 0 ? 1 : -1)
      const nextImageIndex =
        ((calendarState.heroImageIndex + monthOffset) % HERO_IMAGES.length + HERO_IMAGES.length) %
        HERO_IMAGES.length
      setHeroImageIndex(nextImageIndex)
      setCurrentMonth(targetMonth)
    }

    setDateSelection(today, null)
  }, [
    calendarState.currentMonth,
    calendarState.heroImageIndex,
    setCurrentMonth,
    setDateSelection,
    setHeroImageIndex,
  ])

  const hasSelection = useMemo(
    () => !!calendarState.selectedStartDate,
    [calendarState.selectedStartDate]
  )

  const selectionLabel = useMemo(() => {
    if (calendarState.selectedStartDate && calendarState.selectedEndDate) {
      return `${calendarState.selectedStartDate.toLocaleDateString()} to ${calendarState.selectedEndDate.toLocaleDateString()}`
    }

    if (calendarState.selectedStartDate) {
      return calendarState.selectedStartDate.toLocaleDateString()
    }

    return "No selection"
  }, [calendarState.selectedStartDate, calendarState.selectedEndDate])

  const selectionDetails = useMemo(() => {
    if (!calendarState.selectedStartDate) return null

    const start = calendarState.selectedStartDate
    const end = calendarState.selectedEndDate || calendarState.selectedStartDate
    const normalizedStart = start < end ? start : end
    const normalizedEnd = start < end ? end : start

    const startSpecial = getSpecialDayForDate(normalizedStart)
    const endSpecial = getSpecialDayForDate(normalizedEnd)

    const specialLabels = new Set<string>()
    const cursor = new Date(
      normalizedStart.getFullYear(),
      normalizedStart.getMonth(),
      normalizedStart.getDate()
    )
    const last = new Date(
      normalizedEnd.getFullYear(),
      normalizedEnd.getMonth(),
      normalizedEnd.getDate()
    )

    while (cursor <= last) {
      const special = getSpecialDayForDate(cursor)
      if (special) {
        specialLabels.add(`${special.label} (${special.type})`)
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    const totalDays =
      Math.floor(
        (last.getTime() -
          new Date(
            normalizedStart.getFullYear(),
            normalizedStart.getMonth(),
            normalizedStart.getDate()
          ).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1

    return {
      startLabel: normalizedStart.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      endLabel: normalizedEnd.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      isRange: !!calendarState.selectedEndDate,
      totalDays,
      startSpecial,
      endSpecial,
      specialInSelection: Array.from(specialLabels),
    }
  }, [calendarState.selectedStartDate, calendarState.selectedEndDate])

  const savedSelectionNotes = useMemo(() => {
    const monthStart = new Date(
      calendarState.currentMonth.getFullYear(),
      calendarState.currentMonth.getMonth(),
      1
    )
    const monthEnd = new Date(
      calendarState.currentMonth.getFullYear(),
      calendarState.currentMonth.getMonth() + 1,
      0
    )

    return Object.entries(calendarState.rangeNotes)
      .filter(([, note]) => note.trim().length > 0)
      .map(([key, note]) => {
        const parsed = parseSelectionKey(key)
        if (!parsed) return null

        const inCurrentMonth =
          parsed.endDate >= monthStart && parsed.startDate <= monthEnd

        if (!inCurrentMonth) return null

        const label = parsed.isRange
          ? `${parsed.startDate.toLocaleDateString()} to ${parsed.endDate.toLocaleDateString()}`
          : parsed.startDate.toLocaleDateString()

        return {
          key,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          isRange: parsed.isRange,
          label,
          note,
        } satisfies SavedSelectionNote
      })
      .filter((item): item is SavedSelectionNote => !!item)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  }, [calendarState.currentMonth, calendarState.rangeNotes])

  const hasSavedNoteForDate = useCallback(
    (date: Date): boolean => {
      const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

      return savedSelectionNotes.some((item) => {
        const start = new Date(
          item.startDate.getFullYear(),
          item.startDate.getMonth(),
          item.startDate.getDate()
        )
        const end = new Date(
          item.endDate.getFullYear(),
          item.endDate.getMonth(),
          item.endDate.getDate()
        )
        return target >= start && target <= end
      })
    },
    [savedSelectionNotes]
  )

  const openSavedSelection = useCallback(
    (item: SavedSelectionNote) => {
      setDateSelection(item.startDate, item.isRange ? item.endDate : null)
    },
    [setDateSelection]
  )

  const activeTheme = THEME_COLORS[calendarState.themeColor]
  const monthKey = `${calendarState.currentMonth.getFullYear()}-${calendarState.currentMonth.getMonth()}`
  const currentMonthLabel = calendarState.currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
  const isDarkMode = appearanceMode === "dark" || (appearanceMode === "auto" && systemDark)

  const updateAppearanceMode = useCallback((mode: AppearanceMode) => {
    localStorage.setItem(APPEARANCE_MODE_STORAGE_KEY, mode)
    window.dispatchEvent(new Event(APPEARANCE_MODE_EVENT))
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("theme-light", "theme-dark")
    root.classList.add(isDarkMode ? "theme-dark" : "theme-light")
    root.style.colorScheme = isDarkMode ? "dark" : "light"
    localStorage.setItem("calendar_appearance_mode", appearanceMode)
  }, [appearanceMode, isDarkMode])

  if (!isClient || !isHydrated) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? "bg-slate-950" : "bg-gray-50"}`}>
        <div className={isDarkMode ? "text-slate-300" : "text-gray-600"}>Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className={`relative min-h-screen overflow-hidden p-4 sm:p-6 md:p-8 ${
      isDarkMode
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-zinc-900"
        : "bg-linear-to-br from-amber-50 via-zinc-50 to-sky-50"
    }`}>
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute -top-16 -left-20 h-72 w-72 rounded-full blur-3xl ${
          isDarkMode ? "bg-sky-500/20" : "bg-sky-200/35"
        }`}
        animate={{ x: [0, 40, -20, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full blur-3xl ${
          isDarkMode ? "bg-amber-500/15" : "bg-amber-200/30"
        }`}
        animate={{ x: [0, -35, 20, 0], y: [0, 18, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full blur-3xl ${
          isDarkMode ? "bg-violet-500/15" : "bg-violet-200/25"
        }`}
        animate={{ x: [0, 22, -26, 0], y: [0, -12, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-tight ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
            Wall Calendar Planner
            </h1>
            <p className={isDarkMode ? "text-slate-300" : "text-gray-600"}>Plan your month with visual range selection and contextual notes</p>
          </div>

          <div className={`rounded-lg border px-4 py-2 shadow-sm ${
            isDarkMode ? "border-slate-700 bg-slate-900/80" : "border-gray-200 bg-white"
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Current Date & Time</p>
            <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-200" : "text-gray-800"}`}>
              {now.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className={`text-xl font-bold tabular-nums ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
              {now.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className={`sticky top-3 z-30 mb-6 rounded-2xl border px-3 py-3 shadow-lg backdrop-blur sm:px-4 ${
          isDarkMode
            ? "border-slate-700/80 bg-slate-900/85"
            : "border-white/70 bg-white/85"
        }`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <motion.button
                onClick={handlePreviousMonth}
                className={`rounded-full border p-2 shadow-sm transition-colors duration-200 ${
                  isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Previous month"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.p 
                className={`min-w-44 text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={currentMonthLabel}
              >
                {currentMonthLabel}
              </motion.p>
              <motion.button
                onClick={handleNextMonth}
                className={`rounded-full border p-2 shadow-sm transition-colors duration-200 ${
                  isDarkMode
                    ? "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Next month"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={handleJumpToToday}
                className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm ${
                  isDarkMode
                    ? "border-sky-500/50 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30"
                    : "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100"
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <CalendarDays className="h-3.5 w-3.5" /> Today
              </motion.button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <motion.button
                onClick={triggerExport}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold shadow-sm ${
                  isDarkMode
                    ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                    : "border-gray-300 text-gray-700 hover:bg-white"
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-3.5 w-3.5" /> Export
              </motion.button>
              <motion.button
                onClick={() => importInputRef.current?.click()}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold shadow-sm ${
                  isDarkMode
                    ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                    : "border-gray-300 text-gray-700 hover:bg-white"
                }`}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-3.5 w-3.5" /> Import
              </motion.button>
              <div className={`inline-flex rounded-md border p-1 ${
                isDarkMode ? "border-slate-600 bg-slate-800" : "border-gray-300 bg-gray-50"
              }`}>
                {(["light", "dark", "auto"] as AppearanceMode[]).map((mode) => (
                  <motion.button
                    key={mode}
                    onClick={() => updateAppearanceMode(mode)}
                    className={`rounded px-2 py-1 text-xs font-semibold capitalize transition-colors ${
                      appearanceMode === mode
                        ? isDarkMode
                          ? "bg-slate-700 text-slate-100"
                          : "bg-white text-gray-900"
                        : isDarkMode
                          ? "text-slate-300 hover:bg-slate-700/70"
                          : "text-gray-600 hover:bg-white"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    {mode}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side: Hero + Image Controls (40% on desktop) */}
          <div className="w-full lg:w-2/5 flex flex-col gap-4 lg:sticky lg:top-28 self-start">
            <div className={`rounded-2xl shadow-lg overflow-hidden border ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-white/70 bg-white"}`}>
              <HeroSection
                currentMonth={calendarState.currentMonth}
                heroImageSrc={currentHeroImage.src}
                heroImageAlt={currentHeroImage.alt}
                themeColor={calendarState.themeColor}
                turnDirection={turnDirection}
                monthKey={monthKey}
              />

              {/* Image Carousel Controls */}
              <div className={`relative z-20 p-4 border-t ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                <p className={`mb-4 text-xs font-semibold tracking-wide ${isDarkMode ? "text-slate-300" : "text-gray-500"}`}>
                  Visual rail for {currentMonthLabel}. Change theme or image style below.
                </p>

                {/* Image Indicator Dots */}
                <motion.div 
                  className="flex justify-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {HERO_IMAGES.map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setHeroImageIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === calendarState.heroImageIndex
                          ? "w-6"
                          : isDarkMode
                            ? "w-2 bg-slate-600 hover:bg-slate-500"
                            : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                      style={
                        idx === calendarState.heroImageIndex
                          ? { backgroundColor: activeTheme.primary }
                          : undefined
                      }
                      aria-label={`Image ${idx + 1}`}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      layout
                    />
                  ))}
                </motion.div>
              </div>

              {/* Theme Selector */}
              <motion.div 
                className={`p-4 border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className={`text-xs font-semibold uppercase ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                    Theme Color
                  </p>
                  <motion.button
                    onClick={() => setAutoTheme(!autoThemeEnabled)}
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                      isDarkMode
                        ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {autoThemeEnabled ? "Auto from image: ON" : "Auto from image: OFF"}
                  </motion.button>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <p className={`min-w-20 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                    Appearance
                  </p>
                  <div className={`inline-flex rounded-md border p-1 ${
                    isDarkMode ? "border-slate-600 bg-slate-800" : "border-gray-300 bg-gray-50"
                  }`}>
                    {(["light", "dark", "auto"] as AppearanceMode[]).map((mode) => (
                      <motion.button
                        key={mode}
                        onClick={() => updateAppearanceMode(mode)}
                        className={`rounded px-2 py-1 text-xs font-semibold capitalize transition-colors ${
                          appearanceMode === mode
                            ? isDarkMode
                              ? "bg-slate-700 text-slate-100"
                              : "bg-white text-gray-900"
                            : isDarkMode
                              ? "text-slate-300 hover:bg-slate-700/70"
                              : "text-gray-600 hover:bg-white"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        layout
                      >
                        {mode}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, staggerChildren: 0.05 }}
                >
                  {(
                    ["blue", "warm", "cool", "neutral", "vibrant"] as ThemeColor[]
                  ).map((color, idx) => (
                    <motion.button
                      key={color}
                      onClick={() => setThemeColor(color)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 border-2 shadow-md ${
                        calendarState.themeColor === color
                          ? isDarkMode
                            ? "border-slate-100 scale-110"
                            : "border-gray-900 scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{
                        backgroundImage: THEME_COLORS[color].gradient,
                      }}
                      title={`${color} gradient theme`}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ 
                        scale: calendarState.themeColor === color ? 1.2 : 1.15,
                        boxShadow: "0 0 12px rgba(0,0,0,0.3)"
                      }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Right Side: Calendar Grid + Notes (60% on desktop) */}
          <div className="w-full lg:w-3/5">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-6">
                <div className="perspective-[1800px]">
              <AnimatePresence mode="wait" custom={turnDirection}>
                <motion.div
                  key={monthKey}
                  custom={turnDirection}
                  variants={pageTurnVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="space-y-6"
                >
                  {/* Calendar Grid */}
                  <CalendarGrid
                    currentMonth={calendarState.currentMonth}
                    startDate={calendarState.selectedStartDate}
                    endDate={calendarState.selectedEndDate}
                    onDateSelect={selectDate}
                    themeColor={calendarState.themeColor}
                    hasSavedNoteForDate={hasSavedNoteForDate}
                    isDarkMode={isDarkMode}
                    getMoodForDate={getDateMood}
                    getEnergyForDate={getEnergyForDate}
                    replayDateKey={replayDateKey}
                  />

                  {/* Selection Info */}
                  {selectionDetails && (
                    <div className={`p-4 rounded-lg shadow-md text-sm ${
                      isDarkMode ? "bg-slate-900" : "bg-white"
                    }`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className={isDarkMode ? "text-slate-200" : "text-gray-700"}>
                          <p className="font-semibold">
                            {selectionDetails.isRange ? "Selected Range" : "Selected Day"}
                          </p>
                          <p>{selectionDetails.startLabel}</p>
                          {selectionDetails.isRange && (
                            <p>to {selectionDetails.endLabel} ({selectionDetails.totalDays} days)</p>
                          )}
                          {!selectionDetails.isRange && selectionDetails.startSpecial && (
                            <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                              Special: {selectionDetails.startSpecial.label} ({selectionDetails.startSpecial.type})
                            </p>
                          )}
                          {selectionDetails.isRange && selectionDetails.specialInSelection.length > 0 && (
                            <p className={`text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                              Special in range: {selectionDetails.specialInSelection.join(", ")}
                            </p>
                          )}

                          {!selectionDetails.isRange && (
                            <motion.div 
                              className="mt-2 flex flex-wrap items-center gap-2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                                Day Mood
                              </span>
                              {(Object.keys(MOOD_META) as MoodType[]).map((mood, idx) => (
                                <motion.button
                                  key={mood}
                                  onClick={() => handleMoodSelect(mood)}
                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold transition ${
                                    selectedMood === mood
                                      ? "ring-2 ring-offset-1"
                                      : "opacity-85 hover:opacity-100"
                                  }`}
                                  style={{
                                    backgroundColor: `${MOOD_META[mood].color}20`,
                                    color: MOOD_META[mood].color,
                                    borderColor: `${MOOD_META[mood].color}55`,
                                  }}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: idx * 0.08 }}
                                  whileHover={{ scale: 1.08, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {MOOD_META[mood].label}
                                </motion.button>
                              ))}
                              <motion.button
                                onClick={() => handleMoodSelect(null)}
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  isDarkMode ? "text-slate-300" : "text-gray-600"
                                }`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.38 }}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Clear mood
                              </motion.button>
                            </motion.div>
                          )}
                        </div>

                        <motion.button
                          onClick={clearDateRange}
                          className={`px-3 py-1 rounded transition-colors duration-200 font-semibold ${
                            isDarkMode
                              ? "text-red-300 hover:bg-red-500/10"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
                </div>

            <div className={`rounded-lg border p-4 shadow-sm ${
              isDarkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
            }`}>
              <p className={`mb-2 text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}>
                Saved Selection Notes This Month
              </p>

              {savedSelectionNotes.length === 0 ? (
                <motion.p 
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No saved date/range notes for this month yet.
                </motion.p>
              ) : (
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {savedSelectionNotes.map((item, idx) => (
                    <motion.button
                      key={item.key}
                      onClick={() => openSavedSelection(item)}
                      className={`w-full rounded-md border px-3 py-2 text-left ${
                        isDarkMode
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4, scale: 1.01 }}
                    >
                      <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-800"}`}>{item.label}</p>
                      <p className={`line-clamp-1 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>{item.note}</p>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className={`relative overflow-hidden rounded-xl border p-4 shadow-sm ${
              isDarkMode
                ? "border-slate-700 bg-linear-to-br from-slate-900 to-slate-800"
                : "border-gray-200 bg-linear-to-br from-white to-sky-50"
            }`}>
              <div
                aria-hidden
                className={`pointer-events-none absolute -top-10 -right-8 h-28 w-28 rounded-full blur-2xl ${
                  isDarkMode ? "bg-sky-400/20" : "bg-sky-300/30"
                }`}
              />
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className={`text-sm font-semibold tracking-wide ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                  Advanced Planner Lab
                </p>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setIsReplayRunning((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold shadow-sm ${
                      isReplayRunning
                        ? "border-sky-400/60 bg-sky-500/20 text-sky-100"
                        : isDarkMode
                          ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                          : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isReplayRunning ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {isReplayRunning ? "Pause Replay" : "Month Replay"}
                  </motion.button>
                  <motion.button
                    onClick={triggerExport}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold shadow-sm ${
                      isDarkMode
                        ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                        : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </motion.button>
                  <motion.button
                    onClick={() => importInputRef.current?.click()}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold shadow-sm ${
                      isDarkMode
                        ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                        : "border-gray-300 text-gray-700 hover:bg-white"
                    }`}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="h-3.5 w-3.5" /> Import
                  </motion.button>
                </div>
              </div>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportBackup}
                className="hidden"
              />

              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <div className={`rounded-md p-3 ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                  <p className={`mb-1 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-300" : "text-gray-500"}`}>
                    Weekly Smart Summary
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>{weeklySummary}</p>
                </div>
                <div className={`rounded-md p-3 ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                  <p className={`mb-1 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-300" : "text-gray-500"}`}>
                    What Changed Since Last Week
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>{weekDelta}</p>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className={`rounded-md p-2 text-center ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                  <p className={`text-[11px] uppercase ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Active Days</p>
                  <p className={`text-sm font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>{storyCards.totalActiveDays}</p>
                </div>
                <div className={`rounded-md p-2 text-center ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                  <p className={`text-[11px] uppercase ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Top Day</p>
                  <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>{storyCards.topDay}</p>
                </div>
                <div className={`rounded-md p-2 text-center ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                  <p className={`text-[11px] uppercase ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Longest Streak</p>
                  <p className={`text-sm font-bold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>{storyCards.longestStreak}</p>
                </div>
                <div className={`rounded-md p-2 text-center ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                  <p className={`text-[11px] uppercase ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>Busiest Week</p>
                  <p className={`text-xs font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>{storyCards.busiestWeek}</p>
                </div>
              </div>

              <div className={`mb-3 rounded-md p-3 ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                <p className={`mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                  <AlertTriangle className="h-3.5 w-3.5" /> Plan Integrity Checker
                </p>
                {integrityWarnings.length === 0 ? (
                  <p className={`text-xs ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                    No risk signals right now. Plan balance looks healthy.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {integrityWarnings.map((warning) => (
                      <p
                        key={warning}
                        className={`text-xs ${isDarkMode ? "text-amber-200" : "text-amber-700"}`}
                      >
                        - {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className={`rounded-md p-3 ${isDarkMode ? "bg-slate-800/70" : "bg-gray-50"}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className={`inline-flex items-center gap-1 text-xs font-semibold uppercase ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                    <Search className="h-3.5 w-3.5" /> Quick Search
                  </p>
                  <button
                    onClick={() => setShowSearchResults((prev) => !prev)}
                    className={`text-xs font-semibold ${isDarkMode ? "text-sky-300" : "text-sky-700"}`}
                  >
                    {showSearchResults ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search notes..."
                  className={`w-full rounded-md border px-2 py-1 text-xs ${
                    isDarkMode
                      ? "border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
                      : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                  }`}
                />
                {showSearchResults && searchQuery.trim() && (
                  <div className="mt-2 max-h-28 space-y-1 overflow-y-auto">
                    {filteredNotes.length === 0 ? (
                      <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>No matches</p>
                    ) : (
                      filteredNotes.slice(0, 6).map((item) => (
                        <button
                          key={item.key}
                          onClick={() => openSavedSelection(item)}
                          className={`block w-full rounded px-2 py-1 text-left text-xs ${
                            isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
                          }`}
                        >
                          <p className={`font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>{item.label}</p>
                          <p className={`line-clamp-1 ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>{item.note}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className={`inline-flex items-center gap-1 text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                  <Sparkles className="h-3.5 w-3.5" /> Energy heatmap and mood markers are active on the grid.
                </p>
                <p className={`inline-flex items-center gap-1 text-xs ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                  <Keyboard className="h-3.5 w-3.5" /> Shortcuts: N = monthly note, / = search, Shift+Arrows = extend range.
                </p>
              </div>
            </div>

              </div>

              <div className="space-y-6 xl:sticky xl:top-28 self-start">
                <div className={`rounded-xl border p-3 ${
                  isDarkMode ? "border-slate-700 bg-slate-900/90" : "border-gray-200 bg-white/90"
                }`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    isDarkMode ? "text-slate-400" : "text-gray-500"
                  }`}>
                    Active selection
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-gray-900"}`}>
                    {selectionLabel}
                  </p>
                </div>

                <NotesSection
                  monthlyNotes={calendarState.monthlyNotes}
                  rangeNotes={selectionNoteText}
                  onMonthlyNotesChange={setMonthlyNotes}
                  onRangeNotesChange={handleSelectionNoteChange}
                  themeColor={calendarState.themeColor}
                  hasSelection={hasSelection}
                  selectionLabel={selectionLabel}
                  isDarkMode={isDarkMode}
                  monthlyTextareaRef={monthlyNotesRef}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
