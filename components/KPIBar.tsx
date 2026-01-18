'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'

interface KPIBarProps {
  impactPoints: number
  hiringVelocity: number
  ghostingRate: number
}

export default function KPIBar({ impactPoints, hiringVelocity, ghostingRate }: KPIBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="rolewithai-card mb-8"
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Impact Points - Wins for Future Self */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-crema to-crema-400 rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-espresso opacity-60 mb-1 font-sans uppercase tracking-wide">Impact Points</p>
            <p className="text-3xl font-bold text-crema font-serif">{impactPoints}</p>
            <p className="text-xs text-espresso opacity-50 mt-1 font-sans">Wins for your future self</p>
          </div>
        </div>

        {/* Hiring Velocity */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            hiringVelocity >= 0 ? 'bg-crema-50' : 'bg-coldbrew-50'
          }`}>
            <TrendingUp className={`w-6 h-6 ${hiringVelocity >= 0 ? 'text-crema' : 'text-coldbrew'}`} />
          </div>
          <div>
            <p className="text-xs text-espresso opacity-60 mb-1 font-sans uppercase tracking-wide">Hiring Velocity</p>
            <p className={`text-3xl font-bold font-serif ${hiringVelocity >= 0 ? 'text-crema' : 'text-coldbrew'}`}>
              {hiringVelocity > 0 ? '+' : ''}{hiringVelocity}%
            </p>
            <p className="text-xs text-espresso opacity-50 mt-1 font-sans">Market pulse</p>
          </div>
        </div>

        {/* Ghosting Rate */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-coldbrew-50 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-coldbrew" />
          </div>
          <div>
            <p className="text-xs text-espresso opacity-60 mb-1 font-sans uppercase tracking-wide">Ghosting Rate</p>
            <p className="text-3xl font-bold text-coldbrew font-serif">
              +{ghostingRate}%
            </p>
            <p className="text-xs text-espresso opacity-50 mt-1 font-sans">I'm filtering these out</p>
          </div>
        </div>
      </div>
      
      {/* Market Summary - RoleWithAI's Voice with Context */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="rolewithai-voice text-base mb-2">
          <strong className="text-espresso">RoleWithAI:</strong> "Hiring is {hiringVelocity >= 0 ? 'up' : 'down'} ({hiringVelocity > 0 ? '+' : ''}{hiringVelocity}%), but ghosting is still high. I'm filtering out the fake ones for you."
        </p>
        {/* Market Pulse Context - Contextual advice based on hiring velocity */}
        {hiringVelocity < -2 && (
          <p className="rolewithai-voice text-sm italic opacity-80">
            The market is a bit quiet this week. It's a great time to focus on your studies and let RoleWithAI do the scouting.
          </p>
        )}
        {hiringVelocity >= 3 && (
          <p className="rolewithai-voice text-sm italic opacity-80">
            There's good momentum right now. I'm prioritizing the highest-intent matches for you.
          </p>
        )}
      </div>
    </motion.div>
  )
}
