'use client'

import { Filter } from 'lucide-react'

interface FilterToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  label?: string
}

export default function FilterToggle({ enabled, onToggle, label = "Filter the Noise" }: FilterToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        enabled
          ? 'bg-cafe-accent text-white shadow-md'
          : 'bg-cafe-bg border border-border text-cafe-dark hover:bg-border/50'
      }`}
    >
      <Filter className={`w-4 h-4 ${enabled ? 'text-white' : 'text-cafe-accent'}`} />
      <span className="text-sm font-medium">{label}</span>
      {enabled && (
        <span className="text-xs opacity-80 ml-1">(Truth Score ≥ 70)</span>
      )}
    </button>
  )
}
