/**
 * Test script for Solarwart pricing API endpoints
 * Run with: curl commands or use this as documentation
 */

// Test configurations for each service type
const testConfigs = {
  cleaning: {
    productType: "cleaning",
    config: {
      moduleCount: 250,
      roofType: "schraeg",
      floorLevel: 2,
      lastCleaning: "never",
      distance: 20
    }
  },
  maintenance: {
    productType: "maintenance",
    config: {
      moduleCount: 75,
      includeStorage: true,
      subscriptionType: "yearly"
    }
  },
  monitoring: {
    productType: "monitoring",
    config: {
      setupType: "standard",
      subscriptionType: "monthly"
    }
  },
  overvoltage_dc: {
    productType: "overvoltage_dc",
    config: {
      moduleCount: 80
    }
  },
  overvoltage_ac: {
    productType: "overvoltage_ac",
    config: {
      moduleCount: 50,
      needsRebuild: true,
      cableLength: 10
    }
  },
  drone: {
    productType: "drone",
    config: {
      moduleCount: 150
    }
  }
}

// Example curl commands for testing
console.log(`
========================================
SOLARWART API TEST COMMANDS
========================================

1. Test Cleaning Price Calculation:
----------------------------------------
curl -X POST http://localhost:9000/api/store/solarwart/calculate-price \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testConfigs.cleaning, null, 2)}'

Expected result:
- Base price: 250 × 13€ = 3,250€
- Tier discount: 10% (201-500 modules)
- Roof factor: +15% (Schrägdach)
- Floor factor: +5% (2nd floor)
- Soiling factor: +20% (never cleaned)
- Travel cost: 20km × 3.20€ = 64€

2. Test Maintenance Price Calculation:
----------------------------------------
curl -X POST http://localhost:9000/api/store/solarwart/calculate-price \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testConfigs.maintenance, null, 2)}'

Expected result:
- Base price: 363€/year (51-100 modules)
- Storage: +67€/year
- Total: 430€/year

3. Test Monitoring Price Calculation:
----------------------------------------
curl -X POST http://localhost:9000/api/store/solarwart/calculate-price \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testConfigs.monitoring, null, 2)}'

Expected result:
- Setup: 99€
- Monthly fee: 15€
- Total first month: 114€

4. Test DC Overvoltage Price Calculation:
----------------------------------------
curl -X POST http://localhost:9000/api/store/solarwart/calculate-price \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testConfigs.overvoltage_dc, null, 2)}'

Expected result:
- Strings: 80 ÷ 18 = 5
- Units: 5 ÷ 2 = 3
- Price: 3 × 460€ = 1,380€

5. Test AC Overvoltage Price Calculation:
----------------------------------------
curl -X POST http://localhost:9000/api/store/solarwart/calculate-price \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testConfigs.overvoltage_ac, null, 2)}'

Expected result:
- Base: 649€
- Rebuild: +129€
- Cable >5m: +29€
- Total: 807€

6. Test Drone Inspection Price Calculation:
----------------------------------------
curl -X POST http://localhost:9000/api/store/solarwart/calculate-price \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testConfigs.drone, null, 2)}'

Expected result:
- First 50: 149€
- Additional 100 (2×50): 158€
- Total: 307€

========================================
PRICING CONFIG ENDPOINTS
========================================

Get Cleaning Config:
curl http://localhost:9000/api/store/solarwart/pricing-config/cleaning

Get Maintenance Config:
curl http://localhost:9000/api/store/solarwart/pricing-config/maintenance

Get Monitoring Config:
curl http://localhost:9000/api/store/solarwart/pricing-config/monitoring

Get DC Overvoltage Config:
curl http://localhost:9000/api/store/solarwart/pricing-config/overvoltage_dc

Get AC Overvoltage Config:
curl http://localhost:9000/api/store/solarwart/pricing-config/overvoltage_ac

Get Drone Config:
curl http://localhost:9000/api/store/solarwart/pricing-config/drone

========================================
`)

export default testConfigs