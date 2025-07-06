import React from 'react';
import { createSelectWidget } from './createSelectWidget.jsx';

/**
 * Account selector widget
 * Uses userAcctList eventType for data source
 * Requires userID parameter from authenticated user
 */
const SelAcct = createSelectWidget({
  name: 'SelAcct',
  eventType: 'userAcctList',
  valueField: 'acctID',
  displayField: 'acctName',
  placeholder: 'Select Account...',
  emptyMessage: 'No accounts available',
  params: ['userID'] // Required parameter from login context
});

export default SelAcct;