import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Solarwart Shop - Medusa E-Commerce",
  description:
    "Ein performantes Frontend E-Commerce Template mit Next.js 14 und Medusa.",
}

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  return (
    <div className="bg-solarwart-black min-h-screen">
      <Hero />
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blur-circle top-0 right-1/4 opacity-10" />
          <div className="blur-circle bottom-20 left-1/3 opacity-5" />
        </div>
        
        {/* Products Section */}
        <div className="relative z-10">
          <ul className="flex flex-col">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      </div>
    </div>
  )
}
