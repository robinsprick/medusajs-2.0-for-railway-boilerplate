import { 
  ExecArgs,
} from '@medusajs/types';
import { Modules } from '@medusajs/utils';

export default async function updateRegionTax({ container }: ExecArgs) {
  const regionModuleService = container.resolve(Modules.REGION);
  
  try {
    console.log('Updating regions with tax provider...');

    // List all regions
    const regions = await regionModuleService.listRegions();
    
    console.log(`Found ${regions.length} regions`);

    // Update each region to enable automatic taxes
    for (const region of regions) {
      console.log(`Updating region: ${region.name} (${region.id})`);
      
      try {
        await regionModuleService.updateRegions(region.id, {
          automatic_taxes: true,
          metadata: {
            tax_provider_id: 'system'
          }
        });
        
        console.log(`✓ Updated region ${region.name}`);
      } catch (error) {
        console.error(`Failed to update region ${region.name}:`, error.message);
      }
    }

    console.log('✓ Successfully updated all regions');
  } catch (error) {
    console.error('Error updating regions:', error);
    throw error;
  }
}

updateRegionTax.aliases = ['update-tax'];