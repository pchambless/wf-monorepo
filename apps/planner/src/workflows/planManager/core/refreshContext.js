export const refreshContext = async (data, eventType) => {
  // Update context store with selection data
  console.log(`[refreshContext] Refreshing context for ${eventType?.eventType || 'unknown'}`, data);
  
  // Set selected record parameters
  return {
    action: 'setParam',
    params: {
      selectedRecord: data,
      selectedId: data?.id || data?.plan_id || null
    },
    success: true
  };
};