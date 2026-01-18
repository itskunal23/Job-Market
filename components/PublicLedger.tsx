'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Heart, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface CompanyGhostData {
  company: string
  ghostRating: number // 0-100, lower is worse
  totalReports: number
  recentReports: number // Last 7 days
  status: 'high_risk' | 'medium_risk' | 'low_risk' | 'clear'
  lastUpdated: string
}

interface PublicLedgerProps {
  compact?: boolean
}

export default function PublicLedger({ compact = false }: PublicLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Mock data - in production, this would come from Supabase
  const mockCompanies: CompanyGhostData[] = [
    {
      company: 'StartupXYZ',
      ghostRating: 25,
      totalReports: 47,
      recentReports: 12,
      status: 'high_risk',
      lastUpdated: new Date().toISOString()
    },
    {
      company: 'TechCorp',
      ghostRating: 45,
      totalReports: 23,
      recentReports: 5,
      status: 'medium_risk',
      lastUpdated: new Date(Date.now() - 3600000).toISOString()
    },
    {
      company: 'Google',
      ghostRating: 85,
      totalReports: 5,
      recentReports: 1,
      status: 'clear',
      lastUpdated: new Date(Date.now() - 7200000).toISOString()
    },
    {
      company: 'DesignStudio',
      ghostRating: 60,
      totalReports: 15,
      recentReports: 3,
      status: 'medium_risk',
      lastUpdated: new Date(Date.now() - 1800000).toISOString()
    }
  ]

  const filteredCompanies = mockCompanies.filter(company =>
    company.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: CompanyGhostData['status']) => {
    switch (status) {
      case 'high_risk':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium_risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low_risk':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'clear':
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  const getStatusIcon = (status: CompanyGhostData['status']) => {
    switch (status) {
      case 'high_risk':
        return <AlertTriangle className="w-4 h-4" />
      case 'medium_risk':
        return <TrendingDown className="w-4 h-4" />
      case 'low_risk':
        return <TrendingUp className="w-4 h-4" />
      case 'clear':
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: CompanyGhostData['status']) => {
    switch (status) {
      case 'high_risk':
        return '🔴 High Risk'
      case 'medium_risk':
        return '🟡 Medium Risk'
      case 'low_risk':
        return '🔵 Low Risk'
      case 'clear':
        return '🟢 Clear'
    }
  }

  if (compact) {
    return (
      <div className="rolewithai-card p-4 bg-cafe-bg rounded-xl border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-cafe-dark font-serif">
            Community Ghost Rating
          </h3>
          <Link
            href="/ledger"
            className="text-xs text-cafe-accent hover:text-cafe-accent-dark flex items-center gap-1"
          >
            View All
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {mockCompanies.slice(0, 3).map((company) => (
            <div key={company.company} className="flex items-center justify-between p-2 bg-white rounded-lg hover:shadow-sm transition-shadow">
              <span className="text-sm font-medium text-cafe-dark">{company.company}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(company.status)}`}>
                {company.ghostRating}/100
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rolewithai-card p-6 bg-[#F5F1E8] rounded-2xl border border-[#E5D5C5]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#4A2C1A] font-serif mb-2">
          Public Ghosting Ledger
        </h2>
        <p className="text-sm text-[#6B4423] opacity-70">
          Community-powered transparency. See which companies have patterns of ghosting applicants.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B4423] opacity-50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search companies..."
          className="w-full pl-10 pr-4 py-2 border border-[#E5D5C5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] bg-white text-[#4A2C1A]"
        />
      </div>

      {/* Companies Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5D5C5]">
              <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A2C1A]">Company</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A2C1A]">Ghost Rating</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A2C1A]">Reports</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A2C1A]">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company, index) => (
              <motion.tr
                key={company.company}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-[#E5D5C5] hover:bg-[#F9F7F2] transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-semibold text-[#4A2C1A]">{company.company}</div>
                  <div className="text-xs text-[#8B6F47] opacity-60">
                    {company.recentReports} reports this week
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#E5D5C5] rounded-full h-2 max-w-[100px]">
                      <div
                        className={`h-2 rounded-full ${
                          company.ghostRating < 40 ? 'bg-red-500' :
                          company.ghostRating < 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${company.ghostRating}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#4A2C1A]">
                      {company.ghostRating}/100
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-[#6B4423]">
                    {company.totalReports} total
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(company.status)}`}>
                    {getStatusIcon(company.status)}
                    {getStatusLabel(company.status)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-cafe-ghost mx-auto mb-3 opacity-40" />
          <p className="text-cafe-ghost opacity-60">
            No companies found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  )
}
