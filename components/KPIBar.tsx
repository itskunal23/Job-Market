'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { getImpactLevel, getPointsToNextLevel, getProgressToNextLevel } from '@/lib/impactPoints'

interface KPIBarProps {
  impactPoints: number
  hiringVelocity: number
  ghostingRate: number
}

export default function KPIBar({ impactPoints, hiringVelocity, ghostingRate }: KPIBarProps) {
  const currentLevel = getImpactLevel(impactPoints)
  const pointsToNext = getPointsToNextLevel(impactPoints)
  const progress = getProgressToNextLevel(impactPoints)

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
          <div className="p-3 bg-gradient-to-br from-cafe-accent to-cafe-accent-dark rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-cafe-dark opacity-60 font-sans uppercase tracking-wide">Impact Points</p>
              <span className="text-xs px-2 py-0.5 bg-cafe-accent/20 text-cafe-accent rounded-full font-medium">
                {currentLevel.icon} {currentLevel.name}
              </span>
            </div>
            <p className="text-3xl font-bold text-cafe-accent font-serif">{impactPoints}</p>
            <p className="text-xs text-cafe-dark opacity-50 mt-1 font-sans">Wins for your future self</p>
            {pointsToNext > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-cafe-dark opacity-60 mb-1">
                  <span>Progress to next level</span>
                  <span>{pointsToNext} points</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5">
                  <div
                    className="bg-cafe-accent h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hiring Velocity */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            hiringVelocity >= 0 ? 'bg-cafe-matcha/20' : 'bg-cafe-ghost/20'
          }`}>
            <TrendingUp className={`w-6 h-6 ${hiringVelocity >= 0 ? 'text-cafe-matcha' : 'text-cafe-ghost'}`} />
          </div>
          <div>
            <p className="text-xs text-cafe-dark opacity-60 mb-1 font-sans uppercase tracking-wide">Hiring Velocity</p>
            <p className={`text-3xl font-bold font-serif ${hiringVelocity >= 0 ? 'text-cafe-matcha' : 'text-cafe-ghost'}`}>
              {hiringVelocity > 0 ? '+' : ''}{hiringVelocity}%
            </p>
            <p className="text-xs text-cafe-dark opacity-50 mt-1 font-sans">Market pulse</p>
          </div>
        </div>

        {/* Ghosting Rate */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cafe-ghost/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-cafe-ghost" />
          </div>
          <div>
            <p className="text-xs text-cafe-dark opacity-60 mb-1 font-sans uppercase tracking-wide">Ghosting Rate</p>
            <p className="text-3xl font-bold text-cafe-ghost font-serif">
              +{ghostingRate}%
            </p>
            <p className="text-xs text-cafe-dark opacity-50 mt-1 font-sans">I'm filtering these out</p>
          </div>
        </div>
      </div>
      
      {/* Market Summary - RoleWithAI's Voice with Context */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="rolewithai-voice text-base mb-2 text-cafe-dark">
          <strong className="text-cafe-dark">RoleWithAI:</strong> "Hiring is {hiringVelocity >= 0 ? 'up' : 'down'} ({hiringVelocity > 0 ? '+' : ''}{hiringVelocity}%), but ghosting is still high. I'm filtering out the fake ones for you."
        </p>
        {/* Market Pulse Context - Contextual advice based on hiring velocity */}
        {hiringVelocity < -2 && (
          <p className="rolewithai-voice text-sm italic opacity-80 text-cafe-dark">
            The market is a bit quiet this week. It's a great time to focus on your studies and let RoleWithAI do the scouting.
          </p>
        )}
        {hiringVelocity >= 3 && (
          <p className="rolewithai-voice text-sm italic opacity-80 text-cafe-dark">
            There's good momentum right now. I'm prioritizing the highest-intent matches for you.
          </p>
        )}
      </div>
    </motion.div>
  )
}
