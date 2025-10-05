export const createRecord = async (data, eventType) => {
  // Generic record creation using eventType's qry
  console.log(`[createRecord] Creating record for ${eventType?.eventType || 'unknown'}`, data);
  
  // Determine the create query based on eventType category
  const createQry = `create${eventType?.category?.charAt(0).toUpperCase() + eventType?.category?.slice(1) || 'Record'}`;
  
  return {
    action: 'saveRecord',
    qry: createQry,
    data: data,
    success: true,
    message: `${eventType?.category || 'Record'} created successfully`
  };
};