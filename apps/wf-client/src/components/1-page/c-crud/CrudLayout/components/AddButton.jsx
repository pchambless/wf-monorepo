import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

/**
 * AddButton component - Displays an "Add New" button
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Handler for button click
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.label - Button text (defaults to "Add New")
 */
const AddButton = ({ 
  onClick, 
  disabled = false, 
  label = 'Add New' 
}) => {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default AddButton;
