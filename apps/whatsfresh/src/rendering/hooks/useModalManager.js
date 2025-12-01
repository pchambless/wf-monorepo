import { useState, useEffect } from 'react';

/**
 * Modal state management hook
 * Listens for openModal/closeModal events and tracks which modals are open
 */
export function useModalManager() {
  const [openModals, setOpenModals] = useState(new Set());

  useEffect(() => {
    const handleOpenModal = (event) => {
      const { modalId } = event.detail;
      console.log('🔓 Modal opened:', modalId);
      setOpenModals(prev => new Set([...prev, modalId]));
    };

    const handleCloseModal = (event) => {
      const { modalId } = event.detail;
      if (modalId) {
        console.log('🔒 Modal closed:', modalId);
        setOpenModals(prev => {
          const next = new Set(prev);
          next.delete(modalId);
          return next;
        });
      } else {
        console.log('🔒 All modals closed');
        setOpenModals(new Set());
      }
    };

    window.addEventListener('openModal', handleOpenModal);
    window.addEventListener('closeModal', handleCloseModal);

    return () => {
      window.removeEventListener('openModal', handleOpenModal);
      window.removeEventListener('closeModal', handleCloseModal);
    };
  }, []);

  return { openModals };
}
