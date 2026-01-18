'use client'

import { motion } from 'framer-motion'

interface SparklineProps {
  data: number[] // Array of 7 values representing 7-day trend
  width?: number
  height?: number
  color?: string
  showDots?: boolean
}

export default function Sparkline({ 
  data, 
  width = 60, 
  height = 20, 
  color = '#3D5A80',
  showDots = false 
}: SparklineProps) {
  if (!data || data.length === 0) return null

  // Normalize data to fit within height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const normalizedData = data.map(value => {
    const normalized = ((value - min) / range) * (height - 4) + 2
    return Math.max(2, Math.min(height - 2, normalized))
  })

  // Create path for line
  const stepX = width / (data.length - 1)
  const pathData = normalizedData.map((y, i) => {
    const x = i * stepX
    return `${i === 0 ? 'M' : 'L'} ${x} ${height - y}`
  }).join(' ')

  // Determine trend color
  const trend = data[data.length - 1] - data[0]
  const trendColor = trend >= 0 ? '#88A070' : '#935F4C' // Matcha Green for up, Cold Brew Red for down

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Background area */}
      <motion.path
        d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
        fill={trendColor}
        fillOpacity={0.1}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* Line */}
      <motion.path
        d={pathData}
        fill="none"
        stroke={trendColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* Dots */}
      {showDots && normalizedData.map((y, i) => {
        const x = i * stepX
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={height - y}
            r="2"
            fill={trendColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          />
        )
      })}
    </svg>
  )
}
