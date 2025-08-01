import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CountrySelect from "@modules/layout/components/country-select"
import logoSolarwart from "../../../../../public/logo-solarwart.avif"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-20 mx-auto duration-200 bg-solarwart-black/80 backdrop-blur-xl border-b border-white/5">
        <nav className="content-container text-sm flex items-center justify-between w-full h-full">
          {/* Logo */}
          <div className="flex items-center">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              data-testid="nav-store-link"
            >
              <Image
                src={logoSolarwart}
                alt="Solarwart Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </LocalizedClientLink>
          </div>

          {/* Center Navigation */}
          <div className="hidden medium:flex items-center gap-x-8">
            <LocalizedClientLink
              href="/store"
              className="nav-link"
              data-testid="nav-products-link"
            >
              Produkte
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/collections"
              className="nav-link"
              data-testid="nav-collections-link"
            >
              Kollektionen
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/about"
              className="nav-link"
              data-testid="nav-about-link"
            >
              Über uns
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/contact"
              className="nav-link"
              data-testid="nav-contact-link"
            >
              Kontakt
            </LocalizedClientLink>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-x-4">
            {/* Country Selector */}
            {regions && regions.length > 1 && (
              <div className="hidden medium:block">
                <CountrySelect regions={regions} />
              </div>
            )}
            
            {/* Search */}
            {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
              <LocalizedClientLink
                className="nav-link hidden small:block"
                href="/search"
                scroll={false}
                data-testid="nav-search-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </LocalizedClientLink>
            )}
            
            {/* Account */}
            <LocalizedClientLink
              className="nav-link"
              href="/account"
              data-testid="nav-account-link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </LocalizedClientLink>
            
            {/* Cart */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="nav-link flex items-center gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <span className="text-xs">0</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            {/* Mobile Menu Button */}
            <button className="medium:hidden nav-link p-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </nav>
      </header>
    </div>
  )
}