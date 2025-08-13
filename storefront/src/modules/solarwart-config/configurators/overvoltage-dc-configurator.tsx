'use client'

import { useState, useEffect } from 'react'
import { Button } from '@medusajs/ui'
import { ModuleCounter } from '../components/module-counter'
import { StoreProduct } from "@medusajs/types"
import { formatPriceSimple } from '../utils/formatters'

interface OvervoltageDCConfiguratorProps {
  product: StoreProduct
  onAddToCart: (config: any) => Promise<void>
  onCancel?: () => void
}

export const OvervoltageDCConfigurator = ({
  product,
  onAddToCart,
  onCancel
}: OvervoltageDCConfiguratorProps) => {
  const [config, setConfig] = useState({
    moduleCount: 80
  })
  
  const [isAdding, setIsAdding] = useState(false)

  // Konstanten für die Berechnung
  const UNIT_PRICE = 460.00 // € pro Einheit
  const MODULES_PER_STRING = 18
  const STRINGS_PER_UNIT = 2

  // Berechnung der benötigten Einheiten
  const calculateUnits = (moduleCount: number) => {
    // Schritt 1: Anzahl Strings = Modulanzahl ÷ 18 (aufrunden)
    const strings = Math.ceil(moduleCount / MODULES_PER_STRING)
    
    // Schritt 2: Einheiten = Strings ÷ 2 (aufrunden)
    const units = Math.ceil(strings / STRINGS_PER_UNIT)
    
    return { strings, units }
  }

  const { strings, units } = calculateUnits(config.moduleCount)
  const totalPrice = units * UNIT_PRICE

  const breakdown = {
    basePrice: UNIT_PRICE,
    multiplier: units,
    additions: [],
    discounts: [],
    total: totalPrice,
    details: {
      moduleCount: config.moduleCount,
      strings,
      units,
      pricePerUnit: UNIT_PRICE
    }
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await onAddToCart({
        quantity: units, // Anzahl der Einheiten
        metadata: {
          solarwart_config: {
            productType: 'overvoltage_dc',
            moduleCount: config.moduleCount,
            strings,
            units,
            unitPrice: UNIT_PRICE,
            calculatedPrice: totalPrice,
            priceBreakdown: breakdown
          }
        }
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="solarwart-configurator">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">DC-Überspannungsschutz nachrüsten</h3>
          <p className="text-sm text-gray-700">
            Schützen Sie Ihre PV-Anlage vor Überspannungen auf der DC-Seite
          </p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            <li>• DC-Überspannungsschutz für alle Strings</li>
            <li>• Fachgerechte Montage am Wechselrichter oder Generatoranschlusskasten</li>
            <li>• Überprüfung und Inbetriebnahme</li>
            <li>• Schutz vor Blitzschäden und Überspannungen</li>
          </ul>
        </div>

        <div className="config-inputs space-y-4">
          <ModuleCounter
            value={config.moduleCount}
            onChange={(value) => setConfig({ ...config, moduleCount: value })}
            min={1}
            max={10000}
          />

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Berechnungsdetails:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Module:</div>
              <div className="font-medium">{config.moduleCount}</div>
              
              <div className="text-gray-600">Strings (Module ÷ {MODULES_PER_STRING}):</div>
              <div className="font-medium">{strings}</div>
              
              <div className="text-gray-600">Einheiten (Strings ÷ {STRINGS_PER_UNIT}):</div>
              <div className="font-medium">{units}</div>
              
              <div className="text-gray-600">Preis pro Einheit:</div>
              <div className="font-medium">{formatPriceSimple(UNIT_PRICE, 'EUR')}</div>
            </div>
            
            <div className="pt-2 border-t text-xs text-gray-500">
              <strong>Berechnungsformel:</strong><br/>
              1. Strings = ⌈{config.moduleCount} ÷ {MODULES_PER_STRING}⌉ = {strings}<br/>
              2. Einheiten = ⌈{strings} ÷ {STRINGS_PER_UNIT}⌉ = {units}<br/>
              3. Preis = {units} × {formatPriceSimple(UNIT_PRICE, 'EUR')} = {formatPriceSimple(totalPrice, 'EUR')}
            </div>
          </div>
        </div>

        <div className="price-section border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Preisübersicht</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">
                {units} {units === 1 ? 'Einheit' : 'Einheiten'} × {formatPriceSimple(UNIT_PRICE, 'EUR')}
              </span>
              <span className="font-medium">{formatPriceSimple(totalPrice, 'EUR')}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-lg font-bold">
              <span>Gesamtpreis (inkl. MwSt.)</span>
              <span className="text-blue-600">{formatPriceSimple(totalPrice, 'EUR')}</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-800">
              <strong>Enthaltene Leistungen:</strong> Material, Montage, Inbetriebnahme und Funktionsprüfung
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              variant="primary"
              className="flex-1"
            >
              {isAdding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="secondary"
                className="flex-1"
              >
                Abbrechen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}