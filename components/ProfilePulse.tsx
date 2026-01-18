'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Sparkles } from 'lucide-react'
import { getImpactLevel, getPointsToNextLevel, getProgressToNextLevel } from '@/lib/impactPoints'
import CoffeeGauge from './CoffeeGauge'

interface ProfilePulseProps {
  impactPoints: number
  hiringVelocity: number
  lowStressMode?: boolean
  coffeeProgress?: number
  onCoffeeComplete?: () => void
}

export default function ProfilePulse({ 
  impactPoints, 
  hiringVelocity, 
  lowStressMode = false,
  coffeeProgress = 0,
  onCoffeeComplete
}: ProfilePulseProps) {
  // Calculate daily P&L (mock calculation based on hiring velocity)
  const dailyPnL = Math.round(hiringVelocity * impactPoints / 100)
  const isProfit = dailyPnL >= 0

  return (
    <div>
      {/* Account Value / Buying Power */}
      <div>
        <div className="mb-4">
          <h3 className="text-xs font-sans uppercase tracking-wider text-terminal-text/60 mb-2 font-semibold">
            TOTAL CAREER EQUITY
          </h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold font-mono mono-number ${impactPoints >= 100 ? 'neon-glow-green' : ''} text-terminal-text`}>
              {impactPoints.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-terminal-text/60 uppercase">CAPITAL</span>
          </div>
        </div>

        {/* Daily P&L */}
        <div className="border-t border-terminal-border pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-sans uppercase tracking-wider text-terminal-text/60 font-semibold">
              Daily P&L
            </span>
            <span className={`text-lg font-bold font-mono mono-number ${isProfit ? 'text-terminal-bullish neon-glow-green' : 'text-terminal-bearish neon-glow-red'}`}>
              {isProfit ? '+' : ''}{dailyPnL}
            </span>
          </div>
          <div className={`text-xs font-mono ${isProfit ? 'text-terminal-bullish' : 'text-terminal-bearish'}`}>
            {isProfit ? 'PROFIT' : 'LOSS'} • {hiringVelocity >= 0 ? '+' : ''}{hiringVelocity.toFixed(1)}% market velocity
          </div>
        </div>
      </div>
    </div>
  )
}
