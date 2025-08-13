# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-01-13

### Added
- **Vollständige Solarwart-Konfiguratoren implementiert** ✅
  - **Neue Konfiguratoren für fehlende Services:**
    - `monitoring-configurator.tsx`: Monitoring/Fernüberwachung mit Abo-Auswahl
    - `overvoltage-dc-configurator.tsx`: DC-Überspannungsschutz mit automatischer Einheitenberechnung
    - `overvoltage-ac-configurator.tsx`: AC-Überspannungsschutz mit Zusatzoptionen
  - **Features der neuen Konfiguratoren:**
    - Monitoring: Monatliche/jährliche Abrechnung, Einrichtungsgebühr, Preisersparnis-Anzeige
    - DC-Überspannungsschutz: Automatische String- und Einheitenberechnung basierend auf Modulanzahl
    - AC-Überspannungsschutz: Hutschienen-Option, variable Kabellänge, Projektanfrage für große Anlagen
  - **UI-Verbesserungen:**
    - Detaillierte Berechnungsanzeige mit Formeln
    - Responsive Layouts für alle Geräte
    - Informative Beschreibungen und Leistungsübersichten
    - Farbcodierte Status-Meldungen (Info, Warnung, Erfolg)

### Fixed
- Import-Fehler für `formatAmount` behoben - verwendet jetzt `formatPriceSimple`
- ModuleCounter Import korrigiert (Named Export statt Default)
- Build-Warnungen eliminiert

### Changed
- `getConfigurator` Funktion erweitert für alle 6 Produkttypen
- Index-Datei aktualisiert mit neuen Konfigurator-Exports

### Technical
- Alle 6 Solarwart-Produkte haben jetzt funktionierende Konfiguratoren
- Build erfolgreich ohne Fehler durchgeführt
- TypeScript Type-Safety gewährleistet

## [0.6.0] - 2025-01-13

### Added
- **Solarwart Preissystem - Phase 3: Frontend-Konfiguratoren** ✅
  - Vollständige Frontend-Integration für dynamische Preisberechnung
  - **Konfigurator-Komponenten:**
    - CleaningConfigurator: PV-Reinigung mit allen Faktoren
    - MaintenanceConfigurator: Wartungsverträge (Jahres-/Monatsabo)
    - DroneConfigurator: Drohneninspektion mit Staffelpreisen
  - **Shared Components:**
    - ModuleCounter: Modulanzahl mit Tier-Anzeige
    - RoofTypeSelector: Dachtyp-Auswahl (Schrägdach/Flachdach/Freiland)
    - FloorLevelSelector: Etagen-Auswahl mit Höhenzuschlag
    - SoilingSelector: Verschmutzungsgrad-Auswahl
    - DistanceInput: Entfernungseingabe mit Anfahrtskosten
    - PriceDisplay: Live-Preisanzeige
    - PriceBreakdown: Detaillierte Preisaufschlüsselung
  - **Features:**
    - Live-Preisberechnung während Konfiguration
    - Debounced API-Calls für Performance
    - Responsive Design für alle Geräte
    - Fehlerbehandlung und Loading-States
    - Produktseiten-Integration für Solarwart-Produkte
    - Automatische Erkennung von Solarwart-Produkten

### Changed
- ProductActions erweitert für Solarwart-Produkte
- ProductActionsWrapper erstellt für dynamische Komponenten-Auswahl
- lib/config erweitert um MEDUSA_BACKEND_URL Export
- lib/data/products erweitert um retrievePricedProductById

### Technical
- React Hooks für State Management
- Custom Price Formatting Utilities
- TypeScript für Type-Safety
- Tailwind CSS für Styling
- Build erfolgreich getestet und optimiert

## [0.5.1] - 2025-08-13

### Added
- **Supabase MCP Integration**
  - Erfolgreich Supabase MCP Server in Claude Code installiert
  - Direct Database Access über Model Context Protocol
  - Project Reference: arcaytnxsrhvnaohgcef

