/**
 * Supabase Client Configuration
 * Free tier: 500MB storage, perfect for ghosting reports
 */

import { createClient } from '@supabase/supabase-js'

// These would be environment variables in production
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper functions for ghosting reports
export async function insertGhostingReport(report: {
  company: string
  job_title?: string
  job_url: string
  platform?: string
  applied_date?: string
  days_since_application?: number
  got_response?: boolean
  user_id?: string
}) {
  const { data, error } = await supabase
    .from('ghosting_reports')
    .insert([report])
    .select()
    .single()

  if (error) {
    console.error('Error inserting ghosting report:', error)
    throw error
  }

  return data
}

export async function getCompanyGhostRisk(company: string) {
  const { data, error } = await supabase
    .from('company_ghost_risk')
    .select('*')
    .eq('company', company)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching company ghost risk:', error)
    return null
  }

  return data
}

export async function getCachedTruthScore(jobUrl: string) {
  const { data, error } = await supabase
    .from('job_truth_scores')
    .select('*')
    .eq('job_url', jobUrl)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching cached truth score:', error)
    return null
  }

  return data
}

export async function cacheTruthScore(scoreData: {
  job_url: string
  company: string
  job_title?: string
  truth_score: number
  ghost_risk: string
  age_factor?: number
  response_rate?: number
  ghost_signal?: number
}) {
  const { data, error } = await supabase
    .from('job_truth_scores')
    .upsert([scoreData], {
      onConflict: 'job_url',
    })
    .select()
    .single()

  if (error) {
    console.error('Error caching truth score:', error)
    throw error
  }

  return data
}

export async function updateUserImpactPoints(userId: string, points: number) {
  const { data, error } = await supabase
    .from('user_impact_points')
    .upsert(
      {
        user_id: userId,
        total_points: points,
        reports_count: supabase.raw('reports_count + 1'),
        last_activity: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error updating impact points:', error)
    throw error
  }

  return data
}
