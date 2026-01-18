/**
 * RoleWithAI Intelligence Agent
 * Main orchestrator that ties together all intelligence components
 * This is the entry point for the server-side logic engine
 */

import { MarketVitals, JobMatch, LedgerEntry } from './types'
import { getMarketVitals, getMockJobMatches, getMockLedgerEntries } from '@/services/dataService'
import { generateMorningBriefDialogue } from './morningBriefAgent'
import { automateLedgerEntries } from './ledgerAutomator'
import { processGhostSignal } from './signalProcessor'

/**
 * Get complete market intelligence for the dashboard
 */
export async function getMarketIntelligence(): Promise<{
  vitals: MarketVitals
  jobs: JobMatch[]
  ledger: LedgerEntry[]
}> {
  // Get base market vitals
  const vitals = getMarketVitals()
  
  // Generate morning brief dialogue
  vitals.dailyBrief = generateMorningBriefDialogue(vitals)
  
  // Get job matches with intelligence analysis
  const jobs = getMockJobMatches()
  
  // Get ledger entries and auto-prioritize
  const ledger = getMockLedgerEntries()
  const automatedLedger = automateLedgerEntries(ledger)
  
  return {
    vitals,
    jobs,
    ledger: automatedLedger,
  }
}

/**
 * Process a single job match with full intelligence analysis
 */
export function processJobMatch(job: JobMatch): JobMatch {
  // Process ghost signal for visualization
  const signalVisualization = processGhostSignal(job.signalBreakdown)
  
  // Job is already processed by dataService, but we can add visual tags here
  // Tag high-intent items for Crema Gold styling
  if (job.truthScore >= 80) {
    // Already tagged via ghostRisk: 'LOW'
  }
  
  // Tag low-intent/Ghost items for Cold Brew desaturation
  if (job.truthScore < 50) {
    // Already tagged via ghostRisk: 'HIGH'
  }
  
  return job
}

/**
 * Get visual styling tags based on truth score
 * Returns CSS classes or style props for Café Study aesthetic
 */
export function getVisualTags(truthScore: number, ghostRisk: 'LOW' | 'MEDIUM' | 'HIGH'): {
  scoreColor: string // Crema Gold or Cold Brew
  cardOpacity: number // 1.0 for high-intent, 0.75 for ghost jobs
  borderColor: string
} {
  if (truthScore >= 80) {
    return {
      scoreColor: '#C89F65', // Crema Gold
      cardOpacity: 1.0,
      borderColor: '#C89F65',
    }
  }
  
  if (truthScore < 50) {
    return {
      scoreColor: '#AFA59B', // Cold Brew
      cardOpacity: 0.75, // Desaturated for ghost jobs
      borderColor: '#AFA59B',
    }
  }
  
  // Medium (50-79)
  return {
    scoreColor: '#4A3F35', // Espresso
    cardOpacity: 1.0,
    borderColor: '#E5E0DA', // Border subtle
  }
}
