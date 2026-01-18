'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MarketTicker {
  ticker: string
  company: string
  price: number
  change: number
  changePercent: number
}

export default function MarketWatch() {
  const [tickers, setTickers] = useState<MarketTicker[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://localhost:5000/api/market-ticker?limit=20')
        
        if (!response.ok) {
          throw new Error('Failed to fetch ticker data')
        }
        
        const data = await response.json()
        
        if (data.success && data.tickers) {
          setTickers(data.tickers)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error('Error fetching market ticker:', error)
        // Don't set mock data - show empty state or error
        setTickers([])
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchTickerData()

    // Refresh every 2 minutes (120 seconds) - backend caches for 5 minutes
    // This reduces unnecessary API calls while still keeping data relatively fresh
    const interval = setInterval(fetchTickerData, 120000)

    return () => clearInterval(interval)
  }, [])

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-terminal-bullish'
    if (change < 0) return 'text-terminal-bearish'
    return 'text-terminal-text/60'
  }
  
  const getChangeIndicator = (change: number) => {
    if (change > 0) return '🟢'
    if (change < 0) return '🔴'
    return '⚪'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />
    if (change < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  if (isLoading) {
    return (
      <div className="bg-terminal-black border-b border-terminal-border py-1.5 overflow-hidden">
        <div className="flex items-center justify-center">
          <span className="text-xs font-mono text-terminal-text/60">Loading market data...</span>
        </div>
      </div>
    )
  }

  if (tickers.length === 0) {
    return (
      <div className="bg-terminal-black border-b border-terminal-border py-1.5 overflow-hidden">
        <div className="flex items-center justify-center">
          <span className="text-xs font-mono text-terminal-text/60">No market data available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-terminal-black border-b border-terminal-border py-1.5 overflow-hidden">
      <div className="flex items-center gap-8 animate-scroll">
        {/* Duplicate tickers for seamless loop */}
        {[...tickers, ...tickers].map((ticker, idx) => (
          <div
            key={`${ticker.ticker}-${idx}`}
            className="flex items-center gap-3 whitespace-nowrap px-4"
          >
            {/* Ticker Symbol */}
            <span className="text-xs font-bold text-terminal-text uppercase tracking-wider font-mono">
              {ticker.ticker}
            </span>
            
            {/* Indicator */}
            <span className="text-xs">
              {getChangeIndicator(ticker.change)}
            </span>
            
            {/* Price (Market Price) */}
            <span className="text-sm font-mono font-bold text-terminal-text mono-number">
              {ticker.price.toFixed(1)}
            </span>
            
            {/* Change */}
            <div className={`flex items-center gap-1 ${getChangeColor(ticker.change)}`}>
              {getChangeIcon(ticker.change)}
              <span className="text-xs font-mono font-semibold mono-number">
                ({ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(1)}%)
              </span>
            </div>
            
            {/* Separator */}
            <span className="text-terminal-border">|</span>
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
          display: flex;
        }
      `}</style>
    </div>
  )
}
