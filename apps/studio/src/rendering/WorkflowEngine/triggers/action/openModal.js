/**
 * Open a modal by ID and execute its onLoad triggers
 * Content should be: {"modalId": "componentId"}
 */
export async function openModal(content, context) {
  const { triggerEngine } = await import('../../TriggerEngine.js');
  
  const config = typeof content === 'string' ? JSON.parse(content) : content;
  const { modalId } = config;

  if (!modalId) {
    console.error('openModal: modalId is required');
    return;
  }

  console.log(`🔓 Opening modal: ${modalId}`);

  // Clear form data when opening modal (to remove ghost values from previous edits)
  if (context.setFormData) {
    console.log('🧹 Clearing formData');
    context.setFormData({});
  } else {
    console.warn('⚠️ setFormData not available in context');
  }

  // Dispatch event to show the modal
  const event = new CustomEvent('openModal', {
    detail: { modalId, context }
  });
  window.dispatchEvent(event);

  // Find the modal component and execute its onLoad triggers
  const findModalComponent = (components, targetId) => {
    for (const comp of components || []) {
      if (comp.id === targetId) return comp;
      const found = findModalComponent(comp.components, targetId);
      if (found) return found;
    }
    return null;
  };

  const modalComponent = findModalComponent(context.pageConfig?.components, modalId);
  
  if (modalComponent?.workflowTriggers?.onLoad) {
    console.log(`🔄 Executing modal ${modalId} onLoad triggers`);
    await triggerEngine.executeTriggers(modalComponent.workflowTriggers.onLoad, context);
  }
}
