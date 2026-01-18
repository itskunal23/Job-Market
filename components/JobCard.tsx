'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { getRoleWithAIApplicationAdvice } from '@/lib/roleWithAIResponses'
import GhostSignalVisualizer from './GhostSignalVisualizer'

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
}

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const [showRoleWithAIChat, setShowRoleWithAIChat] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [showSkipMessage, setShowSkipMessage] = useState(false)

  const isLowTruth = job.truthScore < 40
  const isHighTruth = job.truthScore >= 80 // Changed to 80+ for Crema Gold

  const handleSkip = () => {
    setShowSkipMessage(true)
    setIsFading(true)
    // Show message for 2 seconds before fading
    setTimeout(() => {
      // Handle skip action
    }, 2000)
  }

  return (
    <AnimatePresence>
      {!isFading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLowTruth ? 0.75 : 1, y: 0 }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)', scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={`job-card ${isHighTruth ? 'job-card-high-intent' : ''} ${isLowTruth ? 'job-card-low-truth' : ''}`}
        >
          {/* Wide Horizontal Layout: Data Left, Score Right */}
          <div className="flex items-start justify-between gap-8">
            {/* Left Side: Job Data */}
            <div className="flex-1 min-w-0">
              {/* RoleWithAI's Direct Guidance - Prominent and Warm */}
              <div className="rolewithai-insight-box mb-5">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-crema mt-1 flex-shrink-0" />
                  <p className="rolewithai-guidance">
                    {job.insight}
                  </p>
                </div>
              </div>

              {/* Job Details */}
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-espresso mb-2 font-serif">
                  {job.title}
                </h3>
                <p className="text-espresso opacity-70 mb-1 font-sans">
                  {job.company} • {job.location}
                </p>
                <p className="text-sm text-espresso opacity-50 font-sans">
                  Posted {job.postedDaysAgo} days ago
                </p>
              </div>

              {/* Ghost Warning Message */}
              {job.ghostRisk === 'high' && (
                <div className="mb-4 p-4 bg-parchment rounded-xl border border-border">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-coldbrew mt-0.5 flex-shrink-0" />
                    <p className="text-sm rolewithai-voice">
                      {job.recruiterActivity}
                    </p>
                  </div>
                </div>
              )}

              {/* Ghost Signal Visualizer - Shows WHY the score */}
              {job.ghostSignals && (
                <GhostSignalVisualizer
                  signals={job.ghostSignals}
                  truthScore={job.truthScore}
                />
              )}

              {/* Action Button - Bottom Left */}
              <div className="mt-6">
                {isHighTruth ? (
                  <button
                    onClick={() => setShowRoleWithAIChat(!showRoleWithAIChat)}
                    className="action-primary"
                  >
                    Secure this Match
                  </button>
                ) : (
                  <button
                    onClick={handleSkip}
                    className="action-skip text-base"
                  >
                    Skip it and save your energy
                  </button>
                )}
              </div>

              {/* Skip Success Message */}
              <AnimatePresence>
                {showSkipMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="skip-success mt-4"
                  >
                    <p className="rolewithai-voice text-base">
                      <strong className="text-espresso">RoleWithAI:</strong> "Good call. Your time is better spent elsewhere today."
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
                    <p className="rolewithai-voice text-base">
                      <strong className="text-espresso">RoleWithAI:</strong> "{getRoleWithAIApplicationAdvice(job.truthScore, job.ghostRisk, job.company)}"
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side: Truth Score & Ghost Risk (Z-Pattern End) */}
            <div className="flex flex-col items-end gap-4 flex-shrink-0">
              {/* Truth Score Ring - Café Study Colors */}
              <div className={`truth-score-ring ${isHighTruth ? 'truth-score-high' : isLowTruth ? 'truth-score-low' : 'truth-score-medium'}`}>
                {job.truthScore}
              </div>
              
              {/* Ghost Risk Badge */}
              <div className={`px-4 py-2 rounded-full text-sm font-medium font-sans ${
                job.ghostRisk === 'low' ? 'bg-crema-50 text-crema-600 border border-crema-200' :
                job.ghostRisk === 'medium' ? 'bg-parchment text-coldbrew border border-border' :
                'bg-parchment text-coldbrew border border-coldbrew-200'
              }`}>
                {job.ghostRisk.toUpperCase()} GHOST RISK
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
