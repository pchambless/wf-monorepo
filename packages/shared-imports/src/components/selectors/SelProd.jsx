import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';

/**
 * Product selector widget
 * Uses prodListAll eventType for data source
 * Shows all products for the current account
 * 
 * Uses auto-detection: 1st column (prodID) as value, 2nd column (prodName) as label
 */
const SelProd = (props) => (
  <SelectWidget
    id="SelProd"
    eventName="prodListAll"
    {...props}
  />
);

export default SelProd;