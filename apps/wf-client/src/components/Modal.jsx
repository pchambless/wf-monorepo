import React, { useState, createContext, useContext } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

// Modal context
const ModalContext = createContext({
    isOpen: false,
    modalProps: {},
    openModal: () => { },
    closeModal: () => { }
});

// Modal state store
export const modalStore = {
    isOpen: false,
    modalProps: {},
    openModal: (props) => {
        modalStore.isOpen = true;
        modalStore.modalProps = props;
        if (modalStore.setStoreState) {
            modalStore.setStoreState({ ...modalStore });
        }
    },
    closeModal: () => {
        modalStore.isOpen = false;
        modalStore.modalProps = {};
        if (modalStore.setStoreState) {
            modalStore.setStoreState({ ...modalStore });
        }
    },
    setStoreState: null
};

// Modal hook
export const useModalStore = () => {
    const [state, setState] = useState(modalStore);

    if (!modalStore.setStoreState) {
        modalStore.setStoreState = setState;
    }

    return state;
};

// Modal component
export const Modal = () => {
    const { isOpen, modalProps, closeModal } = useContext(ModalContext) || {};

    if (!isOpen) {
        return null;
    }

    const { title, content, actions = [], onClose = closeModal } = modalProps;

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            closeModal();
        }
    };

    return (
        <Dialog
            open={true} // Always true because we return null above when !isOpen
            onClose={handleClose}
            aria-labelledby="modal-title"
            maxWidth="md"
            fullWidth
        >
            {title && (
                <DialogTitle id="modal-title">
                    {title}
                </DialogTitle>
            )}
            <DialogContent>
                {typeof content === 'string' ? (
                    <DialogContentText>{content}</DialogContentText>
                ) : (
                    content
                )}
            </DialogContent>
            {actions.length > 0 && (
                <DialogActions>
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            onClick={action.onClick}
                            color={action.color || 'primary'}
                            variant={action.variant || 'text'}
                            disabled={action.disabled}
                        >
                            {action.label}
                        </Button>
                    ))}
                </DialogActions>
            )}
        </Dialog>
    );
};

// Modal provider
export const ModalProvider = ({ children }) => {
    const modalState = useModalStore();

    const contextValue = {
        isOpen: modalState.isOpen,
        modalProps: modalState.modalProps,
        openModal: modalStore.openModal,
        closeModal: modalStore.closeModal
    };

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <Modal />
        </ModalContext.Provider>
    );
};

// Hook for consumer components
export const useModal = () => {
    const { openModal, closeModal } = useContext(ModalContext);
    return { openModal, closeModal };
};

export default Modal;
