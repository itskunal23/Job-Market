'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Zap, User, Loader2, MapPin } from 'lucide-react'

interface RoleMarketData {
  role: string
  demand_score: number
  hiring_velocity: number
  average_posted_days: number
  total_postings: number
  growth_trend: string
  top_locations: string[]
}

interface MarketInsight {
  most_demanding_roles: RoleMarketData[]
  fastest_hiring_roles: RoleMarketData[]
  trending_roles: RoleMarketData[]
  market_temperature: string
  last_updated: string
}

interface RoleSelectorProps {
  onComplete: (userName: string, selectedRole: string, location: string) => void
}

export default function RoleSelector({ onComplete, onShowJobDiscovery }: RoleSelectorProps) {
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true)
  const [marketInsights, setMarketInsights] = useState<MarketInsight | null>(null)
  const [error, setError] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    loadMarketInsights()
  }, [])

  const loadMarketInsights = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/market-insights')
      if (response.ok) {
        const data = await response.json()
        setMarketInsights(data)
      }
    } catch (error) {
      console.error('Error loading market insights:', error)
    } finally {
      setIsLoadingMarketData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    const roleToUse = showCustomInput ? customRole.trim() : selectedRole
    if (!roleToUse) {
      setError('Please select or enter a role')
      return
    }

    setIsLoading(true)
    setError('')

    // Store user preferences
    localStorage.setItem('rolewithai_userName', name.trim())
    localStorage.setItem('rolewithai_selectedRole', roleToUse)
    localStorage.setItem('rolewithai_location', location.trim())

    // Complete onboarding
    onComplete(name.trim(), roleToUse, location.trim())
  }

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'hot':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warm':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto mt-12"
    >
      <div className="rolewithai-card p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold text-espresso mb-4 font-serif">
            Welcome to RoleWithAI
          </h1>
          <p className="text-lg text-espresso opacity-70 rolewithai-voice mb-4">
            Tell us what role you're looking for, and we'll find the best opportunities with real market insights.
          </p>
          <p className="text-sm text-espresso opacity-50">
            Or browse real jobs we've found for you on the discovery page
          </p>
        </div>

        {/* Market Temperature Indicator */}
        {marketInsights && (
          <div className={`mb-6 p-4 rounded-lg border ${getTemperatureColor(marketInsights.market_temperature)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Market Temperature</p>
                <p className="text-2xl font-bold capitalize">{marketInsights.market_temperature}</p>
              </div>
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-espresso mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crema bg-white text-espresso"
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

          {/* Location Input */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-espresso mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Preferred Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crema bg-white text-espresso"
              placeholder="e.g., San Francisco, CA or Remote"
              disabled={isLoading}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-espresso mb-2">
              <Search className="inline w-4 h-4 mr-2" />
              What role are you looking for?
            </label>
            
            {!showCustomInput ? (
              <>
                {/* Popular Roles */}
                {isLoadingMarketData ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-espresso" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Trending Roles */}
                    {marketInsights?.trending_roles && marketInsights.trending_roles.length > 0 && (
                      <div>
                        <p className="text-xs text-espresso opacity-60 mb-2 font-medium">🔥 Trending Now</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {marketInsights.trending_roles.slice(0, 6).map((roleData) => (
                            <button
                              key={roleData.role}
                              type="button"
                              onClick={() => {
                                setSelectedRole(roleData.role)
                                setShowCustomInput(false)
                              }}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                selectedRole === roleData.role
                                  ? 'border-crema bg-crema/20'
                                  : 'border-border hover:border-crema/50'
                              }`}
                            >
                              <p className="font-medium text-espresso text-sm">{roleData.role}</p>
                              <p className="text-xs text-espresso opacity-60 mt-1">
                                +{roleData.hiring_velocity.toFixed(1)}% growth
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fastest Hiring */}
                    {marketInsights?.fastest_hiring_roles && marketInsights.fastest_hiring_roles.length > 0 && (
                      <div>
                        <p className="text-xs text-espresso opacity-60 mb-2 font-medium">⚡ Fastest Hiring</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {marketInsights.fastest_hiring_roles.slice(0, 6).map((roleData) => (
                            <button
                              key={roleData.role}
                              type="button"
                              onClick={() => {
                                setSelectedRole(roleData.role)
                                setShowCustomInput(false)
                              }}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                selectedRole === roleData.role
                                  ? 'border-crema bg-crema/20'
                                  : 'border-border hover:border-crema/50'
                              }`}
                            >
                              <p className="font-medium text-espresso text-sm">{roleData.role}</p>
                              <p className="text-xs text-espresso opacity-60 mt-1">
                                {roleData.average_posted_days.toFixed(0)} days avg
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Most Demanding */}
                    {marketInsights?.most_demanding_roles && marketInsights.most_demanding_roles.length > 0 && (
                      <div>
                        <p className="text-xs text-espresso opacity-60 mb-2 font-medium">📈 High Demand</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {marketInsights.most_demanding_roles.slice(0, 6).map((roleData) => (
                            <button
                              key={roleData.role}
                              type="button"
                              onClick={() => {
                                setSelectedRole(roleData.role)
                                setShowCustomInput(false)
                              }}
                              className={`p-3 rounded-lg border text-left transition-colors ${
                                selectedRole === roleData.role
                                  ? 'border-crema bg-crema/20'
                                  : 'border-border hover:border-crema/50'
                              }`}
                            >
                              <p className="font-medium text-espresso text-sm">{roleData.role}</p>
                              <p className="text-xs text-espresso opacity-60 mt-1">
                                {roleData.total_postings}+ openings
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Role Option */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(true)
                    setSelectedRole('')
                  }}
                  className="mt-4 text-sm text-espresso opacity-60 hover:opacity-100 underline"
                >
                  Can't find your role? Enter it manually
                </button>
              </>
            ) : (
              <div>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-crema bg-white text-espresso"
                  placeholder="e.g., Senior Product Designer, Data Scientist, etc."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomRole('')
                  }}
                  className="mt-2 text-sm text-espresso opacity-60 hover:opacity-100 underline"
                >
                  Browse popular roles instead
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="space-y-3">
            {onShowJobDiscovery && name.trim() && (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('rolewithai_userName', name.trim())
                  onShowJobDiscovery(name.trim())
                }}
                className="w-full px-6 py-3 bg-crema text-espresso rounded-lg font-medium hover:bg-crema/90 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Browse Real Jobs First
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !name.trim() || (!selectedRole && !customRole.trim())}
              className="w-full px-6 py-3 bg-espresso text-white rounded-lg font-medium hover:bg-espresso/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finding opportunities...
                </>
              ) : (
                <>
                  Find My Opportunities
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-xs text-espresso opacity-50 text-center">
          We'll search for jobs matching your role and show you real-time market insights.
        </p>
      </div>
    </motion.div>
  )
}
