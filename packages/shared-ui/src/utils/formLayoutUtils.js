/**
 * Reorganizes form fields to ensure multiLine fields appear in their own group at the end
 */
export function organizeFormGroups(groups) {
  const regularGroups = [];
  const multiLineFields = [];
  
  // Separate multiline fields from regular fields
  groups.forEach(group => {
    const regularFields = group.fields.filter(field => field.type !== 'multiLine');
    const mlFields = group.fields.filter(field => field.type === 'multiLine');
    
    if (regularFields.length > 0) {
      regularGroups.push({
        ...group,
        fields: regularFields
      });
    }
    
    multiLineFields.push(...mlFields);
  });
  
  // Only add multiline group if there are multiline fields
  if (multiLineFields.length > 0) {
    regularGroups.push({
      id: 'multiLineGroup',
      title: 'Comments & Notes',
      fields: multiLineFields
    });
  }
  
  return regularGroups;
}