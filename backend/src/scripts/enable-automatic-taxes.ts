import { 
  ExecArgs,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export default async function enableAutomaticTaxes({ container }: ExecArgs) {
  const regionModuleService = container.resolve(Modules.REGION);
  
  try {
    console.log('===================================');
    console.log('Enabling automatic taxes for all regions...');
    console.log('===================================');

    // List all regions
    const regions = await regionModuleService.listRegions();
    
    console.log(`\nFound ${regions.length} region(s)\n`);

    let successCount = 0;
    let errorCount = 0;

    // Update each region to enable automatic taxes
    for (const region of regions) {
      try {
        console.log(`Processing: ${region.name} (${region.id})`);
        
        await regionModuleService.updateRegions(region.id, {
          automatic_taxes: true
        });
        
        console.log(`✅ SUCCESS: ${region.name} - Automatic taxes enabled\n`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ ERROR: ${region.name} - ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('===================================');
    console.log('SUMMARY:');
    console.log(`✅ Success: ${successCount} region(s)`);
    console.log(`❌ Failed: ${errorCount} region(s)`);
    console.log('===================================');
    
    if (errorCount === 0) {
      console.log('\n🎉 All regions have been successfully updated!');
    } else {
      console.log('\n⚠️  Some regions failed to update. Please check the errors above.');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

enableAutomaticTaxes.aliases = ['enable-tax'];