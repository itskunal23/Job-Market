'use client'

import { useState, useEffect } from 'react'
import { Plus, ExternalLink, Building2, Briefcase, Link as LinkIcon, X, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Application {
  id: string
  role: string
  company: string
  jobLink: string
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted' | 'archived'
  date: string
  ghostRisk?: 'low' | 'medium' | 'high'
  priority?: 'high' | 'medium' | 'low' | 'archived'
  daysSinceApplied?: number
}

interface ApplicationTrackerProps {
  userName?: string
}

export default function ApplicationTracker({ userName }: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    jobLink: ''
  })

  useEffect(() => {
    // Load applications from localStorage
    const stored = localStorage.getItem('rolewithai_applications')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Transform old format to new format if needed
        const transformed = parsed.map((app: any) => {
          const appDate = app.appliedDate || app.date || new Date().toISOString()
          const daysSince = Math.floor((new Date().getTime() - new Date(appDate).getTime()) / (1000 * 60 * 60 * 24))
          
          return {
            id: app.id,
            role: app.jobTitle || app.role,
            company: app.company,
            jobLink: app.jobLink || app.url,
            status: app.status || 'applied',
            date: appDate,
            ghostRisk: app.ghostRisk || 'low',
            priority: app.priority || calculatePriority(daysSince, app.ghostRisk || 'low'),
            daysSinceApplied: daysSince
          }
        })
        setApplications(transformed)
      } catch {
        // If parsing fails, initialize with default entry
        const defaultApp: Application = {
          id: '1',
          role: 'Data Scientist',
          company: 'Google',
          jobLink: 'https://careers.google.com',
          status: 'applied',
          date: '2026-01-18',
          ghostRisk: 'low',
          priority: 'high',
          daysSinceApplied: 0
        }
        setApplications([defaultApp])
        localStorage.setItem('rolewithai_applications', JSON.stringify([defaultApp]))
      }
    } else {
      // Initialize with default entry
      const defaultApp: Application = {
        id: '1',
        role: 'Data Scientist',
        company: 'Google',
        jobLink: 'https://careers.google.com',
        status: 'applied',
        date: '2026-01-18',
        ghostRisk: 'low',
        priority: 'high',
        daysSinceApplied: 0
      }
      setApplications([defaultApp])
      localStorage.setItem('rolewithai_applications', JSON.stringify([defaultApp]))
    }
  }, [])

  const calculatePriority = (daysSince: number, ghostRisk: string): 'high' | 'medium' | 'low' | 'archived' => {
    // Timeline of Peace Logic
    if (ghostRisk === 'high' && daysSince > 7) return 'archived'
    if (daysSince > 28) return 'archived' // 28-day rule: Permission to stop caring
    if (daysSince > 14) return 'low' // 14-day rule: Move to low priority
    if (ghostRisk === 'high') return 'low'
    if (daysSince > 7) return 'medium'
    return 'high'
  }

  const getTimelineOfPeaceMessage = (app: Application): string | null => {
    if (app.priority === 'archived') {
      return "Position Closed: Exit executed to preserve mental capital. Focus your energy elsewhere."
    }
    if (app.priority === 'low' && app.daysSinceApplied && app.daysSinceApplied > 14) {
      return "Watchlist: Position value declining. Consider autopilot mode."
    }
    if (app.ghostRisk === 'high') {
      return "Bearish Signal: High ghost risk detected. Don't invest emotional energy here."
    }
    return null
  }

  const saveApplications = (apps: Application[]) => {
    // Recalculate priorities and days since applied before saving
    const updated = apps.map(app => {
      const appDate = app.date
      const daysSince = Math.floor((new Date().getTime() - new Date(appDate).getTime()) / (1000 * 60 * 60 * 24))
      const ghostRisk = app.ghostRisk || 'low'
      const priority = calculatePriority(daysSince, ghostRisk)
      
      return {
        ...app,
        daysSinceApplied: daysSince,
        priority
      }
    })
    
    setApplications(updated)
    localStorage.setItem('rolewithai_applications', JSON.stringify(updated))
  }

  // Recalculate priorities periodically and auto-archive after 21 days
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = applications.map(app => {
        const appDate = app.date
        const daysSince = Math.floor((new Date().getTime() - new Date(appDate).getTime()) / (1000 * 60 * 60 * 24))
        const ghostRisk = app.ghostRisk || 'low'
        const priority = calculatePriority(daysSince, ghostRisk)
        
        // Auto-archive to Timeline of Peace after 21 days if still in "applied" status
        if (daysSince >= 21 && app.status === 'applied' && app.priority !== 'archived') {
          return {
            ...app,
            daysSinceApplied: daysSince,
            priority: 'archived' as const,
            status: 'ghosted' as const
          }
        }
        
        return {
          ...app,
          daysSinceApplied: daysSince,
          priority
        }
      })
      
      // Save updated applications
      const changed = updated.some((app, idx) => 
        app.priority !== applications[idx]?.priority || 
        app.status !== applications[idx]?.status
      )
      
      if (changed) {
        setApplications(updated)
        localStorage.setItem('rolewithai_applications', JSON.stringify(updated))
      }
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [applications.length])

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.role.trim() || !formData.company.trim() || !formData.jobLink.trim()) {
      return
    }

    const newApplication: Application = {
      id: Date.now().toString(),
      role: formData.role.trim(),
      company: formData.company.trim(),
      jobLink: formData.jobLink.trim(),
      status: 'applied',
      date: new Date().toISOString().split('T')[0],
      ghostRisk: 'low'
    }

    const updated = [...applications, newApplication]
    saveApplications(updated)
    
    // Reset form
    setFormData({ role: '', company: '', jobLink: '' })
    setShowForm(false)
    
    console.log('Application added:', newApplication)
  }

  const handleDeleteApplication = (id: string) => {
    const updated = applications.filter(app => app.id !== id)
    saveApplications(updated)
  }

  const handleStatusChange = (id: string, status: Application['status']) => {
    const updated = applications.map(app => {
      if (app.id === id) {
        const daysSince = app.daysSinceApplied || 0
        const ghostRisk = app.ghostRisk || 'low'
        return {
          ...app,
          status,
          priority: calculatePriority(daysSince, ghostRisk)
        }
      }
      return app
    })
    saveApplications(updated)
  }

  const handleArchive = (id: string) => {
    const updated = applications.map(app =>
      app.id === id ? { ...app, priority: 'archived' as const, status: 'archived' as const } : app
    )
    saveApplications(updated)
  }

  const getStatusBadgeColor = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return 'bg-[#88A07020] text-[#88A070] border-[#88A07040]' // Matcha Green
      case 'interview':
        return 'bg-[#3D5A8020] text-[#3D5A80] border-[#3D5A8040]' // Barista Blue
      case 'offer':
        return 'bg-[#E0A45820] text-[#E0A458] border-[#E0A45840]' // Crema Gold
      case 'rejected':
        return 'bg-[#935F4C20] text-[#935F4C] border-[#935F4C40]' // Cold Brew Red
      case 'ghosted':
        return 'bg-[#935F4C30] text-[#935F4C] border-[#935F4C50]' // Cold Brew Red (darker)
      case 'archived':
        return 'bg-[#E5E0DA] text-[#1A2A3A] border-[#E5E0DA] opacity-60' // Muted for archived
      default:
        return 'bg-[#88A07020] text-[#88A070] border-[#88A07040]'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-[#4A2C1A]'
      case 'medium':
        return 'text-[#6B4423] opacity-80'
      case 'low':
        return 'text-[#8B6F47] opacity-60'
      case 'archived':
        return 'text-[#A8A08A] opacity-50'
      default:
        return 'text-[#4A2C1A]'
    }
  }

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-4 h-4" />
      case 'interview':
        return <CheckCircle2 className="w-4 h-4" />
      case 'offer':
        return <CheckCircle2 className="w-4 h-4" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />
      case 'ghosted':
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  // Helper function for ticker generation
  const getTicker = (company: string): string => {
    const words = company.split(' ')
    if (words.length === 1) {
      return company.substring(0, 4).toUpperCase().padEnd(4, 'X')
    }
    return words.map(w => w[0]).join('').toUpperCase().padEnd(4, 'X').substring(0, 4)
  }

  const applicationCount = applications.filter(app => app.priority !== 'archived').length

  return (
    <div className="glass-panel p-4 border border-terminal-border">
      {/* Header Section */}
      <div className="mb-4 pb-3 border-b border-terminal-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-terminal-text font-sans uppercase tracking-wider">
              OPEN POSITIONS
            </h3>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-terminal-panel border border-terminal-border text-terminal-text hover:border-terminal-bullish hover:shadow-[0_0_8px_rgba(0,255,0,0.3)] font-mono text-xs uppercase transition-all"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            OPEN
          </button>
        </div>
        <p className="text-xs font-mono text-terminal-text/60">
          <span className="text-terminal-text font-bold mono-number">{applicationCount}</span> active position{applicationCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Add Application Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <form onSubmit={handleAddApplication} className="space-y-3 p-4 bg-terminal-panel border border-terminal-border">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-terminal-text/60 mb-1">
                  Role *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-terminal-text/40" />
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Data Scientist"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-terminal-border bg-terminal-black text-terminal-text text-sm font-mono focus:outline-none focus:border-terminal-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-terminal-text/60 mb-1">
                  Company *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-terminal-text/40" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Google"
                    required
                    className="w-full pl-8 pr-3 py-2 border border-terminal-border bg-terminal-black text-terminal-text text-sm font-mono focus:outline-none focus:border-terminal-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-terminal-text/60 mb-1">
                  Job Link *
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-terminal-text/40" />
                  <input
                    type="url"
                    value={formData.jobLink}
                    onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                    placeholder="https://..."
                    required
                    className="w-full pl-8 pr-3 py-2 border border-terminal-border bg-terminal-black text-terminal-text text-sm font-mono focus:outline-none focus:border-terminal-text"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-terminal-bullish text-terminal-black border border-terminal-bullish font-mono text-xs uppercase hover:bg-terminal-accent-green transition-colors"
                >
                  OPEN POSITION
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ role: '', company: '', jobLink: '' })
                  }}
                  className="px-3 py-2 bg-terminal-panel border border-terminal-border text-terminal-text font-mono text-xs uppercase hover:border-terminal-text transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Open Positions Table */}
      {applications.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="w-8 h-8 text-terminal-text/40 mx-auto mb-2" />
          <p className="text-terminal-text/60 text-xs font-mono">
            No open positions. Open your first position to begin.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[400px]">
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Entry Date</th>
                <th>Status</th>
                <th>Unrealized P&L</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications
                .filter(app => app.priority !== 'archived')
                .map((app) => {
                  const ticker = getTicker(app.company)
                  const daysSince = app.daysSinceApplied || 0
                  // Calculate unrealized P&L with time-decay mechanic
                  // Starts at +0%, drops 5% per day, max loss of 80% (market crash threshold)
                  // If status is interview/offer, show positive P&L
                  let unrealizedPnL = 0
                  if (app.status === 'offer') {
                    unrealizedPnL = 100 // Full profit on offer
                  } else if (app.status === 'interview') {
                    unrealizedPnL = 50 // Partial profit on interview
                  } else if (app.status === 'applied') {
                    unrealizedPnL = -Math.min(daysSince * 5, 80) // Decay: -5% per day, max -80%
                  } else {
                    unrealizedPnL = -100 // Rejected/ghosted = total loss
                  }
                  
                  const isProfit = unrealizedPnL >= 0
                  const isMarketCrash = unrealizedPnL <= -80 // Market crash threshold (-80% or worse)
                  const pnlPercent = unrealizedPnL.toFixed(1) + '%'
                  
                  // Visual decay indicator: color intensity based on loss
                  const lossIntensity = Math.abs(unrealizedPnL) / 100
                  const redIntensity = isMarketCrash ? 1 : lossIntensity * 0.8
                  
                  return (
                    <tr 
                      key={app.id} 
                      className={`${app.priority === 'low' ? 'opacity-60' : ''} ${isMarketCrash ? 'bg-terminal-bearish/5 border-l-2 border-terminal-bearish' : ''}`}
                    >
                      <td className="font-mono font-bold uppercase">{ticker}</td>
                      <td className="font-mono text-xs mono-number">{formatDate(app.date)}</td>
                      <td>
                        <span className={`px-2 py-0.5 text-xs font-mono border ${getStatusBadgeColor(app.status)}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={`font-mono mono-number font-bold ${isProfit ? 'text-terminal-bullish neon-glow-green' : isMarketCrash ? 'text-terminal-bearish neon-glow-red animate-pulse' : 'text-terminal-bearish'}`}>
                        <div className="flex items-center gap-2">
                          <span>{isProfit ? '+' : ''}{pnlPercent}</span>
                          {isMarketCrash && (
                            <>
                              <span className="text-xs text-terminal-bearish font-bold animate-pulse">🚨 MARGIN CALL</span>
                              <span className="text-xs text-terminal-text/60 font-mono">({daysSince}d)</span>
                            </>
                          )}
                          {!isProfit && !isMarketCrash && daysSince > 0 && (
                            <span className="text-xs text-terminal-text/40 font-mono">(-{daysSince * 5}% decay)</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as Application['status'])}
                          className="text-xs px-2 py-1 bg-terminal-panel border border-terminal-border text-terminal-text font-mono focus:outline-none focus:border-terminal-text"
                        >
                          <option value="applied">APPLIED</option>
                          <option value="interview">INTERVIEW</option>
                          <option value="offer">OFFER</option>
                          <option value="rejected">REJECTED</option>
                          <option value="ghosted">GHOSTED</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FDFBF7;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3D5A80;
          border-radius: 3px;
          opacity: 0.3;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3D5A80;
          opacity: 0.5;
        }
      `}</style>
    </div>
  )
}

// Application Card Component
function ApplicationCard({
  app,
  onStatusChange,
  onDelete,
  onArchive,
  getStatusIcon,
  getStatusBadgeColor,
  formatDate,
  getTimelineOfPeaceMessage,
  isLowPriority = false,
  isArchived = false
}: {
  app: Application
  onStatusChange: (id: string, status: Application['status']) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  getStatusIcon: (status: Application['status']) => JSX.Element
  getStatusBadgeColor: (status: Application['status']) => string
  formatDate: (date: string) => string
  getTimelineOfPeaceMessage: (app: Application) => string | null
  isLowPriority?: boolean
  isArchived?: boolean
}) {
  const peaceMessage = getTimelineOfPeaceMessage(app)
  const opacityClass = isArchived ? 'opacity-50' : isLowPriority ? 'opacity-75' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={!isArchived ? { y: -2, shadow: 'md' } : {}}
      className={`group p-4 bg-white rounded-xl border border-border hover:border-cafe-accent hover:shadow-md transition-all duration-200 cursor-pointer ${opacityClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[#6B4423]">
              {getStatusIcon(app.status)}
            </div>
            <h4 className="font-semibold text-[#4A2C1A] truncate text-sm">
              {app.role}
            </h4>
          </div>
          <p className="text-sm text-[#6B4423] mb-2 font-medium">
            {app.company}
          </p>
          
          {/* Timeline of Peace Message */}
          {peaceMessage && (
            <div className="mb-2 p-2 bg-[#FDFBF7] rounded-lg border-l-2 border-[#3D5A80]">
              <p className="text-xs text-[#1A2A3A] italic rolewithai-voice opacity-80">
                {peaceMessage}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(app.status)}`}>
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </span>
            <span className="text-xs text-[#6B4423] opacity-60">
              {formatDate(app.date)}
            </span>
            {app.daysSinceApplied !== undefined && app.daysSinceApplied > 0 && (
              <span className="text-xs text-[#8B6F47] opacity-60">
                {app.daysSinceApplied} day{app.daysSinceApplied !== 1 ? 's' : ''} ago
              </span>
            )}
            {app.ghostRisk && app.ghostRisk !== 'low' && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                app.ghostRisk === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {app.ghostRisk === 'high' ? 'High Ghost Risk' : 'Medium Ghost Risk'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isArchived && (
            <>
              <a
                href={app.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-[#6B4423] opacity-60 hover:opacity-100 hover:bg-[#F5F1E8] rounded-lg transition-colors"
                title="Open job link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <select
                value={app.status}
                onChange={(e) => onStatusChange(app.id, e.target.value as Application['status'])}
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-1 border border-[#E5D5C5] rounded-lg bg-white text-[#4A2C1A] focus:outline-none focus:ring-2 focus:ring-[#8B6F47] hover:border-[#D4B896] transition-colors"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="ghosted">Ghosted</option>
              </select>
            </>
          )}
          {isLowPriority && !isArchived && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onArchive(app.id)
              }}
              className="p-2 text-[#8B6F47] opacity-60 hover:opacity-100 hover:bg-[#F5F1E8] rounded-lg transition-colors"
              title="Move to Timeline of Peace"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(app.id)
            }}
            className="p-2 text-[#8B6F47] opacity-60 hover:opacity-100 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete application"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