### Fixed
- **Solarwart Produkte vollständig repariert**
  - Alle 6 Produkte existieren nun in der Datenbank
  - Fehlende Produkte (DC/AC Überspannungsschutz, Drohneninspektion) wurden angelegt
  - Alle Produkte haben jetzt funktionsfähige Varianten
  - Metadata für Konfigurator-Integration aktualisiert
  - Update-Scripts für zukünftige Wartung erstellt:
    - `npm run check:solarwart` - Status-Check
    - `npm run update:solarwart` - Metadata Update
    - `npm run fix:solarwart` - Vollständige Reparatur

### Technical
- Neue Scripts für Produkt-Management
- Vereinfachte Varianten-Erstellung ohne Workflow-Komplikationen
- Direkte Service-Methoden statt komplexer Workflows

## [0.5.0] - 2025-01-13

### Added
- **Solarwart Preissystem - Phase 1: Backend-Infrastruktur** ✅
- **Solarwart Preissystem - Phase 2: Produkt-Setup** ✅
  - 6 Solarwart-Produkte angelegt:
    - Photovoltaik-Reinigung (dynamische Preisberechnung)
    - Photovoltaik-Wartung (Jahres-/Monatsverträge)
    - Monitoring/Fernüberwachung (Setup + Abo)
    - DC-Überspannungsschutz (modulbasierte Berechnung)
    - AC-Überspannungsschutz (mit Zusatzoptionen)
    - Drohneninspektion (Staffelpreise)
  - Vollständige Produkt-Metadata für Konfigurator
  - Seed-Script `seed:solarwart` für einfache Installation
  - Test-Scripts für API-Endpoint-Validierung
  - 5 Produktkategorien erstellt und zugewiesen

**Phase 1 Details:**
  - Custom Pricing Module mit 5 Service-Klassen:
    - `CleaningPriceService`: Berechnung für PV-Reinigung mit allen Faktoren
    - `MaintenancePriceService`: Wartungsverträge mit Jahres-/Monatspreisen
    - `MonitoringPriceService`: Monitoring-Service mit Einrichtung + Abo
    - `OvervoltagePriceService`: DC/AC Überspannungsschutz-Berechnung
    - `DronePriceService`: Drohneninspektion mit Staffelpreisen
  - Utility-Klassen für Berechnungen:
    - `TierCalculator`: Mengenrabatte und Staffelpreise
    - `FactorCalculator`: Dach-, Etagen-, Verschmutzungsfaktoren
  - API Endpoints:
    - `POST /api/store/solarwart/calculate-price`: Dynamische Preisberechnung
    - `GET /api/store/solarwart/pricing-config/[productType]`: Konfiguration abrufen
  - Workflows:
    - `add-configured-product-to-cart`: Konfigurierte Produkte zum Warenkorb
    - `validate-solarwart-checkout`: Preisvalidierung beim Checkout
  - Vollständige TypeScript-Definitionen für Type-Safety
  - Detaillierte Preisaufschlüsselung mit Breakdown

### Technical
- Medusa v2 kompatible Module-Struktur
- Service-basierte Architektur ohne TransactionBaseService
- Metadata-Support für Cart/Order Line Items
- Validierung aller Eingabeparameter
- 24h Gültigkeit für Preisberechnungen

## [0.4.0] - 2025-08-12

### Added
- **Erweiterte Cart-Integration für Cross-Domain**
  - Neue API-Route `/api/cart/add` für direkte URL-basierte Integration
  - Neue API-Route `/api/cart/external-add` mit CORS-Support
  - GET-Support für `/api/cart/add-variants` Route
  - Automatische Weiterleitung zum Cart nach Produkthinzufügung
  - Status-Parameter in Cart-URL (added=X, errors=true)
- **Verbesserte Fehlerbehandlung**
  - Region-Validierung vor Cart-Erstellung
  - Tax Provider Fehlerbehandlung
  - Ausführliches Logging für Debugging
  - Fallback zu 'de' wenn Country Code fehlt
- **Multiple URL-Formate unterstützt**
  - Standard: ?variants=id1,id2&action=add
  - Alternative: ?add_to_cart=id
  - Base64: ?payload=encoded_data
  - Individual: ?v0=id1&v1=id2

