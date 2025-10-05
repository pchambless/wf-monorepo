export const execEvent = async (data, eventType) => {
  // Execute the component's qry to load its data
  console.log(`[execEvent] Loading data for ${eventType?.eventType || 'unknown'} using qry: ${eventType?.qry}`);
  
  if (!eventType?.qry) {
    console.warn(`[execEvent] No qry defined for ${eventType?.eventType}`);
    return { success: false, message: 'No query defined for this component' };
  }
  
  return {
    action: 'refresh',
    qry: eventType.qry,
    data: data || {},
    success: true,
    message: `Data loaded for ${eventType.eventType}`
  };
};