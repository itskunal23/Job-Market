'use client'

import { motion } from 'framer-motion'
import { Sparkles, Award } from 'lucide-react'
import { useState } from 'react'

export default function ImpactPoints() {
  const [points, setPoints] = useState(127)
  const [showNotification, setShowNotification] = useState(false)

  const handleReportGhosting = () => {
    const newPoints = points + 10
    setPoints(newPoints)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="floating-island p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-marine-500 to-glow-500 rounded-full">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Impact Points</p>
              <p className="text-3xl font-bold impact-gradient">{points}</p>
            </div>
          </div>
          <button
            onClick={handleReportGhosting}
            className="rounded-full px-6 py-3 bg-marine-500 text-white hover:bg-marine-600 text-sm font-semibold flex items-center gap-2 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            Report Ghosting
          </button>
        </div>
      </motion.div>

      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-3 left-0 right-0 floating-island p-4"
        >
          <p className="text-sm text-slate-700">
            <strong className="text-glow-600">+10 Impact Points!</strong> Thank you for helping the community.
          </p>
        </motion.div>
      )}
    </div>
  )
}
