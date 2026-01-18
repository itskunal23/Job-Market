'use client'

import { motion } from 'framer-motion'
import { Coffee, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HeaderGreeting() {
  const [timeGreeting, setTimeGreeting] = useState('')
  const [contextualMessage, setContextualMessage] = useState('')
  const [updateMinutes, setUpdateMinutes] = useState(12)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setTimeGreeting('Good morning')
      setContextualMessage("I've narrowed down the noise to just 12 minutes of updates so you can focus on your day ahead.")
    } else if (hour < 17) {
      setTimeGreeting('Good afternoon')
      setContextualMessage("I've filtered out the distractions—here's what actually matters for your career today.")
    } else {
      setTimeGreeting('Good evening')
      setContextualMessage("You've had a long day at work—I've narrowed down the noise to just 12 minutes of updates so you can focus on your studies.")
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="rolewithai-card mb-8 relative overflow-hidden"
    >
      {/* Subtle coffee/cafe background element */}
      <div className="absolute top-4 right-4 opacity-5">
        <Coffee className="w-32 h-32 text-espresso" />
      </div>
      
      <div className="relative z-10">
        {/* Menu of the Day Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <p className="text-xs uppercase tracking-wider text-espresso opacity-60 mb-2 font-sans">
            Today's Menu
          </p>
          <h1 className="text-5xl font-semibold text-espresso mb-2 font-serif">
            {timeGreeting}
          </h1>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="rolewithai-voice text-lg max-w-3xl">
              {contextualMessage}
            </p>
          </div>
          <div className="text-right ml-6">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Sparkles className="w-5 h-5 text-crema" />
              <p className="text-sm text-espresso opacity-60 font-sans">RoleWithAI</p>
            </div>
            <p className="text-lg font-semibold text-espresso font-serif">Your Career Co-Pilot</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
