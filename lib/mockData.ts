interface MarketInsight {
  temperature: 'high' | 'medium' | 'low'
  message: string
  hiringChange: number
  ghostingChange: number
}

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
}

export async function getMarketInsight(): Promise<MarketInsight> {
  // This is now a fallback only - frontend should use backend API
  // Fetch from backend API
  try {
    const response = await fetch('http://localhost:5000/api/market-insights')
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        const trending = data.trending_roles || []
        const avgVelocity = trending.length > 0 
          ? trending.reduce((sum: number, r: any) => sum + (r.hiring_velocity || 0), 0) / trending.length
          : 0
        
        return {
          temperature: avgVelocity > 10 ? 'high' : avgVelocity > 0 ? 'medium' : 'low',
          message: `Market analysis: ${trending.length} trending roles detected with ${avgVelocity.toFixed(1)}% average hiring velocity.`,
          hiringChange: avgVelocity,
          ghostingChange: 0 // Would need community data
        }
      }
    }
  } catch (error) {
    console.error('Error fetching market insights from backend:', error)
  }
  
  // Minimal fallback (not mock data, just error state)
  return {
    temperature: 'low',
    message: 'Unable to fetch market data. Please ensure backend is running.',
    hiringChange: 0,
    ghostingChange: 0,
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

// Generate mock 7-day trend
const generateTrend = (currentScore: number): number[] => {
  const trend = []
  const volatility = 5
  for (let i = 6; i >= 0; i--) {
    const daysAgo = i
    const baseScore = currentScore - (Math.random() * volatility * 2 - volatility)
    trend.push(Math.max(0, Math.min(100, baseScore)))
  }
  return trend
}

// Generate daily change based on truth score and trend
const generateDailyChange = (truthScore: number, trend: number[]): number => {
  if (trend.length < 2) return (Math.random() * 10 - 5)
  const yesterday = trend[trend.length - 2]
  const today = trend[trend.length - 1]
  return today - yesterday
}

export async function getMockJobs(): Promise<Job[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100))

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior Product Designer',
      company: 'InnovateLabs',
      location: 'San Francisco, CA (Remote)',
      truthScore: 87,
      ghostRisk: 'low',
      insight: 'This role is a high-intent match. The company has responded to 92% of applicants this month.',
      postedDaysAgo: 2,
      recruiterActivity: 'Active recruiter engagement detected',
      ghostSignals: {
        recruiterActivity: 'high',
        repostFrequency: 'none',
        sentiment: 'positive',
      },
      ticker: 'INVL',
      sevenDayTrend: [82, 84, 85, 86, 86.5, 87, 87],
      dailyChange: 0.5,
    },
    {
      id: '2',
      title: 'UX Lead',
      company: 'DesignStudio Pro',
      location: 'New York, NY',
      truthScore: 72,
      ghostRisk: 'medium',
      insight: 'Good match, but they\'ve been slow to respond. Worth applying, but keep options open.',
      postedDaysAgo: 5,
      recruiterActivity: 'Moderate recruiter activity',
      ghostSignals: {
        recruiterActivity: 'moderate',
        repostFrequency: 'low',
        sentiment: 'neutral',
      },
    },
    {
      id: '3',
      title: 'Product Manager',
      company: 'TechStart Inc.',
      location: 'Austin, TX',
      truthScore: 35,
      ghostRisk: 'high',
      insight: 'This feels like a ghost job. They\'ve reposted 4 times in 3 months without hiring.',
      postedDaysAgo: 8,
      recruiterActivity: 'This company has ghosted 80% of applicants this month. Should we skip it and save your energy?',
      ghostSignals: {
        recruiterActivity: 'none',
        repostFrequency: 'high',
        sentiment: 'negative',
      },
      ticker: 'TSTI',
      sevenDayTrend: [42, 40, 38, 36, 35, 34, 35],
      dailyChange: 1.0,
    },
    {
      id: '4',
      title: 'Senior UX Designer',
      company: 'CreativeAgency',
      location: 'Los Angeles, CA',
      truthScore: 91,
      ghostRisk: 'low',
      insight: 'Excellent match! High response rate and active hiring. This is a priority application.',
      postedDaysAgo: 1,
      recruiterActivity: 'Very active - multiple interviews scheduled this week',
      ghostSignals: {
        recruiterActivity: 'high',
        repostFrequency: 'none',
        sentiment: 'positive',
      },
      ticker: 'CRAG',
      sevenDayTrend: [85, 87, 88, 89, 90, 90.5, 91],
      dailyChange: 0.5,
    },
    {
      id: '5',
      title: 'Design Director',
      company: 'CorpEnterprise',
      location: 'Chicago, IL',
      truthScore: 28,
      ghostRisk: 'high',
      insight: 'Low truth score detected. This posting has been up for 6 months with no activity.',
      postedDaysAgo: 45,
      recruiterActivity: 'No recruiter activity detected in the past 30 days',
      ghostSignals: {
        recruiterActivity: 'none',
        repostFrequency: 'moderate',
        sentiment: 'negative',
      },
      ticker: 'CRPE',
      sevenDayTrend: [32, 31, 30, 29, 28.5, 28, 28],
      dailyChange: 0,
    },
  ]

  // Ensure all jobs have trading data
  return jobs.map(job => {
    if (!job.sevenDayTrend) {
      job.sevenDayTrend = generateTrend(job.truthScore)
    }
    if (job.dailyChange === undefined) {
      job.dailyChange = generateDailyChange(job.truthScore, job.sevenDayTrend)
    }
    if (!job.ticker) {
      job.ticker = getTicker(job.company)
    }
    return job
  })
}
