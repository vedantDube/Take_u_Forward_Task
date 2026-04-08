"use client"

import React, { useState, useCallback } from "react"
import { THEME_COLORS } from "@/lib/constants"
import type { ThemeColor } from "@/types/calendar"

interface NotesSectionProps {
  monthlyNotes: string
  rangeNotes: string
  onMonthlyNotesChange: (notes: string) => void
  onRangeNotesChange: (notes: string) => void
  themeColor: ThemeColor
  hasSelection: boolean
  selectionLabel: string
  isDarkMode: boolean
  monthlyTextareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

export function NotesSection({
  monthlyNotes,
  rangeNotes,
  onMonthlyNotesChange,
  onRangeNotesChange,
  themeColor,
  hasSelection,
  selectionLabel,
  isDarkMode,
  monthlyTextareaRef,
}: NotesSectionProps) {
  const [activeTab, setActiveTab] = useState<"monthly" | "range">(
    "monthly"
  )
  const themeStyle = THEME_COLORS[themeColor]

  const handleMonthlyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onMonthlyNotesChange(e.target.value)
    },
    [onMonthlyNotesChange]
  )

  const handleRangeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onRangeNotesChange(e.target.value)
    },
    [onRangeNotesChange]
  )

  return (
    <div className={`w-full rounded-2xl shadow-md overflow-hidden border ${isDarkMode ? "bg-slate-900/95 border-slate-700" : "bg-white/95 border-white/70"}`}>
      {/* Tab Selector */}
      <div className={`flex border-b ${isDarkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50/70"}`}>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`flex-1 px-4 py-3 text-sm sm:text-base font-semibold transition-all duration-200 ${
            activeTab === "monthly"
              ? "border-b-2"
              : isDarkMode
                ? "text-slate-300 hover:text-slate-100"
                : "text-gray-600 hover:text-gray-900"
          }`}
          style={
            activeTab === "monthly"
              ? {
                  backgroundColor: themeStyle.primary,
                  borderBottomColor: themeStyle.primary,
                  color: isDarkMode ? "#0f172a" : "white",
                }
              : {}
          }
        >
          Month Notes
        </button>

        <button
          onClick={() => setActiveTab("range")}
          disabled={!hasSelection}
          className={`flex-1 px-4 py-3 text-sm sm:text-base font-semibold transition-all duration-200 ${
            activeTab === "range"
              ? "border-b-2"
              : isDarkMode
                ? "text-slate-300"
                : "text-gray-600"
          } ${!hasSelection ? "opacity-50 cursor-not-allowed" : isDarkMode ? "hover:text-slate-100" : "hover:text-gray-900"}`}
          style={
            activeTab === "range" && hasSelection
              ? {
                  backgroundColor: themeStyle.primary,
                  borderBottomColor: themeStyle.primary,
                  color: isDarkMode ? "#0f172a" : "white",
                }
              : {}
          }
        >
          Range Notes
        </button>
      </div>

      {/* Content */}
      <div className={`p-4 sm:p-6 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        {activeTab === "monthly" ? (
          <div>
            <label
              htmlFor="monthly-notes"
              className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}
            >
              Notes For Current Month
            </label>
            <textarea
              ref={monthlyTextareaRef}
              id="monthly-notes"
              value={monthlyNotes}
              onChange={handleMonthlyChange}
              placeholder="Add notes for this month..."
              maxLength={500}
              className={`w-full h-40 sm:h-48 p-3 border-2 rounded-lg font-mono text-sm focus:outline-none transition-all duration-200 ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                  : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400"
              }`}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = themeStyle.primary
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDarkMode ? "#334155" : "#d1d5db"
              }}
            />
            <p className={`text-xs mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              {monthlyNotes.length}/500 characters
            </p>
          </div>
        ) : (
          <div>
            {hasSelection ? (
              <>
                <label
                  htmlFor="range-notes"
                  className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}
                >
                  Notes For {selectionLabel}
                </label>
                <textarea
                  id="range-notes"
                  value={rangeNotes}
                  onChange={handleRangeChange}
                  placeholder="Add notes for your selected date or range..."
                  maxLength={500}
                  className={`w-full h-40 sm:h-48 p-3 border-2 rounded-lg font-mono text-sm focus:outline-none transition-all duration-200 ${
                    isDarkMode
                      ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
                      : "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400"
                  }`}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = themeStyle.primary
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isDarkMode ? "#334155" : "#d1d5db"
                  }}
                />
                <p className={`text-xs mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {rangeNotes.length}/500 characters
                </p>
              </>
            ) : (
              <p className={`text-center py-8 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                Select a date or date range to add selection-specific notes
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
