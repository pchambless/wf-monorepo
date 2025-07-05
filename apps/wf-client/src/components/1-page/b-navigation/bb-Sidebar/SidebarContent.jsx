import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Divider, FormControl, Select, MenuItem, Typography } from '@mui/material';
import SidebarHeader from './SidebarHeader';
import SidebarNav from './SidebarNav'; // Re-enabled
import { useAccountStore } from '@stores/accountStore';
import createLogger from '@utils/logger';

const log = createLogger('SidebarContent.MobX');

const SidebarContent = observer(({ sections, onNavItemClick }) => {
  log.debug('Rendering MobX SidebarContent');

  const accountStore = useAccountStore();
  const accounts = accountStore.userAcctList || [];
  const currentAccountId = accountStore.currentAcctID;

  const handleAccountChange = (event) => {
    const newAccountId = event.target.value;
    accountStore.setCurrentAcctID(newAccountId);
    if (onNavItemClick) onNavItemClick();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo and app name */}
      <SidebarHeader />

      <Divider />

      {/* Account Selector */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Account
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={currentAccountId || ''}
            onChange={handleAccountChange}
            displayEmpty
            variant="outlined"
            sx={{ fontSize: '0.875rem' }}
          >
            <MenuItem value="" disabled>
              Select Account
            </MenuItem>
            {accounts.map((account) => (
              <MenuItem key={account.acctID} value={account.acctID}>
                {account.acctName || `Account ${account.acctID}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
        <SidebarNav sections={sections} onClose={onNavItemClick} />
      </Box>
    </Box>
  );
});

export default SidebarContent;
