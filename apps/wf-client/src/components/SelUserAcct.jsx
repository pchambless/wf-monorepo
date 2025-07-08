// SelUserAcct.jsx - Client-specific account selector component
import React from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  Typography, 
  Box,
  CircularProgress 
} from '@mui/material';
import { createLogger } from '@whatsfresh/shared-imports';

const log = createLogger('SelUserAcct');

const SelUserAcct = ({ 
  data = [], 
  value = null, 
  onChange, 
  disabled = false,
  loading = false 
}) => {
  
  const handleChange = (event) => {
    const selectedId = event.target.value;
    const selectedAccount = data.find(acc => String(acc.acctID) === String(selectedId));
    
    log.debug('Account selection changed', { 
      selectedId, 
      accountName: selectedAccount?.acctName 
    });
    
    if (onChange) {
      onChange(selectedId, selectedAccount);
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading accounts...</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No accounts available
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Account
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          displayEmpty
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="" disabled>
            Select Account
          </MenuItem>
          {data.map((account) => (
            <MenuItem 
              key={account.acctID} 
              value={account.acctID}
            >
              {account.acctName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SelUserAcct;