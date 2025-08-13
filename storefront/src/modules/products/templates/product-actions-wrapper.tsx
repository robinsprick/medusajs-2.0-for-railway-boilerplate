import { getProductByHandle, retrievePricedProductById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { SolarwartProductActions } from "@modules/products/components/product-actions/solarwart-actions"

export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const product = await retrievePricedProductById({
    id,
    regionId: region.id,
  })

  if (!product) {
    return null
  }

  // Check if this is a Solarwart product
  const isSolarwartProduct = product.metadata?.solarwart_pricing

  if (isSolarwartProduct) {
    return <SolarwartProductActions product={product} region={region} />
  }

  return <ProductActions product={product} region={region} />
}