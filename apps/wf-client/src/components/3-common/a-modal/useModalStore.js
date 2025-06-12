import modalStore from './modalStore';

/**
 * Hook to access modalStore with reactive properties
 */
export const useModalStore = () => {
  // Return an object with all the properties and methods from modalStore
  return {
    isOpen: modalStore.isOpen,
    title: modalStore.title,
    content: modalStore.content,
    actions: modalStore.actions,
    size: modalStore.size,
    config: modalStore.config || {},
    
    // Methods
    showModal: (options) => modalStore.showModal(options),
    closeModal: () => modalStore.closeModal(),
    showError: (options) => modalStore.showError && modalStore.showError(options)
  };
};

export default useModalStore;
