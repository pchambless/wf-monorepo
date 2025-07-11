import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';

/**
 * User Account selector widget
 * Uses userAcctList eventType for data source
 * Requires userID parameter from authenticated user context
 * 
 * Uses auto-detection: 1st column (acctID) as value, 2nd column (acctName) as label
 */
const SelUserAcct = (props) => (
  <SelectWidget
    id="selUserAcct"
    eventName="userAcctList"
    {...props}
  />
);

export default SelUserAcct;
