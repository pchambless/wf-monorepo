import { useEffect, useState, useCallback } from 'react';
import { createLogger, contextStore, execEvent } from '@whatsfresh/shared-imports';

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
      if (contextStore.isAuthenticated && contextStore.getParameter('userID')) {
        setAccountsLoading(true);
        try {
          log.info('Loading accounts for dashboard', { userID: contextStore.getParameter('userID') });
          const accounts = await execEvent('userAcctList');
          setUserAcctList(accounts || []);

          // Set default account - prefer persisted acctID, then user's dfltAcctID, then first account
          if (accounts && accounts.length > 0 && !currentAcctID) {
            const persistedAcctId = contextStore.getParameter('acctID');
            const userDefaultId = contextStore.getParameter('dfltAcctID');
            const accountIds = accounts.map(acc => acc.acctID);

            if (persistedAcctId && accountIds.includes(persistedAcctId)) {
              setCurrentAcctID(persistedAcctId);
              log.info('Using persisted account', { accountId: persistedAcctId });
            } else if (userDefaultId && accountIds.includes(userDefaultId)) {
              setCurrentAcctID(userDefaultId);
              contextStore.setParameter('acctID', userDefaultId);
              log.info('Using user default account', { accountId: userDefaultId });
            } else {
              setCurrentAcctID(accounts[0].acctID);
              contextStore.setParameter('acctID', accounts[0].acctID);
              log.info('Using first available account', { accountId: accounts[0].acctID });
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
    
    // Persist the new account selection
    contextStore.setParameter('acctID', newAccountId);
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
    user: contextStore.currentUser,
    isAuthenticated: contextStore.isAuthenticated,
  };
};

export default useDashboardPresenter;