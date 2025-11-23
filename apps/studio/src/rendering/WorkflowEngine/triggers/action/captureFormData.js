/**
 * Capture Form Data Trigger
 * Scrapes all form field values and stores as dmlData in context_store
 *
 * @param {Object} params - { formId: "formElementId" }
 * @param {Object} context - Execution context with contextStore
 * @returns {Object} The captured form data
 */
export async function captureFormData(params, context) {
  const { comp_name } = params;

  if (!comp_name) {
    throw new Error('captureFormData: comp_name is required');
  }

  // Get form element from DOM (comp_name is the DOM id)
  const form = document.getElementById(comp_name);
  if (!form) {
    throw new Error(`captureFormData: Form not found with id "${comp_name}"`);
  }

  // Scrape all input/select/textarea elements
  const formData = {};
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    if (fieldName) {
      // Handle different input types
      if (input.type === 'checkbox') {
        formData[fieldName] = input.checked;
      } else if (input.type === 'radio') {
        if (input.checked) {
          formData[fieldName] = input.value;
        }
      } else {
        formData[fieldName] = input.value;
      }
    }
  });

  console.log('📋 Captured form data:', formData);

  // Store in context_store as dmlData (stringify objects)
  const { setVals } = await import('../../../../utils/api.js');
  await setVals([{ paramName: 'dmlData', paramVal: JSON.stringify(formData) }]);

  return formData;
}
