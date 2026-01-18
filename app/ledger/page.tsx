'use client'

import PublicLedger from '@/components/PublicLedger'
import LiveCommunityFeed from '@/components/LiveCommunityFeed'
import ReportHazard, { HazardReport } from '@/components/ReportHazard'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function LedgerPage() {
  const [showReportHazard, setShowReportHazard] = useState(false)

  const handleHazardReport = (report: HazardReport) => {
    // In production, this would send to Supabase
    console.log('Hazard reported:', report)
    alert('Thank you for reporting! Your contribution helps the community.')
  }

  return (
    <main className="min-h-screen pb-20 bg-latte">
      <div className="w-full px-8 max-w-7xl mx-auto pt-8">
        {/* Live Community Feed */}
        <LiveCommunityFeed compact={true} />

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold text-[#4A2C1A] font-serif mb-2">
            Public Ghosting Ledger
          </h1>
          <p className="text-lg text-[#6B4423] opacity-70 rolewithai-voice">
            Community-powered transparency. See which companies have patterns of ghosting applicants.
          </p>
        </div>

        {/* Report Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowReportHazard(true)}
            className="px-6 py-3 bg-[#6B4423] text-[#F5E6D3] rounded-xl hover:bg-[#8B6F47] transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
          >
            <AlertTriangle className="w-5 h-5" />
            Report Market Hazard
          </button>
        </div>

        {/* Public Ledger */}
        <PublicLedger compact={false} />

        {/* Report Hazard Modal */}
        <ReportHazard
          isOpen={showReportHazard}
          onClose={() => setShowReportHazard(false)}
          onReport={handleHazardReport}
        />
      </div>
    </main>
  )
}
