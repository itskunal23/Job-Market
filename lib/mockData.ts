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
}

export async function getMarketInsight(): Promise<MarketInsight> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100))

  const insights: MarketInsight[] = [
    {
      temperature: 'high',
      message:
        'Hiring in your niche is up 4% today. 3 roles just opened that actually respond. Let\'s focus there.',
      hiringChange: 4,
      ghostingChange: -2,
    },
    {
      temperature: 'medium',
      message:
        'The market is steady, but ghosting is up in Tech. We found 5 high-intent roles that match your profile.',
      hiringChange: 1,
      ghostingChange: 5,
    },
    {
      temperature: 'low',
      message:
        'Hiring velocity has slowed this week, but we\'ve identified 2 companies actively interviewing. Quality over quantity.',
      hiringChange: -3,
      ghostingChange: 8,
    },
  ]

  return insights[Math.floor(Math.random() * insights.length)]
}

export async function getMockJobs(): Promise<Job[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100))

  return [
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
    },
  ]
}
