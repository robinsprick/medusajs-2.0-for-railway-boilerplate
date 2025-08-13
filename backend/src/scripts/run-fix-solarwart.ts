import fixSolarwartProducts, { checkAllProducts } from "./fix-solarwart-products"

export default async function runFixSolarwart({ container }: any) {
  const logger = container.resolve("logger")
  
  try {
    logger.info("Starting Solarwart products fix...")
    logger.info("This will:")
    logger.info("- Create missing products")
    logger.info("- Update existing products with metadata")
    logger.info("- Add missing variants")
    logger.info("")
    
    // Run the fix
    const result = await fixSolarwartProducts({ container })
    
    logger.info("✅ Fix completed successfully!")
    
    // Show final status
    await checkAllProducts(container)
    
  } catch (error) {
    logger.error("❌ Error fixing Solarwart products:", error)
    throw error
  }
}