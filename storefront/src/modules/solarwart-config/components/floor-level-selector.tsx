'use client'

import { Button } from "@medusajs/ui"

interface FloorLevelSelectorProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export const FloorLevelSelector = ({ 
  value, 
  onChange, 
  max = 10 
}: FloorLevelSelectorProps) => {
  const getFloorFactor = (level: number): number => {
    if (level <= 1) return 1.00
    if (level === 2) return 1.05
    if (level === 3) return 1.10
    return 1.10 + (level - 3) * 0.05
  }

  const factor = getFloorFactor(value)
  const percentageIncrease = Math.round((factor - 1) * 100)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Etage / Stockwerk
      </label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
        >
          -
        </Button>
        <div className="w-24 text-center border rounded px-2 py-1">
          {value === 0 ? 'EG' : `${value}. OG`}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </Button>
      </div>
      <div className="text-sm text-gray-600">
        {percentageIncrease > 0 ? (
          <span className="text-orange-600">
            +{percentageIncrease}% Aufschlag für Höhenarbeit
          </span>
        ) : (
          <span>Keine Höhenzuschläge</span>
        )}
      </div>
    </div>
  )
}