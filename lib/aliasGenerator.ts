/**
 * Generate anonymous cafe-themed aliases for users
 * This maintains privacy while making reports feel personal
 */

const cafeAdjectives = [
  'Mocha', 'Espresso', 'Latte', 'Cappuccino', 'Macchiato',
  'Americano', 'Cortado', 'Flat', 'Ristretto', 'Doppio',
  'Affogato', 'Frappe', 'Cold', 'Iced', 'Steamed'
]

const cafeNouns = [
  'Seeker', 'Coder', 'Builder', 'Designer', 'Engineer',
  'Manager', 'Analyst', 'Developer', 'Creator', 'Learner',
  'Explorer', 'Innovator', 'Architect', 'Strategist', 'Thinker'
]

export function generateAlias(): string {
  const adjective = cafeAdjectives[Math.floor(Math.random() * cafeAdjectives.length)]
  const noun = cafeNouns[Math.floor(Math.random() * cafeNouns.length)]
  return `${adjective}${noun}`
}

export function getOrCreateAlias(): string {
  if (typeof window === 'undefined') return generateAlias()
  
  let alias = localStorage.getItem('rolewithai_alias')
  if (!alias) {
    alias = generateAlias()
    localStorage.setItem('rolewithai_alias', alias)
  }
  return alias
}
