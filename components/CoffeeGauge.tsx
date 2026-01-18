'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coffee } from 'lucide-react'

interface CoffeeGaugeProps {
  progress: number // 0-100
  onComplete?: () => void
}

export default function CoffeeGauge({ progress, onComplete }: CoffeeGaugeProps) {
  const isComplete = progress >= 100

  useEffect(() => {
    if (isComplete && onComplete) {
      // Show suggestion after a brief delay
      const timer = setTimeout(() => {
        onComplete()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, onComplete])

  return (
    <div className="rolewithai-card p-6 bg-cafe-bg">
      <div className="flex items-center gap-3 mb-4">
        <Coffee className="w-5 h-5 text-cafe-gold" />
        <h3 className="text-sm font-semibold text-cafe-dark font-serif">
          Your Daily Ritual
        </h3>
      </div>

      {/* Coffee Cup Visual */}
      <div className="relative w-full h-32 bg-gradient-to-b from-[#E5D5C5] to-[#D4C4B3] rounded-lg overflow-hidden border-2 border-cafe-gold/30">
        {/* Coffee Fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#6B4423] to-[#8B6F47]"
          style={{ height: `${progress}%` }}
        >
          {/* Crema Layer */}
          {progress > 0 && (
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#E0A458] to-transparent opacity-60" />
          )}
        </motion.div>

        {/* Cup Handle */}
        <div className="absolute right-0 top-8 w-8 h-16 border-2 border-cafe-gold/30 rounded-r-full" />

        {/* Progress Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-cafe-dark font-serif">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="text-xs text-cafe-dark/70 mt-3 text-center rolewithai-voice">
        {isComplete 
          ? "☕ You've done the work. Go take a 15-minute walk."
          : "Complete tasks to fill your cup"
        }
      </p>
    </div>
  )
}
