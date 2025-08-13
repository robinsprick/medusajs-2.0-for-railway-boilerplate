'use client'

import { Button } from "@medusajs/ui"

interface ModuleCounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export const ModuleCounter = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 10000 
}: ModuleCounterProps) => {
  const getTierInfo = (count: number) => {
    if (count <= 200) return { tier: '1-200', discount: 0 }
    if (count <= 500) return { tier: '201-500', discount: 10 }
    if (count <= 1000) return { tier: '501-1000', discount: 15 }
    if (count <= 2000) return { tier: '1001-2000', discount: 20 }
    if (count <= 5000) return { tier: '2001-5000', discount: 25 }
    return { tier: '5001-10000', discount: 30 }
  }

  const tierInfo = getTierInfo(value)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min
    onChange(Math.min(Math.max(newValue, min), max))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Anzahl Module
      </label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(min, value - 10))}
          disabled={value <= min}
        >
          -10
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          -1
        </Button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="w-24 text-center border rounded px-2 py-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(max, value + 10))}
          disabled={value >= max}
        >
          +10
        </Button>
      </div>
      <div className="text-sm text-gray-600">
        Preisstufe: <span className="font-medium">{tierInfo.tier}</span>
        {tierInfo.discount > 0 && (
          <span className="text-green-600 ml-2">
            ({tierInfo.discount}% Rabatt)
          </span>
        )}
      </div>
    </div>
  )
}