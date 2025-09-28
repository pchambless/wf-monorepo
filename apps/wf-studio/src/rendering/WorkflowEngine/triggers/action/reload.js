/**
 * Reload action - tells component to reload itself
 * Generic action that can be used by any component that needs to refresh its content
 */
export async function reload(action, context) {
  console.log('🔄 Reload action triggered for component');

  // Return a signal that tells the component to reload
  // The component's execFetchData method will handle this
  return {
    action: 'reload',
    timestamp: Date.now(),
    message: 'Component reload requested'
  };
}