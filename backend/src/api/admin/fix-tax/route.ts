import type { 
  MedusaRequest, 
  MedusaResponse,
} from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Check for secret parameter for security
  const secret = req.query.secret as string;
  
  if (secret !== 'fix-tax-2024') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - invalid secret'
    });
  }

  const regionModuleService = req.scope.resolve(Modules.REGION);
  const taxModuleService = req.scope.resolve(Modules.TAX);
  
  try {
    console.log('Fixing tax provider for regions...');

    // Get available tax providers
    let taxProviders = [];
    let defaultProvider = null;
    
    try {
      taxProviders = await taxModuleService.listTaxProviders();
      console.log('Available tax providers:', taxProviders);
      
      // Find the system provider or use the first available one
      defaultProvider = taxProviders.find(p => p.id === 'system') || taxProviders[0];
    } catch (error) {
      console.log('Could not list tax providers, will use "system" as default');
      defaultProvider = { id: 'system' };
    }

    if (!defaultProvider) {
      return res.status(500).json({
        success: false,
        message: 'No tax provider available',
        error: 'Tax module might not be properly configured'
      });
    }

    // List all regions
    const regions = await regionModuleService.listRegions();
    
    console.log(`Found ${regions.length} regions`);
    console.log(`Using tax provider: ${defaultProvider.id}`);
    
    const results = [];

    // Update each region to enable automatic taxes and set tax provider
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
          message: `Automatic taxes enabled`
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
      taxProvider: defaultProvider.id,
      results
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