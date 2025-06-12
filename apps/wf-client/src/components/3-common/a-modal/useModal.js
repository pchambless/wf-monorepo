import modalStore from './modalStore';

/**
 * Custom hook for using the modal system
 * Provides convenient access to modal store functions
 */
export const useModal = () => {
  return {
    // Legacy pattern - open by type with additional props
    openModal: (modalType, additionalProps = {}) => 
      modalStore.openModal(modalType, additionalProps),
    
    // New pattern - open with complete configuration
    showModal: (config) => 
      modalStore.showModal(config),
    
    // Close the modal
    closeModal: () => 
      modalStore.closeModal(),
    
    // Check if the modal is open
    isModalOpen: () => 
      modalStore.isOpen,
    
    // Get current modal config
    getModalConfig: () => 
      modalStore.config,

    // Show an error modal for application errors
    showError: (options) => modalStore.showError(options),
  };
};
