export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface RangeNotes {
  [key: string]: string
}

export type MoodType = "focused" | "chill" | "energetic" | "reflective"

export interface DateMoods {
  [dateKey: string]: MoodType
}

export interface CalendarState {
  selectedStartDate: Date | null
  selectedEndDate: Date | null
  currentMonth: Date
  monthlyNotes: string
  rangeNotes: RangeNotes
  dateMoods: DateMoods
  heroImageIndex: number
  themeColor: ThemeColor
}

export type SelectionKind = "none" | "single" | "range"

export type ThemeColor =
  | "blue"
  | "warm"
  | "cool"
  | "neutral"
  | "vibrant"

export interface HeroImage {
  src: string
  alt: string
  dominantColor: ThemeColor
}
