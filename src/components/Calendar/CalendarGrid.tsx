"use client"

import { motion } from "framer-motion"
import { SPECIAL_DAYS, THEME_COLORS, WEEKDAY_LABELS } from "@/lib/constants"
import {
  formatSingleDateKey,
  getDaysInMonth,
  getFirstDayOfMonth,
  isEndDate,
  isDateInRange,
  isStartDate,
  isToday,
} from "@/lib/dateUtils"
import type { MoodType, ThemeColor } from "@/types/calendar"

interface CalendarGridProps {
  currentMonth: Date
  startDate: Date | null
  endDate: Date | null
  onDateSelect: (date: Date) => void
  themeColor: ThemeColor
  hasSavedNoteForDate?: (date: Date) => boolean
  isDarkMode: boolean
  getMoodForDate?: (date: Date) => MoodType | null
  getEnergyForDate?: (date: Date) => number
  replayDateKey?: string | null
}

export function CalendarGrid({
  currentMonth,
  startDate,
  endDate,
  onDateSelect,
  themeColor,
  hasSavedNoteForDate,
  isDarkMode,
  getMoodForDate,
  getEnergyForDate,
  replayDateKey,
}: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const themeStyle = THEME_COLORS[themeColor]

  const dates: (Date | null)[] = []

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    dates.push(null)
  }

  // Add all dates in the month
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  }

  const getDateClasses = (date: Date | null) => {
    if (!date) return ""

    const isStart = isStartDate(date, startDate, endDate)
    const isEnd = isEndDate(date, startDate, endDate)
    const inRange = isDateInRange(date, startDate, endDate)
    const isTodayDate = isToday(date)

    let classes =
      "relative w-full aspect-square flex items-center justify-center font-semibold rounded transition-all duration-200"

    if (isStart && !endDate) {
      classes += ` text-white font-bold rounded-lg`
      classes += ` transform hover:scale-105 cursor-pointer`
      return classes
    }

    if (isStart) {
      classes += ` rounded-l-lg text-white font-bold`
      classes += ` transform hover:scale-105 cursor-pointer`
      return classes + ` border-l-4 border-white`
    }

    if (isEnd) {
      classes += ` rounded-r-lg text-white font-bold`
      classes += ` transform hover:scale-105 cursor-pointer`
      return classes + ` border-r-4 border-white`
    }

    if (inRange && startDate && endDate) {
      classes += ` text-white font-bold`
      classes += ` transform hover:scale-105 cursor-pointer`
      return classes
    }

    // Regular date
    classes += ` cursor-pointer ${
      isDarkMode
        ? "text-slate-200 hover:bg-slate-800 hover:shadow-[0_0_0_1px_rgba(148,163,184,0.35)]"
        : "text-gray-800 hover:bg-gray-200 hover:shadow-[0_0_0_1px_rgba(148,163,184,0.35)]"
    }`

    if (isTodayDate) {
      classes += ` border-2 border-current font-bold`
    }

    return classes
  }

  const getDateBackgroundColor = (date: Date | null) => {
    if (!date) return ""

    const isStart = isStartDate(date, startDate, endDate)
    const isEnd = isEndDate(date, startDate, endDate)
    const inRange = isDateInRange(date, startDate, endDate)

    const isWeekendDate = date.getDay() === 0 || date.getDay() === 6

    if (isStart || isEnd) {
      return themeStyle.primary
    }

    if (inRange) {
      return isWeekendDate
        ? `color-mix(in srgb, ${themeStyle.primary} 72%, white)`
        : `color-mix(in srgb, ${themeStyle.primary} 60%, white)`
    }

    return ""
  }

  const getSpecialDay = (date: Date | null) => {
    if (!date) return null

    const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`
    return SPECIAL_DAYS[monthDay] || null
  }

  const getSpecialDayColor = (type: "holiday" | "national" | "international") => {
    if (type === "holiday") return "rgb(220, 38, 38)"
    if (type === "national") return "rgb(22, 163, 74)"
    return "rgb(124, 58, 237)"
  }

  const getSpecialDayAbbreviation = (type: "holiday" | "national" | "international") => {
    if (type === "holiday") return "H"
    if (type === "national") return "N"
    return "I"
  }

  const getRegularDateTextColor = (date: Date): string => {
    const isWeekendDate = date.getDay() === 0 || date.getDay() === 6
    if (isDarkMode) return isWeekendDate ? themeStyle.accent : "rgb(226, 232, 240)"
    return isWeekendDate ? themeStyle.accent : "rgb(31, 41, 55)"
  }

  const getMoodColor = (mood: MoodType) => {
    if (mood === "focused") return "rgb(37, 99, 235)"
    if (mood === "chill") return "rgb(14, 165, 233)"
    if (mood === "energetic") return "rgb(249, 115, 22)"
    return "rgb(168, 85, 247)"
  }

  return (
    <div className={`w-full p-4 sm:p-6 rounded-lg ${isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white"}`}>
      {/* Weekday Header */}
      <motion.div 
        className="grid grid-cols-7 gap-2 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {WEEKDAY_LABELS.map((label, idx) => (
          <motion.div
            key={label}
            className={`text-center font-bold text-sm sm:text-base ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.2 }}
          >
            {label}
          </motion.div>
        ))}
      </motion.div>

      {/* Calendar Grid */}
      <motion.div 
        className="grid grid-cols-7 gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, staggerChildren: 0.02, delayChildren: 0.1 }}
      >
        {dates.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square"
              />
            )
          }

          const classes = getDateClasses(date)
          const backgroundColor = getDateBackgroundColor(date)
          const specialDay = getSpecialDay(date)
          const hasSavedNote = hasSavedNoteForDate ? hasSavedNoteForDate(date) : false
          const mood = getMoodForDate ? getMoodForDate(date) : null
          const energy = getEnergyForDate ? getEnergyForDate(date) : 0
          const replayActive = replayDateKey === formatSingleDateKey(date)

          return (
            <motion.div
              key={date.toISOString()}
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              whileHover={{ y: -2 }}
            >
              <motion.button
                onClick={() => onDateSelect(date)}
                className={`${classes} relative overflow-hidden group`}
                style={
                  backgroundColor
                    ? {
                        backgroundColor,
                        boxShadow:
                          energy > 0
                            ? `inset 0 0 0 999px rgba(250, 204, 21, ${Math.min(0.32, energy * 0.12)})`
                            : undefined,
                        transform: replayActive ? "scale(1.06)" : undefined,
                      }
                    : {
                        color: getRegularDateTextColor(date),
                        boxShadow:
                          energy > 0
                            ? `inset 0 0 0 999px rgba(250, 204, 21, ${Math.min(0.28, energy * 0.12)})`
                            : undefined,
                        transform: replayActive ? "scale(1.06)" : undefined,
                      }
                }
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                title={
                  specialDay
                    ? `${specialDay.type[0].toUpperCase()}${specialDay.type.slice(1)}: ${specialDay.label}`
                    : mood
                      ? `Mood: ${mood}`
                      : undefined
                }
              >
                {/* Ripple Effect on Click */}
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
                  }}
                  initial={{ scale: 0, opacity: 0.6 }}
                  whileTap={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />

                <span className="relative z-10 font-bold">{date.getDate()}</span>

                {replayActive && (
                  <motion.span 
                    className="absolute inset-0 rounded-lg ring-2 ring-amber-300/80"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(250, 204, 21, 0.7)",
                        "0 0 0 8px rgba(250, 204, 21, 0)"
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Special Day Indicator */}
                {specialDay && (
                  <>
                    <motion.span
                      className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: getSpecialDayColor(specialDay.type) }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      title={`${specialDay.type}: ${specialDay.label}`}
                    />
                    <motion.span
                      className="absolute top-1 left-1 rounded px-1 text-[9px] font-bold leading-3 text-white"
                      style={{ backgroundColor: getSpecialDayColor(specialDay.type) }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      title={`${specialDay.type}: ${specialDay.label}`}
                    >
                      {getSpecialDayAbbreviation(specialDay.type)}
                    </motion.span>
                  </>
                )}

                {hasSavedNote && (
                  <motion.span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-3 rounded-full"
                    style={{ backgroundColor: themeStyle.primary }}
                    animate={{ 
                      opacity: [0.6, 1, 0.6],
                      scale: [0.8, 1, 0.8]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    title="Saved note exists for this date/range"
                  />
                )}

                {mood && (
                  <motion.span
                    className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: getMoodColor(mood) }}
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: 0.1 }}
                    title={`Mood: ${mood}`}
                  />
                )}
              </motion.button>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
