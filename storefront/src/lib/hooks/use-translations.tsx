"use client"

import { useParams } from "next/navigation"
import { translations, TranslationKey, Locale, defaultLocale } from "@lib/translations"

export function useTranslations() {
  const params = useParams()
  
  // Für Deutschland (de) verwenden wir deutsche Übersetzungen
  const countryCode = params?.countryCode as string || defaultLocale
  const locale: Locale = countryCode === "de" ? "de" : "en"
  
  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations["en"][key] || key
  }
  
  return { t, locale }
}