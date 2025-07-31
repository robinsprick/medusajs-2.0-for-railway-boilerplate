# Changelog

## Version 1.0.4 - 2025-07-31

### Neue Features
- **Deutsche Lokalisierung implementiert**:
  - Zentrale Übersetzungsdatei (`/src/lib/translations.ts`) mit deutschen und englischen Übersetzungen erstellt
  - Custom Hook `useTranslations` für Client-Komponenten implementiert
  - Server-seitige Übersetzungsfunktion `getServerTranslations` für Server-Komponenten erstellt
  - Übersetzung basiert auf dem Country Code (de = Deutsch, andere = Englisch)

### Übersetzte Komponenten
- Hero-Komponente mit deutschem Welcome-Text
- Product Actions (In den Warenkorb, Variante auswählen, Nicht auf Lager)
- Cart Dropdown (Warenkorb, Menge, Entfernen, Zwischensumme)
- Metadaten für Cart und Homepage

### Technische Details
- Keine zusätzlichen Dependencies benötigt
- Übersetzungen funktionieren sowohl für Client- als auch Server-Komponenten
- Build erfolgreich ohne Fehler

## Version 1.0.3
- Initial storefront version