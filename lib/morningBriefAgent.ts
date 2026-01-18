/**
 * Morning Brief Agent
 * Synthesizes current market stats into a 2-sentence empathetic greeting
 * Context-aware: knows user has "had a long day at work" and is a "student"
 */

import { MarketVitals } from './types'
import { generateMorningBrief } from './narrativeEngine'

/**
 * Generate the morning brief dialogue based on market vitals and time of day
 */
export function generateMorningBriefDialogue(vitals: MarketVitals): string {
  const hour = new Date().getHours()
  let timeOfDay: 'morning' | 'afternoon' | 'evening'
  
  if (hour < 12) {
    timeOfDay = 'morning'
  } else if (hour < 17) {
    timeOfDay = 'afternoon'
  } else {
    timeOfDay = 'evening'
  }
  
  return generateMorningBrief(vitals, timeOfDay)
}

/**
 * Get time-aware greeting
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
