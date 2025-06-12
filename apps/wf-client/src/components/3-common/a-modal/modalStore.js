import { makeAutoObservable } from 'mobx';
import createLogger from '@utils/logger';
import { Typography } from '@mui/material';

/**
 * MobX store for managing modal state
 */
class ModalStore {
  // Core modal state
  isOpen = false;
  title = '';
  content = null;
  actions = [];
  size = 'md';
  
  // Previous focus element for accessibility
  previousFocus = null;
  
  // Pre-defined modal configurations
  modalTypes = {
    deleteConfirm: {
      title: 'Confirm Deletion',
      type: 'confirmation',
      message: 'Are you sure you want to delete this item?',
      confirmButtonText: 'Delete',
      confirmButtonColor: 'error'
    },
    
    confirmation: {
      title: 'Confirm',
      type: 'confirmation',
      message: 'Are you sure?'
    },
    
    textMessage: {
      title: 'Text Message',
      type: 'message',
      message: 'This is a text message modal.'
    },
    
    error: {
      title: 'Error',
      type: 'message',
      message: 'An error occurred.'
    },
    
    // Custom type for DML previews
    dmlPreview: {
      title: 'SQL Preview',
      type: 'dmlPreview',
      size: 'lg'
    }
  };
  
  constructor() {
    makeAutoObservable(this);
    this.log = createLogger('ModalStore');
  }
  
  /**
   * Open a modal by predefined type with optional additional props
   * Compatible with the old ModalContext pattern
   */
  openModal(modalType, additionalProps = {}) {
    this.log.info('Opening modal by type:', modalType);
    this.previousFocus = document.activeElement;
    
    const baseConfig = this.modalTypes[modalType];
    if (!baseConfig) {
      this.log.error(`Unknown modal type: ${modalType}`);
      return;
    }
    
    // Merge the base config with additional props
    this.config = { ...baseConfig, ...additionalProps };
    this.type = baseConfig.type;
    this.isOpen = true;
  }
  
  /**
   * Show a modal with custom configuration
   * New approach for direct configuration
   */
  showModal(options) {
    this.log.info('Showing custom modal:', options.title);
    console.log('Modal store setting isOpen = true');
    
    // Set properties BEFORE setting isOpen to ensure everything's ready
    this.title = options.title || '';
    this.content = options.content || null;
    this.actions = options.actions || [];
    this.size = options.size || 'md';
    
    // Set isOpen last
    this.isOpen = true;
    
    // Add right before modalStore.showModal call
    this.log.info('Opening SQL preview modal and waiting for user interaction');
    console.log('MODAL: Showing modal, execution should pause until user interaction');
  }
  
  /**
   * Show a confirmation dialog
   */
  showConfirmation(options) {
    this.log.info('Showing confirmation modal:', options.title);
    
    const title = options.title || 'Confirm';
    const message = options.message || 'Are you sure?';
    
    this.showModal({
      title,
      content: (
        <div>
          <Typography>{message}</Typography>
        </div>
      ),
      actions: [
        {
          label: options.confirmText || 'Confirm',
          color: options.confirmColor || 'primary',
          onClick: () => {
            this.closeModal();
            if (options.onConfirm) {
              options.onConfirm();
            }
          }
        },
        {
          label: options.cancelText || 'Cancel',
          onClick: () => {
            this.closeModal();
            if (options.onCancel) {
              options.onCancel();
            }
          }
        }
      ],
      size: options.size || 'sm'
    });
  }
  
  /**
   * Close the modal and restore focus
   */
  closeModal() {
    this.log.info('Closing modal');
    this.isOpen = false;
    
    // Return focus to the previous element
    if (this.previousFocus) {
      setTimeout(() => {
        try {
          this.previousFocus.focus();
        } catch (e) {
          this.log.warn('Could not restore focus:', e);
        }
        this.previousFocus = null;
      }, 0);
    }
  }
  
  /**
   * Reset the modal state completely
   */
  reset() {
    this.isOpen = false;
    this.type = null;
    this.config = {};
    this.previousFocus = null;
  }
  
  /**
   * Show an error modal with details
   */
  showError(options) {
    this.log.error('Showing error modal:', options.message);
    this.isOpen = true;
    this.title = options.title || 'An Error Occurred';
    
    // Use ErrorModal component
    const ErrorModal = require('./ErrorModal').default;
    this.content = (
      <ErrorModal
        title={options.title || 'An Error Occurred'}
        message={options.message || 'Something went wrong.'}
        details={options.details}
        stack={options.stack}
        timestamp={options.timestamp || new Date().toISOString()}
        onClose={() => this.closeModal()}
      />
    );
    
    // No actions since ErrorModal handles its own buttons
    this.actions = [];
    this.size = options.size || 'md';
  }
}

// Create singleton instance
const modalStore = new ModalStore();
export default modalStore;

