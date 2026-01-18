'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp, TrendingDown, Users, Heart, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getOrCreateAlias } from '@/lib/aliasGenerator'

interface CommunitySignal {
  id: string
  type: 'ghosting' | 'clear_path' | 'insight' | 'surge'
  company: string
  role?: string
  message: string
  reporterAlias: string
  timestamp: string
  impactCount?: number
  // Stock market style data
  ticker?: string
  hiringVelocity?: number // Percentage change
  currentPrice?: number // Current hiring score (0-100)
  change?: number // Absolute change
  newsType?: 'positive' | 'negative' | 'neutral'
}

interface LiveCommunityFeedProps {
  compact?: boolean
  onThankYou?: (signalId: string) => void
}

export default function LiveCommunityFeed({ compact = false, onThankYou }: LiveCommunityFeedProps) {
  const [signals, setSignals] = useState<CommunitySignal[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [thankedSignals, setThankedSignals] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Mock real-time signals with stock market data - in production, this would come from Supabase Realtime
    const mockSignals: CommunitySignal[] = [
      {
        id: '1',
        type: 'ghosting',
        company: 'StartupXYZ',
        role: 'Product Manager',
        message: 'Hiring freeze reported by 12 users',
        reporterAlias: 'MochaSeeker',
        timestamp: new Date().toISOString(),
        impactCount: 12,
        ticker: 'STXYZ',
        hiringVelocity: -15.2,
        currentPrice: 42.5,
        change: -7.8,
        newsType: 'negative'
      },
      {
        id: '2',
        type: 'clear_path',
        company: 'Google',
        role: 'Data Scientist',
        message: '3 users moved to Interview stage - Active hiring',
        reporterAlias: 'EspressoCoder',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        impactCount: 3,
        ticker: 'GOOG',
        hiringVelocity: 8.5,
        currentPrice: 87.3,
        change: 6.2,
        newsType: 'positive'
      },
      {
        id: '3',
        type: 'insight',
        company: 'NVIDIA',
        role: 'ML Engineer',
        message: 'Recruiter active on LinkedIn 10 mins ago',
        reporterAlias: 'LatteLearner',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        ticker: 'NVDA',
        hiringVelocity: 12.4,
        currentPrice: 91.8,
        change: 10.1,
        newsType: 'positive'
      },
      {
        id: '4',
        type: 'surge',
        company: 'TechCorp',
        role: 'Software Engineer',
        message: '500+ applicants in 2 hours - High competition',
        reporterAlias: 'CappuccinoCoder',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        impactCount: 500,
        ticker: 'TECH',
        hiringVelocity: -5.3,
        currentPrice: 65.2,
        change: -3.7,
        newsType: 'negative'
      },
      {
        id: '5',
        type: 'insight',
        company: 'Microsoft',
        role: 'Cloud Engineer',
        message: 'New role posted - Recruiter actively screening',
        reporterAlias: 'JavaBean',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        ticker: 'MSFT',
        hiringVelocity: 6.8,
        currentPrice: 78.9,
        change: 5.0,
        newsType: 'positive'
      },
      {
        id: '6',
        type: 'ghosting',
        company: 'Meta',
        role: 'Product Designer',
        message: 'No responses for 14+ days - Pattern detected',
        reporterAlias: 'DesignLatte',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        ticker: 'META',
        hiringVelocity: -9.1,
        currentPrice: 58.4,
        change: -5.8,
        newsType: 'negative'
      }
    ]

    setSignals(mockSignals)

    // Rotate through signals every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockSignals.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getSignalIcon = (type: CommunitySignal['type']) => {
    switch (type) {
      case 'ghosting':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'clear_path':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'insight':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />
      case 'surge':
        return <TrendingUp className="w-4 h-4 text-orange-600" />
    }
  }

  const getSignalColor = (type: CommunitySignal['type']) => {
    switch (type) {
      case 'ghosting':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'clear_path':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'insight':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'surge':
        return 'bg-orange-50 border-orange-200 text-orange-800'
    }
  }

  const getSignalLabel = (type: CommunitySignal['type']) => {
    switch (type) {
      case 'ghosting':
        return '🚨 Ghosting Alert'
      case 'clear_path':
        return '✅ Clear Path'
      case 'insight':
        return '💡 Insight'
      case 'surge':
        return '📊 Application Surge'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  const getTickerColor = (signal: CommunitySignal) => {
    if (signal.hiringVelocity === undefined) return 'text-cafe-dark'
    return signal.hiringVelocity >= 0 ? 'text-cafe-matcha' : 'text-cafe-ghost'
  }

  const formatPrice = (price?: number) => {
    if (price === undefined) return 'N/A'
    return price.toFixed(1)
  }

  const formatChange = (change?: number) => {
    if (change === undefined) return ''
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}`
  }

  const formatVelocity = (velocity?: number) => {
    if (velocity === undefined) return ''
    const sign = velocity >= 0 ? '+' : ''
    return `${sign}${velocity.toFixed(1)}%`
  }

  if (compact) {
    // Stock market ticker style
    return (
      <div className="bg-cafe-dark border-b border-cafe-accent/20 py-2 overflow-hidden">
        <div className="flex items-center gap-8 animate-scroll">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="flex items-center gap-3 whitespace-nowrap px-4"
            >
              {/* Ticker Symbol */}
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {signal.ticker || signal.company.substring(0, 4).toUpperCase()}
                </span>
                <span className="text-[10px] text-cafe-accent/70 uppercase">
                  {signal.role?.substring(0, 12) || 'HIRING'}
                </span>
              </div>

              {/* Price & Change */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white">
                    {formatPrice(signal.currentPrice)}
                  </span>
                  {signal.change !== undefined && (
                    <span className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${
                      signal.change >= 0 ? 'text-cafe-matcha' : 'text-cafe-ghost'
                    }`}>
                      {signal.change >= 0 ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )}
                      {formatChange(signal.change)}
                    </span>
                  )}
                </div>
                {signal.hiringVelocity !== undefined && (
                  <span className={`text-[10px] font-mono font-semibold ${
                    signal.hiringVelocity >= 0 ? 'text-cafe-matcha' : 'text-cafe-ghost'
                  }`}>
                    {formatVelocity(signal.hiringVelocity)}
                  </span>
                )}
              </div>

              {/* News Headline */}
              <div className="flex items-center gap-2 max-w-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  signal.newsType === 'positive' ? 'bg-cafe-matcha' :
                  signal.newsType === 'negative' ? 'bg-cafe-ghost' :
                  'bg-cafe-gold'
                }`} />
                <span className="text-xs text-white/90 truncate">
                  {signal.message}
                </span>
              </div>

              {/* Reporter */}
              <span className="text-[10px] text-cafe-accent/60">
                via {signal.reporterAlias}
              </span>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 60s linear infinite;
          }
        `}</style>
      </div>
    )
  }

  // Stock market style vertical feed
  return (
    <div className="rolewithai-card p-4 bg-cafe-bg rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-cafe-accent" />
        <h3 className="text-sm font-semibold text-cafe-dark font-serif">
          Job Market Ticker
        </h3>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-3 rounded-lg border ${
                signal.newsType === 'positive' ? 'bg-cafe-matcha/10 border-cafe-matcha/30' :
                signal.newsType === 'negative' ? 'bg-cafe-ghost/10 border-cafe-ghost/30' :
                'bg-cafe-gold/10 border-cafe-gold/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Ticker & Company */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-cafe-dark uppercase tracking-wider font-mono">
                        {signal.ticker || signal.company.substring(0, 4).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-cafe-dark/60">
                        {signal.company}
                      </span>
                    </div>
                    {signal.role && (
                      <span className="text-xs text-cafe-dark/70">
                        • {signal.role}
                      </span>
                    )}
                  </div>

                  {/* Price & Change Row */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-mono font-bold text-cafe-dark">
                        {formatPrice(signal.currentPrice)}
                      </span>
                      {signal.change !== undefined && (
                        <span className={`text-sm font-mono font-semibold flex items-center gap-1 ${
                          signal.change >= 0 ? 'text-cafe-matcha' : 'text-cafe-ghost'
                        }`}>
                          {signal.change >= 0 ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {formatChange(signal.change)}
                        </span>
                      )}
                    </div>
                    {signal.hiringVelocity !== undefined && (
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                        signal.hiringVelocity >= 0 
                          ? 'bg-cafe-matcha/20 text-cafe-matcha' 
                          : 'bg-cafe-ghost/20 text-cafe-ghost'
                      }`}>
                        {formatVelocity(signal.hiringVelocity)}
                      </span>
                    )}
                  </div>

                  {/* News Headline */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      signal.newsType === 'positive' ? 'bg-cafe-matcha' :
                      signal.newsType === 'negative' ? 'bg-cafe-ghost' :
                      'bg-cafe-gold'
                    }`} />
                    <p className="text-xs text-cafe-dark/90">
                      {signal.message}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <p className="text-[10px] text-cafe-dark/50">
                      {formatTimeAgo(signal.timestamp)} • via {signal.reporterAlias}
                    </p>
                    {!thankedSignals.has(signal.id) && (
                      <button
                        onClick={() => {
                          setThankedSignals(prev => new Set(prev).add(signal.id))
                          onThankYou?.(signal.id)
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-cafe-ghost hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Thank this reporter"
                      >
                        <Heart className="w-3 h-3" />
                        Thanks
                      </button>
                    )}
                    {thankedSignals.has(signal.id) && (
                      <span className="flex items-center gap-1 px-2 py-1 text-xs text-red-600">
                        <Heart className="w-3 h-3 fill-red-600" />
                        Thanked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
