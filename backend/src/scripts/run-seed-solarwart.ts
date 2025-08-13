import seedSolarwartProducts, { solarwartProductsExist } from "./seed-solarwart-products"

export default async function runSeedSolarwart({ container }: any) {
  const logger = container.resolve("logger")
  
  try {
    // Check if products already exist
    const productsExist = await solarwartProductsExist(container)
    
    if (productsExist) {
      logger.info("Solarwart products already exist, skipping seed...")
      return
    }
    
    // Run the seed
    const result = await seedSolarwartProducts({ container, args: [] })
    
    logger.info("✅ Solarwart products seeded successfully!")
    logger.info(`Created ${result.products.length} products in ${result.categories.length} categories`)
    
  } catch (error) {
    logger.error("❌ Error seeding Solarwart products:", error)
    throw error
  }
}