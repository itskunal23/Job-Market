'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, TrendingDown } from 'lucide-react'

interface MarketInsight {
  temperature: 'high' | 'medium' | 'low'
  message: string
  hiringChange: number
  ghostingChange: number
}

interface MorningBriefProps {
  insight: MarketInsight
}

export default function MorningBrief({ insight }: MorningBriefProps) {
  const getTemperatureIcon = () => {
    switch (insight.temperature) {
      case 'high':
        return <TrendingUp className="w-5 h-5 text-glow-500" />
      case 'medium':
        return <Sparkles className="w-5 h-5 text-marine-500" />
      case 'low':
        return <TrendingDown className="w-5 h-5 text-ochre-500" />
    }
  }

  // Group good news first (dopamine priming)
  const goodNews = insight.hiringChange > 0 
    ? `${Math.abs(insight.hiringChange)} companies are actively interviewing today.`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="floating-island p-8 breathe-bg relative"
    >
      <div className="flex items-start gap-4 relative z-10">
        <div className="mt-1">
          {getTemperatureIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-marine mb-3">
            Your Morning Brief
          </h3>
          <div className="space-y-2 mb-4">
            {goodNews && (
              <p className="text-glow-600 font-medium text-base">
                {goodNews}
              </p>
            )}
            <p className="rolewithai-voice text-slate-600">
              {insight.message}
            </p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <span>
              Hiring: {insight.hiringChange > 0 ? '+' : ''}
              {insight.hiringChange}% today
            </span>
            <span>
              Ghosting: {insight.ghostingChange > 0 ? '+' : ''}
              {insight.ghostingChange}% this week
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
