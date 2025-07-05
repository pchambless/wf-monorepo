import React from 'react';
// import { SelAcct } from '@whatsfresh/shared-imports';
import { useAccountStore } from '@stores/accountStore';

const AccountSelector = ({ onClose }) => {
  const accountStore = useAccountStore();

  return (
    <div>Account Selector (Test)</div>
  );
};

export default AccountSelector;
