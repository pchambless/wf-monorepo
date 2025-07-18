import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';

/**
 * Worker selector widget
 * Uses wrkrList eventType for data source
 */
const SelWrkr = (props) => (
  <SelectWidget
    id="selWrkr"
    eventName="wrkrList"
    {...props}
  />
);

export default SelWrkr;