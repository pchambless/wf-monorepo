import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography, FormControl, Select, MenuItem, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '@stores/accountStore';
import createLogger from '@utils/logger';
import { ROUTES } from '@whatsfresh/shared-config/src/routes';

const log = createLogger('AccountSelector');

const AccountSelector = observer(({ onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const accountStore = useAccountStore();
  const currentAccount = accountStore.currentAcctID;
  const accountList = accountStore.userAccounts || [];
  
  // Handle account switching
  const handleAccountChange = async (event) => {
    const newAccountId = event.target.value;
    log.debug(`Changing account to: ${newAccountId}`);
    setIsLoading(true);
    
    try {
      accountStore.setCurrentAcctID(newAccountId);
      navigate(ROUTES.DASHBOARD.path, { replace: true });
      if (onClose) onClose();
    } catch (error) {
      log.error('Error switching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        ACCOUNT
      </Typography>
      
      <FormControl fullWidth size="small">
        <Select
          value={currentAccount || ''}
          onChange={handleAccountChange}
          sx={{ bgcolor: 'background.paper' }}
          displayEmpty
          disabled={isLoading}
          renderValue={() => {
            if (isLoading) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Switching...
                </Box>
              );
            }
            
            // Find current account name
            const account = accountList.find(a => 
              String(a.acctID) === String(currentAccount)
            );
            return account ? account.acctName : "Select Account";
          }}
        >
          {accountList.map(account => (
            <MenuItem key={account.acctID} value={account.acctID}>
              {account.acctName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
});

export default AccountSelector;
