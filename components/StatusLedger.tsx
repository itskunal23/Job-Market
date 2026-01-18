'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, Eye } from 'lucide-react'

interface AppliedJob {
  id: string
  title: string
  company: string
  status: 'applied' | 'interview' | 'ghosted' | 'rejected'
  appliedDate: string
  daysSince: number
  roleWithAINote?: string
  priority: 'high' | 'low'
}

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
    status: 'ghosted',
    appliedDate: '2025-12-20',
    daysSince: 28,
    roleWithAINote: "I've archived this so you don't have to think about it anymore. This company has ghosted 85% of applicants this month—this is on them, not you.",
    priority: 'low',
  },
]

export default function StatusLedger() {
  const getStatusIcon = (status: AppliedJob['status']) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-5 h-5 text-espresso opacity-60" />
      case 'interview':
        return <CheckCircle2 className="w-5 h-5 text-crema" />
      case 'ghosted':
        return <XCircle className="w-5 h-5 text-coldbrew" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-espresso opacity-40" />
    }
  }

  const getStatusColor = (status: AppliedJob['status']) => {
    switch (status) {
      case 'applied':
        return 'text-espresso opacity-70'
      case 'interview':
        return 'text-crema'
      case 'ghosted':
        return 'text-coldbrew'
      case 'rejected':
        return 'text-espresso opacity-50'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-5 h-5 text-crema" />
        <h2 className="text-xl font-semibold text-espresso font-serif">
          Timeline of Peace
        </h2>
      </div>
      {mockAppliedJobs.map((job, index) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: job.status === 'ghosted' ? 0.4 : 1,
            x: 0,
            filter: job.status === 'ghosted' ? 'blur(1px)' : 'blur(0px)',
          }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={`rolewithai-card ${job.status === 'ghosted' ? 'fading-into-past' : ''}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              {getStatusIcon(job.status)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-espresso mb-1 truncate font-serif">
                {job.title}
              </h4>
              <p className="text-espresso opacity-70 text-sm mb-2 font-sans">
                {job.company}
              </p>
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium font-sans ${getStatusColor(job.status)} ${
                  job.status === 'interview' ? 'bg-crema-50' :
                  job.status === 'ghosted' ? 'bg-coldbrew-50' :
                  'bg-parchment'
                }`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                <span className="text-xs text-espresso opacity-50 ml-2 font-sans">
                  {job.daysSince} days ago
                </span>
              </div>

              {/* Comforting RoleWithAI Note - Timeline of Peace */}
              {job.roleWithAINote && (
                <div className="closure-note mt-3">
                  <p className="support-note text-sm">
                    <strong className="text-espresso">RoleWithAI:</strong> "{job.roleWithAINote}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