### Changed
- Cart-Page processUrlParameters erweitert für mehr Formate
- API-Routen mit besserem Error-Handling
- Logging verbessert für alle Cart-Operationen

### Fixed
- Tax Provider "null" Fehler behoben
- Region-Initialisierung korrigiert
- Cart-Cookie-Handling verbessert

### Technical Details
- CORS-Header für externe Domains
- Force-dynamic für API-Routen
- 303 Redirects für GET-Requests
- Comprehensive Error Logging

## [0.3.0] - 2025-08-12

### Added
- **Cross-Domain Cart Integration**
  - Cart-Page unterstützt URL-Parameter für Produkt-Import
  - Query-Parameter: ?variants=id1,id2&action=add&cart_id=xxx
  - Automatische Cart-Erstellung wenn nicht vorhanden
  - Batch-Verarbeitung mehrerer Varianten gleichzeitig
- **URL-Cleaner Component**
  - Automatische Bereinigung der URL nach Parameter-Verarbeitung
  - LocalStorage cleanup für Transfer-Daten
  - Client-side Component für Browser-History-Management
- **API-Route /api/cart/add-variants**
  - POST-Endpoint für programmatischen Cart-Zugriff
  - JSON-basierte Varianten-Übergabe
  - Fallback-Option für CORS-Szenarien
- **Konfigurator-Integration vorbereitet**
  - Unterstützt Weiterleitung von konfigurator.dersolarwart.de
  - Cart-Transfer über URL-Parameter möglich
  - Nahtlose Produktübernahme zwischen Domains

### Changed
- Cart-Page erweitert um processUrlParameters Funktion
- Cart-Template erhält shouldCleanUrl Flag
- Build-Prozess verifiziert und optimiert

### Technical Details
- Server-side URL-Parameter Verarbeitung
- Client-side URL-Bereinigung nach Success
- Console-Logging für Debugging implementiert
- Error-Handling für fehlgeschlagene Varianten-Adds

## [0.2.0] - 2025-01-31

