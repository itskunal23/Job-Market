'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, Archive } from 'lucide-react'

interface AppliedJob {
  id: string
  title: string
  company: string
  status: 'applied' | 'interview' | 'offer' | 'ghosted' | 'rejected' | 'archived'
  appliedDate: string
  daysSince: number
  roleWithAINote?: string
  priority: 'high' | 'low'
}

// Mock data - in production, this would come from ApplicationTracker
const mockAppliedJobs: AppliedJob[] = [
  {
    id: '1',
    title: 'Senior Product Designer',
    company: 'TechCorp Inc.',
    status: 'applied',
    appliedDate: '2026-01-15',
    daysSince: 12,
    roleWithAINote: "I'm watching this so you don't have to. I've moved it to 'low priority' for you—don't let their silence occupy your headspace.",
    priority: 'low',
  },
  {
    id: '2',
    title: 'UX Lead',
    company: 'DesignStudio',
    status: 'interview',
    appliedDate: '2026-01-10',
    daysSince: 17,
    priority: 'high',
  },
  {
    id: '3',
    title: 'Product Manager',
    company: 'StartupXYZ',
    status: 'archived',
    appliedDate: '2025-12-20',
    daysSince: 28,
    roleWithAINote: "We've archived this so you don't have to think about it. The community reports this company is currently silent. Your energy is better spent elsewhere.",
    priority: 'low',
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'SilentCorp',
    status: 'archived',
    appliedDate: '2025-12-15',
    daysSince: 33,
    roleWithAINote: "Automated closure: 21+ days with no response. You have permission to stop checking on this one.",
    priority: 'low',
  },
]

export default function TimelineOfPeace() {
  // Filter to only show archived/peaceful applications (Realized Losses)
  const realizedLosses = mockAppliedJobs.filter(job => 
    job.status === 'archived' || job.daysSince > 21
  )

  const getStatusIcon = (status: AppliedJob['status']) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-4 h-4 text-cafe-dark/40" />
      case 'interview':
        return <CheckCircle2 className="w-4 h-4 text-cafe-matcha" />
      case 'archived':
        return <Archive className="w-4 h-4 text-cafe-ghost/60" />
      default:
        return <XCircle className="w-4 h-4 text-cafe-ghost/60" />
    }
  }

  // Generate ticker from company name
  const getTicker = (company: string): string => {
    const words = company.split(' ')
    if (words.length === 1) {
      return company.substring(0, 4).toUpperCase().padEnd(4, 'X')
    }
    return words.map(w => w[0]).join('').toUpperCase().padEnd(4, 'X').substring(0, 4)
  }

  return (
    <div>
      {realizedLosses.length === 0 ? (
        <div className="glass-panel p-8 text-center border border-terminal-border">
          <Archive className="w-8 h-8 text-terminal-text/30 mx-auto mb-3" />
          <p className="text-sm text-terminal-text/60 font-mono">
            No realized losses yet.
          </p>
          <p className="text-xs text-terminal-text/40 mt-2 font-mono">
            Positions closed after 21+ days will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="terminal-table">
            <thead>
              <tr>
                <th className="font-sans">Symbol</th>
                <th className="font-sans">Role</th>
                <th className="font-sans">Entry Date</th>
                <th className="font-sans">Exit Date</th>
                <th className="font-sans">Realized Loss</th>
                <th className="font-sans">Days Held</th>
              </tr>
            </thead>
            <tbody>
              {realizedLosses.map((job) => {
                const ticker = getTicker(job.company)
                const lossPercent = Math.min(100, (job.daysSince / 30) * 100)
                const realizedLoss = -Math.round(lossPercent)
                
                return (
                  <tr key={job.id} className="opacity-60">
                    <td className="font-mono font-bold uppercase">{ticker}</td>
                    <td className="text-xs">
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-terminal-text/60">{job.company}</div>
                    </td>
                    <td className="font-mono text-xs mono-number">{job.appliedDate}</td>
                    <td className="font-mono text-xs mono-number">
                      {new Date(new Date(job.appliedDate).getTime() + job.daysSince * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    </td>
                    <td className="font-mono mono-number text-terminal-bearish">
                      {realizedLoss}%
                    </td>
                    <td className="font-mono mono-number text-terminal-text/60">
                      {job.daysSince}d
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
