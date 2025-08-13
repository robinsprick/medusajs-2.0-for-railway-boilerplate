'use client'

interface RoofTypeSelectorProps {
  value: 'schraeg' | 'flach' | 'freiland'
  onChange: (value: 'schraeg' | 'flach' | 'freiland') => void
}

const roofTypes = [
  { value: 'schraeg', label: 'Schrägdach', factor: 1.15, description: '15% Aufschlag' },
  { value: 'flach', label: 'Flachdach', factor: 1.00, description: 'Basispreis' },
  { value: 'freiland', label: 'Freiland', factor: 0.95, description: '5% Rabatt' }
] as const

export const RoofTypeSelector = ({ value, onChange }: RoofTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Dachtyp
      </label>
      <div className="space-y-2">
        {roofTypes.map((type) => (
          <label
            key={type.value}
            className={`flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 ${
              value === type.value ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <input
              type="radio"
              name="roofType"
              value={type.value}
              checked={value === type.value}
              onChange={(e) => onChange(e.target.value as any)}
              className="w-4 h-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium">{type.label}</div>
              <div className="text-sm text-gray-600">{type.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}