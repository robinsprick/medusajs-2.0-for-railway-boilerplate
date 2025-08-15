import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function updateACProductMetadata({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT)
  
  console.log("Updating AC-Überspannungsschutz metadata...")
  
  try {
    // Find the AC product by handle
    const products = await productService.listProducts({
      handle: ["ac-ueberspannungsschutz", "ueberspannungsschutz-ac"]
    })
    
    console.log(`Found ${products.length} products to update`)
    
    for (const product of products) {
      console.log(`Updating product: ${product.title} (${product.handle})`)
      
      await productService.updateProducts(product.id, {
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
              needsHutschiene: true,
              hasCableLength: true
            },
            constraints: {
              minModules: 1,
              maxModules: 100,
              projectRequired: 101
            }
          }
        }
      })
      
      console.log(`✅ Updated: ${product.title}`)
    }
    
    console.log("✅ Done updating AC product metadata!")
    
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}