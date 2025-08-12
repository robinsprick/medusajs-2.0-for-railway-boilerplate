import type { 
  MedusaRequest, 
  MedusaResponse,
} from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Simple security check - require a secret parameter
  const secret = req.query.secret as string;
  if (secret !== 'fix-tax-2024') {
    return res.status(403).json({
      success: false,
      message: 'Invalid secret'
    });
  }

  const regionModuleService = req.scope.resolve(Modules.REGION);
  
  try {
    console.log('Fixing tax provider for regions...');

    // List all regions
    const regions = await regionModuleService.listRegions();
    
    console.log(`Found ${regions.length} regions`);
    
    const results = [];

    // Update each region to enable automatic taxes
    for (const region of regions) {
      console.log(`Updating region: ${region.name} (${region.id})`);
      
      try {
        await regionModuleService.updateRegions(region.id, {
          automatic_taxes: true
        });
        
        results.push({
          region: region.name,
          id: region.id,
          status: 'success',
          message: 'Automatic taxes enabled'
        });
        
        console.log(`✓ Updated region ${region.name} with automatic taxes`);
      } catch (error: any) {
        results.push({
          region: region.name,
          id: region.id,
          status: 'error',
          message: error.message
        });
        console.error(`Failed to update region ${region.name}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: 'Tax provider fix completed',
      results,
      note: 'You can now delete this endpoint from /src/api/store/fix-tax/route.ts'
    });
  } catch (error: any) {
    console.error('Error fixing tax provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix tax provider',
      error: error.message
    });
  }
};