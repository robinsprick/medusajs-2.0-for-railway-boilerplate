import updateSolarwartProducts, { checkSolarwartProducts } from "./update-solarwart-products"

export default async function runUpdateSolarwart({ container }: any) {
  const logger = container.resolve("logger")
  
  try {
    // First check the current status
    logger.info("Checking current product status...")
    const status = await checkSolarwartProducts(container)
    
    const existingProducts = status.filter(s => s.exists)
    
    if (existingProducts.length === 0) {
      logger.warn("No Solarwart products found to update!")
      logger.info("Please run 'npm run seed:solarwart' first to create the products.")
      return
    }
    
    // Run the update
    logger.info(`Found ${existingProducts.length} products to update...`)
    const result = await updateSolarwartProducts({ container, args: [] })
    
    logger.info("✅ Solarwart products updated successfully!")
    
    // Show final status
    await checkSolarwartProducts(container)
    
  } catch (error) {
    logger.error("❌ Error updating Solarwart products:", error)
    throw error
  }
}