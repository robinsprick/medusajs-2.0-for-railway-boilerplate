"use client"

import { Button } from "@medusajs/ui"
import { useTranslations } from "@lib/hooks/use-translations"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  const { t } = useTranslations()
  
  return (
    <section className="relative min-h-[90vh] w-full bg-solarwart-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Green Blur Circles */}
        <div className="blur-circle top-20 left-10 opacity-30" />
        <div className="blur-circle bottom-40 right-20 opacity-20" />
        <div className="blur-circle top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 content-container h-full min-h-[90vh] flex flex-col justify-center items-center text-center py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Professionelle{" "}
            <span className="gradient-text">Solarwartung</span>
            <br />
            direkt im Shop
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <LocalizedClientLink href="/store">
              <Button className="btn-primary text-lg px-8 py-4">
                Produkte entdecken
              </Button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/collections">
              <Button className="btn-secondary text-lg px-8 py-4">
                Kollektionen ansehen
              </Button>
            </LocalizedClientLink>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-solarwart-green/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-solarwart-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Premium Qualität</h3>
              <p className="text-white/60 text-sm">Nur geprüfte Produkte für maximale Effizienz</p>
            </div>
            
            <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-solarwart-green/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-solarwart-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Schnelle Lieferung</h3>
              <p className="text-white/60 text-sm">Express-Versand für dringende Wartungen</p>
            </div>
            
            <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-solarwart-green/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-solarwart-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Experten Support</h3>
              <p className="text-white/60 text-sm">Fachberatung für alle Ihre Fragen</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero