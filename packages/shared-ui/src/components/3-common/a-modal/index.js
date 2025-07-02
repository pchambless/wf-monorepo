import Modal from './Modal.jsx';
import modalStore from './modalStore.js';
import { useModal } from './useModal.js';
import { useModalStore } from './useModalStore.js';

// Direct component and store exports
export { Modal, modalStore, useModal, useModalStore };

// Convenience methods that match old API patterns 
export const openModal = (options) => modalStore.showModal(options);
export const closeModal = () => modalStore.closeModal();
export const showError = (options) => modalStore.showError(options);
export const showConfirmation = (options) => modalStore.showConfirmation(options);

// Default export
export default Modal;
