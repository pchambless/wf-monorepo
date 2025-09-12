/**
 * Refresh target components - dynamically invoked method
 */
export async function refresh(action, context) {
  const targets = action.targets || [];
  console.log(`🔄 Refreshing components:`, targets);
  
  for (const targetName of targets) {
    console.log(`🔄 Looking for component: ${targetName}`);
    
    // Find the component reference in the registry
    const componentRef = this.componentRefs.get(targetName);
    if (componentRef && componentRef.workflowTriggers?.onRefresh) {
      console.log(`🔄 Found ${targetName}, executing onRefresh:`, componentRef.workflowTriggers.onRefresh);
      
      // Execute the component's onRefresh workflows using unified execFetchData
      const triggers = componentRef.workflowTriggers.onRefresh;
      if (componentRef.execFetchData && typeof componentRef.execFetchData === 'function') {
        await componentRef.execFetchData(triggers);
      } else {
        console.warn(`⚠️ Component ${targetName} has no execFetchData method`);
      }
    } else {
      console.warn(`⚠️ Component ${targetName} not found in registry or has no onRefresh triggers`);
    }
  }
}