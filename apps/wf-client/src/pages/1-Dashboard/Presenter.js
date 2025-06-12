import { useEffect } from 'react';
import createLogger from '../../utils/logger';
import { useModal } from '@modal';
import usePageHeader from '../../hooks/usePageHeader';
import DashboardIcon from '@mui/icons-material/Dashboard';

const log = createLogger('Dashboard');

const useDashboardPresenter = () => {
  const { showModal } = useModal();
  
  // Set up page header
  usePageHeader({
    title: 'Dashboard',
    description: 'Welcome to WhatsFresh management system', 
    icon: DashboardIcon
  });
  
  // Remove all the navigation link loading logic
  // We don't need it since the sidebar handles navigation
  
  // Keep useful functions like the modal example
  const handleTestModal = () => {
    log.info('Test modal button clicked');
    showModal({
      title: 'Test Modal from Dashboard',
      content: <div>This is a test modal to verify if the modal system works correctly.</div>,
      actions: [
        {
          label: 'Close',
          onClick: () => {
            log.info('Modal close button clicked');
          }
        }
      ],
      size: 'md'
    });
  };

  return {
    // Remove navLinks
    // Remove handleNavigation
    handleTestModal,
  };
};

export default useDashboardPresenter;

// Keep the class version if you're using it elsewhere
export class DashboardPresenter {
  // Your class implementation...
}
