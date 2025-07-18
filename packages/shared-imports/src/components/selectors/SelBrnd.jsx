import React from 'react';
import { SelectWidget } from './SelectWidget.jsx';

/**
 * Brand selector widget
 * Uses brndList eventType for data source
 */
const SelBrnd = (props) => (
  <SelectWidget
    id="selBrnd"
    eventName="brndList"
    {...props}
  />
);

export default SelBrnd;