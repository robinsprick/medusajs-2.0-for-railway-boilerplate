import { 
  ExecArgs,
} from '@medusajs/types';
import { ContainerRegistrationKeys } from '@medusajs/utils';

export default async function fixTaxProvider({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  try {
    console.log('Fixing tax provider for regions...');

    // Get all regions
    const { data: regions } = await query.graph({
      entity: 'region',
      fields: ['id', 'name', 'currency_code', 'automatic_taxes']
    });

    console.log(`Found ${regions.length} regions`);

    // Update each region to use the system tax provider
    for (const region of regions) {
      console.log(`Updating region: ${region.name} (${region.id})`);
      
      await query.graph({
        entity: 'region',
        filters: { id: region.id },
        data: {
          automatic_taxes: true
        }
      });

      console.log(`✓ Updated region ${region.name} with automatic taxes`);
    }

    // Create or update tax regions with the system provider
    const taxModule = container.resolve('@medusajs/tax');
    
    for (const region of regions) {
      try {
        // Create tax region with system provider
        await taxModule.createTaxRegions({
          province_code: null,
          country_code: region.countries?.[0]?.iso_2 || 'DE',
          parent_id: null,
          provider_id: 'system',
          metadata: {},
          default_tax_rate: {
            rate: region.currency_code === 'EUR' ? 19 : 0, // 19% for EUR (Germany), 0 for others
            name: 'Standard VAT',
            code: 'VAT_STD',
            is_default: true
          }
        });
        
        console.log(`✓ Created tax region for ${region.name}`);
      } catch (error) {
        // Tax region might already exist
        console.log(`Tax region might already exist for ${region.name}:`, error.message);
      }
    }

    console.log('✓ Successfully fixed tax provider configuration');
  } catch (error) {
    console.error('Error fixing tax provider:', error);
    throw error;
  }
}

fixTaxProvider.aliases = ['fix-tax'];