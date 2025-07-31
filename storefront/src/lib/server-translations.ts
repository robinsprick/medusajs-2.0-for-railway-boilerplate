import { translations, TranslationKey, Locale, defaultLocale } from "./translations"

export function getServerTranslations(countryCode: string = defaultLocale) {
  const locale: Locale = countryCode === "de" ? "de" : "en"
  
  return {
    t: (key: TranslationKey): string => {
      return translations[locale][key] || translations["en"][key] || key
    },
    locale
  }
}