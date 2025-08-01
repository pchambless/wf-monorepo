/**
 * Document Templates
 * Template functions for generating document content
 */

export { analysisTemplate } from "./analysisTemplate.js";
export { guidanceTemplate } from "./guidanceTemplate.js";
export { planTemplate } from "./planTemplate.js";

/**
 * Get template function by name
 * @param {string} templateName - Name of template
 * @returns {Function|null} Template function or null if not found
 */
export function getTemplate(templateName) {
  const templates = {
    analysisTemplate,
    guidanceTemplate,
    planTemplate,
  };

  return templates[templateName] || null;
}

/**
 * Generate document content using specified template
 * @param {string} templateName - Name of template to use
 * @param {Object} params - Parameters for template
 * @returns {string} Generated document content
 */
export function generateContent(templateName, params) {
  const template = getTemplate(templateName);

  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }

  return template(params);
}
