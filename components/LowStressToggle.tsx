'use client'

import { Moon, Sun } from 'lucide-react'

interface LowStressToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export default function LowStressToggle({ enabled, onToggle }: LowStressToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        enabled
          ? 'bg-cafe-gold/20 text-cafe-gold border border-cafe-gold/40'
          : 'bg-cafe-bg border border-border text-cafe-dark hover:bg-border/50'
      }`}
      title={enabled ? 'Show detailed metrics' : 'Switch to low-stress mode'}
    >
      {enabled ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {enabled ? 'Low-Stress Mode' : 'Detailed Mode'}
      </span>
    </button>
  )
}
