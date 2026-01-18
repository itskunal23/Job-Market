'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Building2, Clock, ExternalLink, Loader2, Sparkles } from 'lucide-react'

interface Job {
  title: string
  company: string
  location: string
  description: string
  url: string
  platform: string
  posted_date?: string
  salary?: string
  job_type?: string
  truthScore?: number
  ghostRisk?: string
  whyScore?: string
}

interface JobDiscoveryProps {
  onJobSelect: (job: Job) => void
  userName: string
}

export default function JobDiscovery({ onJobSelect, userName }: JobDiscoveryProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:5000/api/discover-jobs?limit=60')
      
      if (!response.ok) {
        throw new Error('Failed to load jobs')
      }
      
      const data = await response.json()
      
      if (data.success && data.jobs) {
        setJobs(data.jobs)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
      console.error('Error loading jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    // Store selected job
    localStorage.setItem('rolewithai_selectedJob', JSON.stringify(job))
    localStorage.setItem('rolewithai_userName', userName)
    
    // Find similar jobs based on this selection
    onJobSelect(job)
  }

  const filteredJobs = jobs.filter(job => {
    const matchesPlatform = filterPlatform === 'all' || job.platform.toLowerCase() === filterPlatform.toLowerCase()
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesPlatform && matchesSearch
  })

  const getGhostRiskColor = (risk?: string) => {
    if (!risk) return 'bg-gray-100 text-gray-600'
    switch (risk.toUpperCase()) {
      case 'LOW':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getTruthScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const platforms = ['all', ...Array.from(new Set(jobs.map(j => j.platform)))]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto mt-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-espresso mb-2 font-serif">
          Welcome, {userName}!
        </h1>
        <p className="text-lg text-espresso opacity-70 rolewithai-voice">
          We've found {jobs.length} opportunities for you. Click on any job that interests you to see similar roles.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="rolewithai-card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-espresso opacity-40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies, or locations..."
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crema bg-white text-espresso"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-espresso opacity-60">Platform:</span>
            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setFilterPlatform(platform)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPlatform === platform
                    ? 'bg-crema text-espresso'
                    : 'bg-white border border-border text-espresso opacity-60 hover:opacity-100'
                }`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-espresso mx-auto mb-4" />
            <p className="text-espresso opacity-60">Discovering opportunities from LinkedIn, Indeed, and Glassdoor...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rolewithai-card p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadJobs}
            className="px-6 py-2 bg-espresso text-white rounded-lg hover:bg-espresso/90"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Jobs Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={`${job.platform}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleJobClick(job)}
              className={`rolewithai-card p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                selectedJob?.url === job.url ? 'ring-2 ring-crema' : ''
              }`}
            >
              {/* Platform Badge */}
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-crema/20 text-espresso text-xs font-medium rounded-full">
                  {job.platform}
                </span>
                {job.truthScore !== undefined && (
                  <div className={`text-2xl font-bold ${getTruthScoreColor(job.truthScore)}`}>
                    {job.truthScore}
                  </div>
                )}
              </div>

              {/* Job Title */}
              <h3 className="text-xl font-semibold text-espresso mb-2 font-serif line-clamp-2">
                {job.title}
              </h3>

              {/* Company and Location */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-espresso opacity-70">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{job.company}</span>
                </div>
                <div className="flex items-center gap-2 text-espresso opacity-70">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{job.location}</span>
                </div>
                {job.posted_date && (
                  <div className="flex items-center gap-2 text-espresso opacity-60">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">
                      {new Date(job.posted_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Description Snippet */}
              {job.description && (
                <p className="text-sm text-espresso opacity-60 mb-4 line-clamp-2">
                  {job.description}
                </p>
              )}

              {/* Ghost Risk Badge */}
              {job.ghostRisk && (
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getGhostRiskColor(job.ghostRisk)} mb-4`}>
                  {job.ghostRisk} Ghost Risk
                </div>
              )}

              {/* Salary */}
              {job.salary && (
                <div className="text-sm font-medium text-espresso mb-4">
                  💰 {job.salary}
                </div>
              )}

              {/* Click Indicator */}
              <div className="flex items-center gap-2 text-crema text-sm font-medium mt-4">
                <Sparkles className="w-4 h-4" />
                <span>Click to find similar roles</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredJobs.length === 0 && (
        <div className="rolewithai-card p-12 text-center">
          <p className="text-espresso opacity-60 rolewithai-voice">
            No jobs found matching your filters. Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !error && (
        <div className="mt-6 text-center text-sm text-espresso opacity-60">
          Showing {filteredJobs.length} of {jobs.length} opportunities
        </div>
      )}
    </motion.div>
  )
}
