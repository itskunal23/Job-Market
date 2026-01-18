'use client'

import { useState, useEffect } from 'react'
import HeaderGreeting from '@/components/HeaderGreeting'
import JobCard from '@/components/JobCard'
import StatusLedger from '@/components/StatusLedger'
import ApplicationTracker from '@/components/ApplicationTracker'
import MarketWatch from '@/components/MarketWatch'
import CommunityWazeTicker from '@/components/CommunityWazeTicker'
import ReportHazard, { HazardReport } from '@/components/ReportHazard'
import ProfilePulse from '@/components/ProfilePulse'
import FilterToggle from '@/components/FilterToggle'
import LowStressToggle from '@/components/LowStressToggle'
import TimelineOfPeace from '@/components/TimelineOfPeace'
// Market insights now fetched directly from backend API
import { Loader2, Search, User, Briefcase, AlertTriangle, X, ExternalLink, Calendar, MapPin, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface GhostSignal {
  recruiterActivity: 'none' | 'low' | 'moderate' | 'high'
  repostFrequency: 'none' | 'low' | 'moderate' | 'high'
  sentiment: 'negative' | 'neutral' | 'positive'
  overallScore?: number
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  truthScore: number
  ghostRisk: 'low' | 'medium' | 'high'
  insight: string
  postedDaysAgo: number
  recruiterActivity: string
  ghostSignals?: GhostSignal
  ticker?: string
  dailyChange?: number
  sevenDayTrend?: number[]
  url?: string // Job posting URL from LinkedIn/Indeed/Glassdoor
  platform?: string // Source platform (LinkedIn, Indeed, Glassdoor)
  description?: string // Job description
}

export default function Home() {
  const [userName, setUserName] = useState('')
  const [field, setField] = useState('')
  const [location, setLocation] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [showJobs, setShowJobs] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isFindingMatches, setIsFindingMatches] = useState(false)
  const [marketInsight, setMarketInsight] = useState<any>(null)
  const [showReportHazard, setShowReportHazard] = useState(false)
  const [impactPoints, setImpactPoints] = useState(127)
  const [filterNoise, setFilterNoise] = useState(true) // Filter Truth Score >= 70
  const [lowStressMode, setLowStressMode] = useState(false)
  const [coffeeProgress, setCoffeeProgress] = useState(0)
  const [selectedJobDetail, setSelectedJobDetail] = useState<Job | null>(null)
  
  // Get shorted companies from localStorage
  const getShortedCompanies = () => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('shorted_companies') || '[]')
  }
  
  // Filter out shorted companies
  const shortedCompanies = getShortedCompanies()
  const filteredByShorted = jobs.filter(job => 
    !shortedCompanies.includes(job.company.toLowerCase())
  )

  useEffect(() => {
    // Load career equity (capital) from localStorage
    const stored = localStorage.getItem('rolewithai_impactPoints')
    if (stored) {
      setImpactPoints(parseInt(stored))
    } else {
      localStorage.setItem('rolewithai_impactPoints', '127')
    }
  }, [])

  useEffect(() => {
    // Check if user has already initialized terminal
    const storedUserName = localStorage.getItem('rolewithai_userName')
    const storedField = localStorage.getItem('rolewithai_field')
    const storedLocation = localStorage.getItem('rolewithai_location')
    const storedJob = localStorage.getItem('rolewithai_selectedJob')
    
    if (storedUserName && storedField) {
      setUserName(storedUserName)
      setField(storedField)
      setLocation(storedLocation || '')
      
      // Skip boot sequence if returning user - go straight to trading floor
      setBootPhase('ready')
      
      if (storedJob) {
        // User selected a job - show similar jobs
        try {
          const job = JSON.parse(storedJob)
          setSelectedJob(job)
          setShowJobs(true)
          loadJobsByRole(job.title, storedLocation || '')
        } catch {
          // Load jobs for the field
          setShowJobs(true)
          loadJobsByRole(storedField, storedLocation || '')
        }
      } else {
        // Load jobs for the field
        setShowJobs(true)
        loadJobsByRole(storedField, storedLocation || '')
      }
    } else {
      // New user - start at gateway
      setBootPhase('gateway')
    }

    // Load market insight from backend API (real data only)
    const loadMarketInsight = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/market-insights')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Transform backend format to frontend format
            const trending = data.trending_roles || []
            const avgVelocity = trending.length > 0 
              ? trending.reduce((sum: number, r: any) => sum + (r.hiring_velocity || 0), 0) / trending.length
              : 0
            
            setMarketInsight({
              temperature: avgVelocity > 10 ? 'high' : avgVelocity > 0 ? 'medium' : 'low',
              message: `Market analysis: ${trending.length} trending roles detected from real job data.`,
              hiringChange: avgVelocity,
              ghostingChange: 0 // Would need to calculate from community data
            })
          } else {
            // Backend returned error - set minimal data
            setMarketInsight({
              temperature: 'low',
              message: 'Market data unavailable',
              hiringChange: 0,
              ghostingChange: 0
            })
          }
        } else {
          throw new Error(`Backend returned ${response.status}`)
        }
      } catch (error) {
        console.error('Error loading market insights:', error)
        // Set error state (no mock data)
        setMarketInsight({
          temperature: 'low',
          message: 'Unable to fetch market data. Ensure backend is running.',
          hiringChange: 0,
          ghostingChange: 0
        })
      }
    }
    loadMarketInsight()
  }, [])

  const loadJobsByRole = async (role: string, loc: string) => {
    setIsFindingMatches(true)
    try {
      const response = await fetch('http://localhost:5000/api/find-jobs-by-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role,
          location: loc,
          maxResults: 50
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      
      if (data.success && data.jobs) {
        // Transform jobs to match JobCard interface
        const transformedJobs = data.jobs.map((jobData: any, index: number): Job => {
          const job = jobData.job
          const postedDate = job.posted_date ? new Date(job.posted_date) : new Date()
          const postedDaysAgo = Math.floor((new Date().getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24))
          
          // Generate insight based on market price and market data
          let insight = ''
          const marketData = data.marketData
          if (marketData) {
            if (jobData.truthScore >= 80) {
              insight = `Bullish signal! ${marketData.total_postings}+ similar positions available. ${marketData.growth_trend === 'rising' ? 'Growing demand in this role.' : 'Stable market.'}`
            } else if (jobData.truthScore >= 50) {
              insight = `Worth considering. Market shows ${marketData.hiring_velocity > 0 ? '+' : ''}${marketData.hiring_velocity}% growth in ${role} roles.`
            } else {
              insight = `Bearish signal. ${marketData.growth_trend === 'declining' ? 'Market is cooling for this role.' : 'Keep expectations realistic.'}`
            }
          } else {
            insight = jobData.ghostRisk === 'LOW' ? 'Bullish opportunity detected.' : 'Moderate opportunity - worth exploring.'
          }
          
          // Generate market volatility warning
          let recruiterActivity = ''
          if (jobData.ghostRisk === 'HIGH') {
            recruiterActivity = jobData.whyScore || '⚠️ MARKET VOLATILITY WARNING: High ghost risk detected. Consider shorting this position.'
          } else if (jobData.ghostRisk === 'LOW') {
            recruiterActivity = 'Active recruiter engagement detected. High response rate.'
          } else {
            recruiterActivity = 'Moderate recruiter activity. Response rate is average.'
          }
          
          return {
            id: `job-${index}`,
            title: job.title,
            company: job.company,
            location: job.location,
            truthScore: jobData.truthScore,
            ghostRisk: jobData.ghostRisk.toLowerCase() as 'low' | 'medium' | 'high',
            insight: insight,
            postedDaysAgo: Math.max(0, postedDaysAgo),
            recruiterActivity: recruiterActivity,
            url: job.url || job.jobLink || '#', // Extract URL from backend response
            platform: job.platform || 'Unknown',
            description: job.description || '',
            ghostSignals: {
              recruiterActivity: jobData.ghostRisk === 'LOW' ? 'high' : jobData.ghostRisk === 'MEDIUM' ? 'moderate' : 'none',
              repostFrequency: 'none' as const,
              sentiment: jobData.ghostRisk === 'LOW' ? 'positive' : jobData.ghostRisk === 'HIGH' ? 'negative' : 'neutral',
              overallScore: jobData.truthScore
            }
          }
        })
        
        setJobs(transformedJobs)
      }
    } catch (error) {
      console.error('Backend API unavailable:', error)
      // No fallback - show error state
      setJobs([])
      alert('Unable to connect to backend. Please ensure the Flask server is running on http://localhost:5000')
    } finally {
      setIsFindingMatches(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userName.trim() || !field.trim()) {
      return
    }
    
    // Store user preferences
    localStorage.setItem('rolewithai_userName', userName.trim())
    localStorage.setItem('rolewithai_field', field.trim())
    localStorage.setItem('rolewithai_location', location.trim())
    
    // PHASE 2: Start boot sequence
    setBootPhase('initializing')
    setBootLogs([])
    
    // Calculate market velocity and ghost volume (use marketInsight if available, otherwise mock)
    const velocity = marketInsight?.hiringChange || -4.2
    const ghostVolume = velocity < -3 ? 'HIGH' : velocity < 0 ? 'MODERATE' : 'LOW'
    
    // Boot sequence logs - brutal, honest market assessment
    const logs = [
      `[SYSTEM] Authenticating TRADER: ${userName || '[USER]'}...`,
      `[SYSTEM] Scoping ${field || '[SECTOR]'} market for ghost-signals...`,
      `[SYSTEM] Calculating 24h Hiring Velocity...`,
      `[SYSTEM] Access Granted. Opening Market Floor.`,
      ``,
      `[SYSTEM] WELCOME TRADER ${userName.toUpperCase() || '[NAME]'}.`,
      `[SYSTEM] SECTOR ${field.toUpperCase() || '[SECTOR]'} IS TRADING AT ${velocity > 0 ? '+' : ''}${velocity.toFixed(1)}% VELOCITY.`,
      `[SYSTEM] GHOST VOLUME IS ${ghostVolume}. PROTECT YOUR CAPITAL.`
    ]
    
    // Animate logs appearing one by one (vertical stream)
    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setBootLogs(prev => [...prev, logs[i]])
    }
    
    // Wait a moment for final log to display
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Load jobs in background
    await loadJobsByRole(field.trim(), location.trim())
    
    // Transition to trading floor
    setBootPhase('ready')
    setShowJobs(true)
  }

  const updateImpactPoints = (points: number) => {
    const newTotal = impactPoints + points
    setImpactPoints(newTotal)
    localStorage.setItem('rolewithai_impactPoints', newTotal.toString())
  }

  const handleThankYou = (signalId: string) => {
    // Award points for thanking someone
    updateImpactPoints(2)
  }

  const handleHazardReport = (report: HazardReport) => {
    // In production, this would send to Supabase and update community data
    console.log('Hazard reported:', report)
    
    // Award impact points based on report type
    let pointsEarned = 0
    switch (report.type) {
      case 'ghosting':
        pointsEarned = 10
        break
      case 'interview_freeze':
        pointsEarned = 15
        break
      case 'recruiter_activity':
        pointsEarned = 20
        break
    }
    
    updateImpactPoints(pointsEarned)
    
    // Show success message (you could add a toast notification here)
    alert(`Thank you for reporting! You earned ${pointsEarned} Impact Points.`)
  }

  // PHASE 1: THE GATEWAY - Minimalist landing page
  // PHASE 2: SYSTEM INITIALIZATION - Boot sequence
  // PHASE 3: THE TRADING FLOOR - Dashboard (shown after initialization)
  
  const [bootPhase, setBootPhase] = useState<'gateway' | 'initializing' | 'ready'>('gateway')
  const [bootLogs, setBootLogs] = useState<string[]>([])

  // Show gateway or boot sequence if not ready
  if (!showJobs || bootPhase !== 'ready') {
    // PHASE 2: System Initialization - Full screen vertical stream boot sequence
    if (bootPhase === 'initializing' as const) {
      return (
        <main className="min-h-screen bg-terminal-black flex items-start justify-center pt-20 relative overflow-hidden">
          <div className="w-full max-w-3xl px-8">
            {/* Vertical stream of monospaced logs in neon green */}
            <div className="font-mono text-terminal-bullish text-base space-y-2 leading-relaxed">
              {bootLogs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="font-mono"
                  style={{
                    textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                    color: '#00FF00'
                  }}
                >
                  {log}
                </motion.div>
              ))}
              {/* Blinking cursor */}
              {bootLogs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block font-mono text-terminal-bullish ml-2"
                  style={{ color: '#00FF00' }}
                >
                  ▋
                </motion.div>
              )}
            </div>
          </div>
        </main>
      )
    }

    // PHASE 1: The Gateway - Minimalist landing
    return (
      <main className="min-h-screen bg-terminal-black flex items-center justify-center relative overflow-hidden">
        {/* Subtle background data stream */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute inset-0 flex flex-col gap-4">
            {[...Array(15)].map((_, i) => {
              const duration = 20 + (i % 10) * 0.5
              const delay = (i % 5) * 0.3
              
              return (
                <motion.div
                  key={i}
                  className="flex gap-8 whitespace-nowrap"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration,
                    repeat: Infinity,
                    ease: 'linear',
                    delay
                  }}
                >
                  {['GOOG', 'NVDA', 'MSFT', 'AAPL', 'META', 'AMZN', 'TSLA'].map((ticker, idx) => {
                    const seed = ticker.charCodeAt(0) + ticker.charCodeAt(1) + i * 7 + idx * 13
                    const isBullish = (seed % 2) === 0
                    return (
                      <span
                        key={idx}
                        className={`text-xs font-mono ${isBullish ? 'text-terminal-bullish' : 'text-terminal-bearish'}`}
                      >
                        {ticker}: {isBullish ? '🟢' : '🔴'} {50 + (seed % 50)}.{seed % 10} ({isBullish ? '+' : ''}{(seed % 20) - 10}%)
                      </span>
                    )
                  })}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Single Glassmorphism Card - Centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg px-8 relative z-10"
        >
          <div 
            className="glass-panel p-12 border border-terminal-border backdrop-blur-[16px]"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              boxShadow: '0 0 40px rgba(0, 255, 0, 0.1)'
            }}
          >
            <div className="text-center mb-8">
              <h1 
                className="text-4xl font-bold text-terminal-text mb-2 font-mono uppercase tracking-wider"
                style={{ 
                  textShadow: '0 0 20px rgba(0, 255, 0, 0.4)',
                  color: '#00FF00'
                }}
              >
                INITIALIZE TERMINAL
              </h1>
              <p className="text-xs text-terminal-text/40 font-mono uppercase tracking-widest mt-4">
                IDENTIFY YOURSELF TO THE MARKET
              </p>
            </div>


            <form onSubmit={handleSearch} className="space-y-8">
              {/* 1. TRADER_NAME Input */}
              <div>
                <label htmlFor="trader_name" className="block text-xs font-mono uppercase tracking-wider text-terminal-text/60 mb-3 font-semibold">
                  1. TRADER_NAME
                </label>
                <input
                  id="trader_name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your first or anonymous name"
                  required
                  className="w-full px-4 py-3 border border-terminal-border bg-terminal-black/30 backdrop-blur-sm text-terminal-text font-mono text-base focus:outline-none focus:border-terminal-bullish focus:shadow-[0_0_15px_rgba(0,255,0,0.4)] transition-all"
                />
              </div>

              {/* 2. MARKET_SECTOR Input */}
              <div>
                <label htmlFor="market_sector" className="block text-xs font-mono uppercase tracking-wider text-terminal-text/60 mb-3 font-semibold">
                  2. MARKET_SECTOR
                </label>
                <input
                  id="market_sector"
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g., Data Science, Software Engineer"
                  required
                  className="w-full px-4 py-3 border border-terminal-border bg-terminal-black/30 backdrop-blur-sm text-terminal-text font-mono text-base focus:outline-none focus:border-terminal-bullish focus:shadow-[0_0_15px_rgba(0,255,0,0.4)] transition-all"
                />
              </div>

              {/* INITIALIZE TERMINAL Button */}
              <button
                type="submit"
                disabled={!userName.trim() || !field.trim()}
                className="w-full px-8 py-4 bg-terminal-black border-2 border-terminal-bullish font-mono font-bold uppercase tracking-wider text-terminal-bullish hover:bg-terminal-bullish/10 hover:shadow-[0_0_30px_rgba(0,255,0,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg relative overflow-hidden group"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)'
                }}
              >
                <span className="relative z-10">INITIALIZE TERMINAL</span>
                <motion.div
                  className="absolute inset-0 bg-terminal-bullish/10"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    )
  }

  // Job Detail Modal Component
  const JobDetailModal = ({ job, onClose }: { job: Job | null, onClose: () => void }) => {
    if (!job) return null

    const getTicker = (company: string): string => {
      const words = company.split(' ')
      if (words.length === 1) {
        return company.substring(0, 4).toUpperCase().padEnd(4, 'X')
      }
      return words.map(w => w[0]).join('').toUpperCase().padEnd(4, 'X').substring(0, 4)
    }

    const ticker = job.ticker || getTicker(job.company)
    const hasValidUrl = job.url && job.url !== '#'

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-terminal-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-terminal-border p-6 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-terminal-text/60 hover:text-terminal-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 pb-4 border-b border-terminal-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold font-mono uppercase text-terminal-text">{ticker}</span>
                  <span className={`px-2 py-1 text-xs font-mono border ${
                    job.truthScore >= 80 ? 'border-terminal-bullish text-terminal-bullish' :
                    job.truthScore >= 50 ? 'border-terminal-text/40 text-terminal-text/80' :
                    'border-terminal-bearish text-terminal-bearish'
                  }`}>
                    {job.truthScore >= 80 ? 'PREMIUM' : job.truthScore >= 50 ? 'STANDARD' : 'PENNY'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-terminal-text font-mono mb-2">{job.title}</h2>
                <div className="flex items-center gap-4 text-sm text-terminal-text/60 font-mono">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {job.postedDaysAgo}d ago
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-terminal-text/60 font-mono uppercase mb-1">Market Price</div>
                <div className={`text-3xl font-bold font-mono mono-number ${
                  job.truthScore >= 80 ? 'text-terminal-bullish neon-glow-green' :
                  job.truthScore < 40 ? 'text-terminal-bearish neon-glow-red' :
                  'text-terminal-text'
                }`}>
                  {job.truthScore.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Market Insight */}
          <div className="mb-6 p-4 bg-terminal-dark-gray border border-terminal-border">
            <div className="text-xs text-terminal-text/60 font-mono uppercase mb-2">Market Analysis</div>
            <p className="text-sm text-terminal-text/80 font-mono">{job.insight}</p>
          </div>

          {/* Ghost Risk Warning */}
          {job.ghostRisk === 'high' && (
            <div className="mb-6 p-4 bg-terminal-panel border border-terminal-bearish">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-terminal-bearish mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-terminal-bearish font-mono uppercase mb-1">
                    ⚠️ MARKET VOLATILITY WARNING
                  </div>
                  <p className="text-xs text-terminal-bearish font-mono">{job.recruiterActivity}</p>
                </div>
              </div>
            </div>
          )}

          {/* Job Description */}
          {job.description && (
            <div className="mb-6">
              <div className="text-xs text-terminal-text/60 font-mono uppercase mb-2">Job Description</div>
              <div className="p-4 bg-terminal-dark-gray border border-terminal-border max-h-60 overflow-y-auto">
                <p className="text-sm text-terminal-text/80 font-mono whitespace-pre-wrap">
                  {job.description.length > 500 
                    ? `${job.description.substring(0, 500)}...` 
                    : job.description}
                </p>
              </div>
            </div>
          )}

          {/* Platform Info */}
          <div className="mb-6 flex items-center gap-4 text-xs text-terminal-text/60 font-mono">
            <span>Source: <span className="text-terminal-text/80">{job.platform || 'Unknown'}</span></span>
            {hasValidUrl && (
              <span>•</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-terminal-border">
            {hasValidUrl && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-terminal-panel border border-terminal-border hover:border-terminal-bullish text-terminal-text font-mono uppercase tracking-wider transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View on {job.platform || 'Job Site'}
              </a>
            )}
            <button
              onClick={() => {
                // BUY: Add to Open Positions
                const stored = localStorage.getItem('rolewithai_applications')
                const existing = stored ? JSON.parse(stored) : []
                const newApp = {
                  id: Date.now().toString(),
                  role: job.title,
                  company: job.company,
                  jobLink: job.url || '#',
                  status: 'applied' as const,
                  date: new Date().toISOString().split('T')[0],
                  ghostRisk: job.ghostRisk || 'low',
                  priority: 'high' as const
                }
                existing.push(newApp)
                localStorage.setItem('rolewithai_applications', JSON.stringify(existing))
                alert(`[SYSTEM] Position opened: ${ticker} - ${job.title} at ${job.company}\nUnrealized P&L: +0.0%`)
                onClose()
                window.location.reload()
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-terminal-bullish text-terminal-black border border-terminal-bullish hover:shadow-[0_0_20px_rgba(0,255,0,0.5)] font-mono uppercase tracking-wider transition-all"
            >
              BUY (LONG POSITION)
            </button>
            <button
              onClick={() => {
                // SHORT: Add company to shorted list
                const shortedCompanies = JSON.parse(localStorage.getItem('shorted_companies') || '[]')
                if (!shortedCompanies.includes(job.company.toLowerCase())) {
                  shortedCompanies.push(job.company.toLowerCase())
                  localStorage.setItem('shorted_companies', JSON.stringify(shortedCompanies))
                }
                alert(`[SYSTEM] Position SHORTED: ${job.company} will be hidden from future scans.\nTime capital preserved.`)
                onClose()
                window.location.reload()
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-terminal-panel border border-terminal-bearish hover:border-terminal-bearish text-terminal-bearish font-mono uppercase tracking-wider transition-all"
            >
              SHORT (BET AGAINST)
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show dashboard with matched jobs
  const hiringVelocity = marketInsight?.hiringChange || 0
  const ghostingRate = marketInsight?.ghostingChange || 0

  // Filter jobs by Market Price if filter is enabled
  const filteredJobs = filterNoise 
    ? jobs.filter(job => job.truthScore >= 70)
    : jobs

  // Sort by Market Price (descending)
  const sortedJobs = filteredJobs
    .sort((a, b) => b.truthScore - a.truthScore)

  const handleCoffeeComplete = () => {
    // Show suggestion to take a break
    alert("☕ You've done the work. Go take a 15-minute walk.")
  }

  return (
    <main className="min-h-screen bg-terminal-black text-terminal-text">
      {/* TOP NAV BAR: Global Market Ticker + Community Waze */}
      <div className="sticky top-0 z-50 bg-terminal-black">
        <MarketWatch />
        <CommunityWazeTicker />
      </div>

      {/* TRADING DESK LAYOUT */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* LEFT SIDEBAR: MARKET SCANNER */}
        <div className="w-1/3 border-r border-terminal-border overflow-y-auto bg-terminal-black">
          <div className="p-4 border-b border-terminal-border glass-panel">
            <h2 className="text-lg font-bold text-terminal-text uppercase tracking-wider font-sans mb-1">
              MARKET SCANNER
            </h2>
            <p className="text-xs text-terminal-text/60 font-mono">
              {filterNoise 
                ? `Filtered: Market Price ≥ 70`
                : `Showing ${filteredByShorted.length} positions`
              }
              {shortedCompanies.length > 0 && (
                <span className="ml-2 text-terminal-text/40">
                  ({shortedCompanies.length} shorted)
                </span>
              )}
            </p>
          </div>

          {isFindingMatches ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-terminal-bullish mx-auto mb-4" />
              <p className="text-terminal-text/60 font-mono text-sm">Scanning market...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-terminal-text/60 font-mono text-sm mb-4">
                No positions found. Adjust filters or search.
              </p>
              <button
                onClick={() => setFilterNoise(false)}
                className="px-4 py-2 bg-terminal-panel border border-terminal-border text-terminal-text hover:border-terminal-text font-mono text-xs uppercase"
              >
                Show All
              </button>
            </div>
            ) : (
            <div className="p-2">
              <table className="terminal-table">
                <thead>
                  <tr>
                    <th className="font-sans">Ticker</th>
                    <th className="font-sans">Role</th>
                    <th className="font-sans">Price</th>
                    <th className="font-sans">24h Δ</th>
                    <th className="font-sans">Vol</th>
                    <th className="font-sans">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedJobs.map((job) => {
                    const ticker = job.ticker || getTicker(job.company)
                    // Use deterministic values based on job data to avoid hydration mismatch
                    const seed = job.id.charCodeAt(0) + job.truthScore
                    const dailyChange = job.dailyChange ?? ((seed % 20) - 10) / 2
                    const isBullish = dailyChange >= 0
                    const userCount = 1 + (seed % 5)
                    const volume = 10 + (seed % 40)
                    const volatilitySignals = [
                      `${userCount} users moved to interview stage`,
                      `Recruiter activity detected`,
                      `Community sentiment: ${isBullish ? 'Positive' : 'Negative'}`,
                      `Posting age: ${job.postedDaysAgo} days`
                    ]
                    
                    return (
                      <tr 
                        key={job.id} 
                        className={`group relative ${job.truthScore >= 80 ? 'job-card-high-intent' : job.truthScore < 40 ? 'job-card-low-truth' : ''}`}
                      >
                        <td className="font-mono font-bold uppercase">{ticker}</td>
                        <td className="text-xs">
                          <button
                            onClick={() => setSelectedJobDetail(job)}
                            className="text-left hover:text-terminal-bullish transition-colors cursor-pointer"
                          >
                            <div className="font-semibold font-sans underline decoration-terminal-border hover:decoration-terminal-bullish">
                              {job.title}
                            </div>
                            <div className="text-terminal-text/60 font-mono">{job.company}</div>
                          </button>
                        </td>
                        <td className={`font-mono font-bold mono-number relative ${isBullish ? 'text-terminal-bullish' : 'text-terminal-bearish'}`}>
                          <span className={job.truthScore >= 80 ? 'neon-glow-green' : job.truthScore < 40 ? 'neon-glow-red' : ''}>
                            {job.truthScore.toFixed(1)}
                          </span>
                          {/* Hover Tooltip */}
                          <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 w-64 glass-panel p-3 border border-terminal-border">
                            <div className="text-xs font-mono space-y-1">
                              <div className="text-terminal-text/60 uppercase mb-2">Market Volatility Signals:</div>
                              {volatilitySignals.map((signal, idx) => (
                                <div key={idx} className="text-terminal-text/80">• {signal}</div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className={`font-mono mono-number ${isBullish ? 'text-terminal-bullish' : 'text-terminal-bearish'}`}>
                          {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(1)}
                        </td>
                        <td className="font-mono mono-number text-terminal-text/60">
                          {volume}
                        </td>
                        <td>
                          <button 
                            className="action-primary text-xs px-2 py-1 font-mono uppercase"
                            onClick={() => {
                              // BUY: Add to Open Positions
                              const stored = localStorage.getItem('rolewithai_applications')
                              const existing = stored ? JSON.parse(stored) : []
                              const newApp = {
                                id: Date.now().toString(),
                                role: job.title,
                                company: job.company,
                                jobLink: job.url || '#',
                                status: 'applied' as const,
                                date: new Date().toISOString().split('T')[0],
                                ghostRisk: job.ghostRisk || 'low',
                                priority: 'high' as const
                              }
                              existing.push(newApp)
                              localStorage.setItem('rolewithai_applications', JSON.stringify(existing))
                              alert(`[SYSTEM] Position opened: ${ticker} - ${job.title} at ${job.company}\nUnrealized P&L: +0.0%`)
                              // Refresh the page to show in Open Positions
                              window.location.reload()
                            }}
                          >
                            BUY
                          </button>
                          <button 
                            className="action-skip text-xs px-2 py-1 font-mono uppercase"
                            onClick={() => {
                              // SHORT: Add company to shorted list and flash alert on ticker
                              const shortedCompanies = JSON.parse(localStorage.getItem('shorted_companies') || '[]')
                              if (!shortedCompanies.includes(job.company.toLowerCase())) {
                                shortedCompanies.push(job.company.toLowerCase())
                                localStorage.setItem('shorted_companies', JSON.stringify(shortedCompanies))
                                
                                // Flash ghost alert on global ticker
                                const ghostAlert = {
                                  type: 'ghost',
                                  company: job.company,
                                  message: `SHORTED by trader - Ghost risk flagged`,
                                  timestamp: new Date().toISOString()
                                }
                                
                                // Store alert for CommunityWazeTicker to display
                                const alerts = JSON.parse(localStorage.getItem('ghost_alerts') || '[]')
                                alerts.unshift(ghostAlert)
                                localStorage.setItem('ghost_alerts', JSON.stringify(alerts.slice(0, 10))) // Keep last 10
                              }
                              
                              alert(`[SYSTEM] Position SHORTED: ${job.company} will be hidden from future scans.\nGhost alert flashed on global ticker.\nTime capital preserved.`)
                              // Refresh to remove from view
                              window.location.reload()
                            }}
                          >
                            SHORT
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Portfolio & Equity (40% width) */}
        <div className="w-[40%] flex flex-col overflow-y-auto bg-terminal-black">
          {/* Top Section: Account Value / Buying Power */}
          <div className="border-b border-terminal-border p-4 glass-panel">
            <ProfilePulse
              impactPoints={impactPoints}
              hiringVelocity={hiringVelocity}
              lowStressMode={lowStressMode}
              coffeeProgress={coffeeProgress}
              onCoffeeComplete={handleCoffeeComplete}
            />
          </div>

          {/* Middle Section: Open Positions */}
          <div className="flex-1 p-4 border-b border-terminal-border overflow-y-auto">
            <ApplicationTracker userName={userName} />
          </div>

          {/* Bottom Section: Transaction History / Realized Losses */}
          <div className="p-4 glass-panel">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-terminal-text uppercase tracking-wider font-sans mb-1">
                TRANSACTION HISTORY
              </h2>
              <p className="text-xs text-terminal-text/60 font-mono">
                Closed positions • Realized losses
              </p>
            </div>
            <TimelineOfPeace />
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJobDetail && (
        <JobDetailModal 
          job={selectedJobDetail} 
          onClose={() => setSelectedJobDetail(null)} 
        />
      )}

      {/* Report Hazard Modal */}
      <ReportHazard
        isOpen={showReportHazard}
        onClose={() => setShowReportHazard(false)}
        onReport={handleHazardReport}
      />
    </main>
  )
}

// Helper function for ticker generation
function getTicker(company: string): string {
  const words = company.split(' ')
  if (words.length === 1) {
    return company.substring(0, 4).toUpperCase().padEnd(4, 'X')
  }
  return words.map(w => w[0]).join('').toUpperCase().padEnd(4, 'X').substring(0, 4)
}
