/**
 * Signal Processor
 * Maps GhostSignal data into visual breakdown for the UI
 * Prepares data for the GhostSignalVisualizer component
 */

import { GhostSignal } from './types'

export interface SignalVisualization {
  recruiterActivity: {
    level: 'none' | 'low' | 'moderate' | 'high'
    color: string // Café Study color
    label: string
  }
  repostFrequency: {
    level: 'none' | 'low' | 'moderate' | 'high'
    color: string
    label: string
  }
  communitySentiment: {
    level: 'negative' | 'neutral' | 'positive'
    color: string
    label: string
  }
  overallScore: number // 0-100, for visual representation
}

/**
 * Process GhostSignal into visualization data
 */
export function processGhostSignal(signal: GhostSignal): SignalVisualization {
  // Map recruiter activity
  const recruiterActivity = {
    level: signal.recruiterActivity.toLowerCase() as 'none' | 'low' | 'moderate' | 'high',
    color: getRecruiterActivityColor(signal.recruiterActivity),
    label: `Recruiter Activity: ${signal.recruiterActivity}`,
  }
  
  // Map repost frequency
  const repostFrequency = {
    level: signal.repostFrequency === 'None' ? 'none' : 
           signal.repostFrequency === 'Low' ? 'low' : 'high',
    color: getRepostFrequencyColor(signal.repostFrequency),
    label: `Repost Frequency: ${signal.repostFrequency}`,
  }
  
  // Map community sentiment
  const communitySentiment = {
    level: signal.communitySentiment.toLowerCase() as 'negative' | 'neutral' | 'positive',
    color: getCommunitySentimentColor(signal.communitySentiment),
    label: `Community Sentiment: ${signal.communitySentiment}`,
  }
  
  // Calculate overall score (0-100) for visualization
  const overallScore = calculateOverallScore(signal)
  
  return {
    recruiterActivity,
    repostFrequency,
    communitySentiment,
    overallScore,
  }
}

/**
 * Get Café Study color for recruiter activity
 */
function getRecruiterActivityColor(activity: GhostSignal['recruiterActivity']): string {
  switch (activity) {
    case 'High':
      return '#C89F65' // Crema Gold
    case 'Moderate':
      return '#AFA59B' // Cold Brew
    case 'None':
      return '#AFA59B' // Cold Brew (low activity)
  }
}

/**
 * Get Café Study color for repost frequency
 */
function getRepostFrequencyColor(frequency: GhostSignal['repostFrequency']): string {
  switch (frequency) {
    case 'None':
      return '#C89F65' // Crema Gold (good sign)
    case 'Low':
      return '#AFA59B' // Cold Brew (moderate)
    case 'High':
      return '#AFA59B' // Cold Brew (bad sign - frequent reposting)
  }
}

/**
 * Get Café Study color for community sentiment
 */
function getCommunitySentimentColor(sentiment: GhostSignal['communitySentiment']): string {
  switch (sentiment) {
    case 'Positive':
      return '#C89F65' // Crema Gold
    case 'Neutral':
      return '#AFA59B' // Cold Brew
    case 'Negative':
      return '#AFA59B' // Cold Brew (warning)
  }
}

/**
 * Calculate overall score (0-100) for visual representation
 */
function calculateOverallScore(signal: GhostSignal): number {
  let score = 50 // Base score
  
  // Recruiter activity
  if (signal.recruiterActivity === 'High') score += 30
  else if (signal.recruiterActivity === 'Moderate') score += 15
  else score -= 20
  
  // Repost frequency (inverse - high reposting is bad)
  if (signal.repostFrequency === 'None') score += 20
  else if (signal.repostFrequency === 'Low') score += 5
  else score -= 25
  
  // Community sentiment
  if (signal.communitySentiment === 'Positive') score += 20
  else if (signal.communitySentiment === 'Negative') score -= 25
  
  return Math.max(0, Math.min(100, score))
}
