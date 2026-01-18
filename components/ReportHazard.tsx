'use client'

import { useState } from 'react'
import { AlertTriangle, X, Clock, Pause, MessageSquare, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getOrCreateAlias } from '@/lib/aliasGenerator'

interface ReportHazardProps {
  isOpen: boolean
  onClose: () => void
  onReport: (report: HazardReport) => void
  company?: string
  role?: string
}

export interface HazardReport {
  type: 'ghosting' | 'interview_freeze' | 'recruiter_activity'
  company: string
  role?: string
  details?: string
  daysSinceApplied?: number
}

export default function ReportHazard({ isOpen, onClose, onReport, company = '', role = '' }: ReportHazardProps) {
  const [reportType, setReportType] = useState<HazardReport['type'] | null>(null)
  const [formData, setFormData] = useState({
    company: company,
    role: role,
    details: '',
    daysSinceApplied: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reportType || !formData.company.trim()) {
      return
    }

    setIsSubmitting(true)

    const report: HazardReport = {
      type: reportType,
      company: formData.company.trim(),
      role: formData.role.trim() || undefined,
      details: formData.details.trim() || undefined,
      daysSinceApplied: formData.daysSinceApplied ? parseInt(formData.daysSinceApplied) : undefined
    }

    // In production, this would send to Supabase with anonymous alias
    const alias = getOrCreateAlias()
    console.log('Reporting hazard:', { ...report, reporterAlias: alias })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onReport(report)
    
    // Reset form
    setReportType(null)
    setFormData({ company: company, role: role, details: '', daysSinceApplied: '' })
    setIsSubmitting(false)
    onClose()
  }

  const handleClose = () => {
    setReportType(null)
    setFormData({ company: company, role: role, details: '', daysSinceApplied: '' })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-terminal-black/80 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-panel border border-terminal-border max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-terminal-border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-terminal-bearish" />
                  <h2 className="text-xl font-bold text-terminal-text font-sans uppercase tracking-wider">
                    REPORT MARKET HAZARD
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-terminal-text/60 hover:text-terminal-text hover:bg-terminal-panel transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick-Select Menu */}
              {!reportType ? (
                <div className="space-y-3">
                  <p className="text-xs text-terminal-text/60 mb-4 font-mono">
                    Help the community navigate the market. Your report is anonymous.
                  </p>
                  
                  <button
                    onClick={() => setReportType('ghosting')}
                    className="w-full p-4 text-left glass-panel border border-terminal-bearish hover:border-terminal-bearish hover:shadow-[0_0_10px_rgba(255,51,51,0.3)] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-terminal-bearish" />
                      <div>
                        <div className="font-bold text-terminal-text font-sans uppercase tracking-wider mb-1">
                          [GHOSTING]
                        </div>
                        <div className="text-xs text-terminal-text/60 font-mono">
                          No response for 14+ days
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setReportType('interview_freeze')}
                    className="w-full p-4 text-left glass-panel border border-terminal-border hover:border-terminal-text hover:shadow-[0_0_10px_rgba(224,224,224,0.2)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Pause className="w-5 h-5 text-terminal-text/60" />
                      <div>
                        <div className="font-bold text-terminal-text font-sans uppercase tracking-wider mb-1">
                          [FREEZE]
                        </div>
                        <div className="text-xs text-terminal-text/60 font-mono">
                          Company paused the hiring process
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setReportType('recruiter_activity')}
                    className="w-full p-4 text-left glass-panel border border-terminal-bullish hover:border-terminal-bullish hover:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-terminal-bullish" />
                      <div>
                        <div className="font-bold text-terminal-text font-sans uppercase tracking-wider mb-1">
                          [ACTIVE]
                        </div>
                        <div className="text-xs text-terminal-text/60 font-mono">
                          They are actively messaging/hiring
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                /* Report Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-terminal-text/60 mb-2 font-semibold">
                      COMPANY *
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g., TechCorp"
                      required
                      className="w-full px-4 py-2 border border-terminal-border bg-terminal-black/50 backdrop-blur-sm text-terminal-text font-mono focus:outline-none focus:border-terminal-bullish focus:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-terminal-text/60 mb-2 font-semibold">
                      ROLE <span className="font-normal opacity-50">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g., Software Engineer"
                      className="w-full px-4 py-2 border border-terminal-border bg-terminal-black/50 backdrop-blur-sm text-terminal-text font-mono focus:outline-none focus:border-terminal-bullish focus:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-all"
                    />
                  </div>

                  {reportType === 'ghosting' && (
                    <div>
                      <label className="block text-xs font-sans uppercase tracking-wider text-terminal-text/60 mb-2 font-semibold">
                        DAYS SINCE APPLIED <span className="font-normal opacity-50">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        value={formData.daysSinceApplied}
                        onChange={(e) => setFormData({ ...formData, daysSinceApplied: e.target.value })}
                        placeholder="e.g., 14"
                        min="0"
                        className="w-full px-4 py-2 border border-terminal-border bg-terminal-black/50 backdrop-blur-sm text-terminal-text font-mono mono-number focus:outline-none focus:border-terminal-bullish focus:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-terminal-text/60 mb-2 font-semibold">
                      ADDITIONAL DETAILS <span className="font-normal opacity-50">(Optional)</span>
                    </label>
                    <textarea
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="Any additional context..."
                      rows={3}
                      className="w-full px-4 py-2 border border-terminal-border bg-terminal-black/50 backdrop-blur-sm text-terminal-text font-mono focus:outline-none focus:border-terminal-bullish focus:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setReportType(null)}
                      className="flex-1 px-4 py-2 bg-terminal-panel border border-terminal-border text-terminal-text font-mono text-xs uppercase hover:border-terminal-text transition-colors"
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-terminal-bullish text-terminal-black border border-terminal-bullish font-mono font-bold text-xs uppercase hover:bg-terminal-accent-green hover:shadow-[0_0_10px_rgba(0,255,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-terminal-black border-t-transparent animate-spin" />
                          SUBMITTING...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          SUBMIT REPORT
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-terminal-text/60 text-center pt-2 font-mono">
                    Your report is anonymous. Your alias will flash on the global ticker.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
