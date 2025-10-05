/**
 * Open a modal by ID
 * Content should be: {"modalId": "componentId"}
 */
export async function openModal(content, context) {
  const config = typeof content === 'string' ? JSON.parse(content) : content;
  const { modalId } = config;

  if (!modalId) {
    console.error('openModal: modalId is required');
    return;
  }

  console.log(`🔓 Opening modal: ${modalId}`);

  // TODO: Implement modal state management
  // For now, dispatch a custom event that DirectRenderer can listen to
  const event = new CustomEvent('openModal', {
    detail: { modalId, context }
  });
  window.dispatchEvent(event);
}
