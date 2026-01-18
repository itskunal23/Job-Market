/**
 * Ledger Automator
 * Automatically manages ledger entries based on truth score changes and activity
 * Moves applications to 'Low Priority' if truthScore drops or lastActivity > 14 days
 */

import { LedgerEntry } from './types'

export interface LedgerUpdate {
  entry: LedgerEntry
  priorityChanged: boolean
  statusChanged: boolean
  noteUpdated: boolean
}

/**
 * Automate ledger entry updates based on rules
 */
export function automateLedgerEntry(
  entry: LedgerEntry,
  currentTruthScore?: number
): LedgerUpdate {
  const update: LedgerUpdate = {
    entry: { ...entry },
    priorityChanged: false,
    statusChanged: false,
    noteUpdated: false,
  }
  
  // Calculate days since last activity
  const lastActivityDate = entry.lastActivity 
    ? new Date(entry.lastActivity)
    : new Date(entry.date)
  const daysSinceActivity = Math.floor(
    (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Rule 1: Move to Low Priority if lastActivity > 14 days
  if (daysSinceActivity > 14 && entry.priority !== 'low') {
    update.entry.priority = 'low'
    update.priorityChanged = true
    update.noteUpdated = true
  }
  
  // Rule 2: Move to Low Priority if truthScore dropped significantly
  if (currentTruthScore && entry.truthScore) {
    const scoreDrop = entry.truthScore - currentTruthScore
    if (scoreDrop > 20 && entry.priority !== 'low') {
      update.entry.priority = 'low'
      update.priorityChanged = true
      update.noteUpdated = true
    }
  }
  
  // Rule 3: Auto-update status to 'Ghosted' if no activity for 21+ days and status is 'Applied'
  if (entry.status === 'Applied' && daysSinceActivity > 21) {
    update.entry.status = 'Ghosted'
    update.statusChanged = true
    update.noteUpdated = true
  }
  
  // Update note if priority or status changed
  if (update.noteUpdated) {
    update.entry.echoNote = generateAutoNote(update.entry, daysSinceActivity)
  }
  
  return update
}

/**
 * Generate automatic note for ledger entry
 */
function generateAutoNote(entry: LedgerEntry, daysSince: number): string {
  if (entry.status === 'Ghosted') {
    return `I've archived this so you don't have to think about it anymore. ${entry.company} hasn't responded in ${daysSince} days—this is on them, not you.`
  }
  
  if (entry.priority === 'low' && daysSince > 14) {
    return `I'm watching this so you don't have to. I've moved it to 'low priority' for you—don't let their silence occupy your headspace.`
  }
  
  if (entry.status === 'Interview') {
    return `Great news—${entry.company} is actively engaging. I'm tracking this closely for you.`
  }
  
  return entry.echoNote || `I'm keeping an eye on this application. I'll update you if anything changes.`
}

/**
 * Batch process ledger entries for automation
 */
export function automateLedgerEntries(
  entries: LedgerEntry[],
  currentTruthScores?: Map<string, number> // jobId -> currentTruthScore
): LedgerEntry[] {
  return entries.map((entry) => {
    const currentScore = currentTruthScores?.get(entry.id)
    const update = automateLedgerEntry(entry, currentScore)
    return update.entry
  })
}
