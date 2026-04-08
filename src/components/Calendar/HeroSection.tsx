"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Tilt from "react-parallax-tilt"
import { getMonthName, getYearString } from "@/lib/dateUtils"
import { THEME_COLORS } from "@/lib/constants"
import type { ThemeColor } from "@/types/calendar"

interface HeroSectionProps {
  currentMonth: Date
  heroImageSrc: string
  heroImageAlt: string
  themeColor: ThemeColor
  turnDirection: 1 | -1
  monthKey: string
}

export function HeroSection({
  currentMonth,
  heroImageSrc,
  heroImageAlt,
  themeColor,
  turnDirection,
  monthKey,
}: HeroSectionProps) {
  const monthName = getMonthName(currentMonth).toUpperCase()
  const year = getYearString(currentMonth)
  const themeStyle = THEME_COLORS[themeColor]
  const [isHovered, setIsHovered] = useState(false)

  const liveEffect = useMemo(() => {
    const descriptor = heroImageAlt.toLowerCase()

    if (/(ocean|beach|coast|coastline|tropical|waves?|sea|surf|lagoon)/.test(descriptor)) {
      return "waves"
    }

    if (/(sunset|sunrise|aurora|golden|dawn|dusk)/.test(descriptor)) {
      return "glow"
    }

    if (/(fog|mist|cloud|clouds|lake|valley|river|rain|misty)/.test(descriptor)) {
      return "mist"
    }

    if (/(forest|trees|pine|jungle|meadow|hills|trail|wood)/.test(descriptor)) {
      return "forest"
    }

    return "default"
  }, [heroImageAlt])

  return (
    <div className="relative w-full overflow-hidden bg-gray-100 shadow-lg pt-8">
      <div className="absolute top-1 left-0 right-0 z-10 flex justify-center gap-2 sm:gap-3">
        {Array.from({ length: 16 }).map((_, idx) => (
          <span
            key={`ring-${idx}`}
            className="h-3 w-1.5 sm:h-4 sm:w-2 rounded-b-full bg-slate-700/85"
          />
        ))}
      </div>

      {/* Background Image */}
      <div
        className="group relative h-72 sm:h-104 md:h-136 w-full overflow-hidden bg-gray-300 border-t border-slate-300 perspective-[1600px]"
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <Tilt
          className="absolute inset-0"
          tiltEnable={isHovered}
          tiltMaxAngleX={12}
          tiltMaxAngleY={12}
          perspective={1200}
          scale={1.03}
          transitionSpeed={1400}
          glareEnable={isHovered}
          glareMaxOpacity={0.18}
          glareColor="rgba(255,255,255,0.45)"
          gyroscope={false}
        >
          <AnimatePresence mode="wait" custom={turnDirection}>
            <motion.div
              key={`${monthKey}-${heroImageSrc}`}
              custom={turnDirection}
              initial={{
                opacity: 0,
                rotateY: turnDirection === 1 ? -76 : 76,
                x: turnDirection === 1 ? 18 : -18,
                filter: "blur(1.5px)",
                transformOrigin: turnDirection === 1 ? "left center" : "right center",
              }}
              animate={{
                opacity: 1,
                rotateY: 0,
                x: 0,
                filter: "blur(0px)",
                transformOrigin: "center center",
              }}
              exit={{
                opacity: 0,
                rotateY: turnDirection === 1 ? 76 : -76,
                x: turnDirection === 1 ? -18 : 18,
                filter: "blur(1.5px)",
                transformOrigin: turnDirection === 1 ? "right center" : "left center",
              }}
              transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImageSrc}
                alt={heroImageAlt || `${monthName} ${year}`}
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                quality={78}
                fetchPriority="high"
                className={`object-cover transition-transform duration-700 ease-out ${
                  isHovered ? "scale-[1.06]" : "scale-100"
                }`}
                priority
                style={{ cursor: "default" }}
              />
            </motion.div>
          </AnimatePresence>
        </Tilt>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          animate={
            isHovered
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {liveEffect === "waves" && (
            <>
              <motion.div
                className="absolute inset-x-0 bottom-0 h-2/5 opacity-70"
                style={{
                  background:
                    "linear-gradient(to top, rgba(14, 116, 144, 0.46), rgba(59, 130, 246, 0.16) 36%, transparent 100%)",
                  mixBlendMode: "screen",
                }}
                animate={{
                  y: [0, -4, 0],
                  backgroundPositionX: [0, 120, 0],
                }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-x-[-10%] bottom-[6%] h-20 opacity-75"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 16px, rgba(59,130,246,0.1) 16px 28px, rgba(255,255,255,0.02) 28px 40px)",
                  filter: "blur(2px)",
                }}
                animate={{
                  x: [0, 36, 0],
                  y: [0, -3, 0],
                }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute right-8 top-8 h-20 w-20 rounded-full bg-yellow-200/70 blur-[2px]"
                animate={{
                  x: [0, 10, 0],
                  y: [0, -6, 0],
                  scale: [1, 1.06, 1],
                }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          {liveEffect === "glow" && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 78% 22%, rgba(253, 224, 71, 0.36), transparent 26%), linear-gradient(to top, rgba(251, 146, 60, 0.22), transparent 42%)",
              }}
              animate={{ opacity: [0.7, 1, 0.75] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {liveEffect === "mist" && (
            <>
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(255,255,255,0.18), transparent 34%)",
                }}
                animate={{ opacity: [0.45, 0.72, 0.48] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-x-[-12%] top-1/3 h-28 bg-white/25 blur-3xl"
                animate={{ x: [0, 28, 0], y: [0, -6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          {liveEffect === "forest" && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(16, 185, 129, 0.14), transparent 45%), radial-gradient(circle at 80% 18%, rgba(253, 224, 71, 0.16), transparent 22%)",
              }}
              animate={{ opacity: [0.55, 0.85, 0.6] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {liveEffect === "default" && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(255,255,255,0.12), transparent 30%)",
              }}
              animate={{ opacity: [0.35, 0.58, 0.4] }}
              transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </div>

      {/* Diagonal Banner Overlay */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 sm:h-20 md:h-16 transform -skew-y-3 origin-bottom-right"
        style={{
          backgroundImage: themeStyle.gradient,
          backgroundColor: themeStyle.primary,
        }}
      >
        {/* Month/Year Text */}
        <div className="absolute bottom-2 sm:bottom-2 right-5 sm:right-7 text-white text-right transform skew-y-3">
          <p className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">{year}</p>
          <p className="text-2xl sm:text-2xl md:text-3xl font-black tracking-widest leading-none">
            {monthName}
          </p>
        </div>
      </div>
    </div>
  )
}
