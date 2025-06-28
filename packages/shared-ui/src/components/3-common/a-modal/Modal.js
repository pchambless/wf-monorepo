import React from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import modalStore from './modalStore';
import createLogger from '@utils/logger';

const log = createLogger('Modal');

/**
 * Modal component that observes the modalStore
 */
const Modal = observer(() => {
  // Log modal rendering for debugging
  log.debug('Modal rendering', { 
    isOpen: modalStore.isOpen,
    title: modalStore.title,
    hasContent: !!modalStore.content,
    actionsCount: modalStore.actions?.length || 0
  });
  
  // If modal is not open, render nothing
  if (!modalStore.isOpen) return null;
  
  // Handle modal close
  const handleClose = () => {
    log.debug('Modal close triggered');
    modalStore.closeModal();
  };
  
  return (
    <Dialog
      open={true} // Always true because we return null above when !isOpen
      onClose={handleClose}
      maxWidth={modalStore.size || 'md'}
      fullWidth
    >
      {modalStore.title && (
        <DialogTitle sx={{ pr: 6 }}>
          {modalStore.title}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      
      <DialogContent>
        {modalStore.content}
      </DialogContent>
      
      {modalStore.actions && modalStore.actions.length > 0 && (
        <DialogActions>
          {modalStore.actions.map((action, index) => (
            <Button 
              key={index}
              onClick={action.onClick}
              color={action.color || 'primary'}
              variant={action.variant || 'text'}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
});

export default Modal;
