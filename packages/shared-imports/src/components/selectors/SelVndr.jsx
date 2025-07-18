import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';

/**
 * Vendor selector widget
 * Uses vndrList eventType for data source
 */
const SelVndr = (props) => (
  <SelectWidget
    id="selVndr"
    eventName="vndrList"
    {...props}
  />
);

export default SelVndr;