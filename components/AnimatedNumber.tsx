'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export default function AnimatedNumber({ 
  value, 
  decimals = 1,
  prefix = '',
  suffix = '',
  duration = 1,
  className = ''
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startValue = 0
    const endValue = value
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (endValue - startValue) * easeOutCubic
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
      }
    }
    
    animate()
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}