### Added
- **Neues dersolarwart.de Design-System**
  - Implementierte dunkles Theme mit Solarwart-Farben (Schwarz/Grün)
  - Glassmorphism-Effekte und Blur-Backgrounds
  - Neue Farbpalette: solarwart-green (#77fc58), solarwart-black, etc.
  - Gradient-Texteffekte und animierte Blur-Circles
- **Header-Navigation statt Sidebar**
  - Neue horizontale Navigation im Header
  - Sticky Header mit Backdrop-Blur-Effekt
  - Direkte Links zu Produkten, Kollektionen, Über uns und Kontakt
  - Icons für Suche, Account und Warenkorb
- **Neue Hero-Komponente**
  - Großflächige Hero-Section mit animierten Hintergrundeffekten
  - Feature-Cards mit Glassmorphism-Design
  - CTA-Buttons im neuen Design-System
- **Überarbeitete Produkt-Präsentation**
  - Produkt-Cards mit Glassmorphism-Effekt
  - Hover-Overlays mit Animationen
  - Verbesserte Grid-Layouts (responsive)
- **Footer im neuen Design**
  - Dunkler Footer mit strukturierten Bereichen
  - Links zu Hauptseite dersolarwart.de

### Changed
- Komplette UI-Überarbeitung im Storefront
- Tailwind-Konfiguration erweitert mit neuen Farben und Utilities
- Layout-Template angepasst für dunkles Theme
- CartDropdown mit neuem Design und Icons
- ProductPreview-Komponente komplett überarbeitet

### Technical Details
- Erweiterte Tailwind CSS Konfiguration
- Neue CSS-Utility-Klassen: glass-card, gradient-text, blur-circle, etc.
- Responsive Breakpoints für alle Komponenten
- Build erfolgreich getestet

## [0.1.2] - 2025-07-30

### Fixed
- **CRITICAL FIX**: Medusa v2 must be started from `.medusa/server` directory
  - Updated start.sh to change to correct directory before starting
  - Fixed "Could not find index.html in the admin build directory" error
  - Admin dashboard now loads correctly at /admin endpoint
- Removed simple-server.js test that was causing deployment loops
- Added predeploy script for database migrations
- Enhanced Redis and worker mode configuration support

### Changed
- Modified start.sh script to:
  - Change to `.medusa/server` directory before starting Medusa
  - Run predeploy migrations script
  - Remove simple server connectivity test
- Updated medusa-config.js to:
  - Support Redis configuration via REDIS_URL
  - Handle worker mode configuration
  - Conditionally load dashboard plugin based on worker mode
- Added predeploy script to package.json for migrations

### Technical Details
- Medusa v2 requires execution from built server directory
- Dashboard plugin disabled in worker mode to prevent conflicts
- Railway deployment now follows official Medusa v2 deployment guide

## [0.1.1] - 2025-07-29

### Added
- Custom health endpoint (/health) for Railway deployment
- Multi-stage Dockerfile for optimized builds
- Port configuration support from environment variables
- Enhanced debug logging in start script
- Environment variable validation on startup
- Railway deployment documentation
- .dockerignore for optimized Docker builds

### Changed
- Updated railway.json to use Dockerfile instead of Nixpacks
- Modified medusa-config.js to handle build-time vs runtime configuration
- Enhanced start.sh script with:
  - Environment variable debugging and validation
  - PORT configuration from Railway
  - Better error handling for database connection
  - NODE_ENV configuration
  - Required variables check (DATABASE_URL, JWT_SECRET, COOKIE_SECRET)
- Separated build and runtime environments in Docker

### Fixed
- Railway deployment health check failures
- Port binding issues in production environment
- Database connection validation in start script
- Build-time DATABASE_URL undefined error
- Environment variable availability during Docker build

### Technical Details
- Switched from Nixpacks to Docker for better control
- Added PORT environment variable support for Railway
- Increased health check timeout to 90 seconds
- Multi-stage Docker build reduces image size
- Build stage uses dummy database URL

## [0.1.0] - 2025-01-24

### Added
- Initial Medusa v2.8.8 backend setup
- Supabase PostgreSQL database integration
  - Configured Transaction Pooler for optimal connection handling
  - Successfully migrated all Medusa tables
- Store configuration for German market
  - Region: Deutschland (EUR currency)
  - Tax rates: 19% standard, 7% reduced
  - Sales channel: "Solarwart Webshop"
- Product categories for solar services:
  - Reinigung (Cleaning)
  - Wartung & Inspektion (Maintenance & Inspection)
  - Monitoring
  - Service-Verträge (Service Contracts)
  - Speicher-Services (Battery Storage Services)
  - Zusatzleistungen (Additional Services)
- Demo products with pricing:
  - Premium Solarreinigung (249-449 EUR)
  - Basis-Wartung (299 EUR)
  - Solar-Log Monitoring (199 EUR/year)
  - Full-Service-Vertrag (699-899 EUR/year)
  - Batteriespeicher-Wartung (199 EUR)
  - Thermografie-Inspektion (399 EUR)
- Product metadata schema for recommendation system:
  - recommendation_tags
  - suitable_roof_types
  - service_type
  - priority_score
  - battery_requirement
- Admin user authentication setup
- Development scripts:
  - setup-solarwart-store.ts for initial data seeding
  - reset-admin-password.ts for user management

### Fixed
- Database connection issues with Supabase
  - Resolved "database pascallammers does not exist" error
  - Fixed URL encoding for special characters in password
  - Implemented correct Medusa v2 configuration format

### Changed
- Updated medusa-config.js to use defineConfig from @medusajs/framework/utils
- Switched from Direct Connection to Transaction Pooler URL for better performance

### Technical Details
- Framework: Medusa.js v2.8.8
- Database: PostgreSQL (Supabase)
- ORM: MikroORM v6.4.3
- Node.js: v20+ required

### Known Issues
- TypeScript compilation errors in some scripts (functionality not affected)
- Store name not updating correctly in setup script

## [0.0.1] - 2025-01-24

### Added
- Initial project setup from Medusa starter template