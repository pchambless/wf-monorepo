import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { SelAcct } from '@whatsfresh/shared-ui';
import { useAccountStore } from '@stores/accountStore';
import createLogger from '@utils/logger';
import { ROUTES } from '@whatsfresh/shared-config/src/routes';

const log = createLogger('AccountSelector');

const AccountSelector = observer(({ onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const accountStore = useAccountStore();
  const currentAccount = accountStore.currentAcctID;
  const accountList = accountStore.userAcctList || [];
  
  // Log rendering details
  log.info('AccountSelector rendering', { 
    accountListLength: accountList.length, 
    accounts: accountList, 
    currentId: currentAccount 
  });

  // Handle account switching
  const handleAccountChange = async (newAccountId, account) => {
    log.debug(`Changing account to: ${newAccountId} (${account?.acctName})`);
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
    <SelAcct
      selectedAccountId={currentAccount}
      accounts={accountList}
      onChange={handleAccountChange}
      loading={isLoading}
      size="SM"
    />
  );
});

export default AccountSelector;
