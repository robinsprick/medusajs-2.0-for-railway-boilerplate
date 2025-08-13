'use client'

interface SoilingSelectorProps {
  value: 'never' | 'gt18' | 'lt18'
  onChange: (value: 'never' | 'gt18' | 'lt18') => void
}

const soilingOptions = [
  { 
    value: 'never', 
    label: 'Noch nie gereinigt', 
    factor: 1.20, 
    description: '20% Aufschlag - starke Verschmutzung',
    color: 'text-red-600'
  },
  { 
    value: 'gt18', 
    label: 'Vor mehr als 18 Monaten', 
    factor: 1.10, 
    description: '10% Aufschlag - mittlere Verschmutzung',
    color: 'text-orange-600'
  },
  { 
    value: 'lt18', 
    label: 'Innerhalb der letzten 18 Monate', 
    factor: 1.00, 
    description: 'Basispreis - leichte Verschmutzung',
    color: 'text-green-600'
  }
] as const

export const SoilingSelector = ({ value, onChange }: SoilingSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Letzte Reinigung
      </label>
      <div className="space-y-2">
        {soilingOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 ${
              value === option.value ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <input
              type="radio"
              name="soiling"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as any)}
              className="w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className={`text-sm ${option.color}`}>
                {option.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}