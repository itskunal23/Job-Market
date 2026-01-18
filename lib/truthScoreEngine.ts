/**
 * RoleWithAI Truth Score Calculation Engine
 * Implements the specific algorithm for calculating job posting truth scores
 * 
 * Algorithm:
 * - Recruiter Activity: High = +40 points
 * - Repost Frequency: High = -30 points
 * - Posting Age: >30 days = -20 points
 * - Community Signal: Negative = -25 points
 * 
 * Ghost Risk Thresholds:
 * - >80 = LOW
 * - 50-79 = MEDIUM
 * - <50 = HIGH
 */

import { GhostSignal, JobMatch } from './types'

export interface TruthScoreInput {
  recruiterActivity: 'High' | 'Moderate' | 'None'
  repostFrequency: 'High' | 'Low' | 'None'
  postedDate: string // ISO date string
  communitySentiment: 'Positive' | 'Neutral' | 'Negative'
}

export interface TruthScoreResult {
  truthScore: number // 1-100
  ghostRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  breakdown: {
    baseScore: number
    recruiterActivity: number
    repostFrequency: number
    postingAge: number
    communitySignal: number
  }
  whyScore: string // Human-readable explanation
}

/**
 * Calculate days since posting date
 */
function getDaysSincePosted(postedDate: string): number {
  try {
    const posted = new Date(postedDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - posted.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch {
    return 999 // Treat as very old if parsing fails
  }
}

/**
 * Main Truth Score calculation function
 */
export function calculateTruthScore(input: TruthScoreInput): TruthScoreResult {
  let baseScore = 50 // Start with neutral base
  
  const breakdown = {
    baseScore: 50,
    recruiterActivity: 0,
    repostFrequency: 0,
    postingAge: 0,
    communitySignal: 0,
  }
  
  // 1. Recruiter Activity: High = +40 points
  if (input.recruiterActivity === 'High') {
    baseScore += 40
    breakdown.recruiterActivity = 40
  } else if (input.recruiterActivity === 'Moderate') {
    baseScore += 20
    breakdown.recruiterActivity = 20
  }
  
  // 2. Repost Frequency: High = -30 points
  if (input.repostFrequency === 'High') {
    baseScore -= 30
    breakdown.repostFrequency = -30
  } else if (input.repostFrequency === 'Low') {
    baseScore -= 10
    breakdown.repostFrequency = -10
  }
  
  // 3. Posting Age: >30 days = -20 points
  const daysOld = getDaysSincePosted(input.postedDate)
  if (daysOld > 30) {
    baseScore -= 20
    breakdown.postingAge = -20
  } else if (daysOld > 14) {
    baseScore -= 10
    breakdown.postingAge = -10
  }
  
  // 4. Community Signal: Negative = -25 points
  if (input.communitySentiment === 'Negative') {
    baseScore -= 25
    breakdown.communitySignal = -25
  } else if (input.communitySentiment === 'Positive') {
    baseScore += 15
    breakdown.communitySignal = 15
  }
  
  // Clamp score between 1-100
  const truthScore = Math.max(1, Math.min(100, Math.round(baseScore)))
  
  // Determine Ghost Risk
  let ghostRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  if (truthScore > 80) {
    ghostRisk = 'LOW'
  } else if (truthScore >= 50) {
    ghostRisk = 'MEDIUM'
  } else {
    ghostRisk = 'HIGH'
  }
  
  // Generate "why score" explanation
  const whyScore = generateWhyScore(truthScore, breakdown, daysOld, input)
  
  return {
    truthScore,
    ghostRisk,
    breakdown,
    whyScore,
  }
}

/**
 * Generate human-readable explanation of the score
 */
function generateWhyScore(
  score: number,
  breakdown: TruthScoreResult['breakdown'],
  daysOld: number,
  input: TruthScoreInput
): string {
  const reasons: string[] = []
  
  if (breakdown.recruiterActivity > 0) {
    reasons.push(`Strong recruiter activity (${input.recruiterActivity.toLowerCase()})`)
  }
  
  if (breakdown.repostFrequency < 0) {
    reasons.push(`High repost frequency suggests this may be an evergreen posting`)
  }
  
  if (daysOld > 30) {
    reasons.push(`Posted ${daysOld} days ago—may be stale`)
  } else if (daysOld < 7) {
    reasons.push(`Fresh posting (${daysOld} days old)`)
  }
  
  if (input.communitySentiment === 'Negative') {
    reasons.push(`Community reports suggest ghosting concerns`)
  } else if (input.communitySentiment === 'Positive') {
    reasons.push(`Positive community sentiment`)
  }
  
  if (reasons.length === 0) {
    return 'Moderate signals across all indicators'
  }
  
  return reasons.join('. ') + '.'
}

/**
 * Convert GhostSignal to TruthScoreInput format
 */
export function ghostSignalToInput(
  signal: GhostSignal,
  postedDate: string
): TruthScoreInput {
  return {
    recruiterActivity: signal.recruiterActivity,
    repostFrequency: signal.repostFrequency,
    postedDate,
    communitySentiment: signal.communitySentiment,
  }
}
