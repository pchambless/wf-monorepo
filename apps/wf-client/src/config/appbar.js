/**
 * WF Client AppBar Configuration
 * 
 * Defines the AppBar structure for the WhatsFresh client app.
 * Items are rendered left to right in the AppBar.
 */

import { SelUserAcct } from '@whatsfresh/shared-imports/jsx';

export const appBarConfig = {
  items: [
    {
      type: 'hamburger'
    },
    {
      type: 'logo'
    },
    {
      type: 'title',
      content: 'WhatsFresh'
    },
    {
      type: 'pageTitle'
    },
    {
      type: 'spacer'
    },
    {
      type: 'widget',
      title: 'Account',
      component: SelUserAcct,
      props: {
        label: "Account",
        size: "small",
        variant: "outlined",
        sx: { 
          minWidth: 240,
          mr: 3, // Add margin right for spacing from logout
          '& .MuiInputBase-root': {
            height: '36px', // Smaller height
          },
          '& .MuiOutlinedInput-root': {
            color: '#03061c', // Dark text for light background
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3f51b5',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '0.875rem',
            '&.MuiInputLabel-shrunk': {
              transform: 'translate(14px, -9px) scale(0.75)', // Better positioning for light background
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '0 4px'
            }
          },
          '& .MuiSelect-icon': {
            color: 'rgba(0, 0, 0, 0.54)',
          }
        }
      }
    },
    {
      type: 'logout'
    }
  ]
};

/**
 * Get AppBar configuration for the client app
 * @returns {Object} AppBar configuration object
 */
export function getAppBarConfig() {
  return appBarConfig;
}