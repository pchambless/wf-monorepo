/**
 * Capture Form Data Trigger
 * Scrapes all form field values and stores as dmlData in context_store
 *
 * @param {Object} params - { formId: "formElementId" }
 * @param {Object} context - Execution context with contextStore
 * @returns {Object} The captured form data
 */
export async function captureFormData(params, context) {
  console.log('📋 captureFormData called with params:', params);
  const { comp_name } = params;

  if (!comp_name) {
    throw new Error('captureFormData: comp_name is required');
  }

  console.log('📋 Looking for form with id:', comp_name);
  // Get form container from DOM (might be a div with Form id, not an actual <form> element)
  let formContainer = document.getElementById(comp_name);

  console.log('📋 Step 1: getElementById result:', formContainer);

  if (!formContainer) {
    console.error(`❌ Form container not found with id "${comp_name}"`);
    console.error('Available elements with id:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    throw new Error(`captureFormData: Form container not found with id "${comp_name}"`);
  }

  console.log('✅ Found form container:', formContainer.tagName);

  // Scrape all input/select/textarea elements within the container
  const formData = {};
  const inputs = formContainer.querySelectorAll('input, select, textarea');

  console.log('📋 Found inputs:', inputs.length);

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
