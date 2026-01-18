'use client'

import { motion } from 'framer-motion'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

export default function ScoreRing({ score, size = 'md', showLabel = true, label }: ScoreRingProps) {
  const sizeMap = {
    sm: { outer: 60, inner: 50, stroke: 4 },
    md: { outer: 80, inner: 68, stroke: 6 },
    lg: { outer: 120, inner: 104, stroke: 8 }
  }

  const dimensions = sizeMap[size]
  const radius = (dimensions.inner - dimensions.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  // Determine color based on score - Terminal style with glow
  const getScoreColor = () => {
    if (score >= 90) return '#00FF00' // Neon Financial Green - Premium Asset
    if (score >= 80) return '#26A69A' // Financial Green - High Score
    if (score >= 50) return '#E0E0E0' // Off-White - Medium Score
    if (score >= 40) return '#FF3333' // Neon Financial Red - Low Score
    return '#EF5350' // Financial Red - Penny Stock (Ghost Job)
  }

  const scoreColor = getScoreColor()
  const isHighScore = score >= 90 // Premium Asset
  const isLowScore = score < 40 // Penny Stock
  const isMediumScore = score >= 50 && score < 80

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg
        width={dimensions.outer}
        height={dimensions.outer}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimensions.outer / 2}
          cy={dimensions.outer / 2}
          r={radius}
          fill="none"
          stroke="#E5E0DA"
          strokeWidth={dimensions.stroke}
        />
        
        {/* Score circle with glow effect */}
        <motion.circle
          cx={dimensions.outer / 2}
          cy={dimensions.outer / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: isHighScore 
              ? `drop-shadow(0 0 12px ${scoreColor}) drop-shadow(0 0 6px ${scoreColor}80)`
              : isLowScore
              ? `drop-shadow(0 0 8px ${scoreColor}60)`
              : 'none',
            animation: isLowScore ? 'flicker 2s infinite' : 'none'
          }}
        />
        
        {/* Outer glow ring for premium assets */}
        {isHighScore && (
          <motion.circle
            cx={dimensions.outer / 2}
            cy={dimensions.outer / 2}
            r={radius + 4}
            fill="none"
            stroke={scoreColor}
            strokeWidth={1}
            strokeOpacity={0.3}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </svg>
      
      {/* Score text with terminal styling */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className={`font-bold font-mono mono-number ${
              size === 'sm' ? 'text-lg' :
              size === 'md' ? 'text-2xl' : 'text-4xl'
            }`}
            style={{ 
              color: scoreColor,
              textShadow: isHighScore 
                ? `0 0 10px ${scoreColor}, 0 0 5px ${scoreColor}80`
                : isLowScore
                ? `0 0 8px ${scoreColor}60`
                : 'none'
            }}
          >
            {score}
          </motion.div>
          {showLabel && (
            <div className={`text-terminal-text/60 font-mono uppercase tracking-wider ${
              size === 'sm' ? 'text-xs' :
              size === 'md' ? 'text-xs' : 'text-sm'
            } mt-0.5`}>
              {label || (isHighScore ? 'PREMIUM' : isLowScore ? 'PENNY' : 'SCORE')}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
