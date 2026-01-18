/**
 * Truth Score Calculation Engine
 * Implements the formula: (W1 * A) + (W2 * R) - (W3 * G)
 * 
 * Where:
 * A = Age Factor (0-100)
 * R = Response Rate from community (0-100)
 * G = Ghost Signal from external sources (0-100, lower is better)
 */

export interface TruthScoreInput {
  title: string
  company: string
  description?: string
  postedDate?: string
  url: string
  platform: string
}

export interface TruthScoreResult {
  truthScore: number
  ghostRisk: 'low' | 'medium' | 'high'
  breakdown: {
    ageFactor: number
    responseRate: number
    ghostSignal: number
  }
  insights: {
    message: string
    detailedAdvice: string
  }
}

const WEIGHTS = {
  AGE: 0.4,
  RESPONSE_RATE: 0.4,
  GHOST_SIGNAL: 0.2,
}

export function calculateAgeFactor(postedDate?: string): number {
  if (!postedDate) return 50 // Default if unknown
  
  const daysOld = extractDaysOld(postedDate)
  
  // Age scoring curve
  if (daysOld < 7) return 90      // Very fresh - high score
  if (daysOld < 14) return 75     // Fresh - good score
  if (daysOld < 30) return 60     // Recent - moderate score
  if (daysOld < 60) return 40     // Stale - low score
  if (daysOld < 90) return 25     // Very stale - very low score
  return 10                        // Ancient - minimal score
}

export function extractDaysOld(postedDate: string): number {
  try {
    const now = new Date()
    const posted = new Date(postedDate)
    
    if (!isNaN(posted.getTime())) {
      const diffTime = Math.abs(now.getTime() - posted.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    
    // Try to parse text like "2 days ago", "3 weeks ago"
    const match = postedDate.match(/(\d+)\s*(day|week|month|hour)/i)
    if (match) {
      const num = parseInt(match[1])
      const unit = match[2].toLowerCase()
      if (unit.includes('hour')) return num / 24
      if (unit.includes('day')) return num
      if (unit.includes('week')) return num * 7
      if (unit.includes('month')) return num * 30
    }
    
    return 999 // Unknown - treat as very old
  } catch {
    return 999
  }
}

export async function getResponseRate(
  company: string,
  supabaseClient?: any
): Promise<number> {
  // TODO: Query Supabase for community-reported response rates
  // SELECT 
  //   COUNT(*) as total_reports,
  //   SUM(CASE WHEN got_response = true THEN 1 ELSE 0 END) as responses
  // FROM ghosting_reports 
  // WHERE company = $1 AND reported_at > NOW() - INTERVAL '30 days'
  // 
  // response_rate = (responses / total_reports) * 100
  
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('ghosting_reports')
        .select('got_response')
        .eq('company', company)
        .gte('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      
      if (!error && data && data.length > 0) {
        const responses = data.filter((r: any) => r.got_response).length
        return Math.round((responses / data.length) * 100)
      }
    } catch (error) {
      console.error('Error fetching response rate:', error)
    }
  }
  
  // Default fallback
  return 60
}

export async function getGhostSignal(
  company: string,
  title: string,
  tavilyClient?: any
): Promise<number> {
  // TODO: Use Tavily API to search Reddit/Glassdoor
  // Search queries:
  // 1. site:reddit.com "{company}" ghosting hiring
  // 2. site:glassdoor.com "{company}" "not hiring" fake jobs
  // 3. Count mentions of: "reposted", "evergreen", "no contact", "ghost job"
  
  // Ghost signal is inverse: lower number = less ghosting = better
  
  if (tavilyClient) {
    try {
      // Search Reddit
      const redditResults = await tavilyClient.search({
        query: `site:reddit.com "${company}" ghosting hiring`,
        search_depth: 'basic',
        include_answer: false,
      })
      
      // Search Glassdoor
      const glassdoorResults = await tavilyClient.search({
        query: `site:glassdoor.com "${company}" "not hiring" "fake jobs"`,
        search_depth: 'basic',
        include_answer: false,
      })
      
      // Count ghost-related keywords
      const ghostKeywords = ['reposted', 'evergreen', 'no contact', 'ghost job', 'fake posting']
      let ghostMentions = 0
      
      [...redditResults.results, ...glassdoorResults.results].forEach((result: any) => {
        const text = (result.title + ' ' + result.content).toLowerCase()
        ghostKeywords.forEach(keyword => {
          if (text.includes(keyword)) ghostMentions++
        })
      })
      
      // Convert mentions to score (0-100, lower is better)
      // More mentions = higher ghost signal
      return Math.min(100, ghostMentions * 10)
    } catch (error) {
      console.error('Error fetching ghost signal:', error)
    }
  }
  
  // Default fallback
  return 30
}

export function calculateTruthScore(
  ageFactor: number,
  responseRate: number,
  ghostSignal: number
): number {
  const score = (
    WEIGHTS.AGE * ageFactor +
    WEIGHTS.RESPONSE_RATE * responseRate -
    WEIGHTS.GHOST_SIGNAL * ghostSignal
  )
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function determineGhostRisk(truthScore: number): 'low' | 'medium' | 'high' {
  if (truthScore >= 70) return 'low'
  if (truthScore >= 40) return 'medium'
  return 'high'
}
