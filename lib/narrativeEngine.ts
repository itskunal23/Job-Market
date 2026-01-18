/**
 * RoleWithAI Narrative Engine
 * Generates empathetic, supportive dialogue following the "Supportive Café Friend" persona
 * 
 * Core Principles:
 * - Empathetic, time-protective, sophisticated, ritualistic
 * - Never blame the user
 * - Frame "Ghosting" as systemic failure, not personal
 * - Context-aware: user has "had a long day at work" and is a "student"
 */

import { JobMatch, LedgerEntry, MarketVitals } from './types'

/**
 * Generate RoleWithAI's dialogue for a job match
 */
export function generateJobDialogue(job: JobMatch, timeOfDay: 'morning' | 'afternoon' | 'evening'): string {
  const { truthScore, ghostRisk, company, signalBreakdown } = job
  
  // High-intent jobs (80+)
  if (truthScore >= 80) {
    return `This looks promising. ${company} has been actively engaging with candidates, and the posting is fresh. Your skills align well here—I'd recommend prioritizing this one.`
  }
  
  // Medium-intent jobs (50-79)
  if (truthScore >= 50) {
    if (signalBreakdown.repostFrequency === 'High') {
      return `There's some risk here—${company} has reposted this multiple times. It's worth applying, but let's keep our expectations realistic. I'm tracking this for you.`
    }
    return `This is a solid opportunity. ${company} has moderate activity, and while the signals aren't perfect, it's worth your time. I'll keep an eye on this one.`
  }
  
  // Low-intent/Ghost jobs (<50)
  if (signalBreakdown.communitySentiment === 'Negative') {
    return `I'm seeing red flags here. The community has reported ghosting concerns with ${company}, and the posting patterns suggest this might be an evergreen role. Let's focus your energy on higher-intent opportunities where you'll actually get a response.`
  }
  
  if (signalBreakdown.repostFrequency === 'High') {
    return `This posting has been reposted multiple times without hiring—that's a pattern I don't like. ${company} may be collecting resumes rather than actively hiring. Your time is better spent elsewhere.`
  }
  
  return `The signals here are weak. Low recruiter activity and stale posting suggest this isn't a priority for ${company} right now. I'd recommend skipping this and focusing on roles where you'll get a real response.`
}

/**
 * Generate morning brief dialogue based on market vitals
 */
export function generateMorningBrief(vitals: MarketVitals, timeOfDay: 'morning' | 'afternoon' | 'evening'): string {
  const { hiringVelocity, ghostingRate } = vitals
  
  if (timeOfDay === 'morning') {
    if (hiringVelocity > 0 && ghostingRate < 5) {
      return `Good morning. The market is showing positive momentum—hiring is up ${hiringVelocity}%, and ghosting is relatively low. It's a good day to focus on high-intent matches. I've filtered out the noise for you.`
    }
    if (hiringVelocity < 0) {
      return `Good morning. The market is a bit quiet this week (hiring down ${Math.abs(hiringVelocity)}%), but that's okay—it's a great time to focus on your studies. I'm keeping watch for high-quality opportunities.`
    }
    return `Good morning. Hiring is ${hiringVelocity > 0 ? 'up' : 'down'} ${Math.abs(hiringVelocity)}%, but ghosting is still high (+${ghostingRate}%). I've filtered out the fake ones so you can focus on what matters.`
  }
  
  if (timeOfDay === 'afternoon') {
    return `Good afternoon. I've been tracking the market while you've been working. Hiring is ${hiringVelocity > 0 ? 'up' : 'down'} ${Math.abs(hiringVelocity)}%, and I've identified ${vitals.impactPoints} high-intent matches worth your attention.`
  }
  
  // Evening
  return `Good evening. You've had a long day at work—I've narrowed down the noise to just the essential updates. Hiring is ${hiringVelocity > 0 ? 'up' : 'down'} ${Math.abs(hiringVelocity)}%, and I'm filtering out the ghost jobs so you can focus on your studies.`
}

/**
 * Generate empathetic note for ledger entries
 */
export function generateLedgerNote(entry: LedgerEntry, daysSince: number): string {
  if (entry.status === 'Ghosted') {
    return `I've archived this so you don't have to think about it anymore. ${entry.company} has ghosted ${daysSince > 14 ? '85%' : 'many'} applicants this month—this is on them, not you. Your time is better spent on companies that respect candidates.`
  }
  
  if (entry.status === 'Applied' && daysSince > 14) {
    return `I'm watching this so you don't have to. I've moved it to 'low priority' for you—don't let their silence occupy your headspace. Focus on newer applications where you'll get responses.`
  }
  
  if (entry.status === 'Interview') {
    return `Great news—${entry.company} is actively engaging. I'm tracking this closely for you. This is a high-intent opportunity.`
  }
  
  if (entry.status === 'Rejected') {
    return `I've closed this chapter for you. ${entry.company} wasn't the right fit, and that's okay. Your energy is better spent on opportunities that align with your goals.`
  }
  
  return `I'm keeping an eye on this application. I'll update you if anything changes.`
}

/**
 * Generate "why score" explanation with empathetic framing
 */
export function generateWhyScoreDialogue(
  truthScore: number,
  signalBreakdown: JobMatch['signalBreakdown'],
  daysOld: number
): string {
  const parts: string[] = []
  
  if (signalBreakdown.recruiterActivity === 'High') {
    parts.push('Strong recruiter engagement')
  } else if (signalBreakdown.recruiterActivity === 'None') {
    parts.push('No visible recruiter activity')
  }
  
  if (signalBreakdown.repostFrequency === 'High') {
    parts.push('frequent reposting suggests this may be an evergreen role')
  }
  
  if (daysOld > 30) {
    parts.push(`posted ${daysOld} days ago—may be stale`)
  } else if (daysOld < 7) {
    parts.push(`fresh posting (${daysOld} days old)`)
  }
  
  if (signalBreakdown.communitySentiment === 'Negative') {
    parts.push('community reports indicate ghosting concerns')
  }
  
  if (parts.length === 0) {
    return 'Mixed signals across indicators. Proceed with moderate expectations.'
  }
  
  return `Score based on: ${parts.join(', ')}.`
}
