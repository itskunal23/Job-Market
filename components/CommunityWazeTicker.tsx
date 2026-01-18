'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react'

interface WazeAlert {
  id: string
  type: 'ghost' | 'momentum' | 'freeze' | 'active'
  company: string
  message: string
  count: number
  timestamp: string
}

export default function CommunityWazeTicker() {
  const [alerts, setAlerts] = useState<WazeAlert[]>([])

  useEffect(() => {
    // Fetch real community alerts from backend and localStorage
    const fetchAlerts = async () => {
      try {
        // Get alerts from localStorage (includes SHORT actions)
        const storedAlerts = JSON.parse(localStorage.getItem('ghost_alerts') || '[]')
        
        // TODO: Replace with real API endpoint
        // const response = await fetch('http://localhost:5000/api/community-alerts')
        // const apiAlerts = await response.json()
        
        // Combine stored alerts with mock data
        const mockAlerts: WazeAlert[] = [
          {
            id: '1',
            type: 'ghost',
            company: 'TechCorp',
            message: '15 users reported no response in last 72h',
            count: 15,
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            type: 'momentum',
            company: 'NVIDIA',
            message: '5 users moved to Interview stage today',
            count: 5,
            timestamp: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: '3',
            type: 'freeze',
            company: 'StartupXYZ',
            message: 'Hiring freeze reported by 8 users',
            count: 8,
            timestamp: new Date(Date.now() - 600000).toISOString()
          }
        ]
        
        // Convert stored alerts to WazeAlert format
        const convertedAlerts: WazeAlert[] = storedAlerts.map((alert: any, idx: number) => ({
          id: `stored-${idx}`,
          type: alert.type || 'ghost',
          company: alert.company,
          message: alert.message || 'Ghost risk flagged',
          count: 1,
          timestamp: alert.timestamp || new Date().toISOString()
        }))
        
        // Combine and prioritize recent alerts
        const allAlerts = [...convertedAlerts, ...mockAlerts]
        setAlerts(allAlerts.slice(0, 10)) // Show top 10
      } catch (error) {
        console.error('Error fetching community alerts:', error)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000) // Refresh every 5 seconds for real-time feel
    
    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ghost':
        return <AlertTriangle className="w-3 h-3 text-terminal-bearish" />
      case 'momentum':
        return <TrendingUp className="w-3 h-3 text-terminal-bullish" />
      case 'freeze':
        return <Zap className="w-3 h-3 text-terminal-bearish" />
      case 'active':
        return <Users className="w-3 h-3 text-terminal-bullish" />
      default:
        return null
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'ghost':
      case 'freeze':
        return 'text-terminal-bearish'
      case 'momentum':
      case 'active':
        return 'text-terminal-bullish'
      default:
        return 'text-terminal-text/60'
    }
  }

  const getAlertPrefix = (type: string) => {
    switch (type) {
      case 'ghost':
        return '[🚨 GHOST ALERT]'
      case 'momentum':
        return '[🟢 MOMENTUM]'
      case 'freeze':
        return '[⚠️ FREEZE ALERT]'
      case 'active':
        return '[✅ ACTIVE]'
      default:
        return '[ALERT]'
    }
  }

  const getVerificationBadge = (alert: WazeAlert) => {
    // Show verification count for community-proven alerts (5+ traders = verified)
    if (alert.count >= 5) {
      return `✓ VERIFIED (${alert.count} traders)`
    }
    return null
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="bg-terminal-black border-b border-terminal-border py-1.5 overflow-hidden">
      <div className="flex items-center gap-8 animate-scroll">
        {/* Duplicate alerts for seamless loop */}
        {[...alerts, ...alerts].map((alert, idx) => (
          <div
            key={`${alert.id}-${idx}`}
            className="flex items-center gap-3 whitespace-nowrap px-4"
          >
            {/* Alert Icon */}
            <div className="flex-shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            
            {/* Alert Prefix */}
            <span className="text-xs font-bold text-terminal-text uppercase tracking-wider font-mono">
              {getAlertPrefix(alert.type)}
            </span>
            
            {/* Company */}
            <span className="text-xs font-mono font-semibold text-terminal-text">
              {alert.company}:
            </span>
            
            {/* Message */}
            <span className={`text-xs font-mono ${getAlertColor(alert.type)}`}>
              {alert.message}
            </span>
            
            {/* Community Verification Badge */}
            {getVerificationBadge(alert) && (
              <span className="text-xs font-mono text-terminal-bullish" style={{ textShadow: '0 0 5px rgba(0, 255, 0, 0.5)' }}>
                {getVerificationBadge(alert)}
              </span>
            )}
            
            {/* Separator */}
            <span className="text-terminal-border">|</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
          display: flex;
        }
      `}</style>
    </div>
  )
}
