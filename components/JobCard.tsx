'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, TrendingUp, TrendingDown, ArrowUpRight, Archive } from 'lucide-react'
import { useState } from 'react'
import { getRoleWithAIApplicationAdvice } from '@/lib/roleWithAIResponses'
import Sparkline from './Sparkline'
import AnimatedNumber from './AnimatedNumber'

interface GhostSignal {
  recruiterActivity: 'none' | 'low' | 'moderate' | 'high'
  repostFrequency: 'none' | 'low' | 'moderate' | 'high'
  sentiment: 'negative' | 'neutral' | 'positive'
  overallScore: number
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  truthScore: number
  ghostRisk: 'low' | 'medium' | 'high'
  insight: string
  postedDaysAgo: number
  recruiterActivity: string
  ghostSignals?: GhostSignal
  // Stock market data
  ticker?: string
  dailyChange?: number
  sevenDayTrend?: number[]
}

interface JobCardProps {
  job: Job
  onBuy?: (job: Job) => void
  onShort?: (job: Job) => void
}

// Generate ticker from company name
const getTicker = (company: string): string => {
  const words = company.split(' ')
  if (words.length === 1) {
    return company.substring(0, 4).toUpperCase().padEnd(4, 'X')
  }
  return words.map(w => w[0]).join('').toUpperCase().padEnd(4, 'X').substring(0, 4)
}

// Generate mock 7-day trend
const generateTrend = (currentScore: number): number[] => {
  const trend = []
  const volatility = 5
  for (let i = 6; i >= 0; i--) {
    const daysAgo = i
    const baseScore = currentScore - (Math.random() * volatility * 2 - volatility)
    trend.push(Math.max(0, Math.min(100, baseScore)))
  }
  return trend
}

