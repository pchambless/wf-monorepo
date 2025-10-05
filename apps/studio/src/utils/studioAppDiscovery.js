/**
 * Studio-Centric App & Page Discovery (API-Based)
 * Calls server APIs to discover apps and pages from eventTypes folder structure
 */

/**
 * Discover all apps defined in Studio eventTypes
 * @returns {Promise<string[]>} Array of app names
 */
export async function discoverApps() {
  try {
    const response = await fetch('/api/studio/apps');
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API returned error');
    }
    
    console.log('🔍 Discovered apps from Studio API:', data.apps);
    console.log('📋 Also available - templates:', data.templates);
    
    // Return apps + templates for complete Studio ecosystem
    return [...data.apps, ...data.templates];
    
  } catch (error) {
    console.error('❌ Error discovering apps via API:', error);
    // Fallback to basic structure
    return ['admin', 'client', 'plans', 'shared', 'studio', 'templates'];
  }
}

/**
 * Discover all pages for a specific app
 * @param {string} appName - Name of the app
 * @returns {Promise<string[]>} Array of page names
 */
export async function discoverPagesForApp(appName) {
  try {
    const response = await fetch(`/api/studio/pages/${appName}`);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API returned error');
    }
    
    console.log(`📋 Discovered pages for ${appName} via API:`, data.pages);
    return data.pages;
    
  } catch (error) {
    console.error(`❌ Error discovering pages for ${appName} via API:`, error);
    // Fallback to empty array - better than hardcoded guesses
    return [];
  }
}

/**
 * Discover complete monorepo structure from Studio
 * @returns {Promise<Object>} Object with app -> pages mapping
 */
export async function discoverMonorepoStructure() {
  try {
    console.log('🚀 Discovering monorepo structure via API...');
    
    const response = await fetch('/api/studio/structure');
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API returned error');
    }
    
    console.log('✅ Complete monorepo structure via API:', data.structure);
    return data.structure;
    
  } catch (error) {
    console.error('❌ Error discovering monorepo structure via API:', error);
    
    // Fallback: Get apps and pages separately
    try {
      const apps = await discoverApps();
      const structure = {};
      
      for (const app of apps) {
        structure[app] = await discoverPagesForApp(app);
      }
      
      return structure;
      
    } catch (fallbackError) {
      console.error('❌ Fallback discovery also failed:', fallbackError);
      return { studio: [] }; // Final fallback
    }
  }
}

/**
 * Check if an app has shared components available
 * @param {string} appName - Name of the app
 * @returns {Promise<boolean>} Whether shared components exist
 */
export async function hasSharedComponents(appName) {
  if (appName === 'shared') return true; // shared app itself
  
  try {
    const apps = await discoverApps();
    return apps.includes('shared');
  } catch {
    return false;
  }
}