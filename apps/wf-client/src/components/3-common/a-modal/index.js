import Modal from './Modal';
import modalStore from './modalStore';
import { useModal } from './useModal';
import { useModalStore } from './useModalStore';

// Direct component and store exports
export { Modal, modalStore, useModal, useModalStore };

// Convenience methods that match old API patterns 
export const openModal = (options) => modalStore.showModal(options);
export const closeModal = () => modalStore.closeModal();
export const showError = (options) => modalStore.showError(options);
export const showConfirmation = (options) => modalStore.showConfirmation(options);

// Default export
export default Modal;
