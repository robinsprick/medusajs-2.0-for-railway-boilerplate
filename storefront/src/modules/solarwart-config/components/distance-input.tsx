'use client'

import { Input } from "@medusajs/ui"
import { Info } from "lucide-react"

interface DistanceInputProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export const DistanceInput = ({ 
  value, 
  onChange, 
  max = 50 
}: DistanceInputProps) => {
  const travelCost = value * 3.20

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0
    onChange(Math.min(Math.max(0, newValue), max))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Entfernung zum Einsatzort
      </label>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={value}
          onChange={handleChange}
          min={0}
          max={max}
          step={0.5}
          className="w-32"
        />
        <span className="text-sm text-gray-600">km</span>
      </div>
      <div className="flex items-start space-x-1 text-sm text-gray-600">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <div>Anfahrtskosten: {travelCost.toFixed(2)} €</div>
          <div className="text-xs">(3,20 € pro km)</div>
        </div>
      </div>
      {value > 30 && (
        <div className="text-sm text-orange-600">
          Hinweis: Bei Entfernungen über 30 km können zusätzliche Kosten anfallen.
        </div>
      )}
    </div>
  )
}