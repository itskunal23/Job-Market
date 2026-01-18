'use client'

import { motion } from 'framer-motion'
import { Activity, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react'

interface GhostSignal {
  recruiterActivity: 'none' | 'low' | 'moderate' | 'high'
  repostFrequency: 'none' | 'low' | 'moderate' | 'high'
  sentiment: 'negative' | 'neutral' | 'positive'
  overallScore: number
}

interface GhostSignalVisualizerProps {
  signals: GhostSignal
  truthScore: number
}

export default function GhostSignalVisualizer({ signals, truthScore }: GhostSignalVisualizerProps) {
  const getSignalColor = (level: string) => {
    switch (level) {
      case 'none':
      case 'negative':
        return 'bg-sand-500'
      case 'low':
      case 'neutral':
        return 'bg-softslate-400'
      case 'moderate':
        return 'bg-glow-400'
      case 'high':
      case 'positive':
        return 'bg-glow-500'
      default:
        return 'bg-softslate-300'
    }
  }

  const getSignalLabel = (level: string) => {
    switch (level) {
      case 'none':
        return 'None'
      case 'low':
        return 'Low'
      case 'moderate':
        return 'Moderate'
      case 'high':
        return 'High'
      case 'negative':
        return 'Negative'
      case 'neutral':
        return 'Neutral'
      case 'positive':
        return 'Positive'
      default:
        return 'Unknown'
    }
  }

  const getSignalIcon = (type: 'recruiter' | 'repost' | 'sentiment') => {
    switch (type) {
      case 'recruiter':
        return <Activity className="w-4 h-4" />
      case 'repost':
        return <RefreshCw className="w-4 h-4" />
      case 'sentiment':
        return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <div className="mt-4 p-4 bg-fog-50 rounded-xl border border-softslate-100">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-softslate-500" />
        <p className="text-xs font-semibold text-softslate-600 uppercase tracking-wide">
          Ghost Signal Breakdown
        </p>
      </div>
      
      <div className="space-y-3">
        {/* Recruiter Activity Signal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSignalIcon('recruiter')}
            <span className="text-xs text-softslate-600">Recruiter Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= (signals.recruiterActivity === 'none' ? 0 :
                          signals.recruiterActivity === 'low' ? 1 :
                          signals.recruiterActivity === 'moderate' ? 2 : 4)
                      ? getSignalColor(signals.recruiterActivity)
                      : 'bg-softslate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-softslate-600 w-16 text-right">
              {getSignalLabel(signals.recruiterActivity)}
            </span>
          </div>
        </div>

        {/* Repost Frequency Signal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSignalIcon('repost')}
            <span className="text-xs text-softslate-600">Repost Frequency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= (signals.repostFrequency === 'none' ? 0 :
                          signals.repostFrequency === 'low' ? 1 :
                          signals.repostFrequency === 'moderate' ? 2 : 4)
                      ? getSignalColor(signals.repostFrequency)
                      : 'bg-softslate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-softslate-600 w-16 text-right">
              {getSignalLabel(signals.repostFrequency)}
            </span>
          </div>
        </div>

        {/* Sentiment Signal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSignalIcon('sentiment')}
            <span className="text-xs text-softslate-600">Community Sentiment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= (signals.sentiment === 'negative' ? 1 :
                          signals.sentiment === 'neutral' ? 2 : 3)
                      ? getSignalColor(signals.sentiment)
                      : 'bg-softslate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-softslate-600 w-16 text-right">
              {getSignalLabel(signals.sentiment)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary - Explains WHY the score */}
      <div className="mt-3 pt-3 border-t border-softslate-200">
        <p className="text-xs text-softslate-500 rolewithai-voice">
          <strong className="text-marine">Why {truthScore}?</strong> {
            signals.recruiterActivity === 'none' ? 'No recruiter activity detected. ' : 
            signals.recruiterActivity === 'high' ? 'Strong recruiter engagement. ' : ''
          }
          {signals.repostFrequency === 'high' && 'Frequently reposted without hiring. '}
          {signals.repostFrequency === 'none' && signals.recruiterActivity === 'high' && 'Fresh posting, actively hiring. '}
          {signals.sentiment === 'negative' && 'Negative community sentiment. '}
          {signals.sentiment === 'positive' && signals.recruiterActivity === 'high' && 'Strong signals of active hiring.'}
        </p>
      </div>
    </div>
  )
}
