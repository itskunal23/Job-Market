/**
 * RoleWithAI Intelligence Agent - Data Schema & Interfaces
 * Defines the stable contract between the intelligence engine and the UI
 */

/**
 * Market Vitals - Key metrics for the dashboard
 */
export interface MarketVitals {
  hiringVelocity: number // Percentage change in hiring (e.g., +4%)
  ghostingRate: number // Percentage change in ghosting incidents
  impactPoints: number // User's accumulated impact points
  dailyBrief: string // 2-sentence empathetic greeting based on time of day
}

/**
 * Ghost Signal - Indicators of potential ghosting behavior
 */
export interface GhostSignal {
  recruiterActivity: 'High' | 'Moderate' | 'None'
  repostFrequency: 'High' | 'Low' | 'None'
  communitySentiment: 'Positive' | 'Neutral' | 'Negative'
}

/**
 * Job Match - A job posting with intelligence analysis
 */
export interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  postedDate: string // ISO date string
  truthScore: number // 1-100 score
  ghostRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  echoDialogue: string // RoleWithAI's supportive message
  signalBreakdown: GhostSignal // Detailed ghost signal analysis
  whyScore: string // Explanation of why this score was assigned
}

/**
 * Ledger Entry - Application tracking in the Status Ledger
 */
export interface LedgerEntry {
  id: string
  role: string // Job title
  company: string
  status: 'Applied' | 'Interview' | 'Ghosted' | 'Rejected'
  date: string // ISO date string
  echoNote: string // RoleWithAI's empathetic note
  priority?: 'high' | 'low' // Auto-assigned priority
  lastActivity?: string // ISO date of last activity
  truthScore?: number // Truth score at time of application
}
