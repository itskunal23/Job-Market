import { NextRequest, NextResponse } from 'next/server'
import {
  calculateAgeFactor,
  getResponseRate,
  getGhostSignal,
  calculateTruthScore,
  determineGhostRisk,
} from '@/lib/truthScore'
import { generateJobInsights } from '@/lib/gemini'
import { getCachedTruthScore, cacheTruthScore } from '@/lib/supabase'

interface JobData {
  title: string
  company: string
  description?: string
  postedDate?: string
  url: string
  platform: string
}

// Truth Score Formula: (W1 * A) + (W2 * R) - (W3 * G)
// A = Age Factor, R = Response Rate, G = Ghost Signal

export async function POST(request: NextRequest) {
  try {
    const jobData: JobData = await request.json()

    // Check cache first
    const cached = await getCachedTruthScore(jobData.url)
    if (cached) {
      return NextResponse.json({
        truthScore: cached.truth_score,
        ghostRisk: cached.ghost_risk,
        insights: {
          message: 'Cached analysis available',
          detailedAdvice: 'This analysis was previously calculated.',
        },
        breakdown: {
          ageFactor: cached.age_factor,
          responseRate: cached.response_rate,
          ghostSignal: cached.ghost_signal,
        },
        cached: true,
      })
    }

    // Calculate Age Factor (A)
    const ageFactor = calculateAgeFactor(jobData.postedDate)
    
    // Get Response Rate from community data (R)
    const responseRate = await getResponseRate(jobData.company)
    
    // Get Ghost Signal from external sources (G)
    const ghostSignal = await getGhostSignal(jobData.company, jobData.title)
    
    // Calculate Truth Score
    const truthScore = calculateTruthScore(ageFactor, responseRate, ghostSignal)
    
    // Determine ghost risk
    const ghostRisk = determineGhostRisk(truthScore)
    
    // Generate insights using Gemini (if available) or fallback
    const insights = await generateJobInsights({
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      truthScore,
      ghostRisk,
      ageFactor,
      responseRate,
      ghostSignal,
    })
    
    // Cache the result
    await cacheTruthScore({
      job_url: jobData.url,
      company: jobData.company,
      job_title: jobData.title,
      truth_score: truthScore,
      ghost_risk: ghostRisk,
      age_factor: ageFactor,
      response_rate: responseRate,
      ghost_signal: ghostSignal,
    })
    
    return NextResponse.json({
      truthScore,
      ghostRisk,
      insights,
      breakdown: {
        ageFactor,
        responseRate,
        ghostSignal,
      },
    })
  } catch (error) {
    console.error('Error calculating truth score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate truth score' },
      { status: 500 }
    )
  }
}
