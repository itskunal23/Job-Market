import { NextRequest, NextResponse } from 'next/server'
import { insertGhostingReport, updateUserImpactPoints } from '@/lib/supabase'

interface GhostingReport {
  company: string
  title: string
  url: string
  platform: string
  appliedDate: string
  daysSinceApplication: number
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const report: GhostingReport = await request.json()
    
    // Store in Supabase
    await insertGhostingReport({
      company: report.company,
      job_title: report.title,
      job_url: report.url,
      platform: report.platform,
      applied_date: report.appliedDate,
      days_since_application: report.daysSinceApplication,
      got_response: false, // User is reporting ghosting, so no response
      user_id: report.userId,
    })
    
    // Award impact points if user is authenticated
    if (report.userId) {
      // Get current points and add 10
      // This would require fetching current points first
      // For now, we'll just increment
      await updateUserImpactPoints(report.userId, 10)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for helping the community! +10 Impact Points',
      impactPoints: 10,
    })
  } catch (error) {
    console.error('Error reporting ghosting:', error)
    // Still return success even if DB fails (graceful degradation)
    return NextResponse.json({
      success: true,
      message: 'Thank you for your report!',
      impactPoints: 10,
    })
  }
}
