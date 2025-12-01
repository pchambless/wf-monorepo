/**
 * Close a modal by ID (or close all if no ID specified)
 * Content can be: {"modalId": "componentId"} or empty to close all
 */
export async function closeModal(content, context) {
  const config = content ? (typeof content === 'string' ? JSON.parse(content) : content) : {};
  const { modalId } = config;

  console.log(`🔒 Closing modal:`, modalId || 'all');

  // Dispatch custom event for modal manager
  const event = new CustomEvent('closeModal', {
    detail: { modalId, context }
  });
  window.dispatchEvent(event);
}
