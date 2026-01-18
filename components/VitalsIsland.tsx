'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useState, useEffect } from 'react'

interface VitalsIslandProps {
  hiringVelocity: number
  ghostingRate: number
  impactPoints: number
}

export default function VitalsIsland({ hiringVelocity, ghostingRate, impactPoints }: VitalsIslandProps) {
  const [timeGreeting, setTimeGreeting] = useState('')
  const [updateMinutes, setUpdateMinutes] = useState(12)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setTimeGreeting('Good morning')
    } else if (hour < 17) {
      setTimeGreeting('Good afternoon')
    } else {
      setTimeGreeting('Good evening')
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rolewithai-card mb-8"
    >
      {/* Greeting with Time-Anchoring */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-marine mb-2">
            {timeGreeting}. We have {updateMinutes} minutes of career updates today.
          </h2>
          <p className="text-softslate-500 text-sm">
            Time-anchored updates to help you prioritize
          </p>
        </div>
        {/* Impact Points - Glowing number */}
        <div className="text-right">
          <p className="text-xs text-softslate-400 mb-1">Impact Points</p>
          <p className="text-3xl font-bold impact-gradient">{impactPoints}</p>
        </div>
      </div>

      {/* Vitals - Two Clean Circles */}
      <div className="flex gap-6">
        {/* Hiring Velocity */}
        <div className="flex-1">
          <div className="rolewithai-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-marine-50 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className={`w-8 h-8 ${hiringVelocity >= 0 ? 'text-glow-500' : 'text-marine-500'}`} />
            </div>
            <p className="text-xs text-softslate-500 mb-1">Hiring Velocity</p>
            <p className={`text-2xl font-bold ${hiringVelocity >= 0 ? 'text-glow-500' : 'text-marine-500'}`}>
              {hiringVelocity > 0 ? '+' : ''}{hiringVelocity}%
            </p>
          </div>
        </div>

        {/* Ghosting Rate */}
        <div className="flex-1">
          <div className="rolewithai-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-sand-50 flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-8 h-8 text-sand-500" />
            </div>
            <p className="text-xs text-softslate-500 mb-1">Ghosting Rate</p>
            <p className="text-2xl font-bold text-sand-500">
              +{ghostingRate}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