export default function JobCard({ job, onBuy, onShort }: JobCardProps) {
  const [showRoleWithAIChat, setShowRoleWithAIChat] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [showShortMessage, setShowShortMessage] = useState(false)
  const [showBuyMessage, setShowBuyMessage] = useState(false)

  const ticker = job.ticker || getTicker(job.company)
  const dailyChange = job.dailyChange ?? (Math.random() * 10 - 5) // Mock change between -5 and +5
  const changePercent = (dailyChange / job.truthScore) * 100
  const sevenDayTrend = job.sevenDayTrend || generateTrend(job.truthScore)
  
  const isLowTruth = job.truthScore < 40
  const isHighTruth = job.truthScore >= 80
  const isBullish = dailyChange >= 0
  const isBearish = dailyChange < 0

  // Check if company is shorted (hidden)
  const isShorted = () => {
    if (typeof window === 'undefined') return false
    const shortedCompanies = JSON.parse(localStorage.getItem('shorted_companies') || '[]')
    return shortedCompanies.includes(job.company.toLowerCase())
  }

  const handleBuy = () => {
    setShowBuyMessage(true)
    // Add to applications (Open Positions)
    if (onBuy) {
      onBuy(job)
    }
    // Show "Optimizing Resume" message
    setTimeout(() => {
      setShowBuyMessage(false)
    }, 3000)
  }

  const handleShort = () => {
    // Add company to shorted list (never show again)
    if (typeof window !== 'undefined') {
      const shortedCompanies = JSON.parse(localStorage.getItem('shorted_companies') || '[]')
      if (!shortedCompanies.includes(job.company.toLowerCase())) {
        shortedCompanies.push(job.company.toLowerCase())
        localStorage.setItem('shorted_companies', JSON.stringify(shortedCompanies))
      }
    }
    
    setShowShortMessage(true)
    setIsFading(true)
    
    if (onShort) {
      onShort(job)
    }
    
    setTimeout(() => {
      // Card will fade out
    }, 2000)
  }

  // Don't render if company is shorted
  if (isShorted()) {
    return null
  }

  return (
    <AnimatePresence>
      {!isFading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLowTruth ? 0.75 : 1, y: 0 }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)', scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={`job-card ${
            isHighTruth 
              ? 'border-l-2 border-terminal-bullish bg-terminal-panel' 
              : isBearish 
              ? 'border-l-2 border-terminal-bearish bg-terminal-panel'
              : 'border-terminal-border'
          }`}
        >
          {/* Terminal-Style Header Row */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-terminal-border">
            <div className="flex items-center gap-4">
              {/* Ticker Symbol */}
              <div className="flex flex-col">
                <span className="text-lg font-bold text-terminal-text uppercase tracking-wider font-mono">
                  {ticker}
                </span>
                <span className="text-xs text-terminal-text/60 font-mono">
                  {job.company}
                </span>
              </div>
              
              {/* Market Price & Delta */}
              <div className="flex items-baseline gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-terminal-text/60 font-mono uppercase tracking-wide">
                    Market Price
                  </span>
                  <span className={`text-3xl font-bold font-mono mono-number ${
                    isBullish ? 'text-terminal-bullish' : 'text-terminal-bearish'
                  }`}>
                    <AnimatedNumber value={job.truthScore} decimals={1} />
                  </span>
                </div>
                
                {/* Daily Change */}
                <div className="flex flex-col">
                  <span className="text-xs text-terminal-text/60 font-mono uppercase tracking-wide">
                    Δ 24h
                  </span>
                  <div className={`flex items-center gap-1 ${isBullish ? 'text-terminal-bullish' : 'text-terminal-bearish'}`}>
                    {isBullish ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-xl font-bold font-mono mono-number">
                      {dailyChange >= 0 ? '+' : ''}
                      <AnimatedNumber value={dailyChange} decimals={1} />
                    </span>
                    <span className="text-sm font-mono mono-number opacity-80">
                      ({changePercent >= 0 ? '+' : ''}
                      <AnimatedNumber value={changePercent} decimals={1} />%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="flex flex-col items-end">
              <span className="text-xs text-terminal-text/60 font-mono uppercase tracking-wide mb-1">
                7d Trend
              </span>
              <Sparkline 
                data={sevenDayTrend} 
                width={100} 
                height={30}
                color={isBullish ? '#00FF00' : '#FF3333'}
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-terminal-text mb-1 font-mono">
              {job.title}
            </h3>
            <p className="text-xs text-terminal-text/70 font-mono mb-2">
              {job.location} • Posted {job.postedDaysAgo}d ago
            </p>
            
            {/* Market Insight */}
            <div className="mt-3 p-3 bg-terminal-dark-gray border border-terminal-border">
              <p className="text-xs text-terminal-text/80 font-mono">
                {job.insight}
              </p>
            </div>
          </div>

          {/* Market Volatility Warning */}
          {job.ghostRisk === 'high' && (
            <div className="mb-4 p-3 bg-terminal-panel border border-terminal-bearish">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-terminal-bearish mt-0.5 flex-shrink-0" />
                <p className="text-xs text-terminal-bearish font-mono uppercase">
                  ⚠️ MARKET VOLATILITY WARNING: {job.recruiterActivity}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons - Trading Floor Style */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-terminal-border">
            {isHighTruth ? (
              <button
                onClick={() => setShowRoleWithAIChat(!showRoleWithAIChat)}
                className="action-primary flex-1 flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                BUY (LONG POSITION)
              </button>
            ) : (
              <button
                onClick={handleShort}
                className="action-skip flex-1 flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" />
                SHORT (BET AGAINST)
              </button>
            )}
          </div>

          {/* Short Success Message */}
          <AnimatePresence>
            {showShortMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-terminal-panel border border-terminal-bearish"
              >
                <p className="text-xs text-terminal-bearish font-mono">
                  [SYSTEM] Position SHORTED. {job.company} will be hidden from future scans. Time capital preserved.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* RoleWithAI Chat Response */}
          <AnimatePresence>
            {showRoleWithAIChat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rolewithai-bubble mt-4"
              >
                <p className="rolewithai-voice text-sm">
                  <strong className="text-cafe-dark">RoleWithAI:</strong> "{getRoleWithAIApplicationAdvice(job.truthScore, job.ghostRisk, job.company)}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
