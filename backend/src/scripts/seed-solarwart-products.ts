import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function seedSolarwartProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve(Modules.PRODUCT)
  const storeModuleService = container.resolve(Modules.STORE)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)

  logger.info("Seeding Solarwart products...")

  // Get default store and sales channel
  const [store] = await storeModuleService.listStores()
  const [defaultSalesChannel] = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })

  // Create Solarwart categories
  logger.info("Creating Solarwart categories...")
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Reinigung",
          handle: "reinigung",
          description: "Professionelle Photovoltaik-Reinigung",
          is_active: true,
        },
        {
          name: "Wartung & Inspektion",
          handle: "wartung-inspektion",
          description: "Wartungsverträge und Inspektionen",
          is_active: true,
        },
        {
          name: "Monitoring",
          handle: "monitoring",
          description: "Fernüberwachung und Monitoring",
          is_active: true,
        },
        {
          name: "Überspannungsschutz",
          handle: "ueberspannungsschutz",
          description: "DC und AC Überspannungsschutz",
          is_active: true,
        },
        {
          name: "Drohneninspektion",
          handle: "drohneninspektion",
          description: "Thermografie und Drohneninspektion",
          is_active: true,
        },
      ],
    },
  })

  const categories = {
    reinigung: categoryResult.find((cat) => cat.handle === "reinigung")!,
    wartung: categoryResult.find((cat) => cat.handle === "wartung-inspektion")!,
    monitoring: categoryResult.find((cat) => cat.handle === "monitoring")!,
    ueberspannung: categoryResult.find((cat) => cat.handle === "ueberspannungsschutz")!,
    drohne: categoryResult.find((cat) => cat.handle === "drohneninspektion")!,
  }

  logger.info("Creating Solarwart products...")

  // Create products
  const { result: productsResult } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Photovoltaik-Reinigung",
          handle: "photovoltaik-reinigung",
          description: `
            Professionelle Reinigung Ihrer Photovoltaik-Anlage für maximale Effizienz.
            
            - Entfernung von Verschmutzungen, Staub und Vogelkot
            - Schonende Reinigung mit entmineralisiertem Wasser
            - Keine chemischen Reinigungsmittel
            - Ertragssteigung von 10-30% möglich
            
            Der Preis wird basierend auf Ihrer Anlagenkonfiguration berechnet.
          `.trim(),
          status: ProductStatus.PUBLISHED,
          category_ids: [categories.reinigung.id],
          images: [],
          metadata: {
            solarwart_pricing: {
              calculationType: 'cleaning',
              basePrice: 13.00,
              priceTiers: [
                { min: 1, max: 200, factor: 1.00, discount: 0 },
                { min: 201, max: 500, factor: 0.90, discount: 10 },
                { min: 501, max: 1000, factor: 0.85, discount: 15 },
                { min: 1001, max: 2000, factor: 0.80, discount: 20 },
                { min: 2001, max: 5000, factor: 0.75, discount: 25 },
                { min: 5001, max: 10000, factor: 0.70, discount: 30 }
              ],
              availableOptions: {
                requiresModuleCount: true,
                requiresRoofType: true,
                requiresFloorLevel: true,
                requiresSoilingInfo: true,
                requiresDistance: true,
                hasSubscription: false
              }
            }
          },
          options: [],
          variants: [
            {
              title: "Photovoltaik-Reinigung",
              sku: "PV-CLEAN-001",
              manage_inventory: false,
              prices: [
                {
                  amount: 1300, // 13€ base price in cents
                  currency_code: "eur",
                }
              ],
            }
          ],
        },
        {
          title: "Photovoltaik-Wartung",
          handle: "photovoltaik-wartung",
          description: `
            Umfassender Wartungsvertrag für Ihre PV-Anlage.
            
            Leistungen:
            - Jährliche Sichtprüfung
            - Funktionskontrolle aller Komponenten
            - Ertragskontrolle und Dokumentation
            - Reinigung der Module (1x jährlich)
            - 24/7 Monitoring (optional)
            - Speicherwartung (optional, bis 100 Module)
            
            Verfügbar als Jahres- oder Monatsvertrag.
          `.trim(),
          status: ProductStatus.PUBLISHED,
          category_ids: [categories.wartung.id],
          images: [],
          metadata: {
            solarwart_pricing: {
              calculationType: 'maintenance',
              availableOptions: {
                requiresModuleCount: true,
                requiresRoofType: false,
                requiresFloorLevel: false,
                requiresSoilingInfo: false,
                requiresDistance: false,
                hasSubscription: true,
                hasStorageOption: true
              },
              constraints: {
                minModules: 1,
                maxModules: 10000,
                storageMaxModules: 100
              }
            }
          },
          options: [],
          variants: [
            {
              title: "Photovoltaik-Wartung",
              sku: "PV-MAINT-001",
              manage_inventory: false,
              prices: [
                {
                  amount: 26400, // Starting price for yearly contract in cents
                  currency_code: "eur",
                }
              ],
            }
          ],
        },
        {
          title: "Monitoring / Fernüberwachung",
          handle: "monitoring-fernueberwachung",
          description: `
            24/7 Überwachung Ihrer PV-Anlage mit sofortiger Fehlererkennung.
            
            - Echtzeitüberwachung der Anlagenleistung
            - Automatische Fehlererkennung
            - E-Mail-Benachrichtigungen bei Störungen
            - Monatliche Ertragsberichte
            - Online-Portal mit Live-Daten
            - Einmalige Einrichtungsgebühr: 99€
            - Monatliche Servicegebühr: 15€
          `.trim(),
          status: ProductStatus.PUBLISHED,
          category_ids: [categories.monitoring.id],
          images: [],
          metadata: {
            solarwart_pricing: {
              calculationType: 'monitoring',
              prices: {
                setup: 99,
                monthly: 15,
                yearly: 180
              },
              availableOptions: {
                requiresModuleCount: false,
                requiresRoofType: false,
                requiresFloorLevel: false,
                requiresSoilingInfo: false,
                requiresDistance: false,
                hasSubscription: true
              }
            }
          },
          options: [],
          variants: [
            {
              title: "Monitoring-Service",
              sku: "PV-MON-001",
              manage_inventory: false,
              prices: [
                {
                  amount: 9900, // Setup fee in cents
                  currency_code: "eur",
                }
              ],
            }
          ],
        },
        {
          title: "Überspannungsschutz DC nachrüsten",
          handle: "ueberspannungsschutz-dc",
          description: `
            Nachrüstung von DC-Überspannungsschutz für Ihre PV-Anlage.
            
            - Schutz vor Blitzschäden
            - Typ 2 Überspannungsableiter
            - Professionelle Installation
            - Inkl. Material und Montage
            - Preis abhängig von Modulanzahl
            
            Berechnung: Anzahl Strings (Module ÷ 18) ÷ 2 = Einheiten
            Preis pro Einheit: 460€ brutto
          `.trim(),
          status: ProductStatus.PUBLISHED,
          category_ids: [categories.ueberspannung.id],
          images: [],
          metadata: {
            solarwart_pricing: {
              calculationType: 'overvoltage_dc',
              unitPrice: 460,
              availableOptions: {
                requiresModuleCount: true,
                requiresRoofType: false,
                requiresFloorLevel: false,
                requiresSoilingInfo: false,
                requiresDistance: false,
                hasSubscription: false
              },
              constraints: {
                minModules: 1,
                maxModules: 10000
              }
            }
          },
          options: [],
          variants: [
            {
              title: "DC-Überspannungsschutz",
              sku: "PV-DC-001",
              manage_inventory: false,
              prices: [
                {
                  amount: 46000, // Price per unit in cents
                  currency_code: "eur",
                }
              ],
            }
          ],
        },
        {
          title: "AC-Überspannungsschutz",
          handle: "ac-ueberspannungsschutz",
          description: `
            AC-seitiger Überspannungsschutz für PV-Anlagen bis 100 Module.
            
            - Typ 1+2 Kombi-Ableiter
            - Schutz des Wechselrichters
            - Professionelle Installation
            - Basispreis: 649€
            
            Zusatzoptionen:
            - Umbau/Hutschiene: +129€
            - Kabellänge >5m: +29€
            
            Für Anlagen >100 Module erstellen wir Ihnen ein individuelles Angebot.
          `.trim(),
          status: ProductStatus.PUBLISHED,
          category_ids: [categories.ueberspannung.id],
          images: [],
          metadata: {
            solarwart_pricing: {
              calculationType: 'overvoltage_ac',
              basePrice: 649,
              additions: [
                { type: 'rebuild', price: 129, label: "Umbau/Hutschiene" },
                { type: 'cable', price: 29, label: "Kabellänge > 5m" }
              ],
              availableOptions: {
                requiresModuleCount: true,
                requiresRoofType: false,
                requiresFloorLevel: false,
                requiresSoilingInfo: false,
                requiresDistance: false,
                hasSubscription: false,
                hasRebuildOption: true,
                hasCableLengthOption: true
              },
              constraints: {
                minModules: 1,
                maxModules: 100
              }
            }
          },
          options: [],
          variants: [
            {
              title: "AC-Überspannungsschutz",
              sku: "PV-AC-001",
              manage_inventory: false,
              prices: [
                {
                  amount: 64900, // Base price in cents
                  currency_code: "eur",
                }
              ],
            }
          ],
        },
        {
          title: "Drohneninspektion",
          handle: "drohneninspektion",
          description: `
            Thermografische Inspektion Ihrer PV-Anlage per Drohne.
            
            - Wärmebildaufnahmen aller Module
            - Erkennung von Hot-Spots
            - Defekte Zellen identifizieren
            - Verschattungsanalyse
            - Detaillierter Prüfbericht
            
            Preise:
            - Erste 50 Module: 149€
            - Je weitere 50 Module: 79€
          `.trim(),
          status: ProductStatus.PUBLISHED,
          category_ids: [categories.drohne.id],
          images: [],
          metadata: {
            solarwart_pricing: {
              calculationType: 'drone',
              basePrice: 149,
              additionalBlockPrice: 79,
              blockSize: 50,
              availableOptions: {
                requiresModuleCount: true,
                requiresRoofType: false,
                requiresFloorLevel: false,
                requiresSoilingInfo: false,
                requiresDistance: false,
                hasSubscription: false
              },
              constraints: {
                minModules: 1,
                maxModules: 10000
              }
            }
          },
          options: [],
          variants: [
            {
              title: "Drohneninspektion",
              sku: "PV-DRONE-001",
              manage_inventory: false,
              prices: [
                {
                  amount: 14900, // Base price in cents
                  currency_code: "eur",
                }
              ],
            }
          ],
        },
      ],
    },
  })

  logger.info(`Created ${productsResult.length} Solarwart products`)

  // Link products to sales channel
  const productService = container.resolve(Modules.PRODUCT)
  for (const product of productsResult) {
    await productService.updateProducts(product.id, {
      sales_channels: [{ id: defaultSalesChannel.id }],
    })
  }

  logger.info("Solarwart products successfully seeded!")
  
  return {
    products: productsResult,
    categories: categoryResult,
  }
}

// Also export a function to check if products already exist
export async function solarwartProductsExist(container: any): Promise<boolean> {
  const productModuleService = container.resolve(Modules.PRODUCT)
  
  const solarwartHandles = [
    "photovoltaik-reinigung",
    "photovoltaik-wartung",
    "monitoring-fernueberwachung",
    "ueberspannungsschutz-dc",
    "ac-ueberspannungsschutz",
    "drohneninspektion"
  ]
  
  for (const handle of solarwartHandles) {
    const products = await productModuleService.listProducts({
      handle: handle
    })
    
    if (products && products.length > 0) {
      return true // At least one product exists
    }
  }
  
  return false
}