export default function genFormHtml(formConfig, sampleRecord) {
  if (!formConfig) {
    return '<p><em>No form configuration available for this entity</em></p>';
  }
  
  if (!sampleRecord) {
    return '<p><em>No sample data available for form preview</em></p>';
  }
  
  // Handle the groups-only approach
  if (formConfig.groups && formConfig.groups.length > 0) {
    const groupsHtml = formConfig.groups.map(group => {
      const fieldsHtml = group.fields.map(field => {
        const value = sampleRecord[field.field] !== undefined && sampleRecord[field.field] !== null 
          ? sampleRecord[field.field] 
          : '';
        
        const required = field.required ? '<span class="required-marker">*</span>' : '';
        const fieldType = field.type ? `<span class="field-type">[${field.type}]</span>` : '';
        
        let fieldPreviewClass = 'field-preview';
        if (field.type === 'select') fieldPreviewClass += ' select-field';
        if (field.type === 'multiLine') fieldPreviewClass += ' multiLine-field';
        if (field.type === 'number' || field.type === 'decimal') fieldPreviewClass += ' number-field';
        
        return `
          <div class="form-field">
            <label>${field.label || field.field}${required} ${fieldType}</label>
            <div class="${fieldPreviewClass}">${value}</div>
          </div>`;
      }).join('');
      
      return `
        <div class="form-group">
          <div class="group-header">${group.title}</div>
          <div class="form-row">${fieldsHtml}</div>
        </div>`;
    }).join('');
    
    return `<div class="form-container">${groupsHtml}</div>`;
  }
  
  // Fallback for legacy formConfig with just fields
  if (formConfig.fields && formConfig.fields.length > 0) {
    // Render all fields in a single group
    const fields = formConfig.fields.map(field => {
      const value = sampleRecord[field.field] !== undefined && sampleRecord[field.field] !== null 
        ? sampleRecord[field.field] 
        : '';
    
      const required = field.required ? '<span class="required-marker">*</span>' : '';
      const fieldType = field.type ? `<span class="field-type">[${field.type}]</span>` : '';
    
      let fieldPreviewClass = 'field-preview';
      if (field.type === 'select') fieldPreviewClass += ' select-field';
      if (field.type === 'multiLine') fieldPreviewClass += ' multiLine-field';
      if (field.type === 'number' || field.type === 'decimal') fieldPreviewClass += ' number-field';
    
      return `
        <div class="form-field">
          <label>${field.label || field.field}${required} ${fieldType}</label>
          <div class="${fieldPreviewClass}">${value}</div>
        </div>`;
    }).join('');
  
    return `<div class="form-container"><div class="form-group"><div class="form-row">
    ${fields}</div></div></div>`;
  }
  
  return '<p><em>No form fields defined for this entity</em></p>';
}