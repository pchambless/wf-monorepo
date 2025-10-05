export const updateRecord = async (data, eventType) => {
  // Generic record update using eventType's qry
  console.log(`[updateRecord] Updating record for ${eventType?.eventType || 'unknown'}`, data);
  
  // Determine the update query based on eventType category
  const updateQry = `update${eventType?.category?.charAt(0).toUpperCase() + eventType?.category?.slice(1) || 'Record'}`;
  
  return {
    action: 'saveRecord',
    qry: updateQry,
    data: data,
    success: true,
    message: `${eventType?.category || 'Record'} updated successfully`
  };
};