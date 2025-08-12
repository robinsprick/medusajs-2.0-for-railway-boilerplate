import { 
  ExecArgs,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export default async function setupTaxProvider({ container }: ExecArgs) {
  const regionModuleService = container.resolve(Modules.REGION);
  const taxModuleService = container.resolve(Modules.TAX);
  
  try {
    console.log('Setting up tax provider for all regions...');

    // List all regions
    const regions = await regionModuleService.listRegions();
    
    console.log(`Found ${regions.length} regions`);

    // Get the default tax provider (should be "system" from @medusajs/tax)
    const taxProviders = await taxModuleService.listTaxProviders();
    console.log('Available tax providers:', taxProviders);

    const defaultProvider = taxProviders.find(p => p.id === 'system') || taxProviders[0];
    
    if (!defaultProvider) {
      console.error('No tax provider found! Make sure @medusajs/tax module is properly configured.');
      return;
    }

    console.log(`Using tax provider: ${defaultProvider.id}`);

    // Update each region with the tax provider
    for (const region of regions) {
      console.log(`Updating region: ${region.name} (${region.id})`);
      
      try {
        await regionModuleService.updateRegions(region.id, {
          automatic_taxes: true
        });
        
        console.log(`✓ Updated region ${region.name} with tax provider ${defaultProvider.id}`);
      } catch (error: any) {
        console.error(`Failed to update region ${region.name}:`, error.message);
      }
    }

    console.log('✓ Successfully set up tax provider for all regions');
  } catch (error) {
    console.error('Error setting up tax provider:', error);
    throw error;
  }
}

setupTaxProvider.aliases = ['setup-tax'];