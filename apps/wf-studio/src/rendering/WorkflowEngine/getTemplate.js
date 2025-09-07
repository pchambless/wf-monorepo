/**
 * Get template for eventType category
 */
export async function getTemplate(category) {
  try {
    const templateModule = await import(`../apps/studio/eventBuilders/templates/leafs/${category}.js`);
    return templateModule[`${category}Template`] || templateModule.default;
  } catch (error) {
    console.warn(`⚠️ Template not found for category: ${category}`);
    return null;
  }
}