import { 
  ExecArgs,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export default async function fixTaxProvider({ container }: ExecArgs) {
  const regionModuleService = container.resolve(Modules.REGION);
  
  try {
    console.log('Fixing tax provider for regions...');

    // List all regions
    const regions = await regionModuleService.listRegions();
    
    console.log(`Found ${regions.length} regions`);

    // Update each region to enable automatic taxes
    for (const region of regions) {
      console.log(`Updating region: ${region.name} (${region.id})`);
      
      try {
        await regionModuleService.updateRegions(region.id, {
          automatic_taxes: true
        });
        
        console.log(`✓ Updated region ${region.name} with automatic taxes`);
      } catch (error: any) {
        console.error(`Failed to update region ${region.name}:`, error.message);
      }
    }

    console.log('✓ Successfully fixed tax provider configuration');
  } catch (error) {
    console.error('Error fixing tax provider:', error);
    throw error;
  }
}

fixTaxProvider.aliases = ['fix-tax'];