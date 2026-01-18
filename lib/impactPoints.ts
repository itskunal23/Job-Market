/**
 * Impact Points System - Gamification for Community Contribution
 * Levels: Intern → Junior → Senior → Lead → Market Oracle
 */

export interface ImpactLevel {
  name: string
  minPoints: number
  description: string
  icon: string
}

export const IMPACT_LEVELS: ImpactLevel[] = [
  {
    name: 'Intern',
    minPoints: 0,
    description: 'Just getting started',
    icon: '🌱'
  },
  {
    name: 'Junior Contributor',
    minPoints: 50,
    description: 'Helping others navigate',
    icon: '☕'
  },
  {
    name: 'Senior Helper',
    minPoints: 150,
    description: 'Making a real impact',
    icon: '🎯'
  },
  {
    name: 'Lead Navigator',
    minPoints: 300,
    description: 'Guiding the community',
    icon: '🧭'
  },
  {
    name: 'Market Oracle',
    minPoints: 500,
    description: 'The community trusts you',
    icon: '🔮'
  }
]

export function getImpactLevel(points: number): ImpactLevel {
  // Find the highest level the user has achieved
  for (let i = IMPACT_LEVELS.length - 1; i >= 0; i--) {
    if (points >= IMPACT_LEVELS[i].minPoints) {
      return IMPACT_LEVELS[i]
    }
  }
  return IMPACT_LEVELS[0]
}

export function getPointsToNextLevel(points: number): number {
  const currentLevel = getImpactLevel(points)
  const nextLevelIndex = IMPACT_LEVELS.findIndex(level => level.minPoints > currentLevel.minPoints)
  
  if (nextLevelIndex === -1) {
    return 0 // Already at max level
  }
  
  return IMPACT_LEVELS[nextLevelIndex].minPoints - points
}

export function getProgressToNextLevel(points: number): number {
  const currentLevel = getImpactLevel(points)
  const nextLevelIndex = IMPACT_LEVELS.findIndex(level => level.minPoints > currentLevel.minPoints)
  
  if (nextLevelIndex === -1) {
    return 100 // Already at max level
  }
  
  const currentLevelPoints = currentLevel.minPoints
  const nextLevelPoints = IMPACT_LEVELS[nextLevelIndex].minPoints
  const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
  
  return Math.min(100, Math.max(0, progress))
}
