import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { create } from 'zustand';

// Modal store
export const useModalStore = create((set) => ({
    isOpen: false,
    title: '',
    content: null,
    actions: [],
    contentProps: {},
    options: {},
    open: (config) => set({
        isOpen: true,
        ...config,
    }),
    close: () => set({ isOpen: false })
}));

// Modal context and provider
export const ModalProvider = ({ children }) => {
    return children;
};

// Modal component
const Modal = () => {
    const {
        isOpen,
        title,
        content,
        contentProps = {},
        actions = [],
        options = {},
        close
    } = useModalStore();

    if (!isOpen) return null;

    const handleClose = () => {
        if (options.preventClose) return;
        close();
    };

    const Content = content;

    return (
        <Dialog
            open={true} // Always true because we return null above when !isOpen
            onClose={handleClose}
            maxWidth={options.maxWidth || "sm"}
            fullWidth={options.fullWidth !== false}
            {...options.dialogProps}
        >
            {title && (
                <DialogTitle>{title}</DialogTitle>
            )}
            <DialogContent {...contentProps}>
                {typeof Content === 'string' ? (
                    <DialogContentText>{Content}</DialogContentText>
                ) : (
                    Content && (typeof Content === 'function' ? <Content /> : Content)
                )}
            </DialogContent>
            {actions.length > 0 && (
                <DialogActions>
                    {actions.map((action, i) => (
                        <Button
                            key={i}
                            onClick={() => {
                                if (action.onClick) action.onClick();
                                if (!action.preventClose) close();
                            }}
                            color={action.color || 'primary'}
                            variant={action.variant || 'text'}
                            {...action.buttonProps}
                        >
                            {action.label}
                        </Button>
                    ))}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default Modal;
