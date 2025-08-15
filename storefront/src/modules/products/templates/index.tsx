import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { SolarwartProductActionsWrapper } from "./solarwart-product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Check if this is a Solarwart product with configurator
  const isSolarwartProduct = !!product.metadata?.solarwart_pricing

  // Special layout for Solarwart products
  if (isSolarwartProduct) {
    return (
      <>
        <div
          className="content-container flex flex-col lg:flex-row lg:items-start py-6 relative gap-8"
          data-testid="product-container"
        >
          {/* Left side: 1/3 - Image, Title, Description */}
          <div className="flex flex-col lg:w-1/3 w-full gap-y-6">
            <div className="w-full">
              <ImageGallery images={product?.images || []} />
            </div>
            <div className="flex flex-col gap-y-4">
              <ProductInfo product={product} />
              <ProductTabs product={product} />
            </div>
          </div>
          
          {/* Right side: 2/3 - Configurator */}
          <div className="flex flex-col lg:w-2/3 w-full">
            <Suspense
              fallback={
                <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg" />
              }
            >
              <SolarwartProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>
        <div
          className="content-container my-16 small:my-32"
          data-testid="related-products-container"
        >
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </>
    )
  }

  // Standard layout for regular products
  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={product?.images || []} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
