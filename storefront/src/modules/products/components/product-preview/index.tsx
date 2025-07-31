import { Text } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper" className="glass-card p-4 hover:scale-105 transition-all duration-300 hover:border-solarwart-green/30">
        <div className="relative overflow-hidden rounded-lg">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-solarwart-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-sm font-medium">Details ansehen →</span>
          </div>
        </div>
        <div className="flex flex-col mt-4 gap-2">
          <Text className="text-white font-medium line-clamp-2" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center justify-between">
            <Text className="text-white/60 text-sm">
              {product.subtitle || "Professionelle Qualität"}
            </Text>
            {cheapestPrice && (
              <div className="text-solarwart-green font-semibold">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}