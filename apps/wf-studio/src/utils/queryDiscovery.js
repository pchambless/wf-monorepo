/**
 * Query Discovery - Get available queries from server events directory
 * Reads from /apps/wf-server/server/events/{app}/ to populate Query dropdown
 */

/**
 * Fetch available queries for an app from the server
 * This would ideally be an API call, but for now we'll simulate it
 */
export async function getAvailableQueries(app = 'plans') {
  try {
    // For now, return common query patterns based on app
    // TODO: Replace with actual API call to scan /apps/wf-server/server/events/{app}/
    
    const commonQueries = {
      plans: [
        'planDtl',
        'planList', 
        'planComms',
        'planImpacts',
        'createPlan',
        'updatePlan',
        'deletePlan'
      ],
      client: [
        'userList',
        'userDtl',
        'brandList',
        'productList',
        'recipeList'
      ],
      admin: [
        'accountList',
        'userAcctList',
        'systemConfig'
      ]
    };

    return commonQueries[app] || [];
    
  } catch (error) {
    console.error('Failed to fetch available queries:', error);
    return [];
  }
}

/**
 * Future enhancement: Actual API call to scan server events
 */
export async function scanServerEvents(app) {
  try {
    // This would call an API endpoint that scans:
    // /apps/wf-server/server/events/{app}/*.js
    // and returns the available query names
    
    const response = await fetch(`/api/studio/queries/${app}`);
    const data = await response.json();
    return data.queries || [];
    
  } catch (error) {
    console.warn('Server event scanning not available, using defaults');
    return getAvailableQueries(app);
  }
}