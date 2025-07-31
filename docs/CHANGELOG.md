# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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