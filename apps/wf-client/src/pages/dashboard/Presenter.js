import { useEffect, useState, useCallback } from 'react';
import { createLogger, userStore, execEvent } from '@whatsfresh/shared-imports';

import usePageHeader from '../../hooks/usePageHeader';
import DashboardIcon from '@mui/icons-material/Dashboard';

const log = createLogger('Dashboard');

const useDashboardPresenter = () => {
  const [userAcctList, setUserAcctList] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [currentAcctID, setCurrentAcctID] = useState(null);

  // Set up page header
  usePageHeader({
    title: 'Dashboard',
    description: 'Welcome to WhatsFresh management system',
    icon: DashboardIcon
  });

  // Load accounts when user is authenticated
  useEffect(() => {
    const loadAccounts = async () => {
      if (userStore.isAuthenticated && userStore.userID) {
        setAccountsLoading(true);
        try {
          log.info('Loading accounts for dashboard', { userID: userStore.userID });
          const accounts = await execEvent('userAcctList', { ':userID': userStore.userID });
          setUserAcctList(accounts || []);

          // Set default account - prefer user's dfltAcctID, then first account
          if (accounts && accounts.length > 0 && !currentAcctID) {
            const defaultId = userStore.currentUser?.dfltAcctID;
            const accountIds = accounts.map(acc => acc.acctID);

            if (defaultId && accountIds.includes(defaultId)) {
              setCurrentAcctID(defaultId);
            } else {
              setCurrentAcctID(accounts[0].acctID);
            }
          }

          log.info('Accounts loaded', { count: accounts?.length });
        } catch (error) {
          log.error('Failed to load accounts', error);
        } finally {
          setAccountsLoading(false);
        }
      }
    };

    loadAccounts();
  }, [currentAcctID]);

  const handleAccountChange = useCallback((newAccountId) => {
    log.info('Account changed', { from: currentAcctID, to: newAccountId });
    setCurrentAcctID(newAccountId);
  }, [currentAcctID]);

  const currentAccount = userAcctList.find(acc => acc.acctID === currentAcctID) || null;

  return {
    currentAcctID,
    userAcctList,
    accountsLoading,
    accountsError: null,
    currentAccount,
    hasAccounts: userAcctList.length > 0,
    handleAccountChange,

    // User data from store
    user: userStore.currentUser,
    isAuthenticated: userStore.isAuthenticated,
  };
};

export default useDashboardPresenter;