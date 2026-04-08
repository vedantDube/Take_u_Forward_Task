import type { HeroImage } from "@/types/calendar"

export const HERO_IMAGES: HeroImage[] = [
  {
    src: "/images/hero/hero-01.jpg",
    alt: "Mountain climber on rocky terrain",
    dominantColor: "warm",
  },
  {
    src: "/images/hero/hero-02.jpg",
    alt: "Mountain landscape with clouds",
    dominantColor: "cool",
  },
  {
    src: "/images/hero/hero-03.jpg",
    alt: "Forest path with tall trees",
    dominantColor: "neutral",
  },
  {
    src: "/images/hero/hero-04.jpg",
    alt: "Sunset over mountain peaks",
    dominantColor: "vibrant",
  },
  {
    src: "/images/hero/hero-05.jpg",
    alt: "Snowy mountain valley",
    dominantColor: "cool",
  },
  {
    src: "/images/hero/hero-06.jpg",
    alt: "Golden desert dunes",
    dominantColor: "warm",
  },
  {
    src: "/images/hero/hero-07.jpg",
    alt: "Green alpine meadow",
    dominantColor: "neutral",
  },
  {
    src: "/images/hero/hero-08.jpg",
    alt: "Foggy lake in the morning",
    dominantColor: "cool",
  },
  {
    src: "/images/hero/hero-09.jpg",
    alt: "Ocean waves and beach",
    dominantColor: "vibrant",
  },
  {
    src: "/images/hero/hero-10.jpg",
    alt: "Dense forest canopy",
    dominantColor: "neutral",
  },
  {
    src: "/images/hero/hero-11.jpg",
    alt: "Aurora in night sky",
    dominantColor: "vibrant",
  },
  {
    src: "/images/hero/hero-12.jpg",
    alt: "Mountain ridge at sunrise",
    dominantColor: "warm",
  },
  {
    src: "/images/hero/hero-13.jpg",
    alt: "Blue lake and mountain reflections",
    dominantColor: "cool",
  },
  {
    src: "/images/hero/hero-14.jpg",
    alt: "Rolling hills with sunrise light",
    dominantColor: "warm",
  },
  {
    src: "/images/hero/hero-15.jpg",
    alt: "Snow peaks against clear sky",
    dominantColor: "cool",
  },
  {
    src: "/images/hero/hero-16.jpg",
    alt: "Winding road through mountains",
    dominantColor: "neutral",
  },
  {
    src: "/images/hero/hero-17.jpg",
    alt: "Autumn forest and valley",
    dominantColor: "warm",
  },
  {
    src: "/images/hero/hero-18.jpg",
    alt: "River flowing through green canyon",
    dominantColor: "neutral",
  },
  {
    src: "/images/hero/hero-19.jpg",
    alt: "Cliffside landscape and clouds",
    dominantColor: "cool",
  },
  {
    src: "/images/hero/hero-20.jpg",
    alt: "Tropical coastline view",
    dominantColor: "vibrant",
  },
  {
    src: "/images/hero/hero-21.jpg",
    alt: "Morning sun through pine forest",
    dominantColor: "neutral",
  },
  {
    src: "/images/hero/hero-22.jpg",
    alt: "Desert landscape with dramatic clouds",
    dominantColor: "warm",
  },
  {
    src: "/images/hero/hero-23.jpg",
    alt: "Grand mountain vista",
    dominantColor: "cool",
  },
  {
    src: "/images/hero/hero-24.jpg",
    alt: "Forest trail with sunlight",
    dominantColor: "neutral",
  },
]

export const THEME_COLORS = {
  blue: {
    primary: "rgb(14, 165, 233)",
    secondary: "rgb(226, 232, 240)",
    accent: "rgb(30, 144, 255)",
    gradient: "linear-gradient(135deg, rgb(56, 189, 248), rgb(29, 78, 216))",
  },
  warm: {
    primary: "rgb(251, 146, 60)",
    secondary: "rgb(255, 245, 230)",
    accent: "rgb(234, 88, 12)",
    gradient: "linear-gradient(135deg, rgb(253, 186, 116), rgb(234, 88, 12))",
  },
  cool: {
    primary: "rgb(99, 102, 241)",
    secondary: "rgb(230, 230, 250)",
    accent: "rgb(79, 70, 229)",
    gradient: "linear-gradient(135deg, rgb(129, 140, 248), rgb(79, 70, 229))",
  },
  neutral: {
    primary: "rgb(107, 114, 128)",
    secondary: "rgb(243, 244, 246)",
    accent: "rgb(75, 85, 99)",
    gradient: "linear-gradient(135deg, rgb(156, 163, 175), rgb(75, 85, 99))",
  },
  vibrant: {
    primary: "rgb(217, 70, 239)",
    secondary: "rgb(250, 235, 255)",
    accent: "rgb(190, 24, 93)",
    gradient: "linear-gradient(135deg, rgb(232, 121, 249), rgb(190, 24, 93))",
  },
}

export const WEEKDAY_LABELS = [
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
]

export type SpecialDayType = "holiday" | "national" | "international"

export interface SpecialDay {
  label: string
  type: SpecialDayType
}

export const SPECIAL_DAYS: Record<string, SpecialDay> = {
  "01-01": { label: "New Year", type: "holiday" },
  "01-12": { label: "National Youth Day", type: "national" },
  "01-26": { label: "Republic Day", type: "national" },
  "03-08": { label: "International Women's Day", type: "international" },
  "03-22": { label: "World Water Day", type: "international" },
  "03-29": { label: "Good Friday", type: "holiday" },
  "04-07": { label: "World Health Day", type: "international" },
  "04-11": { label: "Eid ul-Fitr", type: "holiday" },
  "04-17": { label: "Ram Navami", type: "holiday" },
  "04-21": { label: "Mahavir Jayanti", type: "holiday" },
  "05-01": { label: "Labour Day", type: "international" },
  "06-05": { label: "World Environment Day", type: "international" },
  "08-15": { label: "Independence Day", type: "national" },
  "08-29": { label: "National Sports Day", type: "national" },
  "09-05": { label: "Teachers' Day", type: "national" },
  "09-16": { label: "Milad un-Nabi", type: "holiday" },
  "10-02": { label: "Gandhi Jayanti", type: "national" },
  "10-12": { label: "Dussehra", type: "holiday" },
  "10-31": { label: "Diwali", type: "holiday" },
  "11-14": { label: "Children's Day", type: "national" },
  "12-25": { label: "Christmas", type: "holiday" },
}

export function getSpecialDaysForMonth(monthDate: Date): Array<
  SpecialDay & {
    key: string
    day: number
  }
> {
  const month = String(monthDate.getMonth() + 1).padStart(2, "0")

  return Object.entries(SPECIAL_DAYS)
    .filter(([key]) => key.startsWith(`${month}-`))
    .map(([key, value]) => ({
      key,
      day: Number(key.split("-")[1]),
      ...value,
    }))
    .sort((a, b) => a.day - b.day)
}

export function getSpecialDayForDate(date: Date): SpecialDay | null {
  const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`
  return SPECIAL_DAYS[key] || null
}
